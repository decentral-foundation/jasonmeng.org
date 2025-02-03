import Lucia from "luciasdk-t3";

const LuciaSDK = Lucia; // basic rename, can probably make it less verbose

const lucia = {
    init: () => {
        console.log('About to initialize SDK');
        LuciaSDK.init({ 
            clientId: import.meta.env.VITE_CLIENT_ID,
            baseURL: import.meta.env.VITE_BASE_URL,
            api_key: import.meta.env.VITE_API_KEY,
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
      },
      updateUserId: async(currentUser, userId) => {
        try {
          await LuciaSDK.updateUserId(currentUser, userId);
        } catch (error) {
          console.error("Updating user ID failed:", error);
        }
      }
}


lucia.init(); // Initialize the SDK

export default lucia; 