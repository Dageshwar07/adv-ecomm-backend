import mongoose from "mongoose";

const imageUploadSchema = new mongoose.Schema({
  images: [
    {
      type: String,
    },
  ],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const ImageUpload = mongoose.model("ImageUpload", imageUploadSchema);
export default ImageUpload;
