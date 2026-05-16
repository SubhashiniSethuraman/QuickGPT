import { InferenceClient } from "@huggingface/inference";

const huggingface = new InferenceClient(
    process.env.HUGGINGFACE_API_KEY
);

export default huggingface;