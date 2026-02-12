import multer from "multer";

// Memory storage (direct Cloudinary upload)
const storage = multer.memoryStorage();

export const upload = multer({ storage });
