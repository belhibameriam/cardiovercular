import React, { useEffect, useState } from 'react';
import patientsService from '../../services/patientsService';
import { Button, Skeleton, Table, Modal, Form, Input, message, Drawer } from 'antd';
import SerieDetails from './SerieDetails';

function SeriesList({ studyId }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addSeriesFormVisible, setAddSeriesFormVisible] = useState(false);
  const [modality, setModality] = useState('');
  const [description, setDescription] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  
  const fetchSeries = async () => {
    setLoading(true); // Start loading
    try {
      const response = await patientsService.getStudySeries(studyId);
      console.log('series', response);
      setSeries(response);
      setLoading(false); // Stop loading
    } catch (error) {
      console.error('Error fetching series:', error);
      setLoading(false); // Stop loading
    }
  };

  const addSeries = async () => {
    const newSeries = {
      modality,
      description,
      study_id: studyId, // Assuming you need to reference the study
    };

    try {
      const response = await patientsService.createRelatedStudySerie(newSeries);
      setSeries([response, ...series]); // Add the new series to the existing list
      message.success('Series added successfully!');
      setAddSeriesFormVisible(false); // Close the modal
      setModality(''); // Reset fields
      setDescription('');
    } catch (error) {
      console.error('Error adding series:', error);
      message.error('Failed to add series.');
    }
  };

  const openDrawer = (record) => {
    setSelectedSeries(record);
    setDrawerVisible(true);
  };

  useEffect(() => {
    fetchSeries();
  }, [studyId]);

  return loading ? (
    <Skeleton active />
  ) : (
    <div>
      <div className="flex items-center justify-end mb-2">
        <Button type="primary" onClick={() => setAddSeriesFormVisible(true)}>
          Add Series
        </Button>
      </div>
      <Table
        dataSource={series}
        columns={[
          {
            title: 'Modality',
            dataIndex: 'modality',
            key: 'modality',
          },
          {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString(),
          },
          {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
              <Button type="default" onClick={() => openDrawer(record)}>
                Details
              </Button>
            ),
          }
        ]}
        rowKey="id"
      />

      {/* Add Series Modal */}
      <Modal
        title="Add Series"
        visible={addSeriesFormVisible}
        onCancel={() => setAddSeriesFormVisible(false)}
        onOk={addSeries}
      >
        <Form layout="vertical">
          <Form.Item label="Modality" required>
            <Input
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              placeholder="Enter modality"
            />
          </Form.Item>
          <Form.Item label="Description" required>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Series Details Drawer */}
      <Drawer
        title="Series Details"
        placement="right"
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={800}
      >
        {selectedSeries ? (
            <SerieDetails
                serie={selectedSeries}
            />

        ) : (
          <p>No series selected</p>
        )}
      </Drawer>
    </div>
  );
}

export default SeriesList;
