type LinkCardProps = {
  href: string;
  title: string;
  description?: string;
  label?: string;
};

function isExternalUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function LinkCard({ href, title, description, label = "External link" }: LinkCardProps) {
  if (!isExternalUrl(href)) return <p className="embed-error">Invalid external link.</p>;

  return <aside className="link-card" aria-label={`${label}: ${title}`}>
    <a className="link-card-link" href={href} target="_blank" rel="noreferrer">
      <span className="link-card-kicker"><span>{label}</span><span aria-hidden="true">↗</span></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <span className="link-card-cta">Open link <span aria-hidden="true">↗</span></span>
    </a>
  </aside>;
}
