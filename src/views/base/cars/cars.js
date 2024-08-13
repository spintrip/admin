import React, { useEffect, useState } from 'react';
import { getCars } from '../../../api/car';
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
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const Cars = () => {
  const [carData, setCarData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('carid');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if(!token){
        console.log('No token Found');
        navigate('/login')
      }
      try {
        const data = await getCars();
        setCarData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterCars = () =>{
      if(!searchInput){
        setFilteredData(carData)
        setCurrentPage(1);
      } else {
        const filtered = carData.filter((user) => {
          const value = user[selectedSearchOption];
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
    filterCars();
  }, [carData , selectedSearchOption, searchInput] )


  const totalPages = Math.ceil(filteredData.length / limit);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const displayedCars = filteredData.slice((currentPage - 1) * limit, currentPage * limit);

  const getVisiblePages = () => {
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const tableHeaders = [
    { label: 'Car Model', value: 'carmodel' },
    { label: 'Type', value: 'type' },
    { label: 'Brand', value: 'brand' },
    { label: 'Chassis No', value: 'chassisno' },
    { label: 'RC Number', value: 'Rcnumber' },
    { label: 'Engine Number', value: 'Enginenumber' },
    { label: 'Registration Year', value: 'Registrationyear' },
    { label: 'Body Type', value: 'bodyType' },
    { label: 'Car ID', value: 'carid' },
    { label: 'Rating', value: 'rating' },
    { label: 'Host ID', value: 'hostId' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];
  
  return (
    <div className='container-fluid'>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
          <CButton className="fw-bolder bg-light text-black mx-2" >Create</CButton>
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
      <DocsExample href="components/table#hoverable-rows ">
        <CTable color="dark" hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Car Model</CTableHeaderCell>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Brand</CTableHeaderCell>
              <CTableHeaderCell scope="col">Chassis No</CTableHeaderCell>
              <CTableHeaderCell scope="col">RC Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Engine Number</CTableHeaderCell>
              <CTableHeaderCell scope="col">Registration Year</CTableHeaderCell>
              <CTableHeaderCell scope="col">Body Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Rating</CTableHeaderCell>
              <CTableHeaderCell scope="col">Host ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
              <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
          {displayedCars.map((car, index) => (
            <CTableRow key={car.carid}>
              <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
              <CTableDataCell style={{ fontSize: '12px' }}>
                {car.carid ? car.carid : 'N/A'}
              </CTableDataCell>
              <CTableDataCell>{car.carmodel}</CTableDataCell>
              <CTableDataCell>{car.type}</CTableDataCell>
              <CTableDataCell>{car.brand}</CTableDataCell>
              <CTableDataCell style={{ fontSize: '12px' }}>
                {car.chassisno ? car.chassisno : 'N/A'}
              </CTableDataCell>
              <CTableDataCell>{car.Rcnumber}</CTableDataCell>
              <CTableDataCell>
                {car.Enginenumber && car.Enginenumber.length > 10 ? `${car.Enginenumber.slice(0, 10)}...` : car.Enginenumber}
              </CTableDataCell>
              <CTableDataCell>{car.Registrationyear}</CTableDataCell>
              <CTableDataCell>{car.bodytype}</CTableDataCell>
              <CTableDataCell>
                {car.rating !== null && car.rating !== undefined ? car.rating.toFixed(2) : 'N/A'}
              </CTableDataCell>
              <CTableDataCell>
                {car.hostId ? car.hostId : 'N/A'}
              </CTableDataCell>
              <CTableDataCell>{new Date(car.createdAt).toLocaleString()}</CTableDataCell>
              <CTableDataCell>{new Date(car.updatedAt).toLocaleString()}</CTableDataCell>
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
    </div>
  );
};

export default Cars;
