import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "../types";
import { format } from "date-fns";

/**
 * Generate an invoice PDF for the given order
 * @param order Order data
 * @param includeLogo Whether to include the company logo (default: true)
 * @returns Blob containing the PDF file
 */
export const generateInvoice = (
  order: Order,
  includeLogo: boolean = true
): Blob => {
  try {
    // Create PDF in portrait mode, using mm units
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    });

    // Add a font that supports the Rupee symbol
    // Using standard fonts and a text replacement approach
    const currencySymbol = "Rs. "; // Using "Rs. " instead of "₹" to ensure compatibility

    // Format dates
    const dateCreated = format(new Date(order.createdAt), "dd MMM yyyy");
    const invoiceDate = format(new Date(), "dd MMM yyyy");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add a subtle background color for the header area
    doc.setFillColor(245, 247, 250); // Very light blue/gray
    doc.rect(0, 0, pageWidth, 40, "F");

    // Add a separator line
    doc.setDrawColor(59, 130, 246); // Blue color
    doc.setLineWidth(0.5);
    doc.line(15, 40, pageWidth - 15, 40);

    // Add company logo or text header
    if (includeLogo) {
      try {
        // You would need to replace this with your actual logo path
        const logo = new Image();
        logo.src = "/public/logo.png"; // Replace with your actual logo path

        // Create a hidden canvas to convert the logo to a data URL
        const canvas = document.createElement("canvas");
        canvas.width = 150;
        canvas.height = 50;
        const ctx = canvas.getContext("2d");

        // If we successfully load the logo, add it to the PDF
        logo.onload = () => {
          if (ctx) {
            ctx.drawImage(logo, 0, 0, 150, 50);
            doc.addImage(canvas.toDataURL(), "PNG", 15, 10, 50, 18);
          }
        };

        // If logo fails to load, fall back to text
        logo.onerror = () => {
          addTextHeader(doc);
        };
      } catch (logoError) {
        console.warn("Could not add logo, using text instead:", logoError);
        addTextHeader(doc);
      }
    } else {
      addTextHeader(doc);
    }

    // Helper function to add text header (used when logo is not available)
    function addTextHeader(doc: jsPDF) {
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("E-Commerce Platform", 15, 22);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "www.ecommerceplatform.com | support@ecommerce.com | +91 1234567890",
        15,
        30
      );
    }

    // Add invoice title with a colored background
    doc.setFillColor(59, 130, 246); // Blue color
    doc.rect(pageWidth - 70, 10, 55, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("INVOICE", pageWidth - 42, 18, { align: "center" });

    // Add payment status
    doc.setFontSize(14);
    if (order.isPaid) {
      doc.setFillColor(39, 174, 96); // Green color
      doc.rect(pageWidth - 70, 25, 55, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("PAID", pageWidth - 42, 31, { align: "center" });
    } else {
      doc.setFillColor(231, 76, 60); // Red color
      doc.rect(pageWidth - 70, 25, 55, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("UNPAID", pageWidth - 42, 31, { align: "center" });
    }

    // Add invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    const startY = 50;

    // Left column - Customer info with nice box
    doc.setFillColor(245, 247, 250); // Very light blue/gray
    doc.rect(15, startY, 80, 35, "F");
    doc.setDrawColor(220, 220, 220);
    doc.rect(15, startY, 80, 35, "S");

    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text("BILL TO:", 18, startY + 6);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    const customerName =
      typeof order.user === "string"
        ? "Customer"
        : order.user?.name || "Customer";
    doc.text(customerName, 18, startY + 12);
    doc.text(
      `${order.shippingAddress.street || order.shippingAddress.address || ""}`,
      18,
      startY + 18
    );
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      18,
      startY + 24
    );
    doc.text(`${order.shippingAddress.country}`, 18, startY + 30);

    // Right column - Invoice info with nice box
    doc.setFillColor(245, 247, 250); // Very light blue/gray
    doc.rect(pageWidth - 95, startY, 80, 35, "F");
    doc.setDrawColor(220, 220, 220);
    doc.rect(pageWidth - 95, startY, 80, 35, "S");

    doc.setTextColor(59, 130, 246);
    doc.setFontSize(11);
    doc.text("INVOICE DETAILS:", pageWidth - 92, startY + 6);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);

    // Invoice details - left side labels
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice Number:", pageWidth - 92, startY + 12);
    doc.text("Order Number:", pageWidth - 92, startY + 18);
    doc.text("Invoice Date:", pageWidth - 92, startY + 24);
    doc.text("Order Date:", pageWidth - 92, startY + 30);

    // Invoice details - right side values
    doc.setTextColor(40, 40, 40);
    doc.text(`INV-${order._id.substring(0, 8)}`, pageWidth - 18, startY + 12, {
      align: "right",
    });
    doc.text(
      `#${order._id.substring(0, 8).toUpperCase()}`,
      pageWidth - 18,
      startY + 18,
      { align: "right" }
    );
    doc.text(invoiceDate, pageWidth - 18, startY + 24, { align: "right" });
    doc.text(dateCreated, pageWidth - 18, startY + 30, { align: "right" });

    // Add tracking number section if available
    if (order.trackingNumber) {
      const trackingY = startY + 42;

      doc.setFillColor(235, 245, 250); // Very light blue
      doc.rect(15, trackingY, pageWidth - 30, 15, "F");
      doc.setDrawColor(200, 220, 240);
      doc.rect(15, trackingY, pageWidth - 30, 15, "S");

      doc.setTextColor(59, 130, 246);
      doc.text("SHIPPING INFORMATION:", 18, trackingY + 6);

      doc.setTextColor(100, 100, 100);
      doc.text("Tracking Number:", 70, trackingY + 6);

      doc.setTextColor(40, 40, 40);
      doc.text(order.trackingNumber, 105, trackingY + 6);

      doc.setTextColor(100, 100, 100);
      doc.text("Shipping Method:", 140, trackingY + 6);

      doc.setTextColor(40, 40, 40);
      doc.text("Standard Shipping", 175, trackingY + 6);
    }

    // Generate QR code for order lookup
    try {
      // This is a placeholder - in a real app, you would generate a QR code
      // that links to your order tracking page
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=order:${order._id}`;

      // In a real implementation, you would fetch this QR code and add it to the PDF
      // For this example, we'll just add a text note about the QR code
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Scan QR code to track", pageWidth - 25, startY + 42, {
        align: "center",
      });
    } catch (qrError) {
      console.warn("Could not add QR code:", qrError);
    }

    // Add table for items
    const tableColumn = ["Item", "Description", "Qty", "Price", "Total"];
    const tableRows: any[][] = [];

    // Add items to table
    order.orderItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      // Add a short description if available, otherwise use the name
      const description = item.description || "";

      tableRows.push([
        item.name,
        description.length > 30
          ? description.substring(0, 30) + "..."
          : description,
        item.quantity.toString(),
        `${currencySymbol}${item.price.toFixed(2)}`,
        `${currencySymbol}${itemTotal.toFixed(2)}`,
      ]);
    });

    // Determine starting Y position for the table
    const tableStartY = order.trackingNumber ? startY + 65 : startY + 45;

    // Generate the table using the imported autoTable function
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: tableStartY,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Item name
        1: { cellWidth: 60 }, // Description
        2: { cellWidth: 15 }, // Quantity
        3: { cellWidth: 25 }, // Price
        4: { cellWidth: 30 }, // Total
      },
      foot: [
        [
          "",
          "",
          "",
          "Subtotal:",
          `${currencySymbol}${order.subtotal.toFixed(2)}`,
        ],
        [
          "",
          "",
          "",
          "Shipping:",
          order.shippingAmount > 0
            ? `${currencySymbol}${order.shippingAmount.toFixed(2)}`
            : "Free",
        ],
        [
          "",
          "",
          "",
          "Tax (18%):",
          `${currencySymbol}${order.taxAmount.toFixed(2)}`,
        ],
        [
          "",
          "",
          "",
          "Total:",
          `${currencySymbol}${order.totalAmount.toFixed(2)}`,
        ],
      ],
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [40, 40, 40],
        fontStyle: "bold",
      },
    });

    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    // Add return policy and payment information
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setDrawColor(220, 220, 220);
    doc.rect(15, finalY, pageWidth - 30, 25, "S");

    doc.setFillColor(245, 247, 250);
    doc.rect(15, finalY, pageWidth - 30, 6, "F");

    doc.setTextColor(59, 130, 246);
    doc.setFontSize(10);
    doc.text("RETURN & PAYMENT INFORMATION", 17, finalY + 4);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.text(
      "• Return Policy: Items can be returned within 30 days of delivery in original condition.",
      17,
      finalY + 10
    );
    doc.text(
      "• Payment Method: " + (order.paymentMethod || "Credit/Debit Card"),
      17,
      finalY + 14
    );

    // Add note for refunds in case of returns
    if (order.hasReturn) {
      doc.text(
        "• This order has an active return request. Refund will be processed after return is completed.",
        17,
        finalY + 18
      );
    } else {
      doc.text(
        "• For returns, visit your account dashboard or contact support@ecommerce.com",
        17,
        finalY + 18
      );
    }
    doc.text(
      "• To download a digital copy of this invoice, visit your account page at www.ecommerceplatform.com",
      17,
      finalY + 22
    );

    // Add footer with page number and company info
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "E-Commerce Platform | Tax ID: GSTIN12345678 | www.ecommerceplatform.com",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      `Invoice generated on: ${format(
        new Date(),
        "dd MMM yyyy, HH:mm"
      )} | Page 1 of 1`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );

    // Add a bottom border
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    return doc.output("blob");
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};

/**
 * Download invoice as PDF
 * @param order Order data
 */
export const downloadInvoice = (order: Order) => {
  try {
    // Check if all required order data is present
    if (
      !order ||
      !order._id ||
      !order.orderItems ||
      order.orderItems.length === 0
    ) {
      console.error("Cannot generate invoice: Missing order data");
      alert(
        "Cannot generate invoice due to missing order data. Please contact support."
      );
      return;
    }

    const blob = generateInvoice(order);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice-${order._id.toString().substring(0, 8)}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);

    // Show success message
    const successMessage = document.createElement("div");
    successMessage.style.position = "fixed";
    successMessage.style.bottom = "20px";
    successMessage.style.right = "20px";
    successMessage.style.backgroundColor = "#4BB543";
    successMessage.style.color = "white";
    successMessage.style.padding = "10px 20px";
    successMessage.style.borderRadius = "4px";
    successMessage.style.zIndex = "1000";
    successMessage.textContent = "Invoice downloaded successfully!";

    document.body.appendChild(successMessage);

    // Remove the message after 3 seconds
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  } catch (error) {
    console.error("Error generating invoice:", error);
    alert("Failed to generate invoice. Please try again later.");
  }
};

/**
 * Email invoice to customer
 * @param order Order data
 * @param email Email address to send to (defaults to customer email)
 * @returns Promise that resolves when email is sent
 */
export const emailInvoice = async (
  order: Order,
  email?: string
): Promise<boolean> => {
  try {
    if (!order || !order._id) {
      console.error("Cannot email invoice: Missing order data");
      return false;
    }

    // In a real implementation, you would:
    // 1. Generate the invoice
    // 2. Send it to your backend
    // 3. Have your backend email it to the customer

    // This is just a placeholder to demonstrate how it would work
    const recipientEmail =
      email ||
      (typeof order.user !== "string" ? order.user?.email : undefined) ||
      order.shippingAddress.email ||
      "";

    if (!recipientEmail) {
      console.error("Cannot email invoice: Missing email address");
      return false;
    }

    // Here you would call your API endpoint to send the email
    // For now, we'll just log that it would be sent
    console.log(
      `Invoice for order ${order._id} would be sent to ${recipientEmail}`
    );

    // Return true to indicate success (in a real implementation, you'd return the API response)
    return true;
  } catch (error) {
    console.error("Error emailing invoice:", error);
    return false;
  }
};

/**
 * Preview invoice in a new window
 * @param order Order data
 */
export const previewInvoice = (order: Order) => {
  try {
    if (
      !order ||
      !order._id ||
      !order.orderItems ||
      order.orderItems.length === 0
    ) {
      console.error("Cannot preview invoice: Missing order data");
      alert("Cannot generate invoice preview due to missing order data.");
      return;
    }

    const blob = generateInvoice(order);
    const url = URL.createObjectURL(blob);

    // Open the PDF in a new window
    window.open(url, "_blank");

    // Clean up the URL object after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000); // Give 30 seconds for the PDF to load in the new window
  } catch (error) {
    console.error("Error previewing invoice:", error);
    alert("Failed to generate invoice preview. Please try again later.");
  }
};
