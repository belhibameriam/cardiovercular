import React from 'react';
import { FilePdfOutlined } from '@ant-design/icons'; // Import the desired icon

const FileViewer = ({ fileUrl }) => {
  return (
    <div>
      <a href={fileUrl} target="_blank" rel="noopener noreferrer">
        <FilePdfOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
      </a>
    </div>
  );
};

export default FileViewer;
