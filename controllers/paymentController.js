import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const processPayment = async (req, res) => {
    try {
        const { amount, currency, paymentMethodId } = req.body;

        // Validate input
        if (!amount || !currency || !paymentMethodId) {
            return res.status(400).json({
                error: "Missing required fields: amount, currency, or paymentMethodId.",
            });
        }

        if (!Number.isInteger(amount)) {
            return res.status(400).json({
                error: "Amount must be an integer (e.g., in cents for USD).",
            });
        }

        // Create PaymentIntent with manual confirmation
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: "never",
            },
        });

        if (paymentIntent.status === "succeeded") {
            return res.status(200).json({ success: true, transactionId: paymentIntent.id });
        } else {
            return res.status(400).json({
                error: "Payment failed or requires additional steps.",
            });
        }
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({
            success: false,
            error: "An unexpected error occurred. Please try again later.",
        });
    }
};

export { processPayment };
