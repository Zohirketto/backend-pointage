const multer = require("multer");
const path = require("path");

const multerInstance = require(path.join(__dirname, '../config/multer'))
const fs = require('fs')

exports.upload = multerInstance.upload;

exports.delete = async path => {
    try{
        if(!path){
            throw err
        } else {
            fs.unlinkSync(path);
        }
    } catch (err) {
        res.status(500).json({
            error: err,
            status: false,
        })
    }
}