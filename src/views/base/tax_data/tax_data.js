// UpdateTaxModal.js
import React, { useEffect, useState } from 'react';
import { createTax, getTax } from '../../../api/tax';
import DocsExample from '../../../components/DocsExample';
import {
  CInputGroup,
  CFormInput,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CButton,
  CForm,
  CFormLabel,
  CPagination,
  CPaginationItem,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react';

const UpdateTaxModal = () => {
  const [taxModalVisible, setTaxModalVisible] = useState(false);
  const [taxData , setTaxData] = useState([]);
  const [taxFormValues, setTaxFormValues] = useState({
    GST: '',
    TDS: '',
    HostGST: '',
    Commission: ''
  });
  const token = localStorage.getItem('adminToken');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterdData , setFilteredData] = useState([]);
  const [selectedSearchOption , setSelectedSearchOption] = useState('id');
  const [searchInput , setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;

  useEffect(() => {
    if(!token) {
      console.log('No token Found');
      navigate('/login')
    }  else {
      fetchTaxData();
    }
  }, []);

  const fetchTaxData = async() =>{
   try{
    const data = await getTax();
    setTaxData(data.taxes);

   } catch (error) {
    console.log(error);
   }

  }

  const handleTaxInputChange = (e) => {
    const { name, value } = e.target;
    setTaxFormValues({
      ...taxFormValues,
      [name]: value,
    });
  };

  const handleTaxSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTax(taxFormValues);
      setTaxModalVisible(false);
      setTaxFormValues({
        GST: '',
        TDS: '',
        HostGST: '',
        Commission: ''
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filterBooking = () => {
      if(!searchInput){
        setFilteredData(taxData);
        setCurrentPage(1);
      } else {
        const filtered = taxData.filter((tax) => {
          const value = tax[selectedSearchOption];
          if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
            const formattedDate = new Date(value).toLocaleString();
            return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
          }
          return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
        });
        setFilteredData(filtered);
        setCurrentPage(1);
      }
    };
    filterBooking();
  }, [taxData , searchInput , selectedSearchOption ]);

  const totalPages = Math.ceil(filterdData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedHosts = filterdData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const tableHeaders = [
    { label: 'Id', value: 'id' },
    { label: 'Commision', value: 'Commision' },
    { label: 'GST', value: 'GST' },
    { label: 'Host GST', value: 'HostGST' },
    { label: 'TDS', value: 'TDS' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ]

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
          <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setTaxModalVisible(true)} >Create</CButton>
          <CButton className="fw-bolder bg-light text-black mx-2">Update</CButton>
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
              <CTableHeaderCell scope="col">Id </CTableHeaderCell>
              <CTableHeaderCell scope="col">Commission</CTableHeaderCell>
              <CTableHeaderCell scope="col">GST</CTableHeaderCell>
              <CTableHeaderCell scope="col">Host Gst</CTableHeaderCell>
              <CTableHeaderCell scope="col">TDS</CTableHeaderCell>
              
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {displayedHosts.map((tax, index) => (
              <CTableRow key={tax.id}>
                <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
                <CTableDataCell  >{tax.id}</CTableDataCell>
                <CTableDataCell >{tax.Commission ? tax.Commission : 'N/A'}</CTableDataCell>
                <CTableDataCell >{tax.GST ? tax.GST : 'N/A'}</CTableDataCell>
                <CTableDataCell >{tax.HostGST ? tax.HostGST : 'N/A'}</CTableDataCell>
                <CTableDataCell >{tax.TDS ? tax.TDS : 'N/A'}</CTableDataCell>
                <CTableDataCell>{new Date(tax.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{new Date(tax.updatedAt).toLocaleString()}</CTableDataCell>
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

      <CModal visible={taxModalVisible} onClose={() => setTaxModalVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Update Tax Information</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleTaxSubmit}>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>GST</CFormLabel>
              <CFormInput type="text" name="GST" value={taxFormValues.GST} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>TDS</CFormLabel>
              <CFormInput type="text" name="TDS" value={taxFormValues.TDS} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>HostGST</CFormLabel>
              <CFormInput type="text" name="HostGST" value={taxFormValues.HostGST} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Commission</CFormLabel>
              <CFormInput type="text" name="Commission" value={taxFormValues.Commission} onChange={handleTaxInputChange} required />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setTaxModalVisible(false)}>Close</CButton>
              <CButton color="primary" type="submit">Upload</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  );
};

export default UpdateTaxModal;
