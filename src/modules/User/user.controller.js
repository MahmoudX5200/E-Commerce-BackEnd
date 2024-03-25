import User from "../../../DB/Models/user.model.js"

//===========3====================== Update Account API =====================//
export const updateAccount = async (req, res, next) => {
    // 1- destructure the required data from the request body 
    const {username,email,password,age,role,phoneNumbers,addresses} =req.body
    const { _id } = req.authUser

    if (email) {
        // email check
        const isEmailExists = await User.findOne({ email })
        if (isEmailExists) return next(new Error('Email is already exists', { cause: 409 }))
    }
    //update user
    const updatedUser = await User.findByIdAndUpdate(_id,
    {
        username,email,password,age,role,phoneNumbers,addresses
    }, 
    {
        new: true
    })
    if (!updatedUser) return next(new Error('update fail'))
    res.status(200).json({ message: 'done', updatedUser })
}
//=============================== Delete Account API =====================//
export const deleteAccount = async (req, res, next) => {
    const { _id } = req.authUser
    const deletedUser = await User.findByIdAndDelete(_id)
    if (!deletedUser) return next(new Error('delete fail'))
    res.status(200).json({ message: 'done' })
}
//============5===================== Get User Profile API =====================//
export const getUserProfile = async (req, res, next) => {
    res.status(200).json({ message: "User data:", data: req.authUser })
}
//=======================delete soft ==========================
export const deleteSoft = async (req, res, next) => {
    const { _id } = req.authUser
    const softDeleat= await User.findOneAndUpdate(
        {_id,isDeleted:false},//condition
        {isDeleted:true},
        {new:true}
    )
    if (!softDeleat) return res.status(400).json({message:"fail"})
    res.status(200).json({message:"success delete soft"}) 
}