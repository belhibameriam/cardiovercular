// src/components/MainLayout.jsx
import  { useEffect, useState } from 'react';
import {  Avatar, Breadcrumb, Dropdown, Layout, Menu } from 'antd';
// import logo from '../assets/logo-white.png';
// import profilePic from '../assets/profile-pic.webp';
import MenuComponent from '../components/Menu/MenuComponent';
import { menuItems } from '../routes/routes';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import avatar from '../assets/avatar.png';
import {  LogoutOutlined } from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

const MainLayout = ({ children }) => {

    const logout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    //using the location extract BreadCrumb

    const [breadCrumb, setBreadCrumb] = useState([]);

    const location = useLocation();

    const extractBreadCrumb = (menuItems) => {
        const path = window.location.pathname;
        const pathArray = path.split('/').filter(p => p); // Remove empty segments
        const breadCrumb = [];
    
        // Helper function to find an item by its path and build the breadcrumb trail
        const findBreadcrumb = (items, pathSegments, currentIndex) => {
            if (currentIndex >= pathSegments.length) {
                return true;
            }
    
            const segment = pathSegments[currentIndex];
            for (const item of items) {
                if (item.children) {
                    // Check current level
                    if (item.children.some(child => child.path === `/${segment}`)) {
                        breadCrumb.push(item); // Add parent item
                        const childItem = item.children.find(child => child.path === `/${segment}`);
                        if (childItem) {
                            breadCrumb.push(childItem); // Add current level item
                            if (findBreadcrumb(item.children, pathSegments, currentIndex + 1)) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        };
    
        // Start building the breadcrumb from the root level
        findBreadcrumb(menuItems, pathArray, 0);
    
        // Ensure the breadcrumb starts with the root
        // if (breadCrumb[0]?.path !== '/') {
        //     breadCrumb.unshift({ key: 'home', label: 'Home', path: '/' });
        // }
    
        return breadCrumb;
    };
    useEffect(() => {
        const breadCrumb = extractBreadCrumb(menuItems);
        setBreadCrumb(breadCrumb);
    }, [location]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <Header  style={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
            <a href="#" className="text-lg flex items-center space-x-2">
  <span className="text-white capitalize">ANOTATE</span>
</a>
<div className='flex ml-auto items-center space-x-2'>
    <Dropdown
        overlay={
            <Menu>
                <Menu.Item>
                    <a 
                        icon={<LogoutOutlined />}
                        onClick={logout}
                    >Logout</a>
                </Menu.Item>
            </Menu>
        }
        trigger={['click']}
>
 <div className="flex items-center space-x-2 cursor-pointer">
 <Avatar 
        src={avatar}
        className='ml-auto' 
    />
    <div className='text-white text-sm'>{
        localStorage.getItem('name') ? localStorage.getItem('name') : ''
        }</div>
    </div>
        </Dropdown>

</div>
        </Header>
        <div className='w-full  bg-white' 
            style={{
                height: '1px',
            }}
        />
        <Layout>
      <Sider>
        <MenuComponent />
      </Sider>
      
      <Layout
         style={{
            padding: '24px 24px',
          }}
          
      >
      <Breadcrumb
                 className='mt-2 mb-2'
            >
                {
                    breadCrumb.map((item, index) => (
                        <Breadcrumb.Item key={index}>
                                {item.label}
                        </Breadcrumb.Item>
                    ))
                }

            </Breadcrumb>
        <Content 
            className='bg-white rounded-sm'
        >
          <div style={{ marginLeft: 24,  minHeight: 240,
                paddingRight: 24, paddingTop: 16
           }}>            
            {/* {children} */}
            <Outlet />

          </div>
        </Content>
        {/* <Footer style={{ textAlign: 'center' }}>Ant Design ©2024 Created by Ant UED</Footer> */}
      </Layout>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
