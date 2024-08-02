import React, { useEffect, useState } from 'react';
import { getPricing } from '../../../api/pricing';
import DocsExample from '../../../components/DocsExample';
import { useNavigate } from 'react-router-dom';
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

const Pricing = () => {
  const [pricingData, setPricingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      const data = await getPricing();
      setPricingData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil((pricingData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedPricing = (pricingData || []).slice((currentPage - 1) * limit, currentPage * limit);

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
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Cost per Hour</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedPricing.map((pricing, index) => (
              <CTableRow key={pricing.carid}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell>{pricing.carid.length > 10 ? `${pricing.carid.slice(0, 10)}...` : pricing.carid}</CTableDataCell>
                <CTableDataCell>{pricing.costperhr}</CTableDataCell>
                <CTableDataCell>{new Date(pricing.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(pricing.updatedAt).toLocaleString()}</CTableDataCell>
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

export default Pricing;
