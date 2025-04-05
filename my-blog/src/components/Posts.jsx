import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import lucia from '../lucia';

function Posts() {
  lucia.pageView("posts");
  return (
    <div>
      <section>
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        {posts.map((post) => (
          <div key={post.id} className="mb-4">
            <span className="text-gray-500 mr-4">{post.date}</span>
            <Link 
              to={`/blog/${post.id}`} 
              className="text-blue-500 hover:underline"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Posts;