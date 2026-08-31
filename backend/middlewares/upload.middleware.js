/*// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Create upload directory if it doesn't exist
// const uploadPath = path.join(__dirname, '..', 'uploads', 'company_policies');
// if (!fs.existsSync(uploadPath)) {
// fs.mkdirSync(uploadPath, { recursive: true });
// }

// // Multer storage
// const storage = multer.diskStorage({
// destination: (req, file, cb) => {
// cb(null, uploadPath);
// },
// filename: (req, file, cb) => {
// const ext = path.extname(file.originalname);
// const filename = 'policy-' + Date.now() + ext;
// cb(null, filename);
// },
// });

// // File filter
// const fileFilter = (req, file, cb) => {
// const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
// if (allowedTypes.includes(file.mimetype)) {
// cb(null, true);
// } else {
// cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
// }
// };

// const upload = multer({
// storage: storage,
// fileFilter: fileFilter,
// limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
// });

// module.exports = upload;



// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Dynamic destination path based on field name
// const getUploadPath = (fieldname) => {
// const baseDir = path.join(__dirname, '..', 'uploads');
// let folder = '';

// switch (fieldname) {
// case 'attachment': // For company policy
// folder = 'company_policies';
// break;
// case 'document_value': // For employee documents
// folder = 'employee_documents';
// break;
// default:
// folder = 'misc';
// break;
// }

// const fullPath = path.join(baseDir, folder);
// if (!fs.existsSync(fullPath)) {
// fs.mkdirSync(fullPath, { recursive: true });
// }
// return fullPath;
// };

// // Multer storage
// const storage = multer.diskStorage({
// destination: (req, file, cb) => {
// const uploadPath = getUploadPath(file.fieldname);
// cb(null, uploadPath);
// },
// filename: (req, file, cb) => {
// const ext = path.extname(file.originalname);
// const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// cb(null, uniqueName);
// }
// // filename: (req, file, cb) => {
// //     const ext = path.extname(file.originalname);
// //     const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
// //     cb(null, uniqueName);
// //   }
  
// });

// // File filter
// const fileFilter = (req, file, cb) => {
// const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
// if (allowedTypes.includes(file.mimetype)) {
// cb(null, true);
// } else {
// cb(new Error('Only JPEG, PNG, and PDF files are allowed.'));
// }
// };

// // Multer instance
// const upload = multer({
// storage,
// fileFilter,
// limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });

// module.exports = upload;
*/


const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic upload folder resolution
const getUploadPath = (fieldname) => {
  const baseDir = path.join(__dirname, '..', 'uploads');
  let folder = '';

  switch (fieldname) {
    case 'avatar': // ✅ avatars
      folder = 'avatars';
      break;

    case 'attachment': // ✅ company policies
      folder = 'company_policies';
      break;

    case 'document_value': // ✅ employee documents
      folder = 'employee_documents';
      break;

    case 'document': // ✅ generic documents
      folder = 'document_uploads';
      break;
      
    case 'pro_image': // ✅ product images
      folder = 'products_images';
      break;
    case 'expense_doc': // ✅ company policies
      folder = 'expenses';
      break;
    // ✅ Home screen assets
    case 'logo':
    case 'homescreen_left_image':
    case 'homescreen_right_image':
      folder = 'homeimages';
      break;

    default:
      folder = 'misc';
  }

  const fullPath = path.join(baseDir, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
};

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath(file.fieldname);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, uniqueName);
  }
});

// Allowed file types
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only JPEG, PNG, and PDF files are allowed.'));
//   }
// };
// Allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',  // covers .jpeg and .jpg
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, GIF, WEBP, BMP, and PDF files are allowed.'));
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

module.exports = upload;
