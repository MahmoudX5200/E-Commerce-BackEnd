

import multer from "multer"
import generateUniqueString from "../utils/generate-Unique-String.js";
import { allowedExtensions } from "../utils/allowed-extensions.js";

import fs from 'fs' 
import path from 'path' 



export const multerMiddleLocal = ({
    extensions = allowedExtensions.image,
    filePath = 'general'
}) => {

    const destinationPath = path.resolve(`src/uploads/${filePath}`) 

    
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true })
    }
   
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath)
        },
        filename: (req, file, cb) => {
            const uniqueFileName = generateUniqueString(6) + '_' + file.originalname
            cb(null, uniqueFileName)
        }
    })

    
    const fileFilter = (req, file, cb) => {
        if (extensions.includes(file.mimetype.split('/')[1])) {
            return cb(null, true)
        }
        cb(new Error('Image format is not allowed!'), false)
    }


    const file = multer({ fileFilter, storage })
    return file
}


export const multerMiddleHost = ({
    extensions = allowedExtensions.image,
}) => {


   
    const storage = multer.diskStorage({
        filename: (req, file, cb) => {
            const uniqueFileName = generateUniqueString(6) + '_' + file.originalname
            cb(null, uniqueFileName)
        }
    })

   
    const fileFilter = (req, file, cb) => {
        if (extensions.includes(file.mimetype.split('/')[1])) {
            return cb(null, true)
        }
        cb(new Error('Image format is not allowed!'), false)
    }


    const file = multer({ fileFilter, storage })
    return file
}
