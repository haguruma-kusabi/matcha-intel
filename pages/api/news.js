import { fetchRSS } from "../../lib/rss";

export default async function handler(
  req,
  res
) {
  try {
    const items = await fetchRSS();

    res.status(200).json(items);
  } catch (e) {
    res.status(500).json([]);
  }
}
