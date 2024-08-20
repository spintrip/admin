// UpdateTransactionModal.js
import React, { useEffect, useState } from 'react';
import { getTransaction , updateTransaction } from '../../../api/transaction';
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

const UpdateTransactionModal = () => {
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [transactionData , setTransactionData] = useState([]);
  const [transactionFormValues, setTransactionFormValues] = useState({
    status: ''
  });
  const [ transactionId , setTransactionId] = useState('')
  const token = localStorage.getItem('adminToken');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterdData , setFilteredData] = useState([]);
  const [selectedSearchOption , setSelectedSearchOption] = useState('all');
  const [searchInput , setSearchInput] = useState('');
  const limit = 20;
  const visiblePages = 3;

  useEffect(() => {
    if(!token) {
      console.log('No token Found');
      navigate('/login')
    }  else {
        fetchTransactionData();
    }
  }, []);

  const fetchTransactionData = async() =>{
   try{
    const data = await getTransaction();
    setTransactionData(data);

   } catch (error) {
    console.log(error);
   }

  }

  const handleTransactionInputChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormValues({
      ...transactionFormValues,
      [name]: value,
    });
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTransaction(transactionId , transactionFormValues);
      setTransactionModalVisible(false);
      setTransactionFormValues({
        status: ''
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const filterBooking = () => {
        if (!searchInput) {
          setFilteredData(transactionData);
          setCurrentPage(1);
        } else {
          const filtered = transactionData.filter((transaction) => {
            if (selectedSearchOption === 'all') {
                return Object.values(transaction).some(value =>
                  value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
                );
            } else {
                const value = transaction[selectedSearchOption];
                if (selectedSearchOption === 'createdAt' || selectedSearchOption === 'updatedAt') {
                const formattedDate = new Date(value).toLocaleString();
                return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
                }
                return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
            }
          });
          setFilteredData(filtered);
          setCurrentPage(1);
        }
      };      
    filterBooking();
  }, [transactionData , searchInput , selectedSearchOption ]);

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

  const handleTransaction = async (transaction) => {
    setTransactionId(transaction.Transactionid);
    setTransactionModalVisible(true);
  }

  const tableHeaders = [
    {label: 'All' , value : 'all'},
    { label: 'Transaction ID', value: 'Transactionid' },
    { label: 'Booking ID', value: 'Bookingid' },
    { label: 'Status', value: 'status' },
    { label: 'Amount', value: 'amount' },
    { label: 'GST Amount', value: 'GSTAmount' },
    { label: 'Total Amount', value: 'totalAmount' },
    { label: 'Created At', value: 'createdAt' },
    { label: 'Updated At', value: 'updatedAt' },
  ];
  

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center justify-content-between'>
        <div className='crud-group d-flex mx-2'>
         
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
        <CTableHeaderCell scope="col">Transaction ID</CTableHeaderCell>
        <CTableHeaderCell scope="col">Booking ID</CTableHeaderCell>
        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
        <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
        <CTableHeaderCell scope="col">GST Amount</CTableHeaderCell>
        <CTableHeaderCell scope="col">Total Amount</CTableHeaderCell>
        <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
        <CTableHeaderCell scope="col">Updated At</CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {displayedHosts.map((transaction, index) => (
        <CTableRow key={transaction.Transactionid} onClick={() => handleTransaction(transaction)}>
          <CTableHeaderCell scope="row">{(currentPage - 1) * limit + index + 1}</CTableHeaderCell>
          <CTableDataCell>{transaction.Transactionid}</CTableDataCell>
          <CTableDataCell>{transaction.Bookingid}</CTableDataCell>
          <CTableDataCell>{transaction.status}</CTableDataCell>
          <CTableDataCell>{transaction.amount}</CTableDataCell>
          <CTableDataCell>{transaction.GSTAmount ? transaction.GSTAmount : 'N/A'}</CTableDataCell>
          <CTableDataCell>{transaction.totalAmount}</CTableDataCell>
          <CTableDataCell>{new Date(transaction.createdAt).toLocaleString()}</CTableDataCell>
          <CTableDataCell>{new Date(transaction.updatedAt).toLocaleString()}</CTableDataCell>
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

      <CModal visible={transactionModalVisible} onClose={() => setTransactionModalVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Update Transaction Information</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleTransactionSubmit}>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Status</CFormLabel>
              <CFormInput type="text" name="status" value={transactionFormValues.status} onChange={handleTransactionInputChange} required />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setTransactionModalVisible(false)}>Close</CButton>
              <CButton color="primary" type="submit">Upload</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>
    </>
  );
};

export default UpdateTransactionModal;
