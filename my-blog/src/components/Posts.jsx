import { Link } from 'react-router-dom';
import { posts } from '../data/posts';
import { talks } from '../data/talks';

function Posts() {
  return (
    <div>
      <section className="mb-12">
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

      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Talks / Interviews</h2>
        {talks.map((talk) => (
          <div key={talk.id} className="mb-4">
            <span className="text-gray-500 mr-4">{talk.date}</span>
            <a href={talk.url} className="text-blue-500 hover:underline">
              {talk.title}
            </a>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Posts;