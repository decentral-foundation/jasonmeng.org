import LuciaSDK from "luciasdk-t3";

const lucia = {
    init: () => {
        LuciaSDK.init({
            baseURL: process.env.VITE_BASE_URL,
            api_key: process.env.VITE_API_KEY,
        });
    },

    pageView: (page) => {
        LuciaSDK.pageView(page);
    },

    trackConversion: async (eventTag, amount, eventDetails) => {
        try {
            await LuciaSDK.trackConversion(eventTag, amount, eventDetails);
            console.log("Conveersion tracked: ", eventTag);
        } catch (error) {
            console.error("track conversion failed: ",error);
        }
    }

}

lucia.init();

export default lucia;