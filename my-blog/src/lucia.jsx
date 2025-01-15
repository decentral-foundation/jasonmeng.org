import Lucia from "luciasdk-v3";

const LuciaSDK = Lucia; // basic rename, can probably make it less verbose

const lucia = {
    init: () => {
        console.log('About to initialize SDK');
        LuciaSDK.init({ 
            clientId: process.env.VITE_CLIENT_ID,
            baseURL: process.env.VITE_BASE_URL,
            api_key: process.env.VITE_API_KEY,
        });
        LuciaSDK.getClientIP();
      },
    
      pageView: (page) => {
        console.log('Attempting to track page view:', page);
        LuciaSDK.pageView(page);
      },
      trackConversion: async (eventTag, amount, eventDetails) => {
        try {
          await LuciaSDK.trackConversion(eventTag, amount, eventDetails);
          console.log("Conversion tracked:", eventTag);
        } catch (error) {
          console.error("Tracking conversion failed:", error);
        }
      },
      findIP: () => {
        LuciaSDK.findIP();
      }
}


lucia.init(); // Initialize the SDK

export default lucia; 