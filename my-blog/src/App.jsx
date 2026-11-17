import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Posts from './components/Posts';
import PostPage from './components/PostPage';
import Home from './components/Home';
import About from './components/About';
import Apply from './components/Apply';
import Header from './components/Header';
import CookieConsent from './components/CookieConsent';
import './index.css';

// Lazy so wagmi/viem only load on the purchase page, not on every post.
const PipelineAudit = lazy(() => import('./components/PipelineAudit'));

function App() {
  return (
    <BrowserRouter>
      <div className="container mx-auto px-4">
        <CookieConsent />
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<Posts />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/apply" element={<Apply />} />
          <Route
            path="/pipeline-audit"
            element={
              <Suspense fallback={<div className="max-w-[768px] mx-auto px-4 py-12 text-gray-500">Loading…</div>}>
                <PipelineAudit />
              </Suspense>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;