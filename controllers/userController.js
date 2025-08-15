import User from "../models/User.js";
import Cart from "../models/Cart.js";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import axios from "axios"
import Counter from "../models/Counter.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";
import Wishlist from "../models/Wishlist.js";
import nodemailer from "nodemailer"

dotenv.config()

export const registerUser = async (req, res) => {
    const { fullName, email, password, phoneNumber, gender } = req.body;
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User with this email exists" })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const counter = await Counter.findOneAndUpdate({ id: "customer_counter" }, { $inc: { seq: 1 } }, { new: true, upsert: true })
        const custID = counter.seq;
        const user = new User({ fullName, email, password: hashedPassword, phoneNumber, gender, status: "unverified", custID })
        const savedUser = await user.save()
        const cart = new Cart({ user: savedUser._id })
        await cart.save()
        const wishlist = new Wishlist({ user: savedUser._id })
        await wishlist.save();
        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );
        const logo = "https://res.cloudinary.com/dmsuypprq/image/upload/v1738489765/bxe3q3uoapzktpuplggn.png"
        const verificationLink = `https://exclusive-ecommerce-lac.vercel.app/email/verify?token=${token}`;
        const transporter = nodemailer.createTransport({ host: "smtp-relay.brevo.com", port: 587, secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, }, });
        await transporter.sendMail({
            from: `"Exclusive" <${process.env.EMAIL_USER}>`, to: email, subject: "Verify Your Email - Exclusive", html:
                `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>
                    @media only screen and (max-width: 600px) {
                    .container {
                        width: 90% !important;
                        padding: 20px !important;
                    }
                    .logo {
                        width: 80px !important;
                        height: 80px !important;
                    }
                    .title {
                        font-size: 22px !important;
                    }
                    .text, .footer {
                        font-size: 14px !important;
                    }
                    .verify-btn {
                        width: 100% !important;
                        padding: 12px 0 !important;
                    }
                    }
                </style>
                </head>
                <body style="margin:0; padding:0; background-color:#f2f2f2;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;">
                    <tr>
                    <td align="center">
                        <table class="container" width="500" cellpadding="0" cellspacing="0" style="background-color:white; padding:40px; border-radius:8px; border:1px solid #ddd;">
                        <tr>
                            <td align="center">
                            <img src="${logo}" alt="Logo" class="logo" style="width:120px; height:120px;" />
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 28px 0;">
                            <h2 class="title" style="font-size:28px; font-weight:600; margin:0;">Please verify your email</h2>
                            <p class="text" style="font-size:15px; margin-top:10px; color:#333;">To use Exclusive, click the verification button below. This helps keep your account secure.</p>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 30px 0;">
                            <a href="${verificationLink}" class="verify-btn" style="display:block; background-color:#DB4444; color:white; text-decoration:none; border-radius:8px; padding:11px 0; width:154px; text-align:center;">Verify my account</a>
                            </td>
                        </tr>
                        <tr>
                            <td align="center">
                            <p class="footer" style="font-size:15px; color:#777; text-align:center;">
                                This verification link is valid for 10 minutes. If you didn't request this, ignore this email.
                            </p>
                            </td>
                        </tr>
                        </table>
                    </td>
                    </tr>
                </table>
                </body>
                </html>
                `
        });
        res.status(201).json({
            name: fullName
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const addCustomer = async (req, res) => {
    try {
        const { name, email, phoneNumber, gender } = req.body;
        if (!name || !email || !phoneNumber || !gender) {
            return res.status(400).json({ message: "Incomplete details" });
        }

        const existingCustomer = await User.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({ message: "Customer with provided email exists" });
        }
        const counter = await Counter.findOneAndUpdate({ id: "customer_counter" }, { $inc: { seq: 1 } }, { new: true, upsert: true })
        const custID = counter.seq;
        const hashedPassword = await bcrypt.hash("AdminSetPassword0000", 10);

        const user = new User({
            fullName: name,
            email,
            password: hashedPassword,
            gender,
            phoneNumber,
            custID,
            ...(req.body.addresses && { addresses: req.body.addresses }),
            ...(req.body.defaultShippingAddress && { defaultShippingAddress: req.body.defaultShippingAddress }),
            ...(req.body.defaultBillingAddress && { defaultBillingAddress: req.body.defaultBillingAddress })
        });

        const savedUser = await user.save();

        const cart = new Cart({ user: savedUser._id });
        const savedCart = await cart.save();

        savedUser.cart = savedCart._id;
        await savedUser.save();

        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const logo = "https://res.cloudinary.com/dmsuypprq/image/upload/v1738489765/bxe3q3uoapzktpuplggn.png";
        const passwordSetLink = `http://localhost:5173/password-form?create=true&token=${token}`;

        await axios.post(
            process.env.API_URL,
            {
                sender: { email: "shaheerasim320@gmail.com", name: "Shaheer Asim" },
                to: [{ email }],
                subject: "Set Your Password - Exclusive",
                htmlContent: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Set Password</title>
                    </head>
                    <body>
                        <div style="padding: 40px; background-color: white; border:1px solid black; border-radius: 6px;">
                            <div style="width:120px; height:120px; margin:0 auto;">
                                <img src=${logo} alt="Exclusive" style="width:100%; height:100%;">
                            </div>
                            <div style="width:320px; margin:28px auto;">
                                <h2 style="font-weight:600; font-size:28px; text-align:center;">Welcome to Exclusive</h2>
                                <p style="text-align:center; font-size:15px;">Please click the button below to set your password and activate your account.</p>
                            </div>
                            <div style="width:154px; margin:40px auto;">
                                <a href="${passwordSetLink}" style="display:block; background-color:#DB4444; text-decoration:none; text-align:center; color:white; width:154px; border-radius:8px; padding:11px 0;">Set Your Password</a>
                            </div>
                            <div style="width:318px; margin:0 auto;">
                                <p style="text-align:center; font-size:13px;">This password setup link is valid for 1 hour. If you didn't request this, you can ignore this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        res.status(201).json({ message: "Customer created. An email has been sent to set their password." });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const setPassword = async (req, res) => {
    const { token, password } = req.body
    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10)
        const updatedUser = await User.findByIdAndUpdate(decoded.userId, { status: "verified", password: hashedPassword }, { new: true })
        if (!updatedUser) {
            return res.status(404).json({ message: "User Not Found" })
        }
        res.status(200).json({ message: "User verified successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const verifyUser = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updatedUser = await User.findByIdAndUpdate(decoded.userId, { status: "verified" }, { new: true })
        if (!updatedUser) {
            return res.status(404).json({ message: "User Not Found" })
        }
        res.status(200).json({ message: "User verified successfully" });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resendToken = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.status == "verified") {
            return res.status(400).json({ message: "Your email is already verified. Please log in instead." });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30m" });
        const logo = "https://res.cloudinary.com/dmsuypprq/image/upload/v1738489765/bxe3q3uoapzktpuplggn.png"; // Ensure this URL is accessible

        const isAdminPassword = await bcrypt.compare("AdminSetPassword0000", user.password);
        // Determine the purpose: verification or password setup
        let subject, htmlContent;

        // Base URL for frontend, use environment variable for production
        const frontendBaseUrl = "https://exclusive-ecommerce-lac.vercel.app";

        if (isAdminPassword) {
            // Admin-created user: password setup email
            const passwordSetLink = `${frontendBaseUrl}/password-form?create=true&token=${token}`;
            subject = "Set Your Password - Exclusive";
            htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        /* Basic reset for email clients */
                        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                        a[x-apple-data-detectors] {
                            color: inherit !important;
                            text-decoration: none !important;
                            font-size: inherit !important;
                            font-family: inherit !important;
                            font-weight: inherit !important;
                            line-height: inherit !important;
                        }
                        /* Responsive styles */
                        @media screen and (max-width: 600px) {
                            .email-container {
                                width: 100% !important;
                            }
                            .button-container {
                                width: 100% !important;
                                text-align: center !important;
                            }
                            .button-link {
                                width: 90% !important; /* Make button wider on small screens */
                                padding: 15px 0 !important;
                            }
                            .content-padding {
                                padding: 20px !important;
                            }
                            .logo-container {
                                width: 100% !important;
                                text-align: center !important;
                            }
                            .logo-img {
                                max-width: 100px !important;
                                height: auto !important;
                            }
                            .text-block {
                                width: 90% !important;
                                margin: 20px auto !important;
                            }
                            h2 {
                                font-size: 24px !important;
                            }
                            p {
                                font-size: 14px !important;
                            }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: white; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                    <tr>
                                        <td align="center" style="padding: 40px 20px 20px 20px;" class="content-padding">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" class="logo-container" style="padding-bottom: 20px;">
                                                        <img src="${logo}" alt="Exclusive" class="logo-img" style="display: block; width: 120px; height: 120px; border-radius: 50%;">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="padding: 0 20px;">
                                                        <h2 style="font-weight: 600; font-size: 28px; text-align: center; color: #333333; margin: 0 0 15px 0;">Set Your Password</h2>
                                                        <p style="text-align: center; font-size: 15px; line-height: 22px; color: #555555; margin: 0;">Click the button below to set your password and activate your account.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="padding: 40px 0;">
                                                        <table border="0" cellpadding="0" cellspacing="0" class="button-container" style="width: 100%;">
                                                            <tr>
                                                                <td align="center">
                                                                    <a href="${passwordSetLink}" class="button-link" style="display: inline-block; background-color: #DB4444; text-decoration: none; text-align: center; color: white; border-radius: 8px; padding: 12px 25px; font-size: 16px; font-weight: bold;">Set Your Password</a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="padding: 0 20px 20px 20px;">
                                                        <p style="text-align: center; font-size: 13px; color: #777777; margin: 0;">This link is valid for 30 minutes.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;
        } else {
            // Self-registration: verification email
            const verificationLink = `${frontendBaseUrl}/email/verify?token=${token}`;
            subject = "Verify Your Email - Exclusive";
            htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${subject}</title>
                    <style>
                        /* Basic reset for email clients */
                        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                        a[x-apple-data-detectors] {
                            color: inherit !important;
                            text-decoration: none !important;
                            font-size: inherit !important;
                            font-family: inherit !important;
                            font-weight: inherit !important;
                            line-height: inherit !important;
                        }
                        /* Responsive styles */
                        @media screen and (max-width: 600px) {
                            .email-container {
                                width: 100% !important;
                            }
                            .button-container {
                                width: 100% !important;
                                text-align: center !important;
                            }
                            .button-link {
                                width: 90% !important; /* Make button wider on small screens */
                                padding: 15px 0 !important;
                            }
                            .content-padding {
                                padding: 20px !important;
                            }
                            .logo-container {
                                width: 100% !important;
                                text-align: center !important;
                            }
                            .logo-img {
                                max-width: 100px !important;
                                height: auto !important;
                            }
                            .text-block {
                                width: 90% !important;
                                margin: 20px auto !important;
                            }
                            h2 {
                                font-size: 24px !important;
                            }
                            p {
                                font-size: 14px !important;
                            }
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                        <tr>
                            <td align="center" style="padding: 20px 0;">
                                <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: white; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                    <tr>
                                        <td align="center" style="padding: 40px 20px 20px 20px;" class="content-padding">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" class="logo-container" style="padding-bottom: 20px;">
                                                        <img src="${logo}" alt="Exclusive" class="logo-img" style="display: block; width: 120px; height: 120px; border-radius: 50%;">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="padding: 0 20px;">
                                                        <h2 style="font-weight: 600; font-size: 28px; text-align: center; color: #333333; margin: 0 0 15px 0;">Please verify your email</h2>
                                                        <p style="text-align: center; font-size: 15px; line-height: 22px; color: #555555; margin: 0;">Click the button below to verify your account.</p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="padding: 40px 0;">
                                                        <table border="0" cellpadding="0" cellspacing="0" class="button-container" style="width: 100%;">
                                                            <tr>
                                                                <td align="center">
                                                                    <a href="${verificationLink}" class="button-link" style="display: inline-block; background-color: #DB4444; text-decoration: none; text-align: center; color: white; border-radius: 8px; padding: 12px 25px; font-size: 16px; font-weight: bold;">Verify My Account</a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" style="padding: 0 20px 20px 20px;">
                                                        <p style="text-align: center; font-size: 13px; color: #777777; margin: 0;">This link is valid for 30 minutes.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `;
        }

        const transporter = nodemailer.createTransport({ host: "smtp-relay.brevo.com", port: 587, secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, }, });
        await transporter.sendMail({
            from: `"Exclusive" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent
        });

        res.status(200).json({ name: user?.fullName });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const subscribeToNewsletter = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        let recipientName = 'Subscriber'
        const user = await User.findOne({ email });
        if (user) {
            recipientName = user?.fullName;
        }

        const logo = "https://res.cloudinary.com/dmsuypprq/image/upload/v1738489765/bxe3q3uoapzktpuplggn.png"; // Your logo URL
        const subject = "Welcome to Our Newsletter - Exclusive!";

        const frontendBaseUrl = "https://exclusive-ecommerce-lac.vercel.app";

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
                /* Basic reset for email clients */
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }
                /* Responsive styles */
                @media screen and (max-width: 600px) {
                    .email-container {
                        width: 100% !important;
                    }
                    .button-container {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .button-link {
                        width: 90% !important; /* Make button wider on small screens */
                        padding: 15px 0 !important;
                    }
                    .content-padding {
                        padding: 20px !important;
                    }
                    .logo-container {
                        width: 100% !important;
                        text-align: center !important;
                    }
                    .logo-img {
                        max-width: 100px !important;
                        height: auto !important;
                    }
                    .text-block {
                        width: 90% !important;
                        margin: 20px auto !important;
                    }
                    h2 {
                        font-size: 24px !important;
                    }
                    p {
                        font-size: 14px !important;
                    }
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; -webkit-font-smoothing: antialiased;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="background-color: white; border: 1px solid #e0e0e0; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <tr>
                                <td align="center" style="padding: 40px 20px 20px 20px;" class="content-padding">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center" class="logo-container" style="padding-bottom: 20px;">
                                                <img src="${logo}" alt="Exclusive" class="logo-img" style="display: block; width: 120px; height: 120px; border-radius: 50%;">
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding: 0 20px;">
                                                <h2 style="font-weight: 600; font-size: 28px; text-align: center; color: #333333; margin: 0 0 15px 0;">Welcome to Our Newsletter, ${recipientName}!</h2>
                                                <p style="text-align: center; font-size: 15px; line-height: 22px; color: #555555; margin: 0;">Thank you for subscribing to our newsletter. You'll now receive updates on our latest products, exclusive offers, and exciting news!</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding: 30px 0;">
                                                <table border="0" cellpadding="0" cellspacing="0" class="button-container" style="width: 100%;">
                                                    <tr>
                                                        <td align="center">
                                                            <!-- Optional: Link to your shop or a welcome page -->
                                                            <a href="${frontendBaseUrl}" class="button-link" style="display: inline-block; background-color: #DB4444; text-decoration: none; text-align: center; color: white; border-radius: 8px; padding: 12px 25px; font-size: 16px; font-weight: bold;">Visit Our Shop</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding: 0 20px 20px 20px;">
                                                <p style="text-align: center; font-size: 13px; color: #777777; margin: 0;">You can unsubscribe at any time by clicking the link at the bottom of our emails.</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
        const transporter = nodemailer.createTransport({ host: "smtp-relay.brevo.com", port: 587, secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS, }, });
        await transporter.sendMail({
            from: `"Exclusive" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent
        });
        res.status(200).json({ message: `Newsletter confirmation email sent to ${email}` });
    } catch (error) {
        res.status(500).json({ message: `Failed to send newsletter confirmation email to ${email}` });
        console.error(error.message);
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body
    if (!email) return res.status(400).json({ message: "Email not provided" })

    try {
        const user = await User.findOne({ email: email })
        if (!user) return res.status(404).json({ message: "User not found" })
        if (user?.password) {
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return res.status(400).json({ message: "Incorrect password" })
        }

        if (user.status == "unverified") return res.status(403).json({ message: "User is not verified" })

        user.password = undefined
        user.createdAt = undefined
        user.updatedAt = undefined

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.status(200).json({
            message: "Login Successful",
            user: user,
            accessToken
        })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const refreshAccessToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const newAccessToken = generateAccessToken(decoded.userId);

        return res.status(200).json({ accessToken: newAccessToken })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const logout = (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
    });
    res.status(200).json({ message: "Logged out successfully" });
};

export const refreshUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "No refresh token" });
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const newAccessToken = generateAccessToken(decoded.userId);
        const user = await User.findById(decoded.userId).select("-password -createdAt -updatedAt");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            accessToken: newAccessToken,
            message: "User session refreshed",
            user
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const updateProfile = async (req, res) => {
    const userID = req.user?.userId;  // Check if userId exists

    let hashedPassword = "";

    if (!userID) {
        return res.status(400).json({ message: "User ID is missing" });
    }

    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.body.currentPassword && req.body.newPassword) {
            const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }

            if (req.body.newPassword !== req.body.confirmPassword) {
                return res.status(400).json({ message: "New password and confirmation password do not match" });
            }
            if (req.body.currentPassword === req.body.newPassword) {
                return res.status(400).json({ message: "New password is similar to current password" });
            }
            hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
            user.password = hashedPassword;
        }

        if (req.body.fullName) user.fullName = req.body.fullName;
        if (req.body.phoneNumber) user.phoneNumber = req.body.phoneNumber;
        if (req.body.gender) user.gender = req.body.gender;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ role: { $ne: "admin" } }).select('-password');
        res.status(200).json(customers)

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        res.status(200).json({ user });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};



