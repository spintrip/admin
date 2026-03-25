import React, { useEffect, useState } from 'react';
import { fetchCabs } from '../../../api/cab';
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
  CFormSelect,
} from '@coreui/react';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const Cabs = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN';

  const columns = [
    { name: 'ID', selector: row => row.vehicleid, sortable: true },
    { name: 'Cab Model', selector: row => (row.brand && row.variant) ? `${row.brand} ${row.variant}` : row.model || '--', sortable: true },
    { name: 'Registration', selector: row => row.Vehicle?.Rcnumber || '--', sortable: true },
    { name: 'Assigned Driver', selector: row => row.Driver?.DriverAdditional?.FullName || row.Driver?.name || 'Unassigned', sortable: true },
    { name: 'Created At', selector: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <CButton 
          color="info" 
          size="sm" 
          onClick={() => {
            setSelectedCab(row);
            setShowAssignModal(true);
          }}
        >
          Assign Driver
        </CButton>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];

  const getData = async () => {
    if (!token) { navigate('/login'); return; }
    try {
      setLoading(true);
      const [cabsRes, driversRes] = await Promise.all([
        fetchCabs(),
        fetchDrivers()
      ]);
      setData(cabsRes || []);
      setDrivers(driversRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [token, navigate]);

  const handleAssignSubmit = async () => {
    if (!selectedCab || !selectedDriver) return;
    setSubmitting(true);
    try {
      await axios.post(`${serverApiUrl}admin/cab/assign-driver-vehicle`, {
        vehicleid: selectedCab.vehicleid,
        driverid: selectedDriver
      }, {
        headers: { token }
      });
      setShowAssignModal(false);
      setSelectedCab(null);
      setSelectedDriver('');
      getData(); // Refresh
      alert('Driver assigned successfully!');
    } catch (err) {
      console.error('Error assigning driver:', err);
      alert('Failed to assign driver: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container-fluid'>
      <DataTable
        title="Cabs"
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination
        responsive
        highlightOnHover
        progressPending={loading}
      />

      <CModal visible={showAssignModal} onClose={() => setShowAssignModal(false)}>
        <CModalHeader>
          <CModalTitle>Assign Driver to {selectedCab?.cabmodel || 'Cab'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <label className="form-label">Select Driver</label>
              <CFormSelect 
                value={selectedDriver} 
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">Choose a driver...</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name || 'Unnamed Driver'} ({driver.phone})
                  </option>
                ))}
              </CFormSelect>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAssignModal(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleAssignSubmit} disabled={submitting || !selectedDriver}>
            {submitting ? 'Assigning...' : 'Assign Driver'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};
export default Cabs;
