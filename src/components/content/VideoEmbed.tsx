type VideoProps = { url: string; title?: string };

function extractYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (parsed.hostname.endsWith("youtube.com")) return parsed.searchParams.get("v") ?? parsed.pathname.split("/").pop();
  } catch { return null; }
  return null;
}

function extractBilibiliId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("bilibili.com")) return parsed.pathname.match(/(BV[a-zA-Z0-9]+)/)?.[1] ?? null;
  } catch { return null; }
  return null;
}

export function YouTubeEmbed({ url, title = "YouTube video" }: VideoProps) {
  const id = extractYouTubeId(url);
  if (!id) return <p className="embed-error">Invalid YouTube URL.</p>;
  return <div className="video-embed"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
}

export function BilibiliEmbed({ url, title = "Bilibili video" }: VideoProps) {
  const id = extractBilibiliId(url);
  if (!id) return <p className="embed-error">Invalid Bilibili URL.</p>;
  return <div className="video-embed"><iframe src={`https://player.bilibili.com/player.html?bvid=${id}&page=1`} title={title} loading="lazy" allowFullScreen /></div>;
}
