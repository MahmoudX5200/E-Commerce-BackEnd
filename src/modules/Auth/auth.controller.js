import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from "../../../DB/Models/user.model.js"
import sendEmailService from "../../services/send-email.service.js"
import { nanoid } from 'nanoid'


// ========================================= SignUp API ================================//

/**
 * destructuring the required data from the request body
 * check if the user already exists in the database using the email
 * if exists return error email is already exists
 * password hashing
 * create new document in the database
 * return the response
 */
export const signUp = async (req, res, next) => {

    // 1- destructure the required data from the request body 
    const {
        username,
        email,
        password,
        age,
        role,
        phoneNumbers,
        addresses,
    } = req.body


    // 2- check if the user already exists in the database using the email
    const isEmailDuplicated = await User.findOne({ email })
    if (isEmailDuplicated) {
        return next(new Error('Email already exists,Please try another email', { cause: 409 }))
}
    // 3- send confirmation email to the user
    const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERFICATION, { expiresIn: '2m' })

    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Email Verification',
        message: `
        <h2>please clich on this link to verfiy your email</h2>
        <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>
        `
    })
    // 4- check if email is sent successfully
    if (!isEmailSent) {
        return next(new Error('Email is not sent, please try again later', { cause: 500 }))
    }
    // 5- password hashing
    const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS)

    // 6- create new document in the database
    const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        age,
        role,
        phoneNumbers,
        addresses,
        test:req.body.test
    })

    // 7- return the response
    res.status(201).json({
        success: true,
        message: 'User created successfully, please check your email to verify your account',
        data: newUser
    })
}


/**
 * Twilio => paid service
 * nodemailer => free service
 */

// ========================================= Verify Email API ================================//
/**
 * destructuring token from the request query
 * verify the token
 * get uset by email , isEmailVerified = false
 * if not return error user not found
 * if found
 * update isEmailVerified = true
 * return the response
 */
export const verifyEmail = async (req, res, next) => {
    const { token } = req.query
    const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERFICATION)
    // get uset by email , isEmailVerified = false
    const user = await User.findOneAndUpdate({
        email: decodedData.email, isEmailVerified: false
    }, { isEmailVerified: true }, { new: true })
    if (!user) {
        return next(new Error('User not found', { cause: 404 }))
    }

    res.status(200).json({
        success: true,
        message: 'Email verified successfully, please try to login'
    })
}


// ========================================= SignIn API ================================//

/**
 * destructuring the required data from the request body 
 * get user by email and check if isEmailVerified = true
 * if not return error invalid login credentails
 * if found
 * check password
 * if not return error invalid login credentails
 * if found
 * generate login token
 * updated isLoggedIn = true  in database
 * return the response
 */

export const signIn = async (req, res, next) => {
    const { email, password } = req.body
    // get user by email
    const user = await User.findOne({ email, isEmailVerified: true })
    if (!user) {
        return next(new Error('Invalid login credentails', { cause: 404 }))
    }
    // check password
    const isPasswordValid = bcrypt.compareSync(password, user.password)
    if (!isPasswordValid) {
        return next(new Error('Invalid login credentails', { cause: 404 }))
    }

    // generate login token
    const token = jwt.sign({ email, id: user._id, loggedIn: true }, process.env.JWT_SECRET_LOGIN, { expiresIn: '1d' })
    // updated isLoggedIn = true  in database

    user.isLoggedIn = true
    await user.save()

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
            token
        }
    })
}
// ************************************refreshToken*************************************
export const refreshToken = async (req, res, next) => {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.SIGNATURE)
    if (!decoded?.email) {
        return next(new Error("invalid token", 400))
    }
    const user = await User.findOne({ email: decoded.email, confirmed: false })
    if (!user) {
        return next(new Error("user not exist or already  confirmed plz log in", 400))
    }
    const rfToken = jwt.sign({ email: user.email }, process.env.SIGNATURE, { expiresIn: 60 * 2 })
    const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${rfToken}`
    const emailSend = emailFunc({
        email: user.email,
        subject: "confirm email",
        html: `<a href='${link}'>confirm email</a> `
    })
    if (!emailSend) {
        return next(new Error("fail to send this email", 400))

    }
    res.status(201).json({ msg: "done" })

}


// ************************************forgetPassword*************************************
export const forgetPassword = async (req, res, next) => {
    const { email } = req.body

    const userExist = await User.findOne({ email })
    if (!userExist) {
        return next(new Error("email not exist ", 404))
    }
    const code = nanoid(4)
    const emailSend = emailFunc({
        email,
        subject: "reset password",
        html: `<h1>code:${code}</h1>`
    })
    if (!emailSend) {
        return next(new Error("fail to send this email", 400))
    }
    await User.updateOne({ email }, { forgetCode: code })
    res.status(200).json({ msg: "done" })

}

// ************************************resetPassword*************************************
export const resetPassword = async (req, res, next) => {
    const { email, code, password, rePassword } = req.body

    const userExist = await User.findOne({ email })
    if (!userExist) {
        return next(new Error("email not exist ", 404))
    }
    if (userExist.forgetCode !== code) {
        return next(new Error("invalid code ", 400))

    }
    const hash = bcrypt.hashSync(password, +process.env.SALT_ROUND)

    await User.updateOne({ email }, { password: hash, forgetCode: "", changePasswordAt: Date.now() })

    res.status(200).json({ msg: "done" })

}

//============7===================== Update password API =====================//
export const update_password = async (req, res, next) => {
    //destruct data
     const { email,new_password, old_password} = req.body
     const { _id } = req.authUser
     //check email
     const isEmailExists = await User.findOne({ email })
     if (!isEmailExists) return next(new Error('invalid login credentials', { cause: 404 }))
     //check old password
    const isOldPasswordCorrect = bcrypt.compareSync(old_password,isEmailExists.password )
    if (!isOldPasswordCorrect) {
     return res.json({message:"old password rang"})
    } 
    //create new password
     const hashPass = bcrypt.hashSync(new_password, +process.env.SALT_ROUNDS)
     const updatedUser = await User.findByIdAndUpdate(_id ,{password:hashPass}, {new: true})
 
     if (!updatedUser) return next(new Error('update fail'))
     res.status(200).json({ message: 'done change password success' })
     
 }
 