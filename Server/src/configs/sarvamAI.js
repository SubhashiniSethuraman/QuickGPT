import { SarvamAIClient } from "sarvamai";

const sarvamClient = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAM_API_KEY
});

export default sarvamClient;