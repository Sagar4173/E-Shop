const path = require("path");
const fs = require("fs");
const Order = require("../models/Order");

// @desc    Upload return photos
// @route   POST /api/uploads/returns/:orderId/:returnItemId
// @access  Private
exports.uploadReturnPhotos = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    const { orderId, returnItemId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to upload photos for this order
    if (
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Find the return item
    const returnItem = order.returns.id(returnItemId);
    if (!returnItem) {
      return res.status(404).json({ message: "Return item not found" });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../../uploads/returns");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process multiple photos
    const photos = Array.isArray(req.files.photos)
      ? req.files.photos
      : [req.files.photos];
    const photoUrls = [];

    for (const photo of photos) {
      const filename = `return_${orderId}_${returnItemId}_${Date.now()}${path.extname(
        photo.name
      )}`;
      const uploadPath = path.join(uploadDir, filename);

      // Move the file to upload directory
      await photo.mv(uploadPath);

      // Create URL for the uploaded photo
      const photoUrl = `/uploads/returns/${filename}`;
      photoUrls.push(photoUrl);
    }

    // Update the return item to mark photos as uploaded
    returnItem.photosUploaded = true;
    returnItem.photoUrls = photoUrls;

    await order.save();

    res.json({
      message: "Photos uploaded successfully",
      photos: photoUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
