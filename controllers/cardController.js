import dotenv from "dotenv"
import Stripe from "stripe"
import User from "../models/User.js"
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const getDefaultCard = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user.defaultCard) {
            return res.status(404).json({ message: "No default card found" });
        }
        const paymentMethod = await stripe.paymentMethods.retrieve(user.defaultCard);

        res.status(200).json({
            id: paymentMethod.id,
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
        });
    } catch (error) {
        onsole.error("Error fetching default card:", error);
        res.status(500).json({ message: "Failed to retrieve default card" });
    }
}

const getSavedCards = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user) {
            return res.status(404).json({ message: "Requested user not found" })
        }
        const cards = []
        if (user.paymentOptions.length == 0) {
            return res.status(200).json(cards)
        }
        for (const paymentMethodID of user.paymentOptions) {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodID)
            cards.push({
                id: paymentMethodID,
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                exp_month: paymentMethod.card.exp_month,
                exp_year: paymentMethod.card.exp_year,
                name: paymentMethod.billing_details?.name || "Not Provided"
            })
        }
        res.status(200).json(cards);
    } catch (error) {
        console.error("Error fetching saved cards:", error);
        res.status(500).json({ message: "Failed to retrieve saved cards" });
    }
}

const saveCard = async (req, res) => {
    const { paymentMethodId } = req.body;
    try {
        const user = await User.findById(req.user.userId)
        if (!user.stripeCustomerID) {
            return res.status(404).json({ message: "Stripe customer ID missing" })
        }
        await stripe.paymentMethods.attach(paymentMethodId, { customer: user.stripeCustomerID })
        user.paymentOptions.push(paymentMethodId.toString())
        await user.save()
        res.status(200).json({ message: "Card saved successfully" });
    } catch (error) {
        console.error("Error saving card:", error);
        res.status(500).json({ message: "Failed to save card" });
    }
}

const removeCard = async (req, res) => {
    const { paymentMethodId } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user.stripeCustomerID) {
            return res.status(404).json({ message: "Stripe customer ID missing" });
        }
        await stripe.paymentMethods.detach(paymentMethodId);
        if (user.defaultCard == paymentMethodId.toString()) {
            user.defaultCard = null;
        }
        user.paymentOptions = user.paymentOptions.filter(paymentMethodID => paymentMethodID != paymentMethodId.toString());
        await user.save();
        res.status(200).json({ message: "Card removed successfully" });
    } catch (error) {
        console.error("Error removing card:", error);
        res.status(500).json({ message: "Failed to remove card" });
    }
};

const setDefaultCard = async (req, res) => {
    const { paymentMethodId } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user.stripeCustomerID) {
            return res.status(400).json({ message: "Stripe customer ID missing" });
        }
        await stripe.customers.update(user.stripeCustomerID, {
            invoice_settings: { default_payment_method: paymentMethodId }
        })
        user.defaultCard = paymentMethodId.toString()
        await user.save()
        res.status(200).json({ message: "Default card updated successfully" });
    } catch (error) {
        console.error("Error setting default card:", error);
        res.status(500).json({ message: "Failed to set default card" });
    }
}

const createSetupIntent = async (req, res) => {
    const { name } = req.body
    try {
        const user = await User.findById(req.user.userId)
        if (!user.stripeCustomerID) {
            const customer = await stripe.customers.create({
                name: name,
                email: user.email,
                description: `Customer for ${user.email}`
            })
            user.stripeCustomerID = customer.id;
            await user.save();
        }
        const setupIntent = await stripe.setupIntents.create({
            customer: user.stripeCustomerID
        })
        res.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
        console.error("Error creating setup intent:", error);
        res.status(500).json({ message: 'Failed to create setup intent' });
    }
}

const getCardByID = async (req, res) => {
    const cardID = req.params.cardID
    try {
        if (!cardID) {
            return res.status(400).json({ message: "CardID required" })
        }
        const paymentMethod = await stripe.paymentMethods.retrieve(cardID);
        if (!paymentMethod) {
            return res.status(404).json({ message: "Requested resource not found" })
        }
        res.status(200).json({
            id: paymentMethod.id,
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
        });
    } catch (error) {
        console.error("Error in retrieving card:", error);
        res.status(500).json({ message: 'Failed to retrieve card' });
    }
}

export { getDefaultCard, getSavedCards, saveCard, removeCard, setDefaultCard, createSetupIntent, getCardByID }