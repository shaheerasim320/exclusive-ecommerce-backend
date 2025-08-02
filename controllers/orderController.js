import Address from "../models/Address.js"
import Order from "../models/Order.js"
import User from "../models/User.js"
import mongoose from "mongoose"

const placeOrder = async (req, res) => {
    const userID = req.user.userId
    try {
        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        const newOrder = new Order({
            user: userID,
            orderId: req.body.orderId,
            products: req.body.products,
            orderDate: req.body.orderDate || Date.now(),
            orderStatus: req.body.orderStatus || "pending",
            couponCode: req.body.couponCode,
            couponDiscountAmount: req.body.couponDiscountAmount,
            subtotal: req.body.subtotal,
            shippingFee: req.body.shippingFee || 0,
            totalAmount: req.body.totalAmount,
            paymentMethod: req.body.paymentMethod,
            paymentStatus: req.body.transactionId == "COD_PAYMENT" ? "pending" : "paid",
            transactionId: req.body.transactionId,
            paymentDate: req.body.transactionId != "COD_PAYMENT" ? Date.now() : null,
            shippingAddress: req.body.shippingAddress
        })
        await newOrder.save()
        user.orders.push(newOrder._id)
        await user.save()
        const placeOrder = async (req, res) => {
            const userID = req.user.userId
            try {
                const user = await User.findById(userID)
                if (!user) {
                    return res.status(404).json({ message: "Unable to find user" })
                }
                const newOrder = new Order({
                    user: userID,
                    orderId: req.body.orderId,
                    products: req.body.products,
                    orderDate: req.body.orderDate || Date.now(),
                    orderStatus: req.body.orderStatus || "pending",
                    couponCode: req.body.couponCode,
                    couponDiscountAmount: req.body.couponDiscountAmount,
                    subtotal: req.body.subtotal,
                    shippingFee: req.body.shippingFee || 0,
                    totalAmount: req.body.totalAmount,
                    paymentMethod: req.body.paymentMethod,
                    paymentStatus: req.body.transactionId == "COD_PAYMENT" ? "pending" : "paid",
                    transactionId: req.body.transactionId,
                    paymentDate: req.body.transactionId != "COD_PAYMENT" ? Date.now() : null,
                    shippingAddress: req.body.shippingAddress
                })
                await newOrder.save()
                user.orders.push(newOrder._id)
                await user.save()
                return res.status(201).json({ message: "Order placed successfully" })
            } catch (error) {
                console.log(error)
                return res.status(500).json({ message: "Error in placing order" })
            }
        }
        return res.status(201).json({ message: "Order placed successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error in placing order" })
    }
}
const getPlacedOrders = async (req, res) => {
    const userID = req.user.userId
    try {
        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        const orders = await Order.find({ user: user._id }).sort({ orderDate: -1 }).populate("products.productId")
        res.status(200).json(orders)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching all placed orders" })
    }
}

const getRecentOrders = async (req, res) => {
    const userID = req.user.userId;
    try {
        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        const orders = await Order.find({ user: user._id }).sort({ orderDate: -1 }).limit(3)
        res.status(200).json(orders)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching all recent orders" })
    }
}

const getOrderByID = async (req, res) => {
    const userID = req.user.userId;
    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" });
        }

        let order = await Order.findOne({ user: user._id, _id: req.params.orderID });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (mongoose.Types.ObjectId.isValid(order.shippingAddress)) {
            order.shippingAddress = await Address.findById(order.shippingAddress)
        }

        res.status(200).json(order);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error in fetching the requested order" });
    }
};

const getReturnedOrders = async (req, res) => {
    const userID = req.user.userId;
    try {
        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        const orders = await Order.find({ user: user._id, orderStatus: "returned" }).sort({ orderDate: -1 })
        res.status(200).json(orders)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching returned orders" })
    }
}

const getCancelledOrders = async (req, res) => {
    const userID = req.user.userId;
    try {
        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        const orders = await Order.find({ user: user._id, orderStatus: "cancelled" }).sort({ orderDate: -1 })
        res.status(200).json(orders)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching returned orders" })
    }
}

const cancelOrder = async (req, res) => {
    const userID = req.user.userId;
    try {
        const user = await User.findById(userID)
        if (!user) {
            return res.status(404).json({ message: "Unable to find user" })
        }
        const order = await Order.findOne({ user: user._id, _id: req.body.orderID, orderStatus: "pending" })
        if (!order) {
            return res.status(404).json({ message: "Unable to find order" })
        }
        order.orderStatus = "cancelled"
        order.cancelledDate = Date.now()
        order.save();
        res.status(200).json(order)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in cancelling order" })
    }
}

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user")
        const preparedOrders = []
        orders.map((order) => {
            const singleOrder = {
                "_id": order._id,
                "fullName": order.user.fullName,
                "email": order.user.email,
                "orderId": order.orderId,
                "totalAmount": order.totalAmount,
                "orderStatus": order.orderStatus,
                "paymentStatus": order.paymentStatus,
                "orderDate": order.createdAt
            }
            preparedOrders.push(singleOrder)
        })
        res.status(200).json(preparedOrders)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching all orders" })
    }
}
export { placeOrder, getPlacedOrders, getRecentOrders, getOrderByID, getReturnedOrders, getCancelledOrders, cancelOrder, getAllOrders }