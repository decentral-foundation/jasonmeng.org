import lucia from "../lucia";
import useScrollDepth from "../hooks/useScrollDepth";

function About() {
    lucia.pageView("About");
    const depth = useScrollDepth();

    return (
      <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
        <h2 className="text-4xl font-bold mb-12 text-gray-900">About</h2>
        
        <div className="space-y-8 text-lg">
          <p className="text-gray-700">
          <div>Ling Qing Meng is the CEO of Lucia Protocol, an AI-powered Ad Attribution platform that tracks real-time user interactions, measures conversions, and optimizes marketing using DeFi data. Lucia integrates cross-channel attribution with decentralized identity for a complete view of the customer journey.
          </div>
          <br/>
          
          </p>
          <img src="https://i.imgur.com/P8gbG4F.jpeg" alt="Profile" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg mt-8 mb-2" />
          <p className="text-center text-sm italic text-gray-500 mb-8">L to R: Studio 189 Manager, Ling Qing Meng (Lucia Protocol CEO), Ana Andjelic (Espirit PR), Rosario Dawson (Star Wars, Men in Black)</p>
          <div>Before Lucia, he founded a Cybersecurity and Technology Services firm specializing in tech and GTM strategy. Example projects include working with HNWI Ethereum investors in San Francisco to MEV optimized trading infrastructure for deploying capital into competitive crowdsales. <a href="https://medium.com/@codetractio/kyber-ico-who-and-how-to-get-into-round-2-5a99fb6cde32" className="text-blue-500 hover:text-blue-600 hover:underline">https://medium.com/@codetractio/kyber-ico-who-and-how-to-get-into-round-2-5a99fb6cde32</a> covers those achievements.
          </div>
          <br/>
          <div>
          Ling has served as a CTO of an InsureTech platform, working alongside Will McDonough, who was formerly a VP at Goldman Sachs. He led technical teams, designed system architecture, performed audits and worked with firms like Quantstamp, FanVestor, and Machine Zone. 
          </div>
          
          <ul className="space-y-2 pl-6 text-gray-700"> 
            <li className="flex items-center">
              <span className="text-gray-400 mr-2">●</span>
              Quantstamp
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mr-2">●</span>
              Swissborg
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mr-2">●</span>
              Machine Zone
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mr-2">●</span>
              FanVestor
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mr-2">●</span>
              Digimax
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mr-2">●</span>
              and many more
            </li>
          </ul>

          <p className="text-gray-700">
            To this date (last updated Jan 15th 2025) none of his clients have ever gotten hacked. He is also starring in a blockchain reality show called Angels Villa. A show about 10 founders competing to build the next innovative multi-billion dollar company. He is one of the experts and contestants on the show. Preview can be viewed on Instgram.
          </p>

          <p className="text-gray-700">
            He is also an active angel investor and speaker. He has spoken at many conferences and workshops about blockchain technology and its applications.
          </p>
          <p className="text-sm text-gray-500 mb-6">Scroll depth: {depth}%</p>
        </div>
      </div>
    );
}

export default About;