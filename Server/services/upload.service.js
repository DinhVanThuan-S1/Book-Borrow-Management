const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { UPLOAD } = require("../utils/constants");

/**
 * Upload Service
 * Service xử lý upload file
 */
class UploadService {
  /**
   * Cấu hình multer cho upload sách
   */
  static getBookUploadConfig() {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadPath = UPLOAD.UPLOAD_PATHS.BOOKS;
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "book-" + uniqueSuffix + path.extname(file.originalname));
      },
    });

    return multer({
      storage: storage,
      limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE,
      },
      fileFilter: this.imageFileFilter,
    });
  }

  /**
   * Cấu hình multer cho upload avatar
   */
  static getAvatarUploadConfig() {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadPath = UPLOAD.UPLOAD_PATHS.AVATARS;
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
      },
    });

    return multer({
      storage: storage,
      limits: {
        fileSize: UPLOAD.MAX_FILE_SIZE,
      },
      fileFilter: this.imageFileFilter,
    });
  }

  /**
   * Filter cho file ảnh
   */
  static imageFileFilter(req, file, cb) {
    if (UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF)!"), false);
    }
  }

  /**
   * Xóa file theo đường dẫn
   */
  static deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Lỗi xóa file:", error);
    }
  }

  /**
   * Xóa file theo đường dẫn relative
   */
  static deleteFileByPath(relativePath) {
    try {
      if (relativePath) {
        const fullPath = path.join(__dirname, "..", relativePath);
        this.deleteFile(fullPath);
      }
    } catch (error) {
      console.error("Lỗi xóa file:", error);
    }
  }

  /**
   * Kiểm tra file có tồn tại không
   */
  static fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Lấy thông tin file
   */
  static getFileInfo(filePath) {
    try {
      if (this.fileExists(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      }
      return null;
    } catch (error) {
      console.error("Lỗi lấy thông tin file:", error);
      return null;
    }
  }
}

module.exports = UploadService;
