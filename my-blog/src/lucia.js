import LuciaSDK from "lucia-sdk";

const lucia = {
    init: () => {
        try {
            LuciaSDK.init({
                clientId: import.meta.env.VITE_CLIENT_ID,
                baseURL: import.meta.env.VITE_BASE_URL,
                apiKey: import.meta.env.VITE_API_KEY,
                debugURL: import.meta.env.VITE_CLICKINSIGHTS_DEBUG_URL,
            });
        } catch (error) {
            console.error("Lucia init failed:", error);
        }
    },

    pageView: async (page) => {
        try {
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

    userInfo: async (userId, userInfo) => {
        try {
            await LuciaSDK.userInfo(userId, userInfo);
        } catch (error) {
            console.error("Updating user info failed:", error);
        }
    },

    updateUserId: async (currentUser, userId) => {
        try {
            await LuciaSDK.updateUserId(currentUser, userId);
        } catch (error) {
            console.error("Updating user ID failed:", error);
        }
    },

    buttonClick: (buttonName) => {
        try {
            if (typeof LuciaSDK.buttonClick !== "function") {
                throw new Error("LuciaSDK.buttonClick is unavailable");
            }
            LuciaSDK.buttonClick(buttonName);
        } catch (error) {
            console.error(`Tracking button click failed for "${buttonName}":`, error);
        }
    }

}

lucia.init();
export default lucia;