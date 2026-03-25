import React, { useEffect, useState } from 'react';
import { fetchDrivers } from '../../../api/driver';
import axios from 'axios';
import serverApiUrl from '../../../env';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CBadge,
} from '@coreui/react';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const columns = [
  { name: 'ID', selector: row => row.id, sortable: true },
  { name: 'Driver Name', selector: row => row.name || '--', sortable: true },
  { name: 'Phone', selector: row => row.phone || '--', sortable: true },
  { 
    name: 'Status', 
    selector: row => row.isActive, 
    sortable: true,
    cell: row => (
      <CBadge color={row.isActive ? 'success' : 'secondary'}>
        {row.isActive ? 'Active' : 'Offline'}
      </CBadge>
    )
  },
  { name: 'Available', selector: row => row.isActive, cell: row => ( <CBadge color={row.isActive ? 'info' : 'warning'}>{row.isActive ? 'Available' : 'Busy'}</CBadge> ) },
  { name: 'Created At', selector: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
];

const Drivers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN';

  const getData = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      setLoading(true);
      const res = await fetchDrivers();
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [token, navigate]);

  const handleAddSubmit = async () => {
    if (!newDriver.name || !newDriver.phone) return;
    setSubmitting(true);
    try {
      await axios.post(`${serverApiUrl}admin/cab/add-driver`, newDriver, {
        headers: { token }
      });
      setShowAddModal(false);
      setNewDriver({ name: '', phone: '' });
      getData(); // Refresh table
    } catch (err) {
      console.error('Error creating driver:', err);
      alert('Failed to create driver: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container-fluid'>
      <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={() => setShowAddModal(true)}>
          + Add Driver
        </CButton>
      </div>
      <DataTable
        title="Drivers"
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination
        responsive
        highlightOnHover
        progressPending={loading}
      />

      <CModal visible={showAddModal} onClose={() => setShowAddModal(false)}>
        <CModalHeader>
          <CModalTitle>Create New Driver</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormInput
                type="text"
                label="Full Name"
                placeholder="Enter driver name"
                value={newDriver.name}
                onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormInput
                type="text"
                label="Phone Number"
                placeholder="Enter 10-digit phone"
                value={newDriver.phone}
                onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
              />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAddModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleAddSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Driver'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};
export default Drivers;
