import productModel from "../../../DB/models/product.model.js";
import orderModel from "../../../DB/models/order.model.js";
import reviewModel from "../../../DB/models/review.model.js";


// **************************** addReview **********************************
export const addReview = (async (req, res, next) => {
    const { comment, rate, orderId } = req.body
    const { productId } = req.params

    //check product
    const product = await productModel.findOne({ _id: productId })
    if (!product) {
        return next({ cause: 404, message: 'product not found' })
    }

    //check order
    const order = await orderModel.findOne({
        _id: orderId,
        userId: req.authUser._id,
        orderStatus: "delivered",
        "products.productId": productId
    })
    if (!order) {
        return next({ cause: 404, message: 'order not found' })
    }

    //check review
    const reviewExist = await reviewModel.findOne({
        userId: req.authUser._id,
        productId,
        orderId
    })
    if (reviewExist) {
        return next({ cause: 400, message: 'already review it before' })
    }

    const review = await reviewModel.create({ comment, rate, orderId, productId, userId: req.authUser._id })

    // const reviews = await reviewModel.find({ productId })
    // let sum = 0
    // for (const review of reviews) {
    //     sum += review.rate
    // }

    let sum = product.avgRate * product.rateNum
    sum = sum + rate

    product.avgRate = sum / (product.rateNum + 1)
    product.rateNum += 1
    await product.save()
    
    review ? res.status(201).json({ msg: "done", review }) : next({ cause: 500, message: 'fail' })

})



// **************************** removeReview **********************************

export const removeReview = (async (req, res, next) => {
    const { productId, id } = req.query

    //check product
    const product = await productModel.findOne({ _id: productId })
    if (!product) {
        return next({ cause: 404, message: 'product not found' })
    }
    //check review
    const reviewExist = await reviewModel.findOneAndDelete({
        userId: req.authUser._id,
        _id: id
    })
    if (!reviewExist) {
        return next({ cause: 400, message: 'already review it before' })
    }


    let sum = product.avgRate * product.rateNum
    sum = sum - reviewExist.rate

    product.avgRate = sum / (product.rateNum - 1)
    product.rateNum -= 1
    await product.save()
    res.status(200).json({ msg: "done" })
})