import extendOrRecycleFlashSales from "../../cron/extendFlashSales.js";

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    await extendOrRecycleFlashSales();
    res.status(200).json({ message: "Flash sale cron complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Flash sale cron failed" });
  }
}
