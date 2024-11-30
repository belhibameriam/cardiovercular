import  { useEffect, useState } from 'react';
import { Table, Input, Button, Spin, Space, Modal } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import usersService from '../../services/usersService';
import AddUserDrawer from './AddUserDrawer';
// import AddDemandDrawer from '../components/AddDemandDrawer'; // Importer le composant du Drawer
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import UpdateUserDrawer from './UpdateUserDrawer';
import { useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';

const { confirm } = Modal;


const UsersList = () => {
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


const fetchData = () => {
  setLoading(true);
  usersService.getAll()
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
      content: `User: ${record.first_name} ${record.last_name}`,
      icon: <DeleteOutlined 
      style={{ color: 'red' }} />,
      onOk() {
        // Delete user from backend and update state
        usersService.delete(record.id)
          .then(() => {
            const updatedData = data.filter(user => user.id !== record.id);
            setData(updatedData);
          })
          .catch(error => {
            console.log('Error deleting user:', error);
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },
    {
      title: 'Date of birth',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      sorter: (a, b) => a.date_of_birth.localeCompare(b.date_of_birth),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      sorter: (a, b) => a.grade.localeCompare(b.grade),
      width: '8%'
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
                    navigate(`/users/${record.id}`)
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
      <h1 className="text-lg font-semibold mb-4">Users list</h1>
      

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
            Add new user
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
      <AddUserDrawer
        visible={drawerVisible}
        onClose={closeDrawer}
        onAddDemand={handleNewEntry}
      />

      <UpdateUserDrawer
        visible={updateDrawerVisible}
        onClose={closeUpdateDrawer}
        userData={selectedUser} // Pass the selected user to the drawer
        onUpdateDemand={handleUpdatedUser} // Handle the updated user
      />
    </div>
  );
};

export default UsersList;
