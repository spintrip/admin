import React, {useState, useEffect, useCallback} from 'react'
import {fetchHosts} from '../../../api/host'
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import {getCars} from '../../../api/car'
import { fetchUsers } from '../../../api/user';
import {
    CButton,
    CInputGroup,
    CFormInput,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CRow,
    CCol,
    CForm,
    CFormLabel,
    CFormSelect,
    CImage
}
from '@coreui/react';
import { getBooking, fetchBookingById, } from '../../../api/booking';
import { sendPayout } from '../../../api/transaction';

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
      // {
      //   name: '#',
      //   selector: (row) => row.index, // Assuming there's an 'index' property for row numbering
      //   sortable: true,
      // },
      {
        name: 'ID',
        selector: (row) => row.id,
        sortable: true,
  
      },
      {
        name: 'Full Name',
        selector: (row) => row.additionalInfo?.FullName? row.additionalInfo?.FullName : '--' || row.FullName, // Check both possible locations
        sortable: true,
      },
      {
        name: 'Phone',
        selector: (row) => row.phone,
        sortable: true,
      },
      {
        name: 'Role',
        selector: (row) => row.role,
        sortable: true,
      },
      {
        name: 'Rating',
        selector: (row) => row.additionalInfo?.rating? row.additionalInfo?.rating:'N/A' || row.rating, // Adjusted to check nested 'additionalInfo'
        sortable: true,
      },
      // {
      //   name: 'Status',
      //   selector: (row) => row.status,
      //   sortable: true,
      // },
      {
        name: 'Verif-Status',
        selector: (row) =>
          row.additionalInfo?.verification_status ? 'true' : 'false',
        sortable: true,
      },
      {
        name: 'Created At',
        selector: (row) => row.createdAt,
        sortable: true,
      },
      {
        name: 'Updated At',
        selector: (row) => row.updatedAt,
        sortable: true,
      },
    ];


    const tableHeaders = [
        { label: 'Booking ID', value: 'Bookingid' },
        { label: 'Car ID', value: 'carid' },
        
        { label: 'Amount', value: 'amount' },
        { label: 'GST Amount', value: 'GSTAmount' },
        { label: 'Total User Amount', value: 'totalUserAmount' },
        { label: 'TDS Amount', value: 'TDSAmount' },
        { label: 'Total Host Amount', value: 'totalHostAmount' },
        { label: 'Start Trip Date', value: 'startTripDate' },
        { label: 'End Trip Date', value: 'endTripDate' },
        { label: 'Start Trip Time', value: 'startTripTime' },
        { label: 'End Trip Time', value: 'endTripTime' },
        { label: 'Created At', value: 'createdAt' },
        { label: 'Updated At', value: 'updatedAt' },
      ];

      const bookingColumns = tableHeaders.map(header => ({
        name: header.label,
        selector: row => row[header.value],
        sortable: true,
        // Adding unique key to prevent selection issues
        cell: (row) => <div key={row.Bookingid}>{row[header.value]}</div>,
      }));
function payout() {
    const token = localStorage.getItem('adminToken');
    const [userData, setUsersData] = useState([]);
    const [hostData, setHostData] = useState([]);
    const [carData, setCarData] = useState([]);
    const [filteredCarData, setFilteredCarData] = useState([])
    const [filteredData , setFilteredData] = useState([]);
    const [displayBookings, setDisplayBookings] = useState([])
    const [isFinalBookingLoading, setIsFinalBookingLoading] = useState(true)
    const [modalVisible, setModalVisible] = useState(false);
    const [specificHost, setSpecificHost] = useState([])
    const [bookingData, setBookingData] = useState([]);
    const [isLoading , setisLoading] = useState(false);
    const [filteredBookingData, setFilteredBookingData] = useState([]);
    const [payoutFormValues, setPayoutFormValues] = useState({
      bookingIds : [],
      userId: "",
      date : "",
      time : "",
      modeOfPayment : "",
    });
    const [modeOfPayment, setModeOfPayment] = useState('');
    const [proceedModal ,setProceedModal] = useState(false);
    const [selectedRows, setSelectedRows] = React.useState(false);
    const [toggledClearRows, setToggleClearRows] = React.useState(false);
    const [sendError , setSendError] = useState('');
    const navigate = useNavigate();
    
    const handleHostById = (host) => {
        setSpecificHost(host);
        console.log('Selected host ID:', host.id);
    
        const filteredCars = carData.filter((car) => {
            
            return String(car.hostId) === String(host.id);
        });
    
        setFilteredCarData(filteredCars);
    
        // Step 1: Extract car IDs from filteredCars
        const carIds = filteredCars.map(car => car.carid);
        
        // Step 2: Filter bookings based on car IDs
        const filteredBookings = bookingData.filter((booking) => {
            
            return (carIds.includes(booking.carid) && booking.status==3)? booking : null
        });
        // console.log('Filtered bookings:', filteredBookings);
        setDisplayBookings(filteredBookings)
        // If you want to save the filtered bookings to state
        setModalVisible(true);
        setIsFinalBookingLoading(false)
    };


  
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = String(date.getFullYear()).slice(-2); // Last two digits of the year
      
        return `${day}/${month}/${year} ${date.toLocaleTimeString()}`;
      };
      
      const getCurrentDateTime = () => formatDate(new Date());

    const filterHosts = (userData, hostData) => {
        const hostIds = new Set(hostData.map((host) => host.id));
        const filteredHostData = userData.filter((user) => hostIds.has(user.id));
        return filteredHostData;
    };


    const fetchData = useCallback(async () => {
        if (!token) {
          console.log('No token Found');
          navigate('/login');
          return;
        }
        try {
          const hosts = await fetchHosts();
          const users = await fetchUsers();
    
          setHostData(hosts);
          setUsersData(users);
    
          const filteredHosts = filterHosts(users, hosts);
          // console.log('Filtered Hosts', filteredHosts);
          setFilteredData(filteredHosts);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }, [token, navigate]);
      let totalHostAmt = 0
      const addSelectedBooking = ({ selectedRows }) => {
        setSelectedRows(selectedRows);
      };
    
      // Toggle the state so React Data Table changes to clearSelectedRows are triggered
      const removeSelectedBooking = () => {
        setToggleClearRows(!toggledClearRows);
      }

      // useEffect(() => {
      //   console.log('selected booking id', selectedRows)

      // }, [selectedRows]);


    useEffect(() => {
      fetchData();
    }, []);


    const fetchCarData = useCallback(async () => {
        if (!token) {
          console.log('No token Found');
          navigate('/login');
        }
        try {
          const data = await getCars();
          setCarData(data);
          
        } catch (error) {
          setError(error.message);
        }
      } , [token , navigate]);

    console.log('Cars data', carData)

      useEffect(() => {
        fetchCarData();
      }, []);

  useEffect(() => {
    const fetchBookingsData = async () => {
      try {
        const data = await getBooking();
        setBookingData(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBookingsData();
  }, []);


  const handleModeSelection = (mode) => {
    setModeOfPayment(mode);
  };

  
  const handleSendProceed = () => {
    const bookingIds = selectedRows.map(booking => booking.Bookingid.toString()); 
    setPayoutFormValues(prevState => ({
      ...prevState,
      bookingIds: [...new Set([...prevState.bookingIds, ...bookingIds])],
      userId: specificHost.id, 
      modeOfPayment: modeOfPayment, 
      date: getCurrentDateTime().split(' ')[0], 
      time: getCurrentDateTime().split(' ')[1] 
    }));
    setProceedModal(true);
    
  };

 const handlePayoutSubmit = useCallback(async (e) => {
    e.preventDefault();
    setisLoading(true);
    if (!payoutFormValues.modeOfPayment) {
      alert("Please fill the mode Of Payment field.");
      setisLoading(false);
      return; 
    }
    if(!token) {
        console.log('No token Found');
        navigate('/login')
    }
   try{
    const trimmedData = payoutFormValues;
    const data = await sendPayout(trimmedData);
    console.log(data);
    setProceedModal(false);
    setModalVisible(false);
    setSendError(null);
   } catch (error) {
    setSendError(error.message);
   }
   setisLoading(false);
   setSelectedRows(false);  
   setToggleClearRows(!toggledClearRows); 
   
  }, [token , navigate, payoutFormValues, sendPayout]);


  const handleCloseConfirm = () => {
    setProceedModal(false)
    setSendError(null);
  }

  const handlePayoutClose = () =>{
    setModalVisible(false);
    setSelectedRows(false);
  }


  console.log('bookings', bookingData)
  return (
    <div className='container-fluid'>
        <h1>Payout</h1>
        <DataTable
                  
                  columns={columns}
                  data={filteredData}
                  customStyles={customStyles}
                  responsive={true}
                  highlightOnHover={true}
                  pointerOnHover={true}
                  fixedHeader={true}
                  onRowClicked={(host)=>handleHostById(host)}
          />
        
        <CModal visible={modalVisible} onClose={handlePayoutClose} size="xl" scrollable alignment='center'>
            <CModalHeader>
              <CModalTitle>Host Payout Details <span> </span></CModalTitle>
            </CModalHeader>
            <CModalBody >
            <CDropdown className='w-100'>
                  <CDropdownToggle className='d-flex align-items-center text-uppercase justify-content-between py-3' color="light" style={{fontWeight: '700'}}>{modeOfPayment}</CDropdownToggle>
                    <CDropdownMenu className='bg-primary p-3 w-100' style={{minWidth: '100px'}}>
                        <CDropdownItem onClick={() => handleModeSelection('Bank Transfer')}>Bank Transfer</CDropdownItem>
                        <CDropdownItem onClick={() => handleModeSelection('UPI')}>UPI</CDropdownItem>
                      </CDropdownMenu>
                </CDropdown>

                <div className='border rounded p-3 my-4 overflow-y-scroll' style={{minHeight: '50vh'}}>
                    <h6>All Bookings for Host ID: <span className='border rounded p-1'>{specificHost.id}</span> </h6>
                    {isFinalBookingLoading ?
                    <div className='f-flex align-items-center justify-content-center h-100 w-100'>
                        Loading
                    </div>:
                    <div>
                        <DataTable
                            columns={bookingColumns}
                            data={displayBookings.map((row, index) => ({ ...row, uniqueId: `${row.Bookingid}-${index}` }))}
                            customStyles={customStyles}
                            responsive={true}
                          keyField="Bookingid"
                            highlightOnHover={true}
                            pointerOnHover={true}
                            fixedHeader={true}
                            selectableRows
                            onSelectedRowsChange={({ selectedRows }) => addSelectedBooking({ selectedRows })}
                            clearSelectedRows={toggledClearRows}
                          />
                    </div>
                    }
                </div>
                <div className='w-100  d-flex 
                flex-column align-items-center justify-content-between'>
                    {selectedRows?<>
                        {selectedRows.map((booking, index) => {
                          console.log('Booking data:', booking.totalHostAmount); // Check if totalHostAmount is present
                          totalHostAmt+=booking.totalHostAmount
                          return (
                            <div key={index} className='row w-100'>
                              <div className='col'>{booking.Bookingid}</div>
                              
                              <div className='col d-flex align-items-center justify-content-end' style={{fontWeight: '600'}}>+ ₹{String(booking.totalHostAmount)}</div>
                              <hr className='opacity-50'/>
                            </div>
                          );
                        })}
                        <div className='w-100'>
                        <h2 className='w-100 d-flex align-items-center justify-content-end' style={{fontWeight: '700'}}>₹{totalHostAmt.toFixed(2)}</h2>
                        </div>
                   </>
                   :<></>
                }
                    
                </div>
            </CModalBody>


            <CModalFooter className='d-flex align-items-center justify-content-between'>
               <div className='me-3'>{getCurrentDateTime()}</div>
               <CButton size='xl' color='primary' onClick={handleSendProceed}>
                Send Payout
               </CButton>
            </CModalFooter>
          </CModal>


          <CModal visible={proceedModal} onClose={handleCloseConfirm} alignment="center" size="sm">
            <CModalHeader>
              <CModalTitle>Send Payout</CModalTitle>
            </CModalHeader>
            <CModalBody>
            {sendError ? (
              <div className='error-message'> {sendError}</div>
            ) : (
              
              <div>
                <span>Are You sure?</span>
              </div>
            )}
            </CModalBody>
            <CModalFooter>
                <CButton>No</CButton>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                <CButton onClick={handlePayoutSubmit}>Yes</CButton>
            )}
            </CModalFooter>
          </CModal>
    </div>
  )
}

export default payout