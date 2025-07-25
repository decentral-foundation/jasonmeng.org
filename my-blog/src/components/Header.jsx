import { Link } from 'react-router-dom';
import lucia from "../lucia";

function Header() {
  lucia.pageView("Home");
  return (
    <header className="mb-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        <Link to="/">Jason M</Link>
      </h1>
      <nav className="flex justify-center gap-8">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/post">Posts</Link>
        <Link to="/apply">Apply</Link>
      </nav>
    </header>
  );
}

export default Header;