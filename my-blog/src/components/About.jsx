import lucia from "../lucia";
function About() {
    lucia.pageView("About");
    return (
      <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
        <h2 className="text-4xl font-bold mb-12 text-gray-900">About</h2>
        
        <div className="space-y-8 text-lg">
          <p className="text-gray-700">
            Jason Meng is an etablished engineer, builder and founder. He has been building and investing in web3 startups since 2017.
            He specialized in cybersecurity, creating a cybersecurity auditing firm that has worked with many successful projects including:
          </p>

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
            To this date (last updated Nov 7th 2024) none of his clients have ever gotten hacked. He is also starring in a blockchain reality show called Angels Villa. A show about 10 founders competing to build the next innovative multi-billion dollar company. He is one of the experts and contestants on the show. Preview can be viewed on Instgram.
          </p>

          <p className="text-gray-700">
            He is also an active angel investor and speaker. He has spoken at many conferences and workshops about blockchain technology and its applications.
          </p>
        </div>
      </div>
    );
}

export default About;