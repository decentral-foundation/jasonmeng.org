import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import PostPage from './components/PostPage';
import Art from './components/Art';
import About from './components/About';
import Apply from './components/Apply';
import Header from './components/Header';
import './index.css';

function App() {
  const handleTestClick = () => {
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'test_button_click',
        'category': 'Test',
        'action': 'Click',
        'label': 'GTM Test Button'
      });
      console.log('GTM test event pushed');
    } else {
      console.error('dataLayer not found');
    }
  };

  return (
    <BrowserRouter>
      <div className="container mx-auto px-4">
        <button
          onClick={handleTestClick}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Test GTM
        </button>
        <Header />
        <Routes>
          <Route path="/" element={<Posts />} />
          <Route path="/blog/:id" element={<PostPage />} />
          <Route path="/art" element={<Art />} />
          <Route path="/about" element={<About />} />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;