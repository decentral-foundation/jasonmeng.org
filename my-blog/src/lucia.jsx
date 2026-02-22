import Lucia from "lucia-sdk";

const LuciaSDK = Lucia; // basic rename, can probably make it less verbose

const lucia = {
    init: () => {
        console.log('About to initialize SDK with prod url for staging lqm888 gm');
        LuciaSDK.init({ 
            clientId: import.meta.env.VITE_CLIENT_ID,
            baseURL: import.meta.env.VITE_BASE_URL,
            apiKey: import.meta.env.VITE_API_KEY,
            debugURL: import.meta.env.VITE_CLICKINSIGHTS_DEBUG_URL,
        });
      },
    
      pageView: async (page) => {
        try {
          console.log('Attempting to track page view:', page);
          await LuciaSDK.pageView(page);
        } catch (error) {
          console.error("Tracking page view failed:", error);
        }
      },
      trackConversion: async (eventTag, amount, eventDetails) => {
        try {
          await LuciaSDK.trackConversion(eventTag, amount, eventDetails);
          console.log("Conversion tracked:", eventTag);
        } catch (error) {
          console.error("Tracking conversion failed:", error);
        }
      },
      userInfo: async(userId,userInfo) => { 
        try {
          await LuciaSDK.userInfo(userId,userInfo);
        } catch (error) {
          console.error("Updating user info failed:", error);
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
