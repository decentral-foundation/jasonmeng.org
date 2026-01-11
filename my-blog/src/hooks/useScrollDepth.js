import {useState, useEffect} from 'react';


const useScrollDepth = () => {
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    let ticking = false;

    const updateDepth = () => {
      const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
      const maxScroll = scrollHeight - clientHeight;
      const currentDepth = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setDepth((prev) => {
        const next = Math.min(100, Math.max(0, Math.round(currentDepth)));
        if (next !== prev) {
          // console.log(`[useScrollDepth] depth: ${next}%`);
        }
        return next;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateDepth);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    updateDepth(); // capture initial position

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return depth;
};

export default useScrollDepth;