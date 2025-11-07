import { useState, useEffect } from 'react';
import lucia from "../lucia";
function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    lucia.buttonClick('accept_cookie_consent');
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    lucia.buttonClick('decline_cookie_consent');
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm border border-gray-200">
      <p className="text-sm text-gray-600 mb-3">
        We use cookies to improve your experience. By continuing to use this site, you agree to our use of cookies.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleDecline}
          className="bg-gray-200 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
        >
          No thanks
        </button>
        <button
          onClick={handleAccept}
          className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default CookieConsent;
