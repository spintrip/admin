import React, { useEffect, useState } from 'react';
import { fetchCabs, approveCabProfile, rejectCabProfile, unassignDriver } from '../../../api/cab';
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
  CRow,
  CCol,
  CBadge,
  useColorModes,
  CCard,
  CCardBody
} from '@coreui/react';

const Cabs = () => {
  const { colorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const isDark = colorMode === 'dark' || (colorMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [selectedCab, setSelectedCab] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN';

  const columns = [
    { 
      name: 'Cab Model', 
      selector: row => (row.brand && row.variant) ? `${row.brand} ${row.variant}` : row.model || '--', 
      sortable: true 
    },
    { 
      name: 'Category', 
      selector: row => row.cabType || row.cabmodel || '--', 
      sortable: true,
      cell: row => <span className="text-capitalize">{row.cabType || row.cabmodel || '--'}</span>
    },
    { 
      name: 'Registration', 
      selector: row => row.Vehicle?.Rcnumber || '--', 
      sortable: true 
    },
    { 
      name: 'Assigned Driver', 
      selector: row => row.Driver?.DriverAdditional?.FullName || row.Driver?.name || 'Unassigned', 
      sortable: true,
      cell: row => (
        row.driverId ? 
        <span className="text-success fw-bold">{row.Driver?.DriverAdditional?.FullName || row.Driver?.name || 'Assigned'}</span> : 
        <span className="text-warning">Unassigned</span>
      )
    },
    { 
      name: 'Verification', 
      selector: row => row.isVerified, 
      sortable: true,
      cell: row => {
        if (row.isVerified === 1) return <CBadge color="success">Approved</CBadge>;
        if (row.isVerified === 2) return <CBadge color="danger">Rejected</CBadge>;
        return <CBadge color="warning">Pending</CBadge>;
      }
    },
    { 
      name: 'Created At', 
      selector: row => new Date(row.createdAt).toLocaleDateString(), 
      sortable: true 
    },
    {
      name: 'Quick Action',
      cell: row => (
        <CButton 
          color="info" 
          variant="outline"
          size="sm" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            setSelectedCab(row);
            setShowAssignModal(true);
          }}
        >
          {row.driverId ? 'Change Driver' : 'Assign Driver'}
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

  const handleRowClick = (row) => {
    setSelectedCab(row);
    setShowDetailsModal(true);
  };

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

  const handleUnassignDriver = async () => {
    if (!selectedCab || !selectedCab.driverId) return;
    if (!window.confirm("Are you sure you want to unassign the current driver from this cab?")) return;
    
    setSubmitting(true);
    try {
      await unassignDriver(selectedCab.vehicleid);
      setShowDetailsModal(false);
      getData();
      alert('Driver unassigned successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to unassign driver.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedCab) return;
    try {
      await approveCabProfile(selectedCab.vehicleid);
      getData();
      setShowDetailsModal(false);
      alert('Cab approved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to approve cab.');
    }
  };

  const handleReject = async () => {
    if (!selectedCab) return;
    try {
      await rejectCabProfile(selectedCab.vehicleid);
      getData();
      setShowDetailsModal(false);
      alert('Cab rejected.');
    } catch (err) {
      console.error(err);
      alert('Failed to reject cab.');
    }
  };

  return (
    <div className='container-fluid'>
      <CCard className="mb-4">
        <CCardBody>
          <DataTable
            title={<h4 className="mb-0">Cab Management</h4>}
            columns={columns}
            data={data}
            theme={isDark ? 'dark' : 'default'}
            pagination
            responsive
            highlightOnHover
            pointerOnHover
            progressPending={loading}
            onRowClicked={handleRowClick}
          />
        </CCardBody>
      </CCard>

      {/* Driver Assignment Modal */}
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

      {/* Detailed View Modal */}
      {selectedCab && (
        <CModal visible={showDetailsModal} onClose={() => setShowDetailsModal(false)} size="lg">
          <CModalHeader>
            <CModalTitle>Cab Details: {selectedCab.brand} {selectedCab.variant}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <p><strong>Registration (RC):</strong> {selectedCab.Vehicle?.Rcnumber || 'N/A'}</p>
                <p><strong>Category:</strong> <span className="text-capitalize">{selectedCab.cabType || selectedCab.cabmodel || 'N/A'}</span></p>
                <p><strong>Host ID:</strong> {selectedCab.hostId || 'N/A'}</p>
                <p>
                  <strong>Verification Status: </strong> 
                  {selectedCab.isVerified === 1 ? <CBadge color="success">Approved</CBadge> : 
                   selectedCab.isVerified === 2 ? <CBadge color="danger">Rejected</CBadge> : 
                   <CBadge color="warning">Pending</CBadge>}
                </p>
              </CCol>
              <CCol md={6}>
                <div className="p-3 border rounded">
                  <h6 className="fw-bold">Driver Assignment</h6>
                  {selectedCab.driverId ? (
                    <>
                      <p className="mb-1"><strong>Name:</strong> {selectedCab.Driver?.DriverAdditional?.FullName || selectedCab.Driver?.name || 'N/A'}</p>
                      <p className="mb-2"><strong>Phone:</strong> {selectedCab.Driver?.phone || 'N/A'}</p>
                      <CButton size="sm" color="danger" variant="outline" onClick={handleUnassignDriver} disabled={submitting}>
                        Unassign Driver
                      </CButton>
                    </>
                  ) : (
                    <p className="text-muted mb-0">No driver assigned currently.</p>
                  )}
                </div>
              </CCol>
            </CRow>
            <hr />
            <CRow>
              <CCol>
                <h6 className="fw-bold">Actions</h6>
                <div className="d-flex gap-2">
                  <CButton color="info" className="text-white" onClick={() => { setShowDetailsModal(false); setShowAssignModal(true); }}>
                    Assign / Change Driver
                  </CButton>
                  {selectedCab.isVerified !== 1 && (
                    <CButton color="success" className="text-white" onClick={handleApprove}>
                      Approve Cab
                    </CButton>
                  )}
                  {selectedCab.isVerified !== 2 && (
                    <CButton color="danger" className="text-white" onClick={handleReject}>
                      Reject Cab
                    </CButton>
                  )}
                </div>
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowDetailsModal(false)}>Close</CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  );
};
export default Cabs;
