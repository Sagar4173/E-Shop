const path = require("path");
const fs = require("fs");
const Order = require("../models/Order");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary using CLOUDINARY_URL environment variable
// This will automatically parse the cloudinary URL format: cloudinary://<api_key>:<api_secret>@<cloud_name>
if (process.env.CLOUDINARY_URL) {
  console.log("Configuring Cloudinary using CLOUDINARY_URL");
  // No explicit configuration needed as cloudinary will automatically use CLOUDINARY_URL
} else {
  console.warn(
    "CLOUDINARY_URL not found, Cloudinary uploads may not work in production",
  );
}

// Storage service that uses either Cloudinary (production) or local filesystem (development)
const getStorageService = () => {
  // Check if we're in production mode
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    // Use Cloudinary for production
    return {
      uploadFile: async (file, fileName) => {
        try {
          // Create a temporary file path for the upload
          const tempFilePath = path.join("/tmp", fileName);

          // Write the file to the temporary path
          await file.mv(tempFilePath);

          // Upload to cloudinary with a folder structure
          const result = await cloudinary.uploader.upload(tempFilePath, {
            folder: "e-commerce/returns",
            public_id: fileName.split(".")[0], // Use filename without extension as public_id
            resource_type: "auto", // Auto-detect resource type (image, video, etc)
          });

          // Remove the temporary file
          fs.unlinkSync(tempFilePath);

          // Return the secure URL
          return result.secure_url;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
        }
      },
    };
  } else {
    // In development, use local file system
    return {
      uploadFile: async (file, fileName, uploadDir) => {
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, fileName);
        // Move the file to upload directory
        await file.mv(uploadPath);

        // Return local URL path
        return `/uploads/returns/${fileName}`;
      },
    };
  }
};

// @desc    Upload return photos
// @route   POST /api/uploads/returns/:orderId/:returnItemId
// @access  Private
exports.uploadReturnPhotos = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    const { orderId, returnItemId } = req.params;
    const isProd = process.env.NODE_ENV === "production";

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized to upload photos for this order
    if (
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Find the return item
    const returnItem = order.returns.id(returnItemId);
    if (!returnItem) {
      return res.status(404).json({ message: "Return item not found" });
    }

    // Get appropriate storage service (Cloudinary vs local)
    const storageService = getStorageService();

    // Set upload directory (only used in development)
    const uploadDir = path.join(__dirname, "../../uploads/returns");

    // Process multiple photos
    const photos = Array.isArray(req.files.photos)
      ? req.files.photos
      : [req.files.photos];
    const photoUrls = [];

    // Upload each photo
    for (const photo of photos) {
      const filename = `return_${orderId}_${returnItemId}_${Date.now()}${path.extname(
        photo.name,
      )}`;

      // Upload file and get URL
      const photoUrl = await storageService.uploadFile(
        photo,
        filename,
        uploadDir,
      );
      photoUrls.push(photoUrl);

      // Log upload success
      console.log(`File uploaded successfully: ${filename}`);
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
    console.error("Error uploading files:", error);
    res.status(500).json({
      message: "Error uploading files",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};
