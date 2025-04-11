import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboardList,
  FaAddressCard,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaPlus,
  FaTrash,
  FaPen,
  FaStar,
  FaHome,
} from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import {
  isAuthenticated,
  getCurrentUser,
  logout,
  getUserProfile,
} from "../../services/authService";
import { format } from "date-fns";

interface Address {
  id: string;
  type: string;
  isDefault: boolean;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  addresses?: Address[];
}

const AddressesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate("/login", {
        state: { from: { pathname: "/account/addresses" } },
      });
      return;
    }

    // Fetch user data including addresses
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setUser({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          isAdmin: userData.isAdmin,
          addresses: userData.addresses,
        });

        // Set addresses from user data if available
        if (userData.addresses && Array.isArray(userData.addresses)) {
          setAddresses(userData.addresses);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      type: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US",
    });
    setEditingAddress(null);
    setShowAddAddressForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAddress) {
        // Update existing address
        const updatedAddresses = addresses.map((addr) =>
          addr.id === editingAddress.id
            ? {
                ...addr,
                type: formData.type,
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
              }
            : addr
        );
        setAddresses(updatedAddresses);

        // In a real app, you would save this to the backend
        // await updateUserAddresses(updatedAddresses);
      } else {
        // Add new address
        const newAddress: Address = {
          id: `addr-${Date.now()}`,
          type: formData.type,
          isDefault: addresses.length === 0, // Make default if it's the first address
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        };
        const newAddresses = [...addresses, newAddress];
        setAddresses(newAddresses);

        // In a real app, you would save this to the backend
        // await updateUserAddresses(newAddresses);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setEditingAddress(address);
    setShowAddAddressForm(true);
  };

  const handleDelete = (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );
      setAddresses(updatedAddresses);

      // In a real app, you would save this to the backend
      // await updateUserAddresses(updatedAddresses);
    }
  };

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    setAddresses(updatedAddresses);

    // In a real app, you would save this to the backend
    // await updateUserAddresses(updatedAddresses);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>

        {user && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl mr-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Navigation */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaUser className="mr-3 text-gray-500" />
                  <span>Account Overview</span>
                </Link>
                <Link
                  to="/account/orders"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaClipboardList className="mr-3 text-gray-500" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/account/profile"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaUser className="mr-3 text-gray-500" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/account/addresses"
                  className="flex items-center px-4 py-3 text-gray-900 bg-gray-100 rounded-md"
                >
                  <FaAddressCard className="mr-3 text-gray-500" />
                  <span>Addresses</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <FaSignOutAlt className="mr-3 text-gray-500" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Account Content */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">My Addresses</h2>
                {!showAddAddressForm && (
                  <button
                    onClick={() => setShowAddAddressForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Address
                  </button>
                )}
              </div>

              {/* Add/Edit Address Form */}
              {showAddAddressForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-medium mb-4">
                    {editingAddress ? "Edit Address" : "Add New Address"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address Type*
                      </label>
                      <input
                        type="text"
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        placeholder="Home, Work, etc."
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="street"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Street Address*
                      </label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City*
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          State/Province*
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Postal/ZIP Code*
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Country*
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="IN">India</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-r-2 border-white"></span>
                        ) : editingAddress ? (
                          "Update Address"
                        ) : (
                          "Add Address"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 ${
                        address.isDefault
                          ? "border-blue-400"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                              address.isDefault
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {address.type}
                          </span>
                          {address.isDefault && (
                            <span className="inline-flex items-center text-xs text-blue-600">
                              <FaStar className="mr-1" /> Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                              title="Set as default"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(address)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit"
                          >
                            <FaPen size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(address.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm text-gray-800">
                          {address.street}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </div>
                        <div className="text-sm text-gray-600">
                          {address.country === "US"
                            ? "United States"
                            : address.country === "CA"
                            ? "Canada"
                            : address.country === "UK"
                            ? "United Kingdom"
                            : address.country === "AU"
                            ? "Australia"
                            : address.country === "IN"
                            ? "India"
                            : address.country === "DE"
                            ? "Germany"
                            : address.country === "FR"
                            ? "France"
                            : address.country}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <FaMapMarkerAlt className="mx-auto text-gray-400 text-3xl mb-3" />
                  <p className="text-gray-600 mb-4">
                    You don't have any saved addresses yet.
                  </p>
                  {!showAddAddressForm && (
                    <button
                      onClick={() => setShowAddAddressForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center mx-auto"
                    >
                      <FaPlus className="mr-2" /> Add Your First Address
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddressesPage;
