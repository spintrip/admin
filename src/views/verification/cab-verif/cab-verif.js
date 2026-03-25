import React, { useEffect, useState } from 'react';
import { fetchCabs, approveCabProfile, rejectCabProfile } from '../../../api/cab';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CRow, CCol, CImage, CBadge } from '@coreui/react';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const CabVerification = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCab, setSelectedCab] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const getData = async () => {
    setLoading(true);
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetchCabs();
      // Assume a cab with verification_status != 2 needs verification
      const verifyList = (res || []).filter(c => c.verification_status !== 2);
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

  const handleView = (cab) => {
    setSelectedCab(cab);
    setModalVisible(true);
  };

  const handleApprove = async (id) => {
    try{
      await approveCabProfile(id);
      getData();
    }catch(err){
       console.error(err);
    }
  }

  const handleReject = async (id) => {
    try{
      await rejectCabProfile(id);
      getData();
    }catch(err){
      console.error(err);
    }
  }

  const columns = [
    { name: 'ID', selector: row => row.vehicleid, sortable: true },
    { name: 'Model', selector: row => row.model || '--', sortable: true },
    { name: 'Registration', selector: row => row.registration_number || '--', sortable: true },
    { name: 'Status', selector: row => row.verification_status === 1 ? 'Pending' : row.verification_status === 0 ? 'Not Verified' : row.verification_status === 2 ? 'Verified' : 'N/A', sortable: true },
    { 
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
            <CButton color="info" size="sm" onClick={() => handleView(row)}>View Details</CButton>
            <CButton color="success" size="sm" onClick={() => handleApprove(row.vehicleid)}>Approve</CButton>
            <CButton color="danger" size="sm" onClick={() => handleReject(row.vehicleid)} className="ms-2">Reject</CButton>
        </div>
      ),
      minWidth: '250px'
    }
  ];

  return (
    <div className='container-fluid'>
      <DataTable
        title="Cab Verification"
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination
        responsive
        highlightOnHover
        progressPending={loading}
      />

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="xl" alignment="center" backdrop="static">
        <CModalHeader closeButton>
          <CModalTitle>Cab Verification Details - {selectedCab?.vehicleid}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCab && (
            <div className="p-2">
              <CRow className="mb-4">
                <CCol md={6}>
                  <p><strong>Cab Model:</strong> {selectedCab.model || 'Not Provided'}</p>
                  <p><strong>Registration Number:</strong> {selectedCab.registration_number || 'Not Provided'}</p>
                  <p><strong>Registration Year:</strong> {selectedCab.Vehicle?.Registrationyear || 'Unknown'}</p>
                  <p><strong>RC Number:</strong> {selectedCab.Vehicle?.Rcnumber || 'Unknown'}</p>
                  <p><strong>Chassis Number:</strong> {selectedCab.Vehicle?.chassisno || 'Unknown'}</p>
                </CCol>
                <CCol md={6}>
                  <p>
                    <strong>Status: </strong> 
                    {selectedCab.verification_status === 1 ? <CBadge color="warning">Pending</CBadge> : 
                     selectedCab.verification_status === 0 ? <CBadge color="danger">Not Verified</CBadge> : 
                     selectedCab.verification_status === 2 ? <CBadge color="success">Verified</CBadge> : <CBadge color="secondary">N/A</CBadge>}
                  </p>
                  <p><strong>Service Type:</strong> {selectedCab.serviceType || 'Not Provided'}</p>
                  <p><strong>Seating Capacity:</strong> {selectedCab.seatingCapacity || 'Unknown'}</p>
                </CCol>
              </CRow>

              <h5 className="mb-3">Vehicle Documentation Gallery</h5>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                
                {/* RC Document */}
                {selectedCab.Vehicle?.RcImage && (
                  <div className="text-center">
                    <h6 className="text-muted">RC Document</h6>
                    <CImage src={selectedCab.Vehicle?.RcImage} alt="RC Document" className="border rounded shadow-sm" style={{ objectFit: 'cover', width: '250px', height: '200px' }} />
                  </div>
                )}

                {/* PUC Document */}
                {selectedCab.Vehicle?.PucImage && (
                  <div className="text-center">
                    <h6 className="text-muted">PUC Document</h6>
                    <CImage src={selectedCab.Vehicle?.PucImage} alt="PUC Document" className="border rounded shadow-sm" style={{ objectFit: 'cover', width: '250px', height: '200px' }} />
                  </div>
                )}

                {[{name: 'Front View', idx: 1}, {name: 'Back View', idx: 2}, {name: 'Left View', idx: 3}, {name: 'Right View', idx: 4}, {name: 'Interior View', idx: 5}].map((item) => {
                  const imgUrl = selectedCab.Vehicle?.VehicleAdditional?.[`vehicleimage${item.idx}`];
                  if (!imgUrl) return null;
                  return (
                    <div key={item.idx} className="text-center">
                      <h6 className="text-muted">{item.name}</h6>
                      <CImage src={imgUrl} alt={item.name} className="border rounded shadow-sm" style={{ objectFit: 'cover', width: '250px', height: '200px' }} />
                    </div>
                  );
                })}
                {![1, 2, 3, 4, 5].some(idx => selectedCab.Vehicle?.VehicleAdditional?.[`vehicleimage${idx}`]) && (
                  <div className="border rounded p-4 bg-light text-muted w-100 text-center">No Vehicle Documentation Uploaded</div>
                )}
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          {selectedCab && selectedCab.verification_status !== 2 && (
             <CButton color="success" onClick={() => { handleApprove(selectedCab.vehicleid); setModalVisible(false); }}>Approve Profile</CButton>
          )}
          {selectedCab && selectedCab.verification_status !== null && (
             <CButton color="danger" onClick={() => { handleReject(selectedCab.vehicleid); setModalVisible(false); }}>Reject Profile</CButton>
          )}
          <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};
export default CabVerification;
