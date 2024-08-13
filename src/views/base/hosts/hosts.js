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
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CButton,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';

const Hosts = () => {
  const [hostData, setHostData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterdData , setFilteredData] = useState([]);
  const [selectedSearchOption , setSelectedSearchOption] = useState('id');
  const [searchInput , setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
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
        setFilteredData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filterBooking = () => {
      if(!searchInput){
        setFilteredData(hostData);
        setCurrentPage(1);
      } else {
        const filtered = hostData.filter((host) => {
          const value = host[selectedSearchOption];
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
  }, [hostData , searchInput , selectedSearchOption ]);

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
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ]

  return (
    <>
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
                <CTableDataCell style={{ fontSize: '12px' }} >{host.id}</CTableDataCell>
                <CTableDataCell style={{ fontSize: '12px' }} >{host.UserId ? host.UserId : 'N/A'}</CTableDataCell>
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
