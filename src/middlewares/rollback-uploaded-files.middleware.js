import cloudinaryConnection from "../utils/cloudinary.js"


export const rollbackUploadedFiles = async (req, res, next) => {
    /**
     * @description 
     * @param {string} folderPath
     */
    console.log('rollbackUploadedFiles middleware');
    if (req.folder) {
        console.log(req.folder);
        await cloudinaryConnection().api.delete_resources_by_prefix(req.folder)
        await cloudinaryConnection().api.delete_folder(req.folder)
    }
    next()
}