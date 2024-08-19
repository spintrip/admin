import React, { useEffect, useState } from 'react';
import { getPricing , autoCarPricing , manualCarPricing } from '../../../api/pricing';
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
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CForm,
} from '@coreui/react';
import '../../../scss/pricing.css';

const Pricing = () => {
  const [pricingData, setPricingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('carid');
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [updatedCarId , setUpdatedCarId] = useState({ carid : ''})
  const [updatedAutoData , setUpdateAutoData] = useState([])
  const [showManualModal, setShowManualModal] = useState(false);
  const [updatedManualData , setUpdatedManualData] = useState({ carid : '' , costperhr: ''});
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
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

  useEffect(() => {
    const filterPricing = () =>{
      if(!searchInput) {
        setFilteredData(pricingData);
        setCurrentPage(1);
      } else {
        const filtered = pricingData.filter((pricing) => {
          const value = pricing[selectedSearchOption];
          if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
            const formattedDate = new Date(value).toLocaleString();
            return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
          }
          return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
        })
        setFilteredData(filtered);
        setCurrentPage(1);
      }
    };
    filterPricing();
  }, [pricingData , selectedSearchOption , searchInput])

  const totalPages = Math.ceil((filteredData?.length || 0) / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedPricing = (filteredData || []).slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const handleAutoPricing = async() => {
      const trimmedData = {
        carid: updatedCarId.carid.trim(),
      };
      setLoading(true)
      try {
        const data = await autoCarPricing(trimmedData);
        setUpdateAutoData(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false)
      }
  }

  const handleManualPricing = async() => {
    const trimmedData = {
      carid: updatedManualData.carid.trim(),
      costperhr: updatedManualData.costperhr.trim(),
    };
    console.log(updatedManualData.carid);
  
    try {
      await manualCarPricing(trimmedData);
      setShowManualModal(false);
    } catch (error) {
      console.log(error);
    }
}
  const tableHeaders = [
    { label: 'Car Id', value: 'carid' },
    { label: 'Cost/Hr', value: 'costperhr' },
    { label: 'Create Date', value: 'createdAt' },
    { label: 'Update Date', value: 'updatedAt' },
  ];

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
          <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setShowManualModal(true)}>Manual Pricing</CButton>
          <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setShowAutoModal(true)}>Auto Pricing</CButton>
        </div>
        <div>
          <CInputGroup className="mx-2">
            <CFormInput
              aria-label="Text input with dropdown button"
              placeholder='Search'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <CDropdown alignment="end" variant="input-group">
            <CDropdownToggle color="secondary" variant="outline">
              {tableHeaders.find(header => header.value === selectedSearchOption)?.label || 'Select'}
            </CDropdownToggle>
              <CDropdownMenu>
                {tableHeaders.map((header, index) => (
                  <CDropdownItem key={index} onClick={() => setSelectedSearchOption(header.value)}>
                    {header.label}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
          </CInputGroup>
        </div>
      </div>
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
                <CTableDataCell style={{ fontSize : '14px' }}>{pricing.carid ? pricing.carid : 'N/A'}</CTableDataCell>
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
      <CModal visible={showAutoModal} onClose={() => setShowAutoModal(false)} className="custom-modal">
          <CModalHeader className="modal-header-styled">Auto Pricing</CModalHeader>
          <CModalBody className="modal-body-styled">
            <CForm className="modal-form">
              <CFormInput
                type="text"
                placeholder="Enter Car ID"
                value={updatedCarId.carid}
                onChange={(e) => setUpdatedCarId({ ...updatedCarId, carid: e.target.value })}
                className="modal-input"
              />
            </CForm>
              {loading && (
                <div className="loader-container">
                  <div className="loader"></div> 
                </div>
              )}

              {!loading && updatedAutoData && (
                <div className="received-data-container">
                  <p><strong>Message:</strong> {updatedAutoData.message}</p>
                  <p><strong>Car ID:</strong> {updatedAutoData.carid}</p>
                  <p><strong>Cost per Hour:</strong> ₹{updatedAutoData.costperhr}</p>
                </div>
              )}
          </CModalBody>
          <CModalFooter className="modal-footer-styled">
            <CButton color="secondary" onClick={() => setShowAutoModal(false)}>Close</CButton>
            <CButton color="primary" onClick={handleAutoPricing}>Update</CButton>
          </CModalFooter>
        </CModal>

        <CModal visible={showManualModal} onClose={() => setShowManualModal(false)} className="custom-modal">
          <CModalHeader className="modal-header-styled">Manual Pricing</CModalHeader>
          <CModalBody className="modal-body-styled">
            <CForm className="modal-form">
              <CFormInput
                type="text"
                placeholder="Enter Car ID"
                value={updatedManualData.carid}
                onChange={(e) => setUpdatedManualData({ ...updatedManualData, carid: e.target.value })}
                className="modal-input"
              />
            </CForm>

            <CForm className="modal-form">
              <CFormInput
                type="text"
                placeholder="Enter Cost/Hr"
                value={updatedManualData.costperhr}
                onChange={(e) => setUpdatedManualData({ ...updatedManualData, costperhr: e.target.value })}
                className="modal-input"
              />
            </CForm>
          </CModalBody>
          <CModalFooter className="modal-footer-styled">
            <CButton color="secondary" onClick={() => setShowManualModal(false)}>Close</CButton>
            <CButton color="primary" onClick={handleManualPricing}>Update</CButton>
          </CModalFooter>
        </CModal>
    </>
  );
};

export default Pricing;
