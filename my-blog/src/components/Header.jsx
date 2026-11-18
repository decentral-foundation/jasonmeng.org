import { Link } from 'react-router-dom';
import lucia from "../lucia";

function Header() {
  lucia.pageView("Home");
  return (
    <header className="mb-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        <Link to="/">Jason M</Link>
      </h1>
      <nav className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3 sm:gap-x-8">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/post">Posts</Link>
        <Link to="/apply">Apply</Link>
        <Link
          to="/pipeline-audit"
          className="whitespace-nowrap px-3 py-1 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
        >
          Pipeline Audit
        </Link>
      </nav>
    </header>
  );
}

export default Header;
