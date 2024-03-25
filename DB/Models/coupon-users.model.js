
import mongoose from "mongoose";



const couponUsersSchema = new mongoose.Schema({
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxUsage: {
        type: Number,
        required: true,
        min: 1
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    disabledBy:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    disabledAt:{ type: Date},

    enabledBy:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    enabledAt:{type: Date, default: Date.now },

},{timestamps: true});





export default  mongoose.models.CouponUsers ||  mongoose.model('CouponUsers', couponUsersSchema);