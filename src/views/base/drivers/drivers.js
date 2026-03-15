import React, { useEffect, useState } from 'react';
import { fetchDrivers } from '../../../api/driver';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';

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
  { name: 'Created At', selector: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
];

const Drivers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const getData = async () => {
      if (!token) { navigate('/login'); return; }
      try {
        const res = await fetchDrivers();
        setData(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [token, navigate]);

  return (
    <div className='container-fluid'>
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
    </div>
  );
};
export default Drivers;
