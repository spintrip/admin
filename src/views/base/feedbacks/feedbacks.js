import React, { useEffect, useState } from 'react';
import { fetchFeedbacks, deleteFeedback } from '../../../api/feedback';
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

const Feedbacks = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const getData = async () => {
    setLoading(true);
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetchFeedbacks();
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

  const handleDelete = async (id) => {
    if(window.confirm('Delete this feedback?')){
      try{
        await deleteFeedback(id);
        getData();
      }catch(err){
        console.error('Delete error', err);
      }
    }
  };

  const columns = [
    { name: 'ID', selector: row => row.feedbackId, sortable: true, width: '150px' },
    { name: 'User', selector: row => row.userName || row.userId || '--', sortable: true },
    { name: 'Rating', selector: row => `${row.rating} ⭐` || '--', sortable: true, width: '100px' },
    { name: 'Message', selector: row => row.comment || '--', wrap: true, grow: 2 },
    { name: 'Date', selector: row => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '--', sortable: true },
    { 
      name: 'Actions',
      cell: row => (
        <CButton color="danger" size="sm" onClick={() => handleDelete(row.feedbackId)}>Delete</CButton>
      )
    }
  ];

  return (
    <div className='container-fluid'>
      <DataTable
        title="Feedbacks"
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
export default Feedbacks;
