/**
 * Latest TechFlow Labs videos, served as JSON.
 *
 * Source: the channel's public YouTube RSS feed — no API key needed.
 * The feed is fetched server-side (the browser cannot fetch it directly
 * across origins) and cached in memory for 15 minutes, so a burst of
 * visitors costs one feed fetch. When the feed is unreachable the
 * endpoint answers 502 and the site hides the videos section.
 *
 * GET /api/videos -> { videos: [{ id, title, url, thumbnail, publishedAt }] }
 *
 * ESM default export: this project is "type": "module" — a CommonJS
 * `module.exports` here crashes the function on Vercel with
 * FUNCTION_INVOCATION_FAILED.
 */

const CHANNEL_ID = "UCqn0cLpIctTHmY2Dr2hyMwA";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_MS = 15 * 60 * 1000;
const MAX_VIDEOS = 8;

let cache = { at: 0, videos: [] };

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .trim();
}

function field(entry, tag) {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(entry);
  return match ? decodeEntities(match[1]) : "";
}

/** Pure helper, exported so tests can feed it a saved feed. */
export function parseVideosFeed(xml) {
  const entries = String(xml || "").match(/<entry>[\s\S]*?<\/entry>/g) || [];
  return entries
    .map((entry) => {
      const id = field(entry, "yt:videoId");
      const title = field(entry, "title");
      const link = /<link rel="alternate" href="([^"]+)"/.exec(entry)?.[1] || "";
      const thumbnail =
        /<media:thumbnail url="([^"]+)"/.exec(entry)?.[1] || "";
      const publishedAt = field(entry, "published");
      if (!id || !title) return null;
      return {
        id,
        title,
        url: link || `https://www.youtube.com/watch?v=${id}`,
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        publishedAt,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_VIDEOS);
}

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Use GET for this endpoint." });
  }
  try {
    if (Date.now() - cache.at < CACHE_MS && cache.videos.length) {
      return json(res, 200, { videos: cache.videos });
    }
    const response = await fetch(FEED_URL, {
      headers: { "User-Agent": "mytechflowlabs-portal/1.0" },
    });
    if (!response.ok) throw new Error(`Feed answered ${response.status}.`);
    const videos = parseVideosFeed(await response.text());
    cache = { at: Date.now(), videos };
    return json(res, 200, { videos });
  } catch {
    return json(res, 502, {
      error: "Could not load the latest videos right now.",
    });
  }
}
