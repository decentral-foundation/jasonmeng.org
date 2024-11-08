function Art() {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Art</h2>
        <h3 className="text-xl font-semibold mt-6 mb-3"> Bio: </h3>
        <div>Jason Meng</div>
        <div> Angel Investor, Speaker, Engineer </div>
        <div>
          <a href="https://twitter.com/lingqingm" className="text-blue-600 underline hover:text-blue-800">Twitter</a>
        </div>
        <h3 className="text-xl font-semibold mt-6 mb-3"> Recent Talks </h3> 
        <div>Todo: Update this section with ETH CC</div>
        <figure className="max-w-[500px] w-full">
          <img 
            src="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*OQyZREFWnw8ZKhOVod-DsA.png" 
            alt="Description of the image" 
            className="w-full h-auto"
          />
          <figcaption className="text-gray-500 text-sm mt-2 text-center">
            Jason Meng speaking at Ministry of Ideas on the next digital disruption: How blockchain and AI will transform Guest Experience in Hospitality. Conference Website: https://moi.lemiami.com/
          </figcaption>
        </figure>
        <h3 className="text-xl font-semibold mt-6 mb-3"> Past Talks </h3>
        <ol>
          {/* add timestamp */}
          <li>Ling Qing Meng speaking at Hacker Dojo Santa Clara: <a href="https://www.youtube.com/watch?v=aLC-bNitw7Y" className="text-blue-600 underline hover:text-blue-800">Link</a></li>
          <li>Ling Qing Meng speaks at NYC Blockchain Center's first educational seminar: <a className="text-blue-600 underline hover:text-blue-800">Link</a></li>
          <li>Ling Qing Meng speaking at ETH San Francisco, the recent, largest Hackathon for blockchain developers: <a className="text-blue-600 underline hover:text-blue-800">Link</a></li>
          <li>Ling Qing Meng speaking at the WCEF blockchain conference: <a className="text-blue-600 underline hover:text-blue-800">Link</a></li>
          <li>Ling Qing Meng coaching a Hackathon team to first place in Korea: <a href="https://github.com/decentral-inc/secret-voting" className="text-blue-600 underline hover:text-blue-800">Link</a></li>
        </ol>
      </div>
    );
  }
  
  export default Art;