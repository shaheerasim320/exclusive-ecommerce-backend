import cleanGuestData from "../../cron/cleanGuestData.js";

export default async function handler(req, res) {
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized');
    }
    try {
        await cleanGuestData();
        res.status(200).json({ message: "Guest cleanup complete" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Guest cleanup failed" });
    }
}