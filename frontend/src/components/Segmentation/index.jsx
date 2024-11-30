import React, { useState } from "react";
import { Input, Button, message, Image, Spin } from "antd";
import modelsExecutionService from "../../services/modelsExecutionService";

function Segmentation() {
    const [imageUrl, setImageUrl] = useState("");
    const [segmentedImage, setSegmentedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSegmentImage = async () => {
        if (!imageUrl) {
            message.error("Please enter a valid image URL.");
            return;
        }

        setLoading(true); // Show loader
        setSegmentedImage(null); // Reset the previous result
        try {
            const response = await modelsExecutionService.visualizeXray(imageUrl);
            setSegmentedImage(import.meta.env.VITE_API_BASE_URL + response.image_url); // Adjust this based on your API's response format
            message.success("Image segmentation successful!");
        } catch (error) {
            message.error("Failed to segment the image.");
        } finally {
            setLoading(false); // Hide loader
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Image Segmentation</h2>
            <Input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ marginBottom: "10px" }}
            />
            <Button type="primary" onClick={handleSegmentImage} loading={loading}>
                Segment Image
            </Button>
            {loading && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Spin size="large" />
                </div>
            )}
            {segmentedImage && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Segmented Image</h3>
                    <Image
                        src={segmentedImage}
                        alt="Segmented Result"
                        style={{ maxWidth: "50%" }}

                    />
                </div>
            )}
        </div>
    );
}

export default Segmentation;
