import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import dotenv from "dotenv"
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Counter from "../models/Counter.js";
dotenv.config()


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/api/v1/users/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value })

        if (!user) {
            const counter = await Counter.findOneAndUpdate({ id: "customer_counter" }, { $inc: { seq: 1 } }, { new: true, upsert: true })
            const custID = counter.seq;
            user = new User({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                status: "verified",
                custID: custID
            })
            await user.save();
            const cart = new Cart({ user: user._id })
            await cart.save()
            const wishlist = new Wishlist({ user: user._id })
            await wishlist.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}))

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
})

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});


export const googleCallback = [
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login", session: false }),
  (req, res) => {
    const user = req.user;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "Strict"
    });

    const redirectUrl = `http://localhost:5173/auth-callback?token=${accessToken}`;
    res.redirect(redirectUrl);
  }
];
