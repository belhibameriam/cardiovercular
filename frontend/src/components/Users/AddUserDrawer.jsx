import { Drawer, Form, Button, Col, Row, Input as AntInput, Select, DatePicker } from 'antd';
import usersService from '../../services/usersService';
import { useState } from 'react';
import { toast } from 'react-toastify';

const { Option } = Select;

const AddUserDrawer = ({ visible, onClose, onAddDemand }) => {
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


    usersService.create(transformedValues).then(
        (response) => {
            console.log("User Created:", response);
            onAddDemand(response);
            toast.success("Utilisateur ajouté avec succès", 
                {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
        }).catch((error) => {
            console.error("User Creation Error:", error);
        }).finally(() => {
            setLoading(false);
            onClose();
        });

    


    // form.resetFields(); // Reset the form after submission
    // onClose(); // Close the drawer after submission
  };

  return (
    <Drawer
      title="Add new user"
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
              name="email"
              label="Email"
              rules={[{ required: true, message: "Veuillez entrer l'email" }, { type: 'email', message: 'Email invalide' }]}
            >
              <AntInput placeholder="Entrez l'email" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="phone"
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
              name="grade"
              label="Grade"
              rules={[{ required: true, message: "Veuillez entrer le grade" }]}
            >
              <AntInput placeholder="Entrez le grade" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[{ required: true, message: "Veuillez entrer le mot de passe" }]}
            >
              <AntInput.Password placeholder="Entrez le mot de passe" />
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

export default AddUserDrawer;
