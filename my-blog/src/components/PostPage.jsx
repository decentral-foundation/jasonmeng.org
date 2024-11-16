import { useParams, Link } from 'react-router-dom';
import { posts } from '../data/posts';

function PostPage() {
  const { id } = useParams();
  const post = posts.find(post => post.id === id);

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Posts
        </Link>
      </div>
    );
  }

  // Convert the content string into paragraphs
  const paragraphs = post.content
    .trim()
    .split('\n')
    .filter(p => p.trim())
    .map((p, i) => (
      <p key={i} className="mb-4">
        {p.trim()}
      </p>
    ));

  return (
    <article className="max-w-2xl mx-auto py-8">
      <Link to="/" className="text-blue-500 hover:underline mb-4 block">
        ← Back to Posts
      </Link>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="text-gray-500 mb-8">{post.date}</div>
      <div className="prose">
        {paragraphs}
      </div>
      {post.fullArticleUrl && (
        <footer className="mt-8 pt-4 border-t border-gray-200">
          <a 
            href={post.fullArticleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Read the full article →
          </a>
        </footer>
      )}
    </article>
  );
}

export default PostPage; 
