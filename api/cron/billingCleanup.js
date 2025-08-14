import cleanupBillings from "../../cron/cleanupBillings.js";

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    await cleanupBillings();
    res.status(200).json({ message: "Billing cleanup complete" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Billing cleanup failed" });
  }
}
