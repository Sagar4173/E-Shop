import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Order } from "../types";
import { format } from "date-fns";

// Base64 encoded logo - using a simple, valid base64 string
const COMPANY_LOGO_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAA9OSURBVHic7Z15cFTXfcc/v/de70m7QiAJSUjGMggQIMBgG9s4vrDj2I6TetL4kjiNM2k64zTjJm2SZtKZpJ12xp12Jk1dZ5Lxn43HdYJjsLFxjA0GjG3AAglJSEII3Uho71vt9vrHvoXQhaS3q6cR/D4zO7zvvXN+5/x+v7vn3PM75xcJBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFA8L8TWdSqpZiVpaOMKqgr5nrmG0VRkBBIKFgsNsxp5qmo85K9AaCurk6Z37Q437KaZ+DDhw/LudhzLFaLNC+CzyeKogACERkkkJCRJQlVyc12VVHsQI4BYFRUxca9wMX0dCzbDFBXV6dcvHjREm/+vXv3SpFIxDJbWZJkBlCQJYlQMPSBrJnJykZRFOrq6pTDhw/LkyMbYN68eZGcnJxJkxwVunr1qu348ePlRUVFwdLS0sB8jz4mk2nakTc0NGTr6em2OZ1Oc3FxcThdoQOBAIqiEA6HMRqNaDnsphb/+Z7jEWZUAMePHzc1NTU5btiwYU337t27j1tNQrS1tVkbGxttJSUlQZfLpZWUlISyMjMnL1dXW2BlJBIZu2sEbreb/v5+TCYTmZmZ2Gw2LBYLRqMxLfnHwVpWVhZOW9YpjImNjY5F/RnA4XBEDhw48Hl93A/qvGfOnHGuWbMmmJ+frwGYTCbnUmmJZkJbWxsBvx+f14vP5yMcDg9dCwaDBAIBIpEIiqKMRNzZs2fL77777iKLxSKbTCZMJhPJtPTgwYOVzz333FfOnTuX3dDQ4OztkbMAysvLeyoqKprr6+vTrgYyDQAhwGSer91u1yorK8Nz586NAJCdlTVj+cbGRlfla6+t7OjoWBoOh6XBwcGRa3a7nYyMDHJycsjJziYrK2tMBNjtdkpKSrBarcMTwgBU19S43nrrrV2BQGDRCy+8UH3ixImVxw4frgoGgxWyLIPFYpFlWVEUJaooCjH1vFFRFIdisSiyLCuKoqAoMkokEkFRZJRIJIISiWC1WliyZMnzaQXCFAzdRFL6R8AZ4Je6b1ufcLpVq1aFAZzO6SNg8HgA6OiIPpPnzJnDvNJSKisryXC5pneqh5iGfrpcLg2gsbHRSSwnHJt+7t69ezcDmwoLC32xS+9OlnXq33VSpoTB1CJ/MkVOp5P6+noWLlx4s9UxhtDksLJYLFe8Xm+t1+utVRSlvqioSItGo/L58+drwuFwzWRZja6ZAq/XO/L+woULlJaWUlpa+pHxeBwnssViyRj9frIEGUtEI9clADKdTnRdt6iqataG8z1ZlseFQVlZmb+8vNwPsHTp0r7x8megeV0bt43dxOaMpQFyZ5h2urYFg0ECgUAsGozDnRwfP6+84rvKeo+3XthsNi0vL09LtpwQfHjTTATYhrqPBj0UuWaE+Gsy6v14oRKPESKnytxoNLJ8+fLrf44vwDs0c1zVLQ4pv5n1zK/8QRb4W0FPaeDku75Ec6OJrpOZyAkFEdC2DGWoBLpMyaptGyZ9Y5fNZtMUJZmFRR8dRp32EK9LK0om9+fpyj8Ff4oBzNSJnrSgk+W6+bDmrUZVVYxGI5FIhKamJvx+PxERqHy0iEQitLS0AFOWKx9yZk4ApnZYTXLBObkHLRVkWb4hdJO/fOoHaWky06EWTFr0KXKcppVfJBKhvb2d7u5uNO16GKiqSk9PD93d3USj0Q/5g58eCfVpQdbbtmyzI35bQsczlUiSRDgcZmBgYCg0JIb6guuTUFVV8fl8DA4ORtV4o9fYifz/ECmIAbB27do3gLKGhoZlca/X1tZekWX5pizLLFq0aLtWWFM1WbbXX39doLKy8kxWfkHWRIGvvXYym2j0nEFnqL599yaTTJZJIruvtmYym3jppZeqfV7vplAoXAhQWVl5wVZYUzGTfDt3vrDyxMmTNxuN5gGAZcuW3XS6tGKcLPHv79q1szIUDN0y3WRGLSY+8cgjzaoe27Fjxz8PswGw/zAQuvS25ctu/YfpZNM0jZdeeumeUCi0ORwOVw5fi0QiGePzTV3+bx566KGyoqLCl+I/37F9e198fmnCA8t+AJMikZfvhH99ZN8ZxZvMN3K52J1ThR5NG4e44Q7RElCQuW7981nE0JCm3JIlS/x6JD3uOvn5+X69Gonsf+PNyiM/+GGzEtGqggH/Ir/v+nLK9LHTe2+n0+lXjZb+iqr3vgGA/TWJbfcx9HP10Vv/RVGjVRMFtvf0YLfbx6UtLS31jUnvcrk0p9OpuVyucUp3Op2aIQPmbcsa+87jx48DWC+9XdhkKCwcuXa6q5Pnw4PXdn9y7/dGPu9vPMO5H/2Y/sYzI2m6z7Yw0N6OJEnk5eUxb9688amLivzxp4u0Nzd/bXjyzXI6VLfb7YnvvbS2NluPnDu6f+So4V8psXDJP/KxoxdM0vHHmrkSCKEpkvzdTfv5l18tkxxmM5uqyoh9emHvr0/l9A8Oku1yRQb8/vD4GmB+VFWlu7t7TNpYL8D1MDDSba+dQg8D18i12v7+Ye+3bvVgzVzNUXYcbP5JuGPdVgA+9vsnCQTUnKfubCK3uJjsnBxM5g/Gl3rVaLDlF76Xk5MTmiqTzWbTLBaL5nA4xil+WPB47wE0NzePfGGaOkzztxnAYCgb+WyVc3BVXP94voEV+k4+Xs4RvnfhvWG3h9WSkvyvP/TQK3l5+QGT2RSWpMn9SHRZ5uzs7JHlrmQZJzTsNJqv5Gdnu6+2trZ0OZ3O6r179y43mUwbnU6nT9dhzDZ4+JOPPXa79I0TJ8r83mhltM9ma2trq8nOzraa5BuflRBJigMsy5YtcwOncnNzW6a4MZJCUZRoVlZmYHmNux9IBXrIysoIm0zGYPzYQqKnomiRaL/RaMzLyckJPfzww+cSLeNnP314A3DL8HtN0zjXeO5tVdN2hcPhz1+5cmWxz+fbZrPZNgC9DodDMxqNkVg8oAAHFUV5UJblrYqi/NfQ7pzrwyGRoV6AMTYG0NPTYz969GhNYWFhw7p16zpzc3N9AF6v1757926n3W7PiYbDy5xOZ7XJZMpTFEVyOp3a6PS6UHg8HiV2SPlIHKDr6thelL8f+ppG30SJxBArVqzwxY5JpCRUTJYJ4xBHf+ieaKaOSy4uLo4UFxfHa3RuTY272+XKDsVfnCoefvbZZ7PW1NdfrK9fd7G8vCz+hkazJE0yVvDBxpFopiZKK7PtDmZMCRFjBrs8Fj0Q4t940xr4TbZZNU3bRPDrMbYFS1fbxUckfWa71TGKkbVeEwTWhMkJFFmaYx0AqiojLVmyJB/g4sW27OHEltxiqu95jIy8oXkC/oHENsYkgypLpMbWAM9oK88gxbIkbd269Qw3njT55JNPfrq/v/+3nnvuuY179+7dMDg4iNvtpqSkhAcffJAHtjzA0VcOsGnzzew/fgK3241CBu+8fXle+aL5VQBWKZ9LK4appiIYaE5TttREO3nypM1kMllsNtvt0Wj0TqfT+QTwx3/4h3/0+3a7XXv88cc/C3wW4HpTqdGqvwjY4u5vUK8GWWjXJsv+gXC+MD+/6KK/XFpXV/dEph4mExH/u45EjsWOjUjkGPlwODgSz9DfH5QGen3yFZ13jSTk5Iya2BqiqKhI+7iF/wGe0CPgyBAjyzJ2u318pvR6NrHf5K4UCzDFXlkkdh1Gbc2WZZlIJLpWT/Ys0A0UYrRlBI5sX0v+ku0ArF95AK3vPAP7H6G3+UU+ufCZtL9DSiWdwiPE1+PJTFI14ihNLhQZeXJ95Of3YTAkPj/7/T7Lc8/9XdXly40V4XA4D5iRpZmMjIzB4uLituXL3X9TWlq6R5blEQHi59OPSjOSJKaKkbTTC6WB69dkIpFIXlVVde+CBQu6XnvttcJECu3q6soaGBgokmW5aMGCBV2JLNIYR7qRm/JAiSzLZLr0c7UWC7JkQpFMWIxmMAcxZbgwmDPQIl5GDwt7u9vQ/B1kZ2U1nwo0n0pagGmIr9X1mX9SlS3LMquqqn4B/GLbtm2G+OsHDx6ssNlshaOv+/1+OXYkfGpZWsJtoKiKKMt0dBwzmezmzZsb1qxZ0zSaH+iayMTJkye/Uk+bsBCf//znHxu+Z59+evsD0MvQhNOL+uulA9tuhzRWAocmcOKnfew7cKDHarW+7fV6Q2fPnq0sLCzMUVUVu90+dKqYVC0nTXtsOnZ8usVimWd2Vf2+Pm4zXVuGK9/eZ35yd9SaOTgrnYBh5NjKeahGC5vW3cTFixfJzc31f/Hzn/+zlpaWQ9NlPXbsmGvLli1det+UNwYu7t//1Muvrwd03Se7W1paTnR1dVFTXu5XVTVaWVkZkGWZoqKisDlzzR8BjJkgcuZoNVV1i1EtZThLa7AVVGA0GFAikRc83ouZDocjzzPY/zuexu2YPLUj54DTXp233np72Ud+/4tfv3z5clcgECgC+jds2DCv/pN3fTZNg5L5FkbGAU+98k0+UbUd6vuR75qfHfB4/91ut383Ly9v4/PPP28/sv/AE1HjvPs1VbtfO3HwJ1artz1nsVjqNKayQ5SlrfgcAWo/dRdD20Nk3A4HkXD4CQMUKoqyRH/vB8b0AoYPdXwIUFX1QY/H85+xMf16YJ3BIK+bOo9CZImVXG8vqqryxht/t6a7u/tfMzMzf8dut8uBQGBpIBCQI5FIVm9vbx5A0+XL90UikSe13Py1sqIQjUaTEx4gqqq/WFpSEk5R+JkYNyHBbrdvBsbsDTeZTKmfHDZphJF/wwgdHR0Zfr9/gd/vX6DrN2f4UEimREHCc48kScJisbzkdrsrYmsARZKYN29exOVyjQ0MXU8TNYzjzCCH4o6imkymPy8oLBycZgbRuL5/OqTXtR++ASrs9twvGI3GV+NnASXWUB4/fjz3a1/7WlUgENhjMBjCeXl57p6ent39/f2P9fX1ffPUqVPbGhoayiRJurt/06975axbMr5tXNAwpRdRnwF0Rx4HkMxmjbgZOpMbDE4Hve5rjNvIOHrT45T9miRJ/wa8ajKZxu2XnzwOgJ07d2b7/f6/DAaDy51O5+/JsjxQWlr6vc7Ozse6uroWBwKBrdFotDSqRm/SdcnMzAyPLK6YKgzizqRcO/lMolu6bmZT+RjctqGDu4aC0Gw2J/3MjUaj25HS0d/HTrLslSR6e3tl4B8TyPel+Pde/V0HGe5KEXSOMBzNwWDwxcbGxi8BB4a3rM3EbnVJksBkMt1nNBolfTeUabp1DuOXhalzJkG6A7dKAnlkWf62JEn3mqaeuTwcEoqmabv1/XfbgNR/sY8AkiRtcjqd5dPNExAIBAKBQCAQCAQCgUAgEAgEAoFAIBAIBAKBQCAQCAQCgUAgEAgEAoFA8N8I6amZF7ZEyAAAAABJRU5ErkJggg==";

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
        // Use the embedded base64 logo instead of loading from file
        doc.addImage(COMPANY_LOGO_BASE64, "PNG", 15, 10, 40, 18);
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

    // Generate the table using the imported autoTable function - adjust column widths to avoid overflow
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
        0: { cellWidth: 30 }, // Item name - further reduced width
        1: { cellWidth: 40 }, // Description - further reduced width
        2: { cellWidth: 15 }, // Quantity
        3: { cellWidth: 25 }, // Price
        4: { cellWidth: 25 }, // Total
      },
      margin: { left: 15, right: 15 }, // Add margins to ensure content fits
      didParseCell: function (data) {
        // Truncate text in item name and description columns if too long
        if (data.column.index === 0 && data.cell.text.length > 0) {
          // Truncate item name if too long
          const text = data.cell.text[0];
          if (typeof text === "string" && text.length > 15) {
            data.cell.text = [text.substring(0, 15) + "..."];
          }
        }
        if (data.column.index === 1 && data.cell.text.length > 0) {
          // Truncate description if too long
          const text = data.cell.text[0];
          if (typeof text === "string" && text.length > 20) {
            data.cell.text = [text.substring(0, 20) + "..."];
          }
        }
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

    // Determine recipient email
    const recipientEmail =
      email ||
      (typeof order.user !== "string" ? order.user?.email : undefined) ||
      order.shippingAddress.email ||
      order.paymentResult?.email_address ||
      "";

    if (!recipientEmail) {
      console.error("Cannot email invoice: Missing email address");
      return false;
    }

    // Import the API service to handle proper base URL and configuration
    const api = (await import("../services/api")).default;

    // Call the API to send the invoice email using the api service
    const response = await api.post("/emails/send-invoice", {
      orderId: order._id,
      recipientEmail: recipientEmail,
    });

    return response.data.success;
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
