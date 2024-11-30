import  { useEffect, useState } from 'react';
import { Table, Input, Button, Spin, Space, Modal } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import patientsService from '../../services/patientsService';
import AddPatientDrawer from './AddPatientDrawer';
// import AddDemandDrawer from '../components/AddDemandDrawer'; // Importer le composant du Drawer
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UpdatePatientDrawer from './UpdatePatientDrawer';
import { useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

const { confirm } = Modal;


const PatientsList = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


const fetchData = () => {
  setLoading(true);
  patientsService.getAll()
    .then(response => {
      console.log(response);
      setData(response);
    })
    .catch(error => {
      console.log(error);
    }).finally(() => {
      setLoading(false);
    });

}

useEffect(() => {
  fetchData();
}, []);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [updateDrawerVisible, setUpdateDrawerVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // Holds the patient being updated


  // Fonction pour afficher le drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const showUpdateDrawer = (patient) => {
    setSelectedPatient(patient); // Set the selected patient for updating
    setUpdateDrawerVisible(true); // Show the update drawer
  };


  // Fonction pour fermer le drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const closeUpdateDrawer = () => {
    setUpdateDrawerVisible(false);
    setSelectedPatient(null); // Clear the selected patient after closing
  };

  const handleUpdatedPatient = (updatedPatient) => {
    const updatedData = data.map(patient => patient.pk === updatedPatient.pk ? updatedPatient : patient);
    setData(updatedData);  // Update the patient list with the updated patient
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Are you sure you want to delete this patient?',
      content: `Patient: ${record.first_name} ${record.last_name}`,
      icon: <DeleteOutlined 
      style={{ color: 'red' }} />,
      onOk() {
        // Delete patient from backend and update state
        patientsService.delete(record.pk)
          .then(() => {
            const updatedData = data.filter(patient => patient.pk !== record.pk);
            setData(updatedData);
          })
          .catch(error => {
            console.log('Error deleting patient:', error);
          });
      },
      onCancel() {
        console.log('Cancelled delete');
      },
    });
  };

  // Ajouter une nouvelle demande
  const handleNewEntry = (newEntry) => {

    setData([newEntry, ...data]);
  };

//   const handleUpdate = (record) => {
//     // Logic to handle the update, e.g., open a modal with the form
//     console.log('Update record:', record);
// };



  const columns = [
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
      sorter: (a, b) => a.last_name.localeCompare(b.last_name),
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        sorter: (a, b) => a.address.localeCompare(b.address),
      },
    {
      title: 'Phone number',
      dataIndex: 'phone_number',
      key: 'phone_number',
      sorter: (a, b) => a.phone_number.localeCompare(b.phone_number),
    },
    {
      title: 'Date of birth',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      sorter: (a, b) => a.date_of_birth.localeCompare(b.date_of_birth),
    },
    {
      title: 'Genre',
      dataIndex: 'gender',
      key: 'gender',
      sorter: (a, b) => a.gender.localeCompare(b.gender),
      render: (text, record) => (
        <>
          {
            record.gender.toLowerCase() == 'male' ? 'Homme' : record.gender.toLowerCase() == 'female' ? 'Femme' : 'Non défini'
          }
        </>
      ),

            
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
          <Space size="middle">
             <Button
                  type="default"
                  icon={<UserOutlined />}
                  onClick={() =>  {
                    navigate(`/patients/${record.pk}`)
                  }}
              >
                  Details
              </Button>
              <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() =>  {
                    console.log('Update record:', record);
                    showUpdateDrawer(record)
                  }}
              >
                  Update
              </Button>
              <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
              >
                  Delete
              </Button>
          </Space>
      ),
  },
  ];

  const filteredData = data.filter(item => {
    return Object.keys(item).some(key =>
      item[key].toString().toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div className="relative">
        {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white opacity-75 z-10">
          <Spin size="large" /> {/* Full-page loader */}
        </div>
      )}
      <h1 className="text-lg font-semibold mb-4">Patients list</h1>
      

      <div
        className="flex justify-between items-center"
        style={{ marginBottom: 20 }}

      >

        <Input
            placeholder="Recherche..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
                width: 300
            }}
            prefix={<SearchOutlined />}
        />


        <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
            Add new patient
        </Button>

      </div>
      
      
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="pk"
        pagination={{ pageSize: 10 }}
        bordered
        //  scroll={{ y: 350}} 
              // size="small"
      />

      {/* Appel du Drawer */}
      <AddPatientDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        onAddDemand={handleNewEntry}
      />

      <UpdatePatientDrawer
        visible={updateDrawerVisible}
        onClose={closeUpdateDrawer}
        patientData={selectedPatient} // Pass the selected patient to the drawer
        onUpdateDemand={handleUpdatedPatient} // Handle the updated patient
      />
    </div>
  );
};

export default PatientsList;
