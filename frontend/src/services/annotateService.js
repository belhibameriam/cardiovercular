import uploadFileAxiosInstance from "./uploadFileAxiosInstance";

const annotateService = {
    
    async postImage(formData) {
        try {
            const response = await uploadFileAxiosInstance.post("api/dicom-images/", formData);
            return response.data;
        } catch (error) {
            console.error("Error posting image", error);
            throw error;
        }
    },

    async getSingleDicomImage(id) {
        try {
            const response = await uploadFileAxiosInstance.get(`api/dicom-files/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching single dicom image", error);
            throw error;
        }
    },
    
    async addAnnnotationsToDicomImage(data) {
        try {
            const response = await uploadFileAxiosInstance.post(`api/annotation-add-to-image/`, data);
            return response.data;
        } catch (error) {
            console.error("Error adding annotations to dicom image", error);
            throw error;
        }
    },
    
    async addSingleAnnotation(data) {
        try {
            const response = await uploadFileAxiosInstance.post(`api/annotations/`, data);
            return response.data;
        } catch (error) {
            console.error("Error adding single annotation", error);
            throw error;
        }
    },

    //DicomFileAnnotationsView
    async getDicomFileAnnotationsView(id) {
        try {
            const response = await uploadFileAxiosInstance.get(`api/annotation-dicom-file/${id}/`);
            return response.data;
        } catch (error) {
            console.error("Error fetching dicom file annotations view", error);
            throw error;
        }
    },

    async addAnnnotationsToDicom(data, id) {
        try {
            const response = await uploadFileAxiosInstance.patch(`api/annotation-dicom-file/${id}/annotation`, data);
            return response.data;
        } catch (error) {
            console.error("Error adding annotations to dicom image", error);
            throw error;
        }
    },

    //for delete api/dicom-files/<int:pk>
    async deleteDicomFile(id) {
        try {
            const response = await uploadFileAxiosInstance.delete(`api/dicom-files/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting dicom file", error);
            throw error;
        }
    },
    

};


export default annotateService;