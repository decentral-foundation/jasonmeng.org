import { Link } from "react-router-dom";
import { posts } from "../data/posts";
import lucia from "../lucia";
import useScrollDepth from "../hooks/useScrollDepth";

function Home() {
    lucia.pageView("Home");
    const depth = useScrollDepth();

    return (
      <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
        <div className="relative w-full mb-12 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src="https://i.imgur.com/GUfPBYR.jpeg" 
            alt="Presenting on Blockchain & AI" 
            className="w-full h-64 md:h-80 object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow">
            <p className="text-xs md:text-sm uppercase tracking-wide text-white/80">Forefront of AI innovation</p>
            <h1 className="text-2xl md:text-3xl font-bold leading-snug">Founder who ships AI products and learns in public</h1>
            <p className="mt-2 text-sm md:text-base text-white/90">
              Building fast, talking to users, writing when it helps others learn.
            </p>
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-12 text-gray-900">Thesis</h2>

        <div className="mb-16">
          <div className="text-2xl font-semibold mb-6 text-gray-800">Concept</div>
          <div className="text-gray-600">Principled execution, shipping fast, listening to users</div>
        </div>
        
        <div className="mb-16">
          <div className="text-2xl font-semibold mb-6 text-gray-800">Recent Posts</div>
          <ul className="space-y-3 text-lg text-gray-700">
            {posts.slice(0, 3).map((post) => (
              <li key={post.id} className="flex flex-col">
                <span className="text-sm text-gray-500">{post.date}</span>
                <Link to={`/post/${post.id}`} className="text-blue-600 hover:text-blue-800">
                  {post.title}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/post" className="text-blue-600 hover:text-blue-800">
                View all posts →
              </Link>
            </li>
          </ul>
        </div>
        {/* Bio section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Bio</h3>
          <div className="space-y-2 text-lg">
            <div className="font-medium">Jason Meng</div>
            <div className="text-gray-600">Founder/Engineer building AI products</div>

            <div>
              I ship quickly, test with real users, and iterate. I speak at conferences when it helps distribution, but my bias is toward building, not punditry.
            </div>

            

            <div>
              <a href="https://twitter.com/lingqingm" className="text-blue-600 hover:text-blue-800">Twitter</a>
            </div>
          </div>
        </div>

        {/* Recent Appearances */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Recent Appearances</h3>
          <ul className="space-y-4 text-lg list-disc pl-6 text-gray-700">
            <li>Jason starring in Blockchain Reality Show Angels Villa. View trailer: 
              <a href="https://www.instagram.com/reel/C-r5xrQuhX6/?igsh=MXBmMmF2ampzcjVnOQ==" className="text-blue-600 hover:text-blue-800 underline">Instagram Video</a>
            </li>
            <li>Jason pitching at ETH CC 2024 in Brussels
              <a href="https://youtu.be/vg_Dh5hbOag" className="text-blue-600 hover:text-blue-800 mx-1">Part 1</a>
              <a href="https://youtu.be/RtKRJpnxfxY" className="text-blue-600 hover:text-blue-800 mx-1">Part 2</a>
              <a href="https://youtu.be/JN-tGf7BANQ" className="text-blue-600 hover:text-blue-800 mx-1">Part 3</a>
            </li>
          </ul>
        </div>

        <figure className="my-16">
          <img 
            src="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*OQyZREFWnw8ZKhOVod-DsA.png" 
            alt="Description of the image" 
            className="w-full rounded-lg shadow-md"
          />
          <figcaption className="text-gray-600 text-base mt-4 text-center leading-relaxed">
            Jason Meng speaking at Ministry of Ideas on the next digital disruption: How blockchain and AI will transform Guest Experience in Hospitality. Conference Website: https://moi.lemiami.com/
          </figcaption>
        </figure>

        

        {/* Past Talks */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Past Talks</h3>
          <ol className="space-y-4 text-lg list-decimal pl-6 text-gray-700">
            <li>Jason speaking at Hacker Dojo Santa Clara: <a href="https://www.youtube.com/watch?v=aLC-bNitw7Y" className="text-blue-600 hover:text-blue-800">Link</a></li>
            <li>Jason speaks at NYC Blockchain Center&apos;s first educational seminar: <a className="text-blue-600 hover:text-blue-800">Link</a></li>
            <li>Jason speaking at ETH San Francisco, the recent, largest Hackathon for blockchain developers: <a className="text-blue-600 hover:text-blue-800">Link</a></li>
            <li>Jason speaking at the WCEF blockchain conference: <a className="text-blue-600 hover:text-blue-800">Link</a></li>
            <li>Jason coaching a Hackathon team to first place in Korea: <a href="https://github.com/decentral-inc/secret-voting" className="text-blue-600 hover:text-blue-800">Link</a></li>
            <li>Jason speaking at Austin Texas <a className="text-blue-600 hover:text-blue-800">Link</a></li>
          </ol>
        </div>

        {/* Recent Speaking Experiences */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Recent Speaking Experiences</h3>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Representatives from various companies and organizations such as Patagonia, Reformation, Nike, Sustainable Apparel Coalition, Sudio 189, IBM, BCG and Microsfot participated in different workshops and addressed topics.
          </p>
          
          <blockquote className="my-8 pl-6 border-l-4 border-gray-300 italic text-xl text-gray-700">
            <a
              href="https://hmgroup.com/news/hm-group-transparency-hack/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              The Transparency Hack
            </a>{" "}
            was moderated by Ana Andjelic and divided into two different sessions.
          </blockquote>

          <img 
            src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*qRYbR9HGTRi_28lX" 
            alt="Description of the image" 
            className="w-full rounded-lg shadow-md mt-8"
          />
        </div>
        <p className="text-sm text-gray-500 mb-6">Scroll depth: {depth}%</p>
      </div>
    );
  }
  
  export default Home;
