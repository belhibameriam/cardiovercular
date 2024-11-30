import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Spin } from 'antd';
import usersService from '../../services/usersService';

function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    usersService.get(id)
      .then((res) => {
        setUser(res);  // assuming the API response has a `data` field
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Card title={`User Details - ${user.first_name} ${user.last_name}`} style={{ margin: '0 auto' }}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="First Name">{user.first_name}</Descriptions.Item>
        <Descriptions.Item label="Last Name">{user.last_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{user.phone}</Descriptions.Item>
        <Descriptions.Item label="Grade">{user.grade}</Descriptions.Item>
        <Descriptions.Item label="Date of Birth">{user.date_of_birth}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default UserDetails;
