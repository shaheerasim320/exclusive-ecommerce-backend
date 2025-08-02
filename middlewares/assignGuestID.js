import { v4 as uuidv4 } from "uuid";

export const assignGuestId = (req, res, next) => {
    if (!req.cookies.guest_id && !req.user) {
        const guestId = uuidv4();
        res.cookie("guest_id", guestId, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            sameSite: "Lax",
            secure: true,
        });
        req.guestId = guestId;
    } else if (!req.user) {
        req.guestId = req.cookies.guest_id;
    }
    next();
};
