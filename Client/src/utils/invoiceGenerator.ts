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
    fullName: string;
    address: string;
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
 * Generate invoice HTML content
 */
const generateInvoiceHtml = (order: InvoiceOrder): string => {
  const orderId = order._id.substring(order._id.length - 8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${orderId}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .invoice-details { text-align: right; }
        .invoice-number { font-size: 20px; font-weight: bold; color: #333; }
        .invoice-date { color: #666; margin-top: 5px; }
        .address-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .address-block { width: 45%; }
        .address-block h3 { color: #3B82F6; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
        .address-block p { margin: 5px 0; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #3B82F6; color: white; padding: 12px 10px; text-align: left; }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
        th:last-child { text-align: right; }
        .summary { width: 300px; margin-left: auto; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .summary-row.total { border-top: 2px solid #333; border-bottom: none; font-weight: bold; font-size: 18px; padding-top: 15px; }
        .payment-status { margin-top: 20px; padding: 15px; border-radius: 8px; }
        .paid { background: #D1FAE5; color: #065F46; }
        .unpaid { background: #FEF3C7; color: #92400E; }
        .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
        @media print { body { padding: 0; } .invoice-container { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="logo">E-Shop</div>
          <div class="invoice-details">
            <div class="invoice-number">INVOICE #${orderId}</div>
            <div class="invoice-date">${orderDate}</div>
          </div>
        </div>
        
        <div class="address-section">
          <div class="address-block">
            <h3>Billing To</h3>
            <p><strong>${order.shippingAddress.fullName}</strong></p>
            <p>${order.shippingAddress.address}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p>${order.shippingAddress.country}</p>
            ${order.shippingAddress.email ? `<p>${order.shippingAddress.email}</p>` : ""}
            ${order.shippingAddress.phone ? `<p>${order.shippingAddress.phone}</p>` : ""}
          </div>
          <div class="address-block">
            <h3>Payment Details</h3>
            <p><strong>Method:</strong> ${order.paymentMethod}</p>
            <p><strong>Status:</strong> ${order.isPaid ? "Paid" : "Pending"}</p>
            ${order.paidAt ? `<p><strong>Paid On:</strong> ${new Date(order.paidAt).toLocaleDateString()}</p>` : ""}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>₹${order.shippingAmount.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>₹${order.taxAmount.toFixed(2)}</span>
          </div>
          ${
            order.discountAmount && order.discountAmount > 0
              ? `<div class="summary-row" style="color: #10B981;"><span>Discount</span><span>-₹${order.discountAmount.toFixed(2)}</span></div>`
              : ""
          }
          <div class="summary-row total">
            <span>Total</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="payment-status ${order.isPaid ? "paid" : "unpaid"}">
          ${order.isPaid ? "✓ Payment Received" : "⚠ Payment Pending"}
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with E-Shop!</p>
          <p>For any queries, please contact us at support@eshop.com</p>
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
