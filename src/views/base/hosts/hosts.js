import React, { useEffect, useState } from 'react';
import { fetchHosts } from '../../../api/host';
import DocsExample from '../../../components/DocsExample';
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CPagination,
  CPaginationItem,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const Hosts = () => {
  const [hostData, setHostData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if(!token){
        console.log('No token Found');
        navigate('/Login')
      }
      try {
        const data = await fetchHosts();
        setHostData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const totalPages = Math.ceil(hostData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedHosts = hostData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  return (
    <>
      <DocsExample href="components/table#hoverable-rows">
        <CTable color="dark" hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">User ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedHosts.map((host, index) => (
              <CTableRow key={host.id}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell>{host.id.length > 10 ? `${host.id.slice(0, 10)}...` : host.id}</CTableDataCell>
                <CTableDataCell>{host.UserId ? (host.UserId.length > 10 ? `${host.UserId.slice(0, 10)}...` : host.UserId) : 'N/A'}</CTableDataCell>
                <CTableDataCell>{new Date(host.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(host.updatedAt).toLocaleString()}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </DocsExample>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CPagination aria-label="Page navigation example">
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </CPaginationItem>
          {getVisiblePages().map((page) => (
            <CPaginationItem
              key={page}
              active={page === currentPage}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </CPaginationItem>
          ))}
          <CPaginationItem
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </CPaginationItem>
        </CPagination>
      </div>
    </>
  );
};

export default Hosts;
