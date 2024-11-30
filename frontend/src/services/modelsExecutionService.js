import axiosInstance from "./axiosInstance";
import uploadFileAxiosInstance from "./uploadFileAxiosInstance";


const modelsExecutionService = {
    // Analyze X-ray (POST request with file upload)
    analyzeXray: async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await uploadFileAxiosInstance.post("/api/image-captioning/", formData);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Visualize X-ray (POST request with image_url)
    visualizeXray: async (imageUrl) => {
        try {
            const response = await axiosInstance.post("/api/segmentation/", { image_url: imageUrl });
            return response.data; // This will contain the processed image in base64 or binary
        } catch (error) {
            return Promise.reject(error);
        }
    },
};

export default modelsExecutionService;
