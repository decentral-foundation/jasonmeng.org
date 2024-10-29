import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import Posts from './components/Posts';
import Art from './components/Art';
import About from './components/About';
import './index.css';

function App() {
  return (
    <Router>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Header />
        <Routes>
          <Route path="/" element={<Posts />} />
          <Route path="/art" element={<Art />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 