import { getAllBooks } from "@/lib/content/books";

export const metadata = { title: "Books", description: "ScottWang 精选的技术书架：优先收录可公开阅读、适合长期参考的工程与 AI 书籍。" };

export default function BooksPage() {
  const books = getAllBooks();

  return (
    <section className="books-page">
      <p className="eyebrow accent">/ curated shelf</p>
      <h1>Books</h1>
      <p className="lead">精选的开源或公开阅读电子书。本站做筛选、归档和入口，优先尊重原作者维护的官方阅读体验。</p>
      <div className="books-list">
        {books.map((book) => <BookCard key={book.slug} book={book} />)}
      </div>
    </section>
  );
}

function BookCard({ book }: { book: ReturnType<typeof getAllBooks>[number] }) {
  return (
    <article className="book-card" id={book.slug}>
      <div className="book-meta">
        <span>{book.status}</span>
        <span>{book.language}</span>
        <span>{book.author}</span>
      </div>
      <h2>{book.title}</h2>
      <p>{book.description}</p>
      {book.body && <p className="book-note">{book.body}</p>}
      <div className="tag-row">{book.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <p className="license-note">{book.licenseNote}</p>
      <div className="book-links">
        <a href={book.readerUrl} target="_blank" rel="noreferrer">Read ↗</a>
        <a href={book.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
      </div>
    </article>
  );
}
