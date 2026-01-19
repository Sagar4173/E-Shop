import api from "../services/api";

// Order type for invoice generation
interface InvoiceOrder {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
    product?: string;
  }>;
  shippingAddress: {
    fullName?: string;
    address?: string;
    street?: string; // Alternative to address
    city: string;
    state: string;
    postalCode: string;
    country: string;
    email?: string;
    phone?: string;
  };
  paymentMethod: string;
  paymentResult?: {
    email_address?: string;
  };
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount?: number;
  isPaid: boolean;
  paidAt?: string;
  createdAt: string;
  user?:
    | {
        _id?: string;
        name?: string;
        email?: string;
      }
    | string;
}

/**
 * Generate invoice HTML content optimized for PDF printing
 */
const generateInvoiceHtml = (order: InvoiceOrder): string => {
  const orderId = order._id.substring(order._id.length - 8).toUpperCase();
  const invoiceNumber = `INV-${orderId.toLowerCase()}`;
  const orderNumber = `#${orderId}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const itemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; word-wrap: break-word;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; white-space: nowrap;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; white-space: nowrap;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1f2937;
          background: white;
          margin: 0;
          padding: 0;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          padding: 20mm;
          position: relative;
        }
        
        .header-section {
          display: table;
          width: 100%;
          margin-bottom: 25px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 15px;
        }
        
        .header-left {
          display: table-cell;
          width: 50%;
          vertical-align: top;
        }
        
        .header-right {
          display: table-cell;
          width: 50%;
          vertical-align: top;
          text-align: right;
        }
        
        .company-name {
          font-size: 24pt;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        
        .company-info {
          font-size: 9pt;
          color: #6b7280;
          line-height: 1.6;
        }
        
        .invoice-badge {
          display: inline-block;
          background: #3b82f6;
          color: white;
          padding: 6px 16px;
          font-size: 11pt;
          font-weight: bold;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          font-size: 10pt;
          font-weight: bold;
          border-radius: 4px;
          margin-top: 5px;
        }
        
        .status-badge.paid {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-badge.unpaid {
          background: #fef3c7;
          color: #92400e;
        }
        
        .invoice-details-section {
          display: table;
          width: 100%;
          margin-bottom: 25px;
        }
        
        .details-left {
          display: table-cell;
          width: 50%;
          vertical-align: top;
          padding-right: 20px;
        }
        
        .details-right {
          display: table-cell;
          width: 50%;
          vertical-align: top;
          padding-left: 20px;
        }
        
        .section-title {
          font-size: 10pt;
          font-weight: bold;
          color: #3b82f6;
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        
        .info-table {
          width: 100%;
          font-size: 10pt;
        }
        
        .info-table td {
          padding: 4px 0;
          vertical-align: top;
        }
        
        .info-table td:first-child {
          color: #6b7280;
          width: 40%;
        }
        
        .info-table td:last-child {
          color: #1f2937;
          font-weight: 500;
        }
        
        .address-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          margin-top: 8px;
        }
        
        .address-box p {
          margin: 3px 0;
          font-size: 10pt;
          line-height: 1.6;
        }
        
        .address-box strong {
          display: block;
          margin-bottom: 4px;
          font-size: 11pt;
        }
        
        .items-section {
          margin: 25px 0;
        }
        
        .items-title {
          font-size: 12pt;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 12px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }
        
        .items-table thead th {
          background: #3b82f6;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 10pt;
        }
        
        .items-table thead th:nth-child(2) {
          text-align: center;
          width: 60px;
        }
        
        .items-table thead th:nth-child(3),
        .items-table thead th:nth-child(4) {
          text-align: right;
          width: 100px;
        }
        
        .items-table tbody td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-section {
          margin-top: 25px;
          display: table;
          width: 100%;
        }
        
        .summary-left {
          display: table-cell;
          width: 50%;
        }
        
        .summary-right {
          display: table-cell;
          width: 50%;
        }
        
        .summary-table {
          width: 100%;
          max-width: 300px;
          float: right;
          font-size: 10pt;
        }
        
        .summary-table tr td {
          padding: 6px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-table tr td:first-child {
          color: #6b7280;
        }
        
        .summary-table tr td:last-child {
          text-align: right;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .summary-table tr.discount td {
          color: #059669;
        }
        
        .summary-table tr.total {
          border-top: 2px solid #1f2937;
          border-bottom: 2px solid #1f2937;
        }
        
        .summary-table tr.total td {
          padding: 10px 0;
          font-size: 13pt;
          font-weight: bold;
          color: #1f2937;
        }
        
        .footer-section {
          margin-top: 35px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        .return-payment-info {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .return-payment-info h4 {
          font-size: 10pt;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .return-payment-info ul {
          list-style: disc;
          padding-left: 20px;
          margin: 0;
        }
        
        .return-payment-info li {
          font-size: 9pt;
          color: #4b5563;
          margin: 4px 0;
          line-height: 1.6;
        }
        
        .thank-you {
          text-align: center;
          margin-top: 20px;
          padding: 15px;
          background: #eff6ff;
          border-radius: 4px;
        }
        
        .thank-you p {
          font-size: 10pt;
          color: #1f2937;
          margin: 3px 0;
        }
        
        .thank-you p:first-child {
          font-weight: bold;
          font-size: 11pt;
        }
        
        .contact-info {
          color: #6b7280;
          font-size: 9pt;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          
          .page {
            margin: 0;
            padding: 15mm;
            width: 210mm;
            min-height: 297mm;
          }
          
          @page {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header-section">
          <div class="header-left">
            <div class="company-name">E-Commerce Platform</div>
            <div class="company-info">
              www.ecommerceplatform.com | support@ecommerce.com<br>
              +91 1234567890
            </div>
          </div>
          <div class="header-right">
            <div class="invoice-badge">INVOICE</div>
            <div class="status-badge ${order.isPaid ? "paid" : "unpaid"}">
              ${order.isPaid ? "PAID" : "UNPAID"}
            </div>
          </div>
        </div>
        
        <!-- Invoice Details and Bill To -->
        <div class="invoice-details-section">
          <div class="details-left">
            <div class="section-title">BILL TO:</div>
            <div class="address-box">
              <strong>${order.shippingAddress.fullName || "Customer"}</strong>
              <p>${order.shippingAddress.address || order.shippingAddress.street || ""}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
              <p>${order.shippingAddress.country}</p>
              ${order.shippingAddress.email ? `<p>${order.shippingAddress.email}</p>` : ""}
              ${order.shippingAddress.phone ? `<p>${order.shippingAddress.phone}</p>` : ""}
            </div>
          </div>
          <div class="details-right">
            <div class="section-title">INVOICE DETAILS:</div>
            <table class="info-table">
              <tr>
                <td>Invoice Number:</td>
                <td>${invoiceNumber}</td>
              </tr>
              <tr>
                <td>Order Number:</td>
                <td>${orderNumber}</td>
              </tr>
              <tr>
                <td>Invoice Date:</td>
                <td>${invoiceDate}</td>
              </tr>
              <tr>
                <td>Order Date:</td>
                <td>${orderDate}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Order Items -->
        <div class="items-section">
          <div class="items-title">Order Items:</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
        
        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-left"></div>
          <div class="summary-right">
            <table class="summary-table">
              <tr>
                <td>Subtotal:</td>
                <td>₹${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping:</td>
                <td>${order.shippingAmount === 0 ? "Free" : "₹" + order.shippingAmount.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax (18%):</td>
                <td>₹${order.taxAmount.toFixed(2)}</td>
              </tr>
              ${
                order.discountAmount && order.discountAmount > 0
                  ? `<tr class="discount"><td>Discount:</td><td>-₹${order.discountAmount.toFixed(2)}</td></tr>`
                  : ""
              }
              <tr class="total">
                <td>Total:</td>
                <td>₹${order.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer-section">
          <div class="return-payment-info">
            <h4>Return & Payment Information</h4>
            <ul>
              <li>Return Policy: Items can be returned within 30 days of delivery in original condition.</li>
              <li>Payment Method: ${order.paymentMethod} ${order.isPaid ? "(Payment received and confirmed)" : "(Payment pending)"}</li>
              <li>To download a digital copy of this invoice, visit: www.support.ecommerceplatform.com</li>
            </ul>
          </div>
          
          <div class="thank-you">
            <p>Thank you for your business!</p>
            <p class="contact-info">For support or queries, contact us at support@ecommerce.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate a Blob from invoice HTML
 */
export const generateInvoiceBlob = (order: InvoiceOrder): Blob => {
  const html = generateInvoiceHtml(order);
  return new Blob([html], { type: "text/html" });
};

/**
 * Download invoice as HTML file
 */
export const downloadInvoice = (order: InvoiceOrder): void => {
  try {
    if (
      !order ||
      !order._id ||
      !order.orderItems ||
      order.orderItems.length === 0
    ) {
      console.error("Cannot download invoice: Missing order data");
      alert("Cannot generate invoice due to missing order data.");
      return;
    }

    const blob = generateInvoiceBlob(order);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${order._id.substring(order._id.length - 8).toUpperCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating invoice:", error);
    alert("Failed to generate invoice. Please try again later.");
  }
};

/**
 * Preview invoice in a new browser tab
 */
export const previewInvoice = (order: InvoiceOrder): void => {
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

    const blob = generateInvoiceBlob(order);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Clean up URL after 30 seconds
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 30000);
  } catch (error) {
    console.error("Error previewing invoice:", error);
    alert("Failed to generate invoice preview. Please try again later.");
  }
};

/**
 * Email invoice to customer
 */
export const emailInvoice = async (
  order: InvoiceOrder,
  recipientEmail?: string,
): Promise<boolean> => {
  try {
    if (!order || !order._id) {
      console.error("Cannot email invoice: Missing order data");
      return false;
    }

    // Determine recipient email
    const email =
      recipientEmail ||
      (typeof order.user !== "string" ? order.user?.email : undefined) ||
      order.shippingAddress.email ||
      order.paymentResult?.email_address ||
      "";

    if (!email) {
      console.error("Cannot email invoice: Missing email address");
      return false;
    }

    const response = await api.post("/emails/send-invoice", {
      orderId: order._id,
      recipientEmail: email,
    });

    return response.data.success;
  } catch (error) {
    console.error("Error emailing invoice:", error);
    return false;
  }
};
