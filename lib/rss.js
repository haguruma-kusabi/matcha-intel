import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
});

const KEYWORDS = [
  "抹茶",
  "宇治抹茶",
  "抹茶スイーツ",
  "抹茶アイス",
  "抹茶ラテ",
];

export async function fetchRSS() {
  const all = [];

  for (const word of KEYWORDS) {
    try {
      const url =
        "https://news.google.com/rss/search?q=" +
        encodeURIComponent(word) +
        "&hl=ja&gl=JP&ceid=JP:ja";

      const res = await fetch(url);

      const xml = await res.text();

      const json = parser.parse(xml);

      const items =
        json?.rss?.channel?.item || [];

      for (const item of items) {
        all.push({
          title: item.title || "",
          link: item.link || "",
          date:
            item.pubDate ||
            new Date().toISOString(),
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return dedupe(all);
}

/* =========================
   ■ 重複統合
========================= */
function dedupe(items) {
  const map = new Map();

  for (const item of items) {
    const key = normalize(item.title);

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );
}

/* =========================
   ■ 正規化
========================= */
function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[【】\[\]（）()]/g, "")
    .replace(/\s/g, "")
    .replace(/宇治抹茶/g, "抹茶")
    .replace(/matcha/g, "抹茶");
}
