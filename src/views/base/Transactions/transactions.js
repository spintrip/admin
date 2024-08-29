// UpdateTransactionModal.js
import React, { useEffect, useState, useCallback } from 'react';
import { getTransaction , updateTransaction } from '../../../api/transaction';

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
    selector: row => {
      switch (row.status) {
        case 1:
          return "Upcoming";
        case 2:
          return "Start Ride";
        case 3:
          return "Requested";
        
        default:
          return "Unknown";
      }
    },
    sortable: false,
    cell: row => {
      let statusText;
      let className;
  
      switch (row.status) {
        case 1:
          statusText = "Initiated";
          className = "p-1 rounded border border-primary text-white bg-primary w-100 text-center";
          break;
        case 2:
          statusText = "Payment Processed";
          className = "p-1 rounded border border-success text-white bg-success w-100 text-center";
          break;
        case 3:
          statusText = "Declined";
          className = "p-1 rounded border border-danger text-black bg-danger w-100 text-center";
          break;
        default:
          statusText = "Unknown";
          className = "";
      }
  
      return <div key={row.Bookingid} className={className}>{statusText}</div>;
    },
  },
  {
    name: 'Amount',
    selector: (row) => row.amount, // Replace with the actual key for Amount in your data
    sortable: false,
    cell: (row) => {return <div style={{fontWeight: '700'}}>₹ {row.amount.toFixed(2)}</div>}
  },
  {
    name: 'GST Amount',
    selector: (row) => row.gstAmount? row.gstAmount : '0', // Replace with the actual key for GST Amount in your data
    sortable: false,
    cell: (row) => {return <div style={{fontWeight: '700'}}>₹ {row.gstAmount? row.gstAmount.toFixed(2) : '0.00'}</div>}
  },
  {
    name: 'Total Amount',
    selector: (row) => row.totalAmount, // Replace with the actual key for Total Amount in your data
    sortable: false,
    cell: (row) => {return <div style={{fontWeight: '700'}}>₹ {row.totalAmount.toFixed(2)}</div>}
  },
  {
    name: 'Created At',
    selector: (row) => new Date(row.createdAt).toLocaleString(), // Converts to a readable date string
    sortable: false,
  },
  {
    name: 'Updated At',
    selector: (row) => new Date(row.updatedAt).toLocaleString(), // Converts to a readable date string
    sortable: true,
  },
];

const UpdateTransactionModal = () => {
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [transactionData , setTransactionData] = useState([]);
  const [transactionFormValues, setTransactionFormValues] = useState({
    status: ''
  });
  const navigate = useNavigate();
  const [ transactionId , setTransactionId] = useState('')
  const token = localStorage.getItem('adminToken');
  const [filterdData , setFilteredData] = useState([]);
  const [selectedSearchOption , setSelectedSearchOption] = useState('all');
  const [searchInput , setSearchInput] = useState('');
  console.log('Transactions', filterdData)


  useEffect(() => {
    console.log("DSIPLAYED Transactions", filterdData)
  }, [filterdData])

  useEffect(() => {
    fetchTransactionData();
    console.log('Fetched Transactions', filterdData)
  }, []);

  const fetchTransactionData = useCallback(async() =>{
   if(!token) {
      console.log('No token Found');
      navigate('/login')
   }
   try{
    const data = await getTransaction();
    setTransactionData(data);
   } catch (error) {
    console.log(error);
   }

  }, [token , navigate])

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
    let sortedData = [...transactionData];
      sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (!searchInput) {
        setFilteredData(sortedData);
      } else {
        const filtered = sortedData.filter((transaction) => {
          if (selectedSearchOption == 'all') {
              return Object.values(transaction).some(value =>
                value && value.toString().toLowerCase().includes(searchInput.toLowerCase())
              );
          } else {
              const value = transaction[selectedSearchOption];
              if (selectedSearchOption == 'createdAt' || selectedSearchOption == 'updatedAt') {
              const formattedDate = new Date(value).toLocaleString();
              return formattedDate && formattedDate.toLowerCase().includes(searchInput.toLowerCase());
              }
              return value && value.toString().toLowerCase().includes(searchInput.toLowerCase());
          }
        });
        setFilteredData(filtered);
        
      }
    };     
  
    
    filterBooking();
  }, [transactionData ,selectedSearchOption, searchInput  ]);


  const displayedHosts = filterdData
  console.log('Transactions', filterdData)


  const handleTransaction = (transaction) => {
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
                  //data={displayedHosts}
                  data={displayedHosts.map((row, index) => ({ ...row, uniqueId: `${row.Transactionid}-${row.Bookingid}-${index}` }))}
                  customStyles={customStyles}
                  responsive={true}
                  title={'Transactions Table'}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  onRowClicked={(transaction)=>handleTransaction(transaction)}
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
