import { Menu } from 'antd';
import { Link } from 'react-router-dom'; 
import { menuItems } from '../../routes/routes';


const MenuComponent = () => {
    const renderMenuItems = (items) =>
        items.map(item => (
            item.children ? (
                <Menu.SubMenu key={item.key} title={item.label}
                icon={item.icon && <item.icon />}
                >
                    
                    {renderMenuItems(item.children)}
                </Menu.SubMenu>
            ) : (
                <Menu.Item key={item.key}>
                    {item.icon && <item.icon 
                    style={{
                        fontSize: '16px',
                        marginRight: '10px',
                    }}
                    />}
                    <Link to={item.path}>{item.label}</Link>
                </Menu.Item>
            )
        ));

    return (
        <Menu mode="inline"
        theme="light"
        defaultSelectedKeys={[]}
        defaultOpenKeys={[]}
        style={{
          height: '100%',
          borderRight: 0,
        //   width: 250,
          paddingTop: 20,
        }}>
            {renderMenuItems(menuItems)}
        </Menu>
    );
};

export default MenuComponent;
