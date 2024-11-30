import React, { useState } from "react";
import { Upload, Button, message, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import modelsExecutionService from "../../services/modelsExecutionService";

function ImageCaptioning() {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState("");
    const [features, setFeatures] = useState([]);
    const [report, setReport] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFileChange = ({ file }) => {
        setFile(file);
        setCaption(""); // Reset previous caption
    };

    const handleGenerateCaption = async () => {
        if (!file) {
            message.error("Please upload a file first.");
            return;
        }

        setLoading(true); // Show loader
        try {
            const response = await modelsExecutionService.analyzeXray(file);
            // setCaption(response.caption); // Adjust based on your API's response
            setFeatures(response?.features);
            setReport(response?.report);
            message.success("Caption generated successfully!");
        } catch (error) {
            message.error("Failed to generate the caption.");
        } finally {
            setLoading(false); // Hide loader
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Image Captioning</h2>
            <Upload
                beforeUpload={() => false}
                onChange={handleFileChange}
                maxCount={1}
                accept="image/*"
            >
                <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
            <Button
                type="primary"
                onClick={handleGenerateCaption}
                style={{ marginTop: "10px" }}
                loading={loading}
            >
                Generate Caption
            </Button>
            {loading && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Spin size="large" />
                </div>
            )}
            {/* {caption && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Generated Caption</h3>
                    <p>{caption}</p>
                </div>
            )} */}
            {features?.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h3 className="font-semibold text-xl">Features</h3>
                    <ul>
                        {features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
            )}
            {report && (
                <div style={{ marginTop: "20px" }}>
                    <h3 className="font-semibold text-xl">Report</h3>
                    <p>{report}</p>
                </div>
            )}
        </div>
    );
}

export default ImageCaptioning;
