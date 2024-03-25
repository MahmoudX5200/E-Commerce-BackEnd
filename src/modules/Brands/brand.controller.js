import slugify from 'slugify'

import Brand from '../../../DB/Models/brand.model.js'
import subCategory from '../../../DB/Models/sub-category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'
import { APIFeatures } from "../../utils/api-features.js";

//======================= add brand =======================//
export const addBrand = async (req, res, next) => {
    // 1- desturcture the required data from teh request object
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    const { _id } = req.authUser
    // category check , subcategory check
    // 2- subcategory check
    const subCategoryCheck = await subCategory.findById(subCategoryId).populate('categoryId', 'folderId')
    if (!subCategoryCheck) return next({ message: 'SubCategory not found', cause: 404 })

    // 3- duplicate  brand document check 
    const isBrandExists = await Brand.findOne({ name, subCategoryId })
    if (isBrandExists) return next({ message: 'Brand already exists for this subCategory', cause: 400 })

    // 4- categogry check
    if (categoryId != subCategoryCheck.categoryId._id) return next({ message: 'Category not found', cause: 404 })

    // 5 - generate the slug
    const slug = slugify(name, '-')

    // 6- upload brand logo
    if (!req.file) return next({ message: 'Please upload the brand logo', cause: 400 })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    })

    const brandObject = {
        name, slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        subCategoryId,
        categoryId
    }

    const newBrand = await Brand.create(brandObject)

    res.status(201).json({
        status: 'success',
        message: 'Brand added successfully',
        data: newBrand
    })

}

//***********************UpdateBrand************************** */
export const UpdateBrand = async (req, res, next) => {
    // 1- destructuring the request body
    const { name, oldPublicId } = req.body
    // 2- destructuring the request query 
    const { BrandId } = req.query
    // 3- destructuring _id from the request authUser
    const { _id } = req.authUser

    // 4- check if the Brand is exist bu using BrandId
    const brand = await Brand.findById(BrandId)
    if (!brand) return next({ cause: 404, message: 'Brand not found' })

    // 5- check if the use want to update the name field
    if (name) {
        // 5.1 check if the new brand name different from the old name
        if (name == brand.name) {
            return next({ cause: 400, message: 'Please enter different brand name from the existing one.' })
        }

        // 5.2 check if the new category name is already exist
        const isNameDuplicated = await subCategory.findOne({ name })
        if (isNameDuplicated) {
            return next({ cause: 409, message: 'Category name is already exist' })
        }

        // 5.3 update the brand name and the category slug
        brand.name = name
        brand.slug = slugify(name, '-')
    }

    // 6- check if the user want to update the image
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: 'Image is required' })

        const NewPublicId = oldPublicId.split(`${brand.folderId}/`)[1]

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_FOLDER}/Categories/${brand.subCategoryId.categoryId.folderId}/subCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`,
            public_id: NewPublicId
        })

        brand.Image.secure_url = secure_url
    }

    // 7- set value for the updatedBy field
    brand.updatedBy = _id

    const update_brand= await brand.save()
    res.status(200).json({ success: true, message: 'Category updated successfully', data: update_brand })
}
//====================== delete Brand ======================//
export const deleteBrand = async (req, res, next) => {
const { BrandId } = req.query
    const brands =await Brand.findById(BrandId).populate(
        {
             path: "subCategoryId",
             populate:[
                {
                    path:"categoryId"
                },
            ],
        },
    );
if (!brands) return next({ status: 404, message: "Brand not found" });

    // delete  brands
    const delete_brands = await Brand.findByIdAndDelete( BrandId )
    if (!delete_brands) return next({ status: 404, message: "Brand not found" });

    //  delete image folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(
        `${process.env.MAIN_FOLDER}/Categories/${brands.subCategoryId.categoryId.folderId}/subCategories/${brands.subCategoryId.folderId}/Brands/${brands.folderId}`
    )
    
    //  delete the category folder from cloudinary
    await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${brands.subCategoryId.categoryId.folderId}/subCategories/${brands.subCategoryId.folderId}/Brands/${brands.folderId}`
    )

    res.status(200).json({ success: true, message: 'Category deleted successfully' })
}
//*********************getAllBrand****************** */
export const getAllBrand = async (req, res, next) => {
    const brand = await Brand.find()
    res.status(200).json({ success: true, message: 'Categories fetched successfully', data: brand })
}
//=========================== Apply the API features in brand===========================

export const featuresBrand = async (req, res, next) => {
    const { page, size, sort, ...search } = req.query;
    const features = new APIFeatures(req.query, Brand.findOne())
      .sort(sort)
      .pagination({ page, size })
      .search(search)
      .filters(search)
  
    // console.log(features.mongooseQuery);

    const brand = await features.mongooseQuery;
    res.status(200).json({ success: true, data: brand });
  };
  