import { useParams, Link } from 'react-router-dom';
import { posts } from '../data/posts';
import lucia from '../lucia';

function PostPage() {
  const { id } = useParams();
  const post = posts.find(post => post.id === id);
  lucia.pageView("PostPage");

  const handleLoginClick = () => {
    console.log('Login button clicked');

    // technically this isn't a conversion, need to add a donate button 
    lucia.trackConversion('back_to_post_click', 0, {
        page: window.location.pathname,
        timestamp: new Date().toISOString()
    });
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <Link 
          to="/" 
          className="text-blue-500 hover:underline"
          onClick={handleLoginClick}
        >
          ← Back to Posts
        </Link>
      </div>
    );
  }

  // Render content with HTML support
  const createMarkup = () => {
    return { __html: post.content.trim() };
  };

  return (
    <article className="max-w-2xl mx-auto py-8">
      <Link to="/" className="text-blue-500 hover:underline mb-4 block">
        ← Back to Posts
      </Link>
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <div className="text-gray-500 mb-8">{post.date}</div>
      <div className="prose lg:prose-xl" dangerouslySetInnerHTML={createMarkup()} />
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
