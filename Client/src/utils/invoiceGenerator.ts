import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "../types";
import { format } from "date-fns";

/**
 * Generate an invoice PDF for the given order
 * @param order Order data
 * @returns Blob containing the PDF file
 */
export const generateInvoice = (order: Order): Blob => {
  try {
    const doc = new jsPDF();

    // Format dates
    const dateCreated = format(new Date(order.createdAt), "dd MMM yyyy");
    const invoiceDate = format(new Date(), "dd MMM yyyy");

    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("E-Commerce Platform", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text("INVOICE", 105, 30, { align: "center" });

    // Add invoice details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    // Left column - Customer info
    doc.text("Bill To:", 15, 50);
    doc.setTextColor(40, 40, 40);
    const customerName =
      typeof order.user === "string"
        ? "Customer"
        : order.user?.name || "Customer";
    doc.text(customerName, 15, 55);
    doc.text(
      `${order.shippingAddress.street || order.shippingAddress.address || ""}`,
      15,
      60
    );
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
      15,
      65
    );
    doc.text(`${order.shippingAddress.country}`, 15, 70);

    // Right column - Invoice info
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice Number:", 140, 50);
    doc.text("Order Number:", 140, 55);
    doc.text("Invoice Date:", 140, 60);
    doc.text("Order Date:", 140, 65);
    doc.text("Payment Method:", 140, 70);

    doc.setTextColor(40, 40, 40);
    doc.text(`INV-${order._id.substring(0, 8)}`, 195, 50, { align: "right" });
    doc.text(`#${order._id.substring(0, 8).toUpperCase()}`, 195, 55, {
      align: "right",
    });
    doc.text(invoiceDate, 195, 60, { align: "right" });
    doc.text(dateCreated, 195, 65, { align: "right" });
    doc.text(order.paymentMethod, 195, 70, { align: "right" });

    // Add table for items
    const tableColumn = ["Item", "Qty", "Price", "Total"];
    const tableRows: any[][] = [];

    // Add items to table
    order.orderItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      tableRows.push([
        item.name,
        item.quantity.toString(),
        `₹${item.price.toFixed(2)}`,
        `₹${itemTotal.toFixed(2)}`,
      ]);
    });

    // Generate the table using the imported autoTable function
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: "striped",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
      },
      foot: [
        ["", "", "Subtotal:", `₹${order.subtotal.toFixed(2)}`],
        [
          "",
          "",
          "Shipping:",
          order.shippingAmount > 0
            ? `₹${order.shippingAmount.toFixed(2)}`
            : "Free",
        ],
        ["", "", "Tax (18%):", `₹${order.taxAmount.toFixed(2)}`],
        ["", "", "Total:", `₹${order.totalAmount.toFixed(2)}`],
      ],
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: [40, 40, 40],
        fontStyle: "bold",
      },
    });

    // Add footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 105, finalY, { align: "center" });
    doc.text(
      "For any questions regarding this invoice, please contact support@ecommerce.com",
      105,
      finalY + 5,
      { align: "center" }
    );

    // Add payment status
    doc.setFontSize(12);
    if (order.isPaid) {
      doc.setTextColor(39, 174, 96);
      doc.text("PAID", 195, 40, { align: "right" });
    } else {
      doc.setTextColor(231, 76, 60);
      doc.text("UNPAID", 195, 40, { align: "right" });
    }

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
    link.download = `invoice-${order._id.substring(0, 8)}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error generating invoice:", error);
    alert("Failed to generate invoice. Please try again later.");
  }
};
