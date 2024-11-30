import { Drawer, Form, Button, Col, Row, Input as AntInput, Select, DatePicker } from 'antd';
import patientsService from '../../services/patientsService';
import { useState } from 'react';
import { toast } from 'react-toastify';

const { Option } = Select;

const AddPatientDrawer = ({ visible, onClose, onAddDemand }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);



  
  const onFinish = (values) => {
    // Transform the date_of_birth to a string in YYYY-MM-DD format
    setLoading(true);
    const transformedValues = {
      ...values,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
    };
    // onAddDemand(transformedValues);


    patientsService.create(transformedValues).then(
        (response) => {
            console.log("Patient Created:", response);
            onAddDemand(response);
            toast.success("Patient ajouté avec succès", 
                {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
        }).catch((error) => {
            console.error("Patient Creation Error:", error);
        }).finally(() => {
            setLoading(false);
            form.resetFields(); // Reset the form after submission
            onClose();
        });

    


    // form.resetFields(); // Reset the form after submission
    // onClose(); // Close the drawer after submission
  };

  return (
    <Drawer
      title="Add new patient"
    //   width={500}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 40 }}
    >
           <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="first_name"
              label="Prénom"
              rules={[{ required: true, message: "Veuillez entrer le prénom" }]}
            >
              <AntInput placeholder="Entrez le prénom" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="last_name"
              label="Nom"
              rules={[{ required: true, message: "Veuillez entrer le nom" }]}
            >
              <AntInput placeholder="Entrez le nom" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="phone_number"
              label="Téléphone"
              rules={[{ required: true, message: "Veuillez entrer le téléphone" }]}
            >
              <AntInput placeholder="Entrez le téléphone" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="date_of_birth"
              label="Date de naissance"
              rules={[{ required: true, message: "Veuillez entrer la date de naissance" }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="gender"
              label="Genre"
              rules={[{ required: true, message: "Veuillez sélectionner le genre" }]}
            >
              <Select placeholder="Sélectionnez le genre">
                <Option value="Male">Homme</Option>
                <Option value="Female">Femme</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Adresse"
              rules={[{ required: true, message: "Veuillez entrer l'adresse" }]}
            >
              <AntInput placeholder="Entrez l'adresse" />
            </Form.Item>
          </Col>
        </Row>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button type="primary" htmlType="submit"
            loading={loading}
          >
            Soumettre
          </Button>
        </div>
      </Form>
    </Drawer>   
  );
};

export default AddPatientDrawer;
