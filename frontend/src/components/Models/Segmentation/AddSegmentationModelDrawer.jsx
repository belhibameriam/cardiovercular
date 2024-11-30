import { Drawer, Form, Button, Col, Row, Input as AntInput, Upload, Select } from 'antd';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { UploadOutlined } from '@ant-design/icons';
import modelService from '../../../services/modelService';

const { Option } = Select;

const AddSegmentationModelDrawer = ({ visible, onClose, onAddModel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);  // To handle uploaded files

  // Handle file change
  const handleFileChange = ({ fileList }) => setFileList(fileList);

  const onFinish = (values) => {
    setLoading(true);

    // Prepare form data for file upload
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('type', values.type);
    formData.append('version', values.version);
    formData.append('model_description', values.model_description);

    // Add the file if it exists
    if (fileList.length > 0) {
      console.log("File to upload:", fileList[0].originFileObj);
      formData.append('model_file', fileList[0].originFileObj);
    }

    // Submit form data to the server
    modelService.createSegmentationModel(formData).then(
      (response) => {
        toast.success("Segmentation model ajouté avec succès");
        onAddModel(response); // Callback to parent component
      }
    ).catch((error) => {
      console.error("Segmentation model creation error:", error);
      toast.error("Erreur lors de la création du modèle");
    }).finally(() => {
      setLoading(false);
      onClose();  // Close drawer
    });
  };

  return (
    <Drawer
      title="Add new segmentation model"
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 40 }}
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Nom"
              rules={[{ required: true, message: "Veuillez entrer le nom du modèle" }]}
            >
              <AntInput placeholder="Entrez le nom du modèle" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Veuillez entrer le type de modèle" }]}
            >
              <AntInput placeholder="Entrez le type de modèle" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="version"
              label="Version"
              rules={[{ required: true, message: "Veuillez entrer la version" }]}
            >
              <AntInput placeholder="Entrez la version du modèle" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="model_description"
              label="Description du modèle"
              rules={[{ required: true, message: "Veuillez entrer la description du modèle" }]}
            >
              <AntInput.TextArea placeholder="Entrez la description du modèle" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              label="Fichier du modèle"
              rules={[{ required: true, message: "Veuillez télécharger le fichier du modèle" }]}
            >
              <Upload
                fileList={fileList}
                beforeUpload={() => false} // Prevent automatic upload, handle it manually
                onChange={handleFileChange}
              >
                <Button icon={<UploadOutlined />}>Télécharger le fichier</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }} disabled={loading}>
            Annuler
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Soumettre
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

export default AddSegmentationModelDrawer;
