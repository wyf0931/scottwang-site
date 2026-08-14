"use client";

import { create, insert, search } from "@orama/orama";
import { createTokenizer } from "@orama/tokenizers/mandarin";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SearchDocument = { id: string; title: string; description: string; body: string; type: string; tags: string; date: string; url: string };
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [results, setResults] = useState<SearchDocument[]>([]);
  const db = useRef<unknown>(null);

  useEffect(() => {
    if (!open || db.current) return;
    fetch("/search-index.json").then((response) => response.json() as Promise<SearchDocument[]>).then((items) => {
      const index = create({
        schema: { title: "string", description: "string", body: "string", type: "string", tags: "string", date: "string", url: "string" },
        components: { tokenizer: createTokenizer() },
      });
      items.forEach((item) => insert(index as never, item as never));
      db.current = index;
      setDocuments(items);
    });
  }, [open]);

  useEffect(() => {
    if (!query.trim() || !db.current) { setResults([]); return; }
    void (async () => {
      const response = await search(db.current as never, { term: query, properties: ["title", "description", "body", "tags"], limit: 8 } as never) as { hits: Array<{ document: SearchDocument }> };
      setResults(response.hits.map((hit) => hit.document));
    })();
  }, [query, documents]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(true); } if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  return <>
    <button className="search-trigger" onClick={() => setOpen(true)} aria-label="Search"><span>⌕</span><kbd>⌘ K</kbd></button>
    {open && <div className="search-backdrop" role="presentation" onClick={() => setOpen(false)}><section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search site" onClick={(event) => event.stopPropagation()}><div className="search-input-row"><span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章、项目、报告和书…" /></div><div className="search-results">{query && results.length === 0 && <p className="search-empty">没有找到匹配内容。</p>}{results.map((result) => <Link className="search-result" key={result.id} href={new URL(result.url).pathname} onClick={() => setOpen(false)}><span className="eyebrow accent">{result.type}</span><strong>{result.title}</strong><small>{result.description}</small></Link>)}{!query && <p className="search-hint">输入中文或英文关键词开始检索</p>}</div></section></div>}
  </>;
}
