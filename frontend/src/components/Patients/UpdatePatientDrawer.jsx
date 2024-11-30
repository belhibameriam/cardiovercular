/* eslint-disable react/prop-types */
import { Drawer, Form, Button, Col, Row, Input as AntInput, DatePicker, Select } from 'antd';
import patientsService from '../../services/patientsService';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
const { Option } = Select;

const UpdatePatientDrawer = ({ visible, onClose, patientData, onUpdateDemand }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  console.log("patientData", patientData);


  // Pre-fill the form with patient data when opening the drawer
  useEffect(() => {
    if (patientData) {
      form.setFieldsValue({
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        phone_number: patientData.phone_number,
        date_of_birth: dayjs(patientData.date_of_birth),
        gender:   patientData.gender.toLowerCase() == 'male' ? 'Male' : patientData.gender.toLowerCase() == 'female' ? 'Female' : 'Other',
        // date_of_birth: patientData.date_of_birth ? dayjs(patientData.date_of_birth).format('YYYY-MM-DD') : null,
        address: patientData.address,
      });
    }
  }, [patientData, form]);

  const onFinish = (values) => {
    setLoading(true);

    const transformedValues = {
      ...values,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
    };

    patientsService.update(patientData.pk, transformedValues).then(
      (response) => {
        console.log("Patient Updated:", response);
        onUpdateDemand(response);
        toast.success("Patient modifié avec succès");
      }).catch((error) => {
        console.error("Patient Update Error:", error);
      }).finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <Drawer
      title="Mettre à jour l'Patient"
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
              label="Address"
              rules={[{ required: true, message: "Veuillez entrer l'adresse" }]}
            >
              <AntInput placeholder="Entrez l'adresse" />
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

export default UpdatePatientDrawer;
