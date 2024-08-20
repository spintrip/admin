import React, { useState, useEffect, useCallback } from 'react';
import { createFeature, getFeatures, deleteFeatures } from '../../../api/feature';
import {
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormSelect,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CPagination,
  CPaginationItem
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/blog.css';

const Features = () => {
  const [visible, setVisible] = useState(false);
  const [features, setFeatures] = useState([]);
  const [selectedFeatureName, setSelectedFeatureName] = useState('');
  const token = localStorage.getItem('adminToken');
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [error , setError] = useState('');
  const [modalError , setModalError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const limit = 20;
  const visiblePages = 3;

  useEffect(() => {
    fetchFeatureData();
  }, []);

  const fetchFeatureData = useCallback(async () => {
    try {
        if (!token) {
            console.log('No token Found');
            navigate('/login');
          }
      const data = await getFeatures();
      setFeatures(data);
    } catch (error) {
      setError(error.message);
    }
  }, [token, navigate]);


  const handleFeatureSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await createFeature(selectedFeatureName);
      fetchFeatureData();
      setSelectedFeatureName('');
      setVisible(false);
      setModalError(''); 
    } catch (error) {
      setModalError(error.response?.data?.message || 'An error occurred');
    }
  }, [fetchFeatureData, selectedFeatureName]);
  

  const handleCloseModal = () => {
    setVisible(false);
    setModalError(''); 
  };


  const handleFeatureDelete = useCallback(async (id) => {
    try {
      await deleteFeatures(id);
      fetchFeatureData();
      setError('');
    } catch (error) {
      setError(error.message);
    }
  },[fetchFeatureData]);

  useEffect(() => {
    const filterFeatures = () =>{
      if(!searchInput) {
        setFilteredData(features);
        setCurrentPage(1);
      } else {
        const filtered = features.filter((feature) => {
          if (selectedSearchOption === 'all') {
            return Object.values(feature).some(value =>
              value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
            );
          } else {
            const value = feature[selectedSearchOption];
            if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
              const formattedDate = new Date(value).toLocaleString();
              return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
            }
            return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
        })
        setFilteredData(filtered);
        setCurrentPage(1);
      }
    };
    filterFeatures();
  }, [features , selectedSearchOption , searchInput])

  const totalPages = Math.ceil(filteredData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedfeatures = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  
  const tableHeaders = [
    { label: 'All', value: 'all' },
    { label: 'Feature', value: 'featureName' },
    { label: 'Create Date', value: 'createdAt' },
    { label: 'Update Date', value: 'updatedAt' },
  ];

  return (
    <div>
      {error ? (
        <div> {error} </div>
      ) : (
        <>
        <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
          <div className='crud-group d-flex mx-2'>
            <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setVisible(true)}> Create </CButton>
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
  
        <div className="mt-4 container-fluid">
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell scope="col">#</CTableHeaderCell>
                <CTableHeaderCell scope="col">Feature Name</CTableHeaderCell>
                <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
                <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {displayedfeatures.map((feature, index) => (
                <CTableRow key={feature.id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{feature.featureName}</CTableDataCell>
                  <CTableDataCell>{new Date(feature.createdAt).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>{new Date(feature.updatedAt).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="danger" size="sm" onClick={() => handleFeatureDelete(feature.id)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
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
        </div>
  
        {/* Feature Creation Modal */}
        <CModal visible={visible} onClose={handleCloseModal} alignment="center" size="lg">
          <CModalHeader>
            <CModalTitle>Create Feature</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {modalError ? (
              <div>
                {modalError}
              </div>
            ) : (
              <CForm onSubmit={handleFeatureSubmit}>
              <CInputGroup className="mb-3">
                <CFormLabel className='me-3'>Select Feature</CFormLabel>
                <CFormSelect 
                  value={selectedFeatureName} 
                  onChange={(e) => setSelectedFeatureName(e.target.value)} 
                  required
                >
                  <option value="">Choose...</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="pick/up">Pick/Up</option>
                  <option value="selfdirve">Self Drive</option>
                </CFormSelect>
              </CInputGroup>
              <CModalFooter>
                <CButton color="secondary" onClick={handleCloseModal}>Close</CButton>
                <CButton color="primary" type="submit">Save changes</CButton>
              </CModalFooter>
            </CForm>
            )}
          </CModalBody>
        </CModal>
      </>
      )}
    </div>
  );
};

export default Features;
