import { useEffect } from "react";
import lucia from "../lucia";

import useScrollDepth from "../hooks/useScrollDepth";

function About() {
    useEffect(() => { lucia.pageView("About"); }, []);
    const depth = useScrollDepth();

    return (
      <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
        <h2 className="text-4xl font-bold mb-12 text-gray-900">About</h2>
        
        <div className="space-y-8 text-lg">
          <p className="text-gray-700">
          <div>Ling Qing Meng is the CEO of Lucia Protocol and an independent researcher focused on sequential decision systems for marketing and user behavior. Lucia is an AI-powered attribution and optimization platform designed to measure causality, not just correlation, across fragmented channels.
          </div>
          <br/>
          </p>
          <img src="https://i.imgur.com/P8gbG4F.jpeg" alt="Profile" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg mt-8 mb-2" />
          <p className="text-center text-sm italic text-gray-500 mb-8">L to R: Studio 189 Manager, Ling Qing Meng (Lucia Protocol CEO), Ana Andjelic (Espirit PR), Rosario Dawson (Star Wars, Men in Black)</p>
          <div>Before Lucia, he founded a cybersecurity and technology services firm covering systems architecture, product strategy, and GTM execution. Example projects include MEV-optimized infrastructure for Ethereum-aligned investors in San Francisco. <a href="https://medium.com/@codetractio/kyber-ico-who-and-how-to-get-into-round-2-5a99fb6cde32" className="text-blue-500 hover:text-blue-600 hover:underline">https://medium.com/@codetractio/kyber-ico-who-and-how-to-get-into-round-2-5a99fb6cde32</a> documents part of that work.
          </div>
          <br/>
          <div>
          He has served as CTO at an InsureTech platform, working alongside Will McDonough (former VP at Goldman Sachs). He has led technical teams, designed system architecture, performed audits, and worked with firms such as Quantstamp, FanVestor, and Machine Zone. 
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
            To date (last updated Jan 15th 2025), none of his clients have experienced a successful hack under his security scope. He is also featured in the blockchain reality show Angels Villa, where founders compete to build high-growth companies.
          </p>

          <p className="text-gray-700">
            He is an active angel investor and speaker, and is currently preparing a whitepaper on latent emotional state modeling for human-agent interaction. The objective is clear: define a hard problem, benchmark against strong baselines, and ship measurable gains.
          </p>
          <p className="text-sm text-gray-500 mb-6">Scroll depth: {depth}%</p>
        </div>
      </div>
    );
}

export default About;