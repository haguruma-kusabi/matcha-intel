import { useEffect, useMemo, useState } from "react";

/* =========================
   ■ グループ
========================= */
const GROUPS = {
  コンビニ: ["ローソン", "セブン", "ファミマ"],
  カフェ: ["スタバ", "タリーズ", "ドトール"],
  その他: ["その他"],
};

/* =========================
   ■ ブランド判定
========================= */
const getBrand = (item) => {
  const text = (
    (item.title || "") +
    (item.link || "")
  )
    .toLowerCase()
    .replace(/\s/g, "");

  if (/(lawson|ローソン)/.test(text))
    return "ローソン";

  if (/(7-?eleven|セブン)/.test(text))
    return "セブン";

  if (/(familymart|ファミマ)/.test(text))
    return "ファミマ";

  if (
    /(starbucks|スタバ|スターバックス)/.test(
      text
    )
  )
    return "スタバ";

  if (/(tully'?s|タリーズ)/.test(text))
    return "タリーズ";

  if (/(doutor|ドトール)/.test(text))
    return "ドトール";

  return "その他";
};

const getBrandColor = (brand) => {
  if (brand === "セブン") return "#ff9f43";

  if (brand === "ローソン")
    return "#2d7ff9";

  if (brand === "ファミマ")
    return "#2ecc71";

  if (brand === "スタバ")
    return "#0f9d58";

  if (brand === "タリーズ")
    return "#b71c1c";

  if (brand === "ドトール")
    return "#795548";

  return "#666";
};

const getEmoji = (text = "") => {
  if (/アイス/.test(text)) return "🍨";

  if (/ラテ|ドリンク/.test(text))
    return "🍵";

  if (/ケーキ|スイーツ/.test(text))
    return "🍡";

  return "🍃";
};

export default function Home() {
  const [items, setItems] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [keyword, setKeyword] =
    useState("");

  const [activeGroups, setActiveGroups] =
    useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/news");

      const data = await res.json();

      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = (
        item.title +
        item.link
      ).toLowerCase();

      if (
        keyword &&
        !text.includes(keyword.toLowerCase())
      ) {
        return false;
      }

      const brand = getBrand(item);

      if (activeGroups.length > 0) {
        const ok = activeGroups.some((g) =>
          GROUPS[g].includes(brand)
        );

        if (!ok) return false;
      }

      return true;
    });
  }, [items, keyword, activeGroups]);

  const toggleGroup = (g) => {
    setActiveGroups((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g]
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.sticky}>
        <h1 style={styles.title}>
          METCHA 🍵 MATCHA
        </h1>

        <div style={styles.searchRow}>
          <input
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
            placeholder="検索"
            style={styles.search}
          />
        </div>

        <div style={styles.filterRow}>
          {Object.keys(GROUPS).map((g) => (
            <button
              key={g}
              onClick={() =>
                toggleGroup(g)
              }
              style={filterBtn(
                activeGroups.includes(g)
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <div style={styles.infoRow}>
          {filtered.length}件
        </div>
      </div>

      <div style={styles.contentArea}>
        {loading && (
          <div style={styles.loading}>
            読み込み中...
          </div>
        )}

        <div style={styles.grid}>
          {!loading &&
            filtered.map((item, i) => {
              const brand = getBrand(item);

              return (
                <div
                  key={i}
                  style={styles.card}
                >
                  <div
                    style={{
                      ...styles.brandBadge,
                      background:
                        getBrandColor(
                          brand
                        ),
                    }}
                  >
                    {brand}
                  </div>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      textDecoration:
                        "none",
                    }}
                  >
                    <div
                      style={styles.emojiBox}
                    >
                      {getEmoji(
                        item.title
                      )}
                    </div>

                    <div
                      style={styles.titleText}
                    >
                      {item.title}
                    </div>
                  </a>

                  <div
                    style={styles.dateText}
                  >
                    {new Date(
                      item.date
                    ).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    overflow: "hidden",

    display: "flex",
    flexDirection: "column",

    padding: "0 16px",

    maxWidth: 520,
    margin: "0 auto",

    background:
      "linear-gradient(180deg,#0f3d2e,#1f5c45,#3b7a57)",

    color: "#fff",
  },

  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 10,

    paddingTop: 14,
    paddingBottom: 12,

    background:
      "rgba(15,61,46,0.92)",

    backdropFilter: "blur(10px)",
  },

  contentArea: {
    flex: 1,
    overflow: "hidden",
    paddingBottom: 120,
  },

  grid: {
    display: "grid",
    gap: 18,

    overflowY: "auto",

    height: "100%",

    scrollbarWidth: "none",
  },

  title: {
    textAlign: "center",
    fontSize: 24,
    marginBottom: 14,
  },

  searchRow: {
    marginBottom: 10,
  },

  search: {
    width: "100%",
    padding: 10,

    border: "none",

    borderRadius: 12,
  },

  filterRow: {
    display: "flex",
    gap: 6,

    marginBottom: 10,
  },

  infoRow: {
    fontSize: 12,
    color: "#d7e0e5",
  },

  loading: {
    textAlign: "center",
    marginTop: 24,
  },

  card: {
    background: "#fff",

    color: "#111",

    borderRadius: 18,

    padding: 12,

    position: "relative",
  },

  brandBadge: {
    position: "absolute",

    top: 10,
    right: 10,

    color: "#fff",

    padding: "4px 8px",

    borderRadius: 8,

    fontSize: 10,
  },

  emojiBox: {
    height: 105,

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: 40,

    background: "#eef6f1",

    borderRadius: 12,

    marginBottom: 10,
  },

  titleText: {
    color: "#111",

    fontSize: 14,

    fontWeight: "bold",

    lineHeight: 1.5,

    marginBottom: 10,
  },

  dateText: {
    fontSize: 11,
    color: "#666",
  },
};

const filterBtn = (active) => ({
  flex: 1,

  padding: 8,

  border: "none",

  borderRadius: 10,

  color: "#fff",

  background: active
    ? "#27ae60"
    : "#2a2f36",
});
