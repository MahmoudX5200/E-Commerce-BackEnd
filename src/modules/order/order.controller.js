//================================= add   order  ====================================

import { couponValidation } from "../../utils/coupon-validation.js";
import { checkProductAvailability } from "../Cart/utils/check-product-in-db.js";
import Order from "../../../DB/Models/order.model.js";
import CouponUsers from "../../../DB/Models/coupon-users.model.js";
import { getUserCart } from "../Cart/utils/get-user-cart.js";
import Product from "../../../DB/Models/product.model.js";
import Cart from "../../../DB/Models/cart.model.js";
import { DateTime } from "luxon";
import { qrCodeGeneration } from "../../utils/qr-code.js";
import {
  confirmPaymentIntent,
  createCheckoutSession,
  createPaymentIntent,
  createStripeCoupon,
  refundPaymentIntent,
  retrievePaymentIntent,
} from "../../payment-handler/stripe.js";
import couponModel from "../../../DB/Models/coupon.model.js";
import productModel from "../../../DB/Models/product.model.js";
import { nanoid } from "nanoid";
import sendEmailService from "../../services/send-email.service.js";
import  createInvoice  from "../../utils/pdfkit.js";
//-----------------createOrder-----------------------
export const createOrder = async (req, res, next) => {
  //destructure the request body
  const {
    product, // product id
    quantity,
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const { _id: user } = req.authUser;

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, user);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }

  // product check
  const isProductAvailable = await checkProductAvailability(product, quantity);
  if (!isProductAvailable)
    return next({ message: "Product is not available", cause: 400 });

  let orderItems = [
    {
      title: isProductAvailable.title,
      quantity,
      price: isProductAvailable.appliedPrice,
      product: isProductAvailable._id,
    },
  ];

  //prices
  let shippingPrice = orderItems[0].price * quantity;
  let totalPrice = shippingPrice;

  console.log(shippingPrice, totalPrice);
  console.log(!(coupon?.couponAmount <= shippingPrice));

  if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice))
    return next({ message: "You cannot use this coupon", cause: 400 });

  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // order status + paymentmethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // create order
  const order = new Order({
    user,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  await order.save();

  isProductAvailable.stock -= quantity;
  await isProductAvailable.save();

  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId: user },
      { $inc: { usageCount: 1 } }
    );
  }

  // generate QR code
  const orderQR = await qrCodeGeneration([
    {
      orderId: order._id,
      user: order.user,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    },
  ]);
  res
    .status(201)
    .json({ message: "Order created successfully", order, orderQR });

  //===================== create pdf ===============
  const ordeCode = `${req.authUser.username}_${nanoid(5)}`;
  const orderinvoice = {
    shipping: {
      name: req.authUser.username,
      address: req.authUser.addresses,
      city: "cairo",
      state: "cairo",
      country: "Egypt",
      //   postal_code: 94111
    },
    ordeCode,
    date: order.createdAt,
    items: order.orderItems,
    subtotal: order.shippingPrice,
    paid: order.totalPrice,

  };
  await createInvoice(orderinvoice, `${ordeCode}.pdf`);
  //===================== send notification to user =================

  await sendEmailService({
    to: req.authUser.email,
    subject: "pdf order",
    message: "<h1>please find your invoice pdfv below</h1>",
    attachments: [
      {
        path: `./Files/${ordeCode}.pdf`,
        contentType: "application/pdf"
        
      },
      // {
      //   path: "wallpaperflare.com_wallpaper (16).jpg",
      //   contentType: "image.jpg"

      // }

    ],
  });

  
};

export const convertFromcartToOrder = async (req, res, next) => {
  //destructure the request body
  const {
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const { _id: user } = req.authUser;
  // cart items
  const userCart = await getUserCart(user);
  if (!userCart) return next({ message: "Cart not found", cause: 404 });

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, user);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }

  // product check
  // const isProductAvailable = await checkProductAvailability(product, quantity);
  // if(!isProductAvailable) return next({message: 'Product is not available', cause: 400});

  let orderItems = userCart.products.map((cartItem) => {
    return {
      title: cartItem.title,
      quantity: cartItem.quantity,
      price: cartItem.basePrice,
      product: cartItem.productId,
    };
  });

  //prices
  let shippingPrice = userCart.subTotal;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice))
    return next({ message: "You cannot use this coupon", cause: 400 });

  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // order status + paymentmethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // create order
  const order = new Order({
    user,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  await order.save();

  await Cart.findByIdAndDelete(userCart._id);

  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.quantity } }
    );
  }

  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId: user },
      { $inc: { usageCount: 1 } }
    );
  }

  res.status(201).json({ message: "Order created successfully", order });
};

// ======================= order delivery =======================//
export const delieverOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const updateOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: ["Paid", "Placed"] },
    },
    {
      orderStatus: "Delivered",
      deliveredAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
      deliveredBy: req.authUser._id,
      isDelivered: true,
    },
    {
      new: true,
    }
  );

  if (!updateOrder)
    return next({
      message: "Order not found or cannot be delivered",
      cause: 404,
    });

  res
    .status(200)
    .json({ message: "Order delivered successfully", order: updateOrder });
};

// ======================= order payment with stipe =======================//
export const payWithStripe = async (req, res, next) => {
  const { orderId } = req.params;
  const { _id: userId } = req.authUser;

  // get order details from our database
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    orderStatus: "Pending",
  });
  if (!order)
    return next({ message: "Order not found or cannot be paid", cause: 404 });

  const paymentObject = {
    customer_email: req.authUser.email,
    metadata: { orderId: order._id.toString() },
    discounts: [],
    line_items: order.orderItems.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100, // in cents
        },
        quantity: item.quantity,
      };
    }),
  };
  // coupon check
  if (order.coupon) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.coupon });
    if (stripeCoupon.status)
      return next({ message: stripeCoupon.message, cause: 400 });

    paymentObject.discounts.push({
      coupon: stripeCoupon.id,
    });
  }

  const checkoutSession = await createCheckoutSession(paymentObject);
  const paymentIntent = await createPaymentIntent({
    amount: order.totalPrice,
    currency: "EGP",
  });

  order.payment_intent = paymentIntent.id;
  await order.save();

  res.status(200).json({ checkoutSession, paymentIntent });
};

//====================== apply webhook locally to confirm the  order =======================//
export const stripeWebhookLocal = async (req, res, next) => {
  const orderId = req.body.data.object.metadata.orderId;

  const confirmedOrder = await Order.findById(orderId);
  if (!confirmedOrder) return next({ message: "Order not found", cause: 404 });

  await confirmPaymentIntent({
    paymentIntentId: confirmedOrder.payment_intent,
  });

  confirmedOrder.isPaid = true;
  confirmedOrder.paidAt = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss");
  confirmedOrder.orderStatus = "Paid";

  await confirmedOrder.save();

  res.status(200).json({ message: "webhook received" });
};

export const refundOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const findOrder = await Order.findOne({ _id: orderId, orderStatus: "Paid" });
  if (!findOrder)
    return next({
      message: "Order not found or cannot be refunded",
      cause: 404,
    });

  // refund the payment intent
  const refund = await refundPaymentIntent({
    paymentIntentId: findOrder.payment_intent,
  });

  findOrder.orderStatus = "Refunded";
  await findOrder.save();

  res
    .status(200)
    .json({ message: "Order refunded successfully", order: refund });
};
// **************************** cancel order **********************************
export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const { _id } = req.authUser;
  const order = await Order.findOne({ _id: orderId, userId: _id });
  if (!order) {
    return next(new Error(`invalid order with id ${orderId} `, 404));
  }
  if (
    (order?.orderStatus != "Placed" && order?.paymentMethod == "Cash") ||
    (order?.orderStatus != "Pending" && order?.paymentMethod == "Paymob")
  ) {
    return next(new Error(`can not cancel your order `, 400));
  }

  // Calculate order age
  const currentTime = Date.now();
  const orderAge = currentTime - order.createdAt;

  // Check if order is older than 1 day (86400000 milliseconds)
  if (orderAge > 86400000) {
    return res
      .status(400)
      .json({ error: "Order cannot be canceled after 1 day" });
  }
  const cancelOrder = await Order.updateOne(
    { _id: order._id },
    { orderStatus: "Cancelled", cancelledBy: _id, reason }
  );
  if (!cancelOrder) {
    return next(new Error(`fail when cancel order `, 500));
  }
  if (order.couponId) {
    await couponModel.updateOne(
      { _id: order.couponId },
      { $pull: { usedBy: _id } }
    );
  }
  for (const product of order.products) {
    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity } }
    );
  }
  res.status(201).json({ msg: "done", cancelOrder });
};
