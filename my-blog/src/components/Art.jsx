import lucia from "../lucia";
function Art() {
    lucia.pageView("Art");
    return (
      <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
        <h2 className="text-4xl font-bold mb-12 text-gray-900">Art</h2>
        
        {/* Bio section */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Bio</h3>
          <div className="space-y-2 text-lg">
            <div className="font-medium">Jason Meng</div>
            <div className="text-gray-600">Angel Investor, Speaker, Engineer</div>
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
              <a href="https://www.instagram.com/reel/C-r5xrQuhX6/?igsh=MXBmMmF2ampzcjVnOQ==">Instagram Video</a>
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
            <li>Jason speaks at NYC Blockchain Center's first educational seminar: <a className="text-blue-600 hover:text-blue-800">Link</a></li>
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
            The Transparency Hack was moderated by Ana Andjelic and divided into two different sessions.
          </blockquote>

          <img 
            src="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*qRYbR9HGTRi_28lX" 
            alt="Description of the image" 
            className="w-full rounded-lg shadow-md mt-8"
          />
        </div>
      </div>
    );
  }
  
  export default Art;
