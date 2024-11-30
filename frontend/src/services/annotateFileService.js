import uploadFileAxiosInstance from "./uploadFileAxiosInstance";

const annotateFileService = {

    async filesList () {
        try {
            const response = await uploadFileAxiosInstance.get("api/dicom-files-to-annotate/");
            return response.data;
        } catch (error) {
            console.error("Error fetching files list", error);
            throw error;
        }
    },

    async uploadFile(formData)  {
        try {
            const response = await uploadFileAxiosInstance.post("api/dicom-files-to-annotate/", formData);
            return response.data;
        } catch (error) {
            console.error("Error posting image", error);
            throw error;
        }
    },

    async getSingleDicomImage(id) {
        try {
            const response = await uploadFileAxiosInstance.get(`api/dicom-files-to-annotate/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching single dicom image", error);
            throw error;
        }
    },

    async addAnnnotationsToDicom(data, id) {
        try {
            const response = await uploadFileAxiosInstance.patch(`api/annotation-dicom-file-to-annotate/${id}/annotation`, data);
            return response.data;
        } catch (error) {
            console.error("Error adding annotations to dicom image", error);
            throw error;
        }
    },



};

export default annotateFileService;