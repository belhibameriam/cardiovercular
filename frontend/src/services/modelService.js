import axiosInstance from "./axiosInstance";
import uploadFileAxiosInstance from "./uploadFileAxiosInstance";

const modelService = {

    getSegmentationModels: async () => {
        try {
            const response = await axiosInstance.get("/api/segmentation-models/");
            return response.data;
        } catch (error) {
            console.error("Unable to get segmentation models", error);
            throw error;
        }
    },

    getImageCaptioningModels: async () => {
        try {
            const response = await axiosInstance.get("/api/image-captioning-models/");
            return response.data;
        } catch (error) {
            console.error("Unable to get image captioning models", error);
            throw error;
        }
    },

    createSegmentationModel: async (formData) => {
        try {
            const response = await uploadFileAxiosInstance.post("/api/segmentation-models/", formData);
            return response.data;
        } catch (error) {
            console.error("Segmentation model creation error:", error);
            throw error;
        }
    },

    createImageCaptioningModel: async (formData) => {
        try {
            const response = await uploadFileAxiosInstance.post("/api/image-captioning-models/", formData);
            return response.data;
        } catch (error) {
            console.error("Image captioning model creation error:", error);
            throw error;
        }
    },

    deleteSegmentationModel: async (modelId) => {
        try {
            const response = await axiosInstance.delete(`/api/segmentation-models/${modelId}`);
            return response.data;
        } catch (error) {
            console.error("Unable to delete segmentation model", error);
            throw error;
        }
    },


    deleteCaptioningModel: async (modelId) => {
        try {
            const response = await axiosInstance.delete(`/api/image-captioning-models/${modelId}`);
            return response.data;
        } catch (error) {
            console.error("Unable to delete image captioning model", error);
            throw error;
        }
    },
    

};

export default modelService;