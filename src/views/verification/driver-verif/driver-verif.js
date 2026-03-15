import React, { useEffect, useState } from 'react';
import { fetchDrivers, approveDriverProfile, rejectDriverProfile } from '../../../api/driver';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { CButton } from '@coreui/react';

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
    { name: 'Status', selector: row => row.verification_status === 1 ? 'Pending' : 'N/A', sortable: true },
    { 
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
            <CButton color="success" size="sm" onClick={() => handleApprove(row.id)}>Approve</CButton>
            <CButton color="danger" size="sm" onClick={() => handleReject(row.id)} className="ms-2">Reject</CButton>
        </div>
      ),
      minWidth: '200px'
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
    </div>
  );
};
export default DriverVerification;
