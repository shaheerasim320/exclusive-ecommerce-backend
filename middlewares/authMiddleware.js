import jwt from "jsonwebtoken";
import User from "../models/User.js"

export const verifyAccessToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access token missing" });
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired access token" });
    }
}

export const verifyAccessTokenOptional = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(token){
        try {
            const decoded = jwt.verify(token,process.env.ACCESS_SECRET);
            req.user = decoded;
        } catch (error) {
            console.warn("Invalid token, falling back to guest:", error.message);   
        }
    }
    next();

}


const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId)
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." })
        }
        next()
    } catch (error) {
        console.log(error.message)
        res.status(401).json({ message: "Not authorized, token failed" });
    }
}


export { verifyAdmin };