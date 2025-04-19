import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import PostPage from './components/PostPage';
import Art from './components/Art';
import About from './components/About';
import Apply from './components/Apply';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto px-4">
        <CookieConsent />
        <Header />
        <Routes>
          <Route path="/" element={<Posts />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/art" element={<Art />} />
          <Route path="/about" element={<About />} />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;