const getLuciaSDK = () => {
    const sdk = window.LuciaSDK;
    if (!sdk) {
        throw new Error("Lucia client-side SDK is not loaded.");
    }
    return sdk;
};

const lucia = {
    init: () => {
        try {
            // The CDN script auto-initializes via data-api-key in index.html.
            // Keep this as a safe no-op accessor in case this module runs first.
            getLuciaSDK();
        } catch (error) {
            console.error("Lucia init failed:", error);
        }
    },

    pageView: async (page) => {
        try {
            await getLuciaSDK().pageView(page);
        } catch (error) {
            console.error("Tracking page view failed:", error);
        }
    },

    trackConversion: async (eventTag, amount, eventDetails) => {
        try {
            await getLuciaSDK().trackConversion(eventTag, amount, eventDetails);
            console.log("Conversion tracked:", eventTag);
        } catch (error) {
            console.error("Tracking conversion failed:", error);
        }
    },

    userInfo: async (userId, userInfo) => {
        try {
            await getLuciaSDK().userInfo(userId, userInfo);
        } catch (error) {
            console.error("Updating user info failed:", error);
        }
    },

    updateUserId: async (currentUser, userId) => {
        try {
            await getLuciaSDK().updateUserId(currentUser, userId);
        } catch (error) {
            console.error("Updating user ID failed:", error);
        }
    },

    buttonClick: (buttonName) => {
        try {
            const sdk = getLuciaSDK();
            if (typeof sdk.buttonClick !== "function") {
                throw new Error("LuciaSDK.buttonClick is unavailable");
            }
            sdk.buttonClick(buttonName);
        } catch (error) {
            console.error(`Tracking button click failed for "${buttonName}":`, error);
        }
    }

}

lucia.init();
export default lucia;