const multer = require("multer");
const path = require("path");
//image upload
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
         cb(null, path.join(__dirname, "../public/files/"));
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
        // cb(null, file.originalname.replace(/ /g, ''));
    }
});
// checking file type
const fileFilter = (req, file, cb) => {
    console.log(file.mimetype)
    if (file.mimetype.startsWith('image') || ['application/x-rar', 'application/zip', 'application/octet-stream'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unexpected file ! Please upload rar, zip or image.', 400), false);
    }
};
exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 6
    },
    fileFilter: fileFilter
});
