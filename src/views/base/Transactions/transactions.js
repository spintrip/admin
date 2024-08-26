// UpdateTransactionModal.js
import React, { useEffect, useState, useCallback } from 'react';
import { getTransaction, updateTransaction } from '../../../api/transaction';

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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
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
    name: 'Transaction ID',
    selector: (row) => row.Transactionid, // Replace with the actual key for Transaction ID in your data
    sortable: false,
  },
  {
    name: 'Booking ID',
    selector: (row) => row.Bookingid, // Replace with the actual key for Booking ID in your data
    sortable: false,
  },
  {
    name: 'Status',
    selector: (row) => row.status ? row.status : "N/A", // Replace with the actual key for Status in your data
    sortable: false,
  },
  {
    name: 'Amount',
    selector: (row) => row.amount, // Replace with the actual key for Amount in your data
    sortable: false,
  },
  {
    name: 'GST Amount',
    selector: (row) => row.gstAmount ? row.gstAmount : '0', // Replace with the actual key for GST Amount in your data
    sortable: false,
  },
  {
    name: 'Total Amount',
    selector: (row) => row.totalAmount, // Replace with the actual key for Total Amount in your data
    sortable: false,
  },
  {
    name: 'Created At',
    selector: (row) => new Date(row.createdAt).toLocaleString(), // Converts to a readable date string
    sortable: false,
  },
  {
    name: 'Updated At',
    selector: (row) => new Date(row.updatedAt).toLocaleString(), // Converts to a readable date string
    sortable: false,
  },
];

const UpdateTransactionModal = () => {
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [transactionFormValues, setTransactionFormValues] = useState({
    status: ''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const [filterdData, setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  console.log('Transactions', filterdData)


  useEffect(() => {
    console.log("DSIPLAYED Transactions", filterdData)
  }, [filterdData])

  useEffect(() => {
    fetchTransactionData();
    console.log('Fetched Transactions', filterdData)
  }, []);

  const fetchTransactionData = useCallback(async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      setTransactionData([]);
      setFilteredData([]);
      const data = await getTransaction();
      setTransactionData(data);
      setFilteredData(data); // Initialize filtered data with fetched data
    } catch (error) {
      console.log(error);
    }
  }, [token, navigate]);
  

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
      await updateTransaction(transactionId, transactionFormValues);
      setTransactionModalVisible(false);
      setTransactionFormValues({
        status: ''
      });
    } catch (error) {
      console.log(error);
    }
  };
  const filterBooking = () => {
    let sortedData = [...transactionData]; // Creates a copy of transactionData
    if (selectedSearchOption === 'createdAt') {
      sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // Apply search filter
    const filtered = sortedData.filter((transaction) => {
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
  };
  
  useEffect(() => {

    filterBooking();
    console.log(transactionData);
  }, [transactionData, selectedSearchOption, searchInput]);


  const displayedHosts = filterdData
  console.log('Transactions', filterdData)


  const handleTransaction = (transaction) => {
    setTransactionId(transaction.Transactionid);
    setTransactionModalVisible(true);
  }

  const tableHeaders = [
    { label: 'All', value: 'all' },
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
                {tableHeaders.find(header => header.value == selectedSearchOption)?.label || 'Select'}
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

      <div className='container-fluid h-fit-content '>
        <DataTable
          columns={columns}
          data={displayedHosts}
          customStyles={customStyles}
          responsive={true}
          title={'Transactions Table'}
          highlightOnHover={true}
          pointerOnHover={true}
          fixedHeader={true}
          onRowClicked={(transaction) => handleTransaction(transaction)}
        />
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
