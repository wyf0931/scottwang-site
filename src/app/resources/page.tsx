import Link from "next/link";
import { getAllBooks } from "@/lib/content/books";
import { getAllResearch, researchPath } from "@/lib/content/research";

export const metadata = {
  title: "Resources",
  description: "ScottWang 的资源中心：精选书籍与外部阅读入口、读书笔记，以及 AI Agent 与各领域的研究报告。",
};

export default function ResourcesPage() {
  const books = getAllBooks();
  const research = getAllResearch();

  return (
    <section className="resources-page">
      <p className="eyebrow accent">/ resources</p>
      <h1>Resources</h1>
      <p className="lead">书籍入口与读书笔记，以及按领域整理的研究报告。外部内容注明来源和授权，站内报告标注方法与边界。</p>

      <section id="books" className="resource-section" aria-labelledby="books-heading">
        <h2 id="books-heading">Books</h2>
        {books.length === 0 ? (
          <p className="resource-empty">书架整理中。</p>
        ) : (
          <div className="books-list">
            {books.map((book) => (
              <article className="book-card" key={book.slug} id={book.slug}>
                <div className="book-meta">
                  <span>{book.status}</span>
                  <span>{book.language}</span>
                  <span>{book.author}</span>
                </div>
                <h3>{book.title}</h3>
                <p>{book.description}</p>
                {book.body && <p className="book-note">{book.body}</p>}
                <div className="tag-row">{book.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <p className="license-note">{book.licenseNote}</p>
                <div className="book-links">
                  <a href={book.readerUrl} target="_blank" rel="noreferrer">Read ↗</a>
                  <a href={book.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="research" className="resource-section" aria-labelledby="research-heading">
        <h2 id="research-heading">Research</h2>
        {research.length === 0 ? (
          <p className="resource-empty">研究报告撰写中。</p>
        ) : (
          <div className="research-grid">
            {research.map((report) => (
              <article className="research-card" key={report.slug}>
                <div className="research-meta">
                  <span>{report.industry}</span>
                  <time dateTime={report.date.toISOString()}>{report.date.toLocaleDateString("zh-CN")}</time>
                </div>
                <h3><Link href={researchPath(report.slug)}>{report.title}</Link></h3>
                <p>{report.description}</p>
                <div className="tag-row">{report.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                <Link className="text-link" href={researchPath(report.slug)}>Read report <span>→</span></Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
