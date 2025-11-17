import Lucia from "lucia-sdk";

const LuciaSDK = Lucia; // basic rename, can probably make it less verbose

const lucia = {
    init: () => {
        console.log('About to initialize SDK');
        LuciaSDK.init({ 
            clientId: import.meta.env.VITE_CLIENT_ID,
            baseURL: import.meta.env.VITE_BASE_URL,
            apiKey: import.meta.env.VITE_API_KEY,
            debugURL: import.meta.env.VITE_CLICKINSIGHTS_DEBUG_URL,
        });
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
      updateUserId: async(currentUser, userId) => {
        try {
          await LuciaSDK.updateUserId(currentUser, userId);
        } catch (error) {
          console.error("Updating user ID failed:", error);
        }
      },
      buttonClick: (buttonName) => {
        console.log('Tracked this Button being clicked:', buttonName);
        LuciaSDK.buttonClick(buttonName);
      }
}


lucia.init(); // Initialize the SDK

export default lucia; 
