import LuciaSDK from "lucia-sdk";

const lucia = {
    init: () => {
        LuciaSDK.init({
            baseURL: import.meta.env.VITE_BASE_URL,
            api_key: import.meta.env.VITE_API_KEY,
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
console.log("Lucia initialized", lucia);
export default lucia;