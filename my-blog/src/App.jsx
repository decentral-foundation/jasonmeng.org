import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import PostPage from './components/PostPage';
import Art from './components/Art';
import About from './components/About';
import Header from './components/Header';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto px-4">
        <Header />
        <Routes>
          <Route path="/" element={<Posts />} />
          <Route path="/blog/:id" element={<PostPage />} />
          <Route path="/art" element={<Art />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App; 