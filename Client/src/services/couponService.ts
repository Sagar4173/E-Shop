import api from "./api";

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  applicableCategories: string[];
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discount: number;
  minimumPurchase: number;
  maximumDiscount: number | null;
}

// Validate a coupon code
export const validateCoupon = async (
  code: string,
  cartTotal: number,
): Promise<CouponValidation> => {
  const response = await api.post("/coupons/validate", { code, cartTotal });
  return response.data;
};

// Apply a coupon (mark as used after order)
export const applyCoupon = async (code: string): Promise<void> => {
  await api.post("/coupons/apply", { code });
};

// Get active coupons (for display)
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const response = await api.get("/coupons/active");
  return response.data;
};

// Admin: Get all coupons
export const getAllCoupons = async (): Promise<Coupon[]> => {
  const response = await api.get("/coupons");
  return response.data;
};

// Admin: Create a coupon
export const createCoupon = async (
  couponData: Omit<Coupon, "_id" | "usedCount">,
): Promise<Coupon> => {
  const response = await api.post("/coupons", couponData);
  return response.data;
};

// Admin: Update a coupon
export const updateCoupon = async (
  id: string,
  couponData: Partial<Coupon>,
): Promise<Coupon> => {
  const response = await api.put(`/coupons/${id}`, couponData);
  return response.data;
};

// Admin: Delete a coupon
export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};
