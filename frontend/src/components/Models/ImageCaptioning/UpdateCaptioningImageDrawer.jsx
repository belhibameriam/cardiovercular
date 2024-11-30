/* eslint-disable react/prop-types */
import { Drawer, Form, Button, Col, Row, Input as AntInput, DatePicker } from 'antd';
import usersService from '../../../services/usersService';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const UpdateModelDrawer = ({ visible, onClose, userData, onUpdateDemand }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  console.log("userData", userData);


  // Pre-fill the form with user data when opening the drawer
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        date_of_birth: dayjs(userData.date_of_birth),
        // date_of_birth: userData.date_of_birth ? dayjs(userData.date_of_birth).format('YYYY-MM-DD') : null,
        grade: userData.grade,
      });
    }
  }, [userData, form]);

  const onFinish = (values) => {
    setLoading(true);

    const transformedValues = {
      ...values,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
    };

    usersService.update(userData.id, transformedValues).then(
      (response) => {
        console.log("User Updated:", response);
        onUpdateDemand(response);
        toast.success("Utilisateur modifié avec succès");
      }).catch((error) => {
        console.error("User Update Error:", error);
      }).finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <Drawer
      title="Mettre à jour l'utilisateur"
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

export default UpdateModelDrawer;
