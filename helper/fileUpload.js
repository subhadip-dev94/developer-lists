const multer = require("multer");
const path = require("path");
const fs = require("fs");

class FileUploader {
    constructor({ folderName = "public/uploads", fieldSize = 1024 * 1024 * 2 } = {}) {
        this.folderName = folderName;
        this.supportedFiles = ["application/pdf"]; // Only allow PDF
        this.fieldSize = fieldSize;

        // Check if the folder exists, if not, create it
        if (!fs.existsSync(this.folderName)) {
            fs.mkdirSync(this.folderName, { recursive: true });
        }
    }

    // Set up storage configuration 
    storage() {
        return multer.diskStorage({
            destination: (_, __, cb) => {
                cb(null, this.folderName);
            },
            filename: (_, file, cb) => {
                let ext = path.extname(file.originalname);
                cb(null, Date.now() + "SM" + ext);
            },
        });
    }

    // Set up file filter to only accept PDF files
    fileFilter() {
        return (_, file, callback) => {
            if (this.supportedFiles.includes(file.mimetype)) {
                callback(null, true);
            } else {
                console.log(`Please upload a PDF resume only.`);
                callback(null, false);
            }
        };
    }

    // Return the multer configuration with dynamic options
    upload() {
        return multer({
            storage: this.storage(),
            fileFilter: this.fileFilter(),
            limits: {
                fileSize: this.fieldSize,
            },
        });
    }
}

module.exports = FileUploader;
