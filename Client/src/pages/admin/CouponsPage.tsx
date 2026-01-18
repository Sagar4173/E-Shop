import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTag,
  FaPercent,
  FaRupeeSign,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import { getCurrentUser } from "../../services/authService";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  Coupon,
} from "../../services/couponService";

interface CouponFormData {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number | null;
  isActive: boolean;
}

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    minimumPurchase: 0,
    maximumDiscount: null,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    usageLimit: null,
    isActive: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
      navigate("/login");
      return;
    }
    loadCoupons();
  }, [navigate]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch {
      setError("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const couponData = {
        ...formData,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString(),
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, couponData);
        setSuccess("Coupon updated successfully");
      } else {
        await createCoupon(couponData as Omit<Coupon, "_id" | "usedCount">);
        setSuccess("Coupon created successfully");
      }

      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      loadCoupons();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumPurchase: coupon.minimumPurchase,
      maximumDiscount: coupon.maximumDiscount,
      validFrom: new Date(coupon.validFrom).toISOString().split("T")[0],
      validUntil: new Date(coupon.validUntil).toISOString().split("T")[0],
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await deleteCoupon(id);
      setSuccess("Coupon deleted successfully");
      loadCoupons();
    } catch {
      setError("Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minimumPurchase: 0,
      maximumDiscount: null,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      usageLimit: null,
      isActive: true,
    });
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <button
            onClick={openCreateModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <FaPlus />
            Create Coupon
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-4">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No coupons found. Create your first coupon!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaTag className="text-indigo-500 mr-2" />
                        <span className="font-mono font-medium">
                          {coupon.code}
                        </span>
                      </div>
                      {coupon.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {coupon.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {coupon.discountType === "percentage" ? (
                          <>
                            <FaPercent className="text-green-500 mr-1" />
                            <span>{coupon.discountValue}%</span>
                          </>
                        ) : (
                          <>
                            <FaRupeeSign className="text-green-500 mr-1" />
                            <span>{coupon.discountValue}</span>
                          </>
                        )}
                      </div>
                      {coupon.minimumPurchase > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Min: ₹{coupon.minimumPurchase}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <p>
                        From: {new Date(coupon.validFrom).toLocaleDateString()}
                      </p>
                      <p>
                        Until:{" "}
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.isActive ? (
                          <>
                            <FaCheck className="mr-1" /> Active
                          </>
                        ) : (
                          <>
                            <FaTimes className="mr-1" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        aria-label={`Edit coupon ${coupon.code}`}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label={`Delete coupon ${coupon.code}`}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                      placeholder="e.g., WELCOME20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 20% off for new customers"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Type
                      </label>
                      <select
                        value={formData.discountType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountType: e.target.value as
                              | "percentage"
                              | "fixed",
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        aria-label="Discount type"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value
                      </label>
                      <input
                        type="number"
                        aria-label="Discount Value"
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountValue: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min. Purchase (₹)
                      </label>
                      <input
                        type="number"
                        aria-label="Minimum Purchase"
                        value={formData.minimumPurchase}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minimumPurchase: Number(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Discount (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.maximumDiscount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maximumDiscount: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        min="0"
                        placeholder="No limit"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid From
                      </label>
                      <input
                        type="date"
                        aria-label="Valid From"
                        value={formData.validFrom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validFrom: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        aria-label="Valid Until"
                        value={formData.validUntil}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            validUntil: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usageLimit: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Active
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {editingCoupon ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CouponsPage;
