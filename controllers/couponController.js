import Coupon from "../models/Coupon.js";

const addCoupon = async (req, res) => {
    const coupon = new Coupon(req.body)
    try {
        const savedCoupon = await coupon.save()
        res.status(201).json(savedCoupon)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const updateCoupon = async (req, res) => {
    const couponID = req.params.id
    const updatedData = req.body
    try {
        const coupon = await Coupon.findByIdAndUpdate(couponID, updatedData, { new: true })
        if (!coupon) {
            return res.status(404).json({ message: "Coupon doesn't exists" })
        }
        res.status(200).json(coupon)
    } catch (error) {
        res.status(500).message({ message: error.message })
    }
}

const getCouponByID = async (req, res) => {
    const couponID = req.params.id;

    try {
        const coupon = await Coupon.findById(couponID);

        if (!coupon) {
            return res.status(404).json({ message: "Coupon Not Found" });
        }
        res.status(200).json(coupon);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};


export { addCoupon, updateCoupon, getCouponByID }