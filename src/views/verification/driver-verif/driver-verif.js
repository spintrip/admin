import React, { useEffect, useState } from 'react';
import { fetchDrivers, approveDriverProfile, rejectDriverProfile } from '../../../api/driver';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow, CCol, CImage } from '@coreui/react';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const DriverVerification = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const getData = async () => {
    setLoading(true);
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetchDrivers();
      // Assume a driver with verification_status != 2 needs verification
      const verifyList = (res || []).filter(d => d.verification_status !== 2);
      setData(verifyList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [token, navigate]);

  const handleView = (driver) => {
    setSelectedDriver(driver);
    setModalVisible(true);
  };

  const handleApprove = async (id) => {
    try{
      await approveDriverProfile(id);
      getData();
    }catch(err){
      console.error(err);
    }
  }

  const handleReject = async (id) => {
    try{
      await rejectDriverProfile(id);
      getData();
    }catch(err){
      console.error(err);
    }
  }

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Driver Name', selector: row => row.name || '--', sortable: true },
    { name: 'Phone', selector: row => row.phone || '--', sortable: true },
    { name: 'Status', selector: row => row.verification_status === 1 ? 'Pending' : row.verification_status === 0 ? 'Not Verified' : row.verification_status === 2 ? 'Verified' : 'N/A', sortable: true },
    { 
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
            <CButton color="info" size="sm" onClick={() => handleView(row)}>View Details</CButton>
            <CButton color="success" size="sm" onClick={() => handleApprove(row.id)}>Approve</CButton>
            <CButton color="danger" size="sm" onClick={() => handleReject(row.id)}>Reject</CButton>
        </div>
      ),
      minWidth: '250px'
    }
  ];

  return (
    <div className='container-fluid'>
      <DataTable
        title="Driver Verification"
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination
        responsive
        highlightOnHover
        progressPending={loading}
      />

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg" alignment="center" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Driver Verification Details - {selectedDriver?.id}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedDriver && (
            <div className="p-2">
              <CRow className="mb-4">
                <CCol md={6}>
                  <p><strong>Name:</strong> {selectedDriver.name || 'Not Provided'}</p>
                  <p><strong>Phone:</strong> {selectedDriver.phone || 'Not Provided'}</p>
                </CCol>
                <CCol md={6}>
                  <p>
                    <strong>Status: </strong> 
                    {selectedDriver.verification_status === 1 ? <span className="text-warning">Pending</span> : 
                     selectedDriver.verification_status === 0 ? <span className="text-danger">Not Verified</span> : 
                     selectedDriver.verification_status === 2 ? <span className="text-success">Verified</span> : 'N/A'}
                  </p>
                </CCol>
              </CRow>

              <h5 className="mb-3">Verification Documents</h5>
              <CRow>
                <CCol md={4} className="text-center mb-3">
                  <h6 className="text-muted">Profile Picture</h6>
                  {selectedDriver.profilepic ? (
                    <CImage src={selectedDriver.profilepic} alt="Profile" fluid className="border rounded shadow-sm" style={{ objectFit: 'cover', height: '200px', width: '100%' }} />
                  ) : (
                    <div className="border rounded p-4 bg-light text-muted" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Profile Pic</div>
                  )}
                </CCol>

                <CCol md={4} className="text-center mb-3">
                  <h6 className="text-muted">Aadhar Card</h6>
                  {selectedDriver.aadhar ? (
                    <CImage src={selectedDriver.aadhar} alt="Aadhar" fluid className="border rounded shadow-sm" style={{ objectFit: 'cover', height: '200px', width: '100%' }} />
                  ) : (
                    <div className="border rounded p-4 bg-light text-muted" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Aadhar Uploaded</div>
                  )}
                </CCol>

                <CCol md={4} className="text-center mb-3">
                  <h6 className="text-muted">Driving License (DL)</h6>
                  {selectedDriver.dl ? (
                     <CImage src={selectedDriver.dl} alt="Driving License" fluid className="border rounded shadow-sm" style={{ objectFit: 'cover', height: '200px', width: '100%' }} />
                  ) : (
                    <div className="border rounded p-4 bg-light text-muted" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No DL Uploaded</div>
                  )}
                </CCol>
              </CRow>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          {selectedDriver && selectedDriver.verification_status !== 2 && (
             <CButton color="success" onClick={() => { handleApprove(selectedDriver.id); setModalVisible(false); }}>Approve Profile</CButton>
          )}
          {selectedDriver && selectedDriver.verification_status !== null && (
             <CButton color="danger" onClick={() => { handleReject(selectedDriver.id); setModalVisible(false); }}>Reject Profile</CButton>
          )}
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};
export default DriverVerification;
