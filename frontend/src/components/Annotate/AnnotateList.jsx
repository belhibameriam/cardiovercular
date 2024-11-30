import React, { useEffect, useState } from 'react'
import annotateFileService from '../../services/annotateFileService'
import { Upload } from 'antd';
import { Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Image, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

function AnnotateList() {


    const [filesList, setFilesList] = useState([]);

    const navigate = useNavigate();

    const getFilesList = async () => {
        await annotateFileService.filesList().then(
            (response) => {
                console.log("Files List:", response);
                setFilesList(response);
            },
            (error) => {
                console.error("Files List Error:", error);
            }
        ).catch((error) => {
            console.error("Files List Error:", error);
        });
    }

    const [fileToUpload, setFileToUpload] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);


    const uploadFile = async () => {

        const formData = new FormData();

        setUploadLoading(true);

        formData.append("image_url", fileToUpload);

        await annotateFileService.uploadFile(formData).then(
            (response) => {
                console.log("Upload File:", response);
                getFilesList();
                setFileToUpload(null);
            },
            (error) => {
                console.error("Upload File Error:", error);
            }
        ).catch((error) => {
            console.error("Upload File Error:", error);
        }).finally(() => {
            setUploadLoading(false);
        });
    }

    useEffect(() => {
        getFilesList();
    }, []);

  return (
    <div>
        <Upload 
        onChange={(e) => {
          console.log(e);
          setFileToUpload(e.file.originFileObj);
        }}
      > 
    <Button icon={<UploadOutlined />}
        // onClick={uploadFile}
    >Click to Upload</Button>

  </Upload>

  <Button
    type="primary"
    className='ml-2'
    onClick={uploadFile}
    disabled={!fileToUpload}
    >
    Upload
    </Button>

  {
    uploadLoading && <div className='flex-col items-center justify-center w-full'>
        <Spin />
        <p
          className="text-lg font-medium"
        >Uploading...</p>
      </div>

  }

<div className="mt-4">
            {filesList?.length > 0 && (
                <Image.PreviewGroup>
                    <Row gutter={[16, 16]}
                        className='space-x-4'
                    >
                        {filesList
                        ?.sort((a, b) => b.id - a.id)?.map((file, index) => (
                            <Col key={index} xs={24} sm={12} md={6} lg={6}
                                className='bg-white p-4 rounded-lg shadow-md '
                            >
                                <div className="file-card">
                                    <Image 
                                        src={import.meta.env.VITE_API_BASE_URL  + file.image_url} 
                                        alt={`File ${index}`} 
                                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                                    />
                                    <div className='flex justify-between items-center space-x-2'>
                                    <Button type="primary" className='mt-2'
                                        onClick={() => navigate(`/annotate_image_s/${file.id}`)}
                                    >Annotate</Button>

                                    
                                    </div>

                                    {/* <p className="file-date">{new Date(file.created_at).toLocaleDateString()}</p> */}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Image.PreviewGroup>
            )}
        </div>
    </div>
  )
}

export default AnnotateList