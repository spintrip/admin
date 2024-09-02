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
import DataTable from 'react-data-table-component';
const customStyles = {
  header: {
    style: {
      backgroundColor: 'transparent',
      color: '#ffffff',
    },
  },
  headRow: {
    style: {
      backgroundColor: '#212631',
      color: '#ffffff',
    },
  },
  headCells: {
    style: {
      color: '#ffffff',
    },
  },
  rows: {
    style: {
      backgroundColor: '#282D37',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: 'black',
      },
    },
  },
  pagination: {
    style: {
      backgroundColor: '#343a40',
      color: '#ffffff',
    },
  },
};
const columns = [

  {
    name: 'Car ID',
    selector: row => row.carid, // Replace with the actual key for Car ID in your data
    sortable: true,
  },
  {
    name: 'Cost per Hour',
    selector: row => row.costperhr? '₹ '+row.costperhr.toFixed(2) : null, // Replace with the actual key for Cost per Hour in your data
    sortable: true,
    col: row => {
      return <div>₹ {row.costperhr}</div>
    }
  },
  {
    name: 'Created At',
    selector: row => new Date(row.createdAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
  {
    name: 'Updated At',
    selector: row => new Date(row.updatedAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
];
const Pricing = () => {
  const [pricingData, setPricingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('carid');
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [updatedCarId , setUpdatedCarId] = useState({ carid : ''})
  const [updatedAutoData , setUpdateAutoData] = useState([])
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
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

  const displayedPricing = filteredData || [];
  console.log(displayedPricing)
  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const handleAutoPricing = async() => {
      const trimmedData = {
        carid: updatedCarId.trim(),
      };
      setLoading(true)
      try {
        const data = await autoCarPricing(trimmedData);
        setUpdateAutoData(data);
        fetchData();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false)
        setShowPricingModal(false);
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
      fetchData();
    } catch (error) {
      console.log(error);
    }
    setShowPricingModal(false);
}
  const handlePricing = (car) =>{
    setUpdatedCarId(car.carid);
    setUpdatedManualData(car);
    setShowPricingModal(true);
  }
  const tableHeaders = [
    { label: 'Car Id', value: 'carid' },
    { label: 'Cost/Hr', value: 'costperhr' },
    { label: 'Create Date', value: 'createdAt' },
    { label: 'Update Date', value: 'updatedAt' },
  ];

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-end'>
        
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
      <div className='container-fluid h-fit-content mt-4 '>
      <DataTable
                  columns={columns}
                  data={displayedPricing}
                  customStyles={customStyles}
                  responsive={true}
                  title={'Pricing Table'}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  onRowClicked={(car)=>handlePricing(car)}
          />
          </div>

          <CModal visible={showPricingModal} onClose={() => setShowPricingModal(false)} className="custom-modal">
            <CModalHeader className="modal-header-styled">Pricing</CModalHeader>
            <CModalBody className="modal-body-styled">
              <div>
                <h2>Selected Car ID</h2>
                <span>{updatedCarId}</span>
                <p>Please select the pricing you need to set.</p>
              </div>
              <div className='crud-group d-flex mx-2 justify-content-between'>
                <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setShowManualModal(true)}>Manual Pricing</CButton>
                <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setShowAutoModal(true)}>Auto Pricing</CButton>
              </div>
            </CModalBody>
            <CModalFooter className="modal-footer-styled">
              
            </CModalFooter>
          </CModal>

          <CModal visible={showAutoModal} onClose={() => setShowAutoModal(false)} className="custom-modal">
            <CModalHeader className="modal-header-styled">Auto Pricing</CModalHeader>
              <CModalBody className="modal-body-styled">
                <CForm className="modal-form">
                  <CFormInput
                    type="text"
                    placeholder="Enter Car ID"
                    value={updatedCarId}
                    onChange={(e) => setUpdatedCarId(e.target.value)}
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
