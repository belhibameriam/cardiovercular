import axiosInstance from "./axiosInstance";
import uploadFileAxiosInstance from "./uploadFileAxiosInstance";


const patientsService = {

    // Get all patients
    getAll: async () => {
        try {
            const response = await axiosInstance.get("/api/patients/");
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },


    // Get a patient by ID
    get: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/patients/${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Create a new patient
    create: async (data) => {
        try {
            const response = await axiosInstance.post("/api/patients/", data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Update a patient
    update: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/api/patients/${id}`, data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    

    // Delete a patient

    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/api/patients/${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },



    //patient studies api
    // Get all studies of a patient
    getAllStudies: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/studies-by-patient/${id}/`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    createStudy: async (data) => {
        try {
            const response = await axiosInstance.post(`/api/studies/`, data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    //get study series
    getStudySeries: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/series?study=${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    createRelatedStudySerie: async (data) => {
        try {
            const response = await axiosInstance.post(`/api/series/`, data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    createRelatedSeriesDicomFile: async (data) => {
        try {
            const response = await uploadFileAxiosInstance.post(`/api/dicom-files/`, data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getSeriesDicomFiles: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/dicom-files?series=${id}`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }


}

export default patientsService;