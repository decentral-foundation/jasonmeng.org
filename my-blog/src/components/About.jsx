import lucia from "../lucia";

function About() {
    lucia.pageView("About");
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">About</h2>
        <p>About content coming soon...</p>
      </div>
    );
  }
  
  export default About;