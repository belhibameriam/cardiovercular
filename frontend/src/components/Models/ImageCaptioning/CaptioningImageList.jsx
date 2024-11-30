import  { useEffect, useState } from 'react';
import { Table, Input, Button, Spin, Space, Modal } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import usersService from '../../../services/usersService';
import AddCaptioningImageModel from './AddCaptioningImageModel';
// import AddDemandDrawer from '../components/AddDemandDrawer'; // Importer le composant du Drawer
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UpdateCaptioningImageDrawer from './UpdateCaptioningImageDrawer';
import modelService from '../../../services/modelService';
import FileViewer from '../../FileViewer';

const { confirm } = Modal;


const CaptioningImageList = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);


const fetchData = () => {
  setLoading(true);
  modelService.getImageCaptioningModels()
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
  const [selectedUser, setSelectedUser] = useState(null); // Holds the user being updated


  // Fonction pour afficher le drawer
  const showDrawer = () => {
    setDrawerVisible(true);
  };
  const showUpdateDrawer = (user) => {
    setSelectedUser(user); // Set the selected user for updating
    setUpdateDrawerVisible(true); // Show the update drawer
  };


  // Fonction pour fermer le drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const closeUpdateDrawer = () => {
    setUpdateDrawerVisible(false);
    setSelectedUser(null); // Clear the selected user after closing
  };

  const handleUpdatedUser = (updatedUser) => {
    const updatedData = data.map(user => user.id === updatedUser.id ? updatedUser : user);
    setData(updatedData);  // Update the user list with the updated user
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      content: `Model: ${record.name}`,
      icon: <DeleteOutlined 
      style={{ color: 'red' }} />,
      onOk() {
        // Delete user from backend and update state
        modelService.deleteCaptioningModel(record.id)
          .then(() => {
            const updatedData = data.filter(user => user.id !== record.id);
            setData(updatedData);
          })
          .catch(error => {
            console.log('Error deleting model:', error);
          });
      },
      onCancel() {
        console.log('Cancelled delete');
      },
    });
  };

  // Ajouter une nouvelle demande
  const handleNewEntry = (newEntry) => {
    console.log('New Entry:', newEntry);
    setData([newEntry, ...data]);
  };

//   const handleUpdate = (record) => {
//     // Logic to handle the update, e.g., open a modal with the form
//     console.log('Update record:', record);
// };



  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      sorter: (a, b) => a.version.localeCompare(b.version),
    },
    {
      title: 'Model Description',
      dataIndex: 'model_description',
      key: 'model_description',
      sorter: (a, b) => a.model_description.localeCompare(b.model_description),
    },
    {
      title: 'Model File',
      dataIndex: 'model_file',
      key: 'model_file',
      sorter: (a, b) => a.model_file.localeCompare(b.model_file),
      render: (text, record) => (
        <FileViewer 
            fileUrl={record.model_file}
        />
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
          <Space size="middle">
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
      <h1 className="text-lg font-semibold mb-4">{`Image captioning models list`}</h1>
      

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
            {`Add new image captioning model`}
        </Button>

      </div>
      
      
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        bordered
        //  scroll={{ y: 350}} 
              // size="small"
      />

      {/* Appel du Drawer */}
      <AddCaptioningImageModel
        visible={drawerVisible}
        onClose={closeDrawer}
        onAddModel={handleNewEntry}
      />

      <UpdateCaptioningImageDrawer
        visible={updateDrawerVisible}
        onClose={closeUpdateDrawer}
        userData={selectedUser} // Pass the selected user to the drawer
        onUpdateDemand={handleUpdatedUser} // Handle the updated user
      />
    </div>
  );
};

export default CaptioningImageList;
