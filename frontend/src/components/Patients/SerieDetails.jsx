import React, { useEffect, useState } from 'react';
import patientsService from '../../services/patientsService';
import { Button, Table, Modal, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import annotateService from '../../services/annotateService';
function SerieDetails({ serie }) {
    const [dicomFiles, setDicomFiles] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const getSerieDcmFiles = async () => {
        try {
            const response = await patientsService.getSeriesDicomFiles(serie?.id);
            setDicomFiles(response);
        } catch (error) {
            console.error('Error fetching dcm files:', error);
        }
    };

    const handleAddDicomFile = async (values) => {
        try {
            const { title, description, file } = values;
            console.log('Adding dicom file:', title, description, file);
            // Assume `patientsService.addDicomFile` sends data to the backend
            const formData = new FormData();
            formData.append('title', title);
            console.log('formData:', formData);
            formData.append('description', description);
            console.log('formData:', formData);
            formData.append('image_url', file.originFileObj);
            console.log('formData:', formData);
            formData.append('series_id', serie?.id);
            console.log('formData:', formData);
            await patientsService.createRelatedSeriesDicomFile(formData);
            message.success('Dicom file added successfully');
            getSerieDcmFiles(); // Refresh the list after adding
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Error adding Dicom file');
            console.error('Error adding Dicom file:', error);
        }
    };

    useEffect(() => {
        getSerieDcmFiles();
    }, [serie]);

    return (
        <div>
            <div className="flex justify-end mb-2">
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                    Add File
                </Button>
            </div>

            <Table
                dataSource={dicomFiles}
                columns={[
                    {
                        title: 'Title',
                        dataIndex: 'title',
                        key: 'title',
                    },
                    {
                        title: 'Description',
                        dataIndex: 'description',
                        key: 'description',
                    },
                    {
                        title: 'Image Path',
                        dataIndex: 'image_url',
                        key: 'image_url',
                        render: (text) => (
                            //image_url.slice(16,)}
                            text.slice(16,)
                        ),
                    },
                    {
                        title: 'Actions',
                        key: 'actions',
                        /**
                         *  <Button variant="outline-primary" type='button' style={{padding:'5px', border:'9px', borderRadius: '50%'}} onClick={() => this.sendImageURL(dicom_file.image_url)}>
                                    <a  id='link-background' href={`http://localhost:5000/dwv/`} target="_blank" rel="noreferrer" >
                                      <i style={{padding:'5px'}}>{External}</i>
                                    </a>
                                  </Button>
                         */
                        render: (text, record) => (
                            <div className='flex space-x-2'>
                            <Button type="default" 
                                onClick={() => {
                                    navigate(`/annotate/${record.id}`);
                                }}
                            >
                                Annotate
                            </Button>
                            <Button type="primary"
                            danger 
                                onClick={() => {
                                    // patientsService.deleteDicomFile(record.id);
                                    // getSerieDcmFiles();

                                    //opens a delete confirmation modal
                                    Modal.confirm({
                                        title: 'Delete Dicom File',
                                        content: 'Are you sure you want to delete this file?',
                                        onOk: async () => {
                                            await annotateService.deleteDicomFile(record.id);
                                            getSerieDcmFiles();
                                        }
                                    });
                                }}
                            >
                                Delete
                            </Button>
                            </div>
                        ),
                        
                    }

                ]}
            />

            <Modal
                title="Add File"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddDicomFile}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input placeholder="Enter title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <Input.TextArea placeholder="Enter description" />
                    </Form.Item>

                    <Form.Item
                        name="file"
                        label="File"
                        valuePropName="file"
                        getValueFromEvent={(e) => e.fileList[0]}
                        rules={[{ required: true, message: 'Please upload a file' }]}
                    >
                        <Upload beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload Dicom File</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default SerieDetails;
