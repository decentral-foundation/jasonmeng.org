function Posts() {
  const posts = [
    {
      date: "Feb 18, 2020",
      title: "First Blog Post",
      url: "#"
    },
    {
      date: "Feb 5, 2020",
      title: "Second Blog Post",
      url: "#"
    },
  ];

  const talks = [
    {
      date: "Mar 24, 2021",
      title: "First Talk",
      url: "#"
    },
    {
      date: "Apr 8, 2021",
      title: "Second Talk",
      url: "#"
    },
  ];

  return (
    <div>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        {posts.map((post, index) => (
          <div key={index} className="mb-4">
            <span className="text-gray-500 mr-4">{post.date}</span>
            <a href={post.url} className="text-blue-500 hover:underline">
              {post.title}
            </a>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Talks / Interviews</h2>
        {talks.map((talk, index) => (
          <div key={index} className="mb-4">
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