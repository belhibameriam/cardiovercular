import { UserOutlined } from '@ant-design/icons';
import { TeamOutlined } from '@ant-design/icons';
import { DatabaseOutlined } from '@ant-design/icons';
import { SignatureOutlined } from '@ant-design/icons';
import { GroupOutlined } from '@ant-design/icons';
import { PictureOutlined } from '@ant-design/icons';

export const menuItems = [
    {
        key: 'users',
        label: 'Users',
        path : '/users',
        icon: UserOutlined,
    },
    {
        key: 'patients',
        label: 'Patients',
        path : '/patients',
        icon: TeamOutlined,
    },
    {
        key: 'dl_models',
        label: 'DL Models',
        icon: DatabaseOutlined,
        children: [
            {
                key: 'segmentation',
                label: 'Segmentation',
                path : '/models',
            },
            {
                key: 'image_captioning',
                label: 'Image captioning',
                path : '/image',
            }
        ]
    },
    {
        key: 'seg',
        label: 'Segmentation',
        path : '/seg',
        icon: GroupOutlined,

    },
    {
        key: 'image',
        label: 'Image captioning',
        path : '/image_cap',
        icon: PictureOutlined,

    },

    {
        key: 'annotate',
        label: 'Annotate',
        path : '/annotate_image',
        icon: SignatureOutlined,

    }
];