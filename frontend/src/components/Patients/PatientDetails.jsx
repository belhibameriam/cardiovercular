import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Descriptions, Spin, Table, Modal, Input, Form, message, Drawer, Skeleton } from 'antd';
import patientsService from '../../services/patientsService';
import SeriesList from './SeriesList';

function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientStudies, setPatientStudies] = useState([]);
  
  const [showAddStudyModal, setShowAddStudyModal] = useState(false);  // Modal state
  const [studyDescription, setStudyDescription] = useState("");  // Form field state

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);

  const fetchPatient = async () => {
    try {
      const resp = await patientsService.get(id);
      setPatient(resp);  // Assuming the response is valid
    } catch (error) {
      console.error("Error fetching patient:", error);
    }
  };
  
  const fetchPatientStudies = async () => {
    try {
      const resp = await patientsService.getAllStudies(id);
      console.log("studies", resp);
      setPatientStudies(resp);  // Assuming the response is valid
    } catch (error) {
      console.error("Error fetching patient studies:", error);
    }
  };

  const createPatientStudy = async () => {
    const study = {
      study_description: studyDescription,
      patient_id: id
    };

    await patientsService.createStudy(study)
      .then(response => {
        console.log(response);
        message.success('Study added successfully!');
        setShowAddStudyModal(false);
        setStudyDescription("");  // Clear the input field
        setPatientStudies([response, ...patientStudies]);  // Add the new study to the list
      })
      .catch(error => {
        console.log(error);
      });
  };

  // Open drawer and set selected study
  const handleOpenDrawer = (study) => {
    setSelectedStudy(study);  // Set the selected study
    setDrawerVisible(true);  // Show the drawer
  };

  // Close the drawer
  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedStudy(null);  // Clear selected study
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);  // Make sure loading starts as true
      await Promise.all([fetchPatient(), fetchPatientStudies()]);  // Run both async fetches concurrently
      setLoading(false);  // Set loading to false after both are done
    };
  
    fetchData();
  }, [id]);

  if (loading) {
    return <Skeleton active />;
  }

  return (
    <div>
      <Card title={`Patient Details - ${patient.first_name} ${patient.last_name}`} style={{ margin: '0 auto' }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="First Name">{patient.first_name}</Descriptions.Item>
          <Descriptions.Item label="Last Name">{patient.last_name}</Descriptions.Item>
          <Descriptions.Item label="Age">{patient.age}</Descriptions.Item>
          <Descriptions.Item label="Gender">{patient.gender}</Descriptions.Item>
          <Descriptions.Item label="Date of Birth">{patient.date_of_birth}</Descriptions.Item>
          <Descriptions.Item label="Phone Number">{patient.phone_number}</Descriptions.Item>
          <Descriptions.Item label="Address">{patient.address}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <div className="flex items-center justify-between">
            <div>{`Patient Studies list - ${patient.first_name} ${patient.last_name}`}</div>
            <Button type="primary" onClick={() => setShowAddStudyModal(true)}>
              Add Study
            </Button>
          </div>
        }
        style={{ margin: '8px auto' }}
      >
        <Table 
          dataSource={patientStudies} 
          rowKey="id" 
          columns={[
            {
              title: 'Study Description',
              dataIndex: 'study_description',
              key: 'study_description',
            },
            {
              title: 'Study Date',
              dataIndex: 'study_date',
              key: 'study_date',
              render: (text, record) => (
                new Date(record.study_date).toLocaleString()
              ),
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (text, record) => (
                <Button type="default" onClick={() => handleOpenDrawer(record)}>
                  Details
                </Button>
              ),
            }
          ]}
        />
      </Card>

      {/* Modal for adding study */}
      <Modal
        title="Add Study"
        visible={showAddStudyModal}
        onCancel={() => setShowAddStudyModal(false)}
        onOk={createPatientStudy}
      >
        <Form layout="vertical">
          <Form.Item label="Study Description" required>
            <Input
              value={studyDescription}
              onChange={(e) => setStudyDescription(e.target.value)}
              placeholder="Enter study description"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer for displaying study details */}
      <Drawer
        title="Study Series List"
        width={800}
        visible={drawerVisible}
        onClose={handleCloseDrawer}
      >
        {selectedStudy && (
          <SeriesList studyId={selectedStudy.id} />
        )}
      </Drawer>
    </div>
  );
}

export default PatientDetails;
