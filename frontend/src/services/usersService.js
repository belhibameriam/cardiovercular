import axiosInstance from "./axiosInstance";

const usersService = {

    // Get all users
    getAll: async () => {
        try {
            const response = await axiosInstance.get("/auth/users/");
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Get a user by ID
    get: async (id) => {
        try {
            const response = await axiosInstance.get(`/auth/users/${id}/`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Create a new user
    create: async (data) => {
        try {
            const response = await axiosInstance.post("/api/users/register", data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Update a user
    update: async (id, data) => {
        try {
            const response = await axiosInstance.put(`/auth/users/${id}/`, data);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // Delete a user
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/auth/users/${id}/`);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    },

};

export default usersService;