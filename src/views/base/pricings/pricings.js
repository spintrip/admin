import React, { useEffect, useState } from 'react';
import { getPricing , autovehiclePricing , manualvehiclePricing } from '../../../api/pricing';
import axios from 'axios';
import serverApiUrl from '../../../env';
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
    name: 'vehicle Id',
    selector: row => row.vehicleid, // Replace with the actual key for vehicle Id in your data
    sortable: true,
  },
  {
    name: 'Cost per Hour',
    selector: row => row.costperhr ? 'Rs. ' + Number(row.costperhr).toFixed(2) : null, // Replace with the actual key for Cost per Hour in your data
    sortable: true,
    col: row => {
      return <div>Rs. {row.costperhr}</div>
    }
  },
  {
    name: 'Created At',
    selector: row => new Date(row.createdAt), // Return the Date object for sorting
    sortable: true,
    cell: row => new Date(row.createdAt).toLocaleString(), // Display as a formatted string
  },
  {
    name: 'Updated At',
    selector: row => new Date(row.updatedAt), // Return the Date object for sorting
    sortable: true,
    cell: row => new Date(row.updatedAt).toLocaleString(), // Display as a formatted string
  },
];

const cabRateColumns = [
  { name: 'City', selector: row => row.city || '--', sortable: true },
  { name: 'Cab Type', selector: row => row.cabType || '--', sortable: true },
  { name: 'Airport T.', selector: row => row.airportTransferPrice ? 'Rs. ' + row.airportTransferPrice : 'N/A' },
  { name: 'Half Day', selector: row => row.halfDayPrice ? 'Rs. ' + row.halfDayPrice : 'N/A' },
  { name: 'Full Day', selector: row => row.fullDayPrice ? 'Rs. ' + row.fullDayPrice : 'N/A' },
  { name: 'Extra Hr', selector: row => row.extraHourRate ? 'Rs. ' + row.extraHourRate : 'N/A' },
  { name: 'Extra Km', selector: row => row.extraKmRate ? 'Rs. ' + row.extraKmRate : 'N/A' },
  { name: 'Outstation', selector: row => row.outstationPerKmPrice ? 'Rs. ' + row.outstationPerKmPrice : 'N/A' },
  { name: 'D/A', selector: row => row.driverAllowancePerDay ? 'Rs. ' + row.driverAllowancePerDay : 'N/A' },
  { name: 'Toll (Rs. )', selector: row => row.tollCharges ? 'Rs. ' + row.tollCharges : 'Rs. 0' },
  { name: 'Surge', selector: row => row.surgeMultiplier ? row.surgeMultiplier + 'x' : '1x' },
  { name: 'Offers', selector: row => row.offers ? row.offers : '--' },
];
const Pricing = () => {
  const [pricingData, setPricingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData , setFilteredData] = useState([]);
  const [selectedSearchOption, setSelectedSearchOption] = useState('vehicleid');
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [updatedvehicleid , setUpdatedvehicleid] = useState({ vehicleid : ''})
  const [updatedAutoData , setUpdateAutoData] = useState([])
  const [showManualModal, setShowManualModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [updatedManualData , setUpdatedManualData] = useState({ vehicleid : '' , costperhr: ''});
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  // Cab Admin Cab Rate States
  const [cabRates, setCabRates] = useState([]);
  const [cabTypes, setCabTypes] = useState([]); // Dynamic vehicle types
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({
    city: '', cabType: '', airportTransferPrice: '', halfDayPrice: '', fullDayPrice: '', extraHourRate: '', extraKmRate: '', outstationPerKmPrice: '', driverAllowancePerDay: '', hostId: '', surgeMultiplier: '1.0', tollCharges: '0', offers: ''
  });
  const [submittingRate, setSubmittingRate] = useState(false);

  const limit = 20;
  const visiblePages = 3;
  const token = localStorage.getItem('adminToken');
  const role = localStorage.getItem('adminRole') || 'SUPER_ADMIN';
  const adminId = localStorage.getItem('adminuser_id'); // Ensure this is set on login for host associations
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    try {
      const data = await getPricing();
      setPricingData(data);
      if (role === 'cabadmin' || role === 'SUPER_ADMIN') {
        const rateData = await axios.get(`${serverApiUrl}admin/crud/hostcabratecard`, { headers: { token } });
        setCabRates(rateData.data?.data || []);
        
        try {
          const typeData = await axios.get(`${serverApiUrl}admin/vehicle-types`, { headers: { token } });
          const types = typeData.data?.data || typeData.data || [];
          setCabTypes(types);
          // Set default dropdown value if items exist
          if (types.length > 0) {
            setRateForm(prev => ({ ...prev, cabType: types[0].name || types[0].type || types[0] }));
          }
        } catch (e) {
          console.error("Failed to load cab types", e);
        }
      }
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
        vehicleid: updatedvehicleid.trim(),
      };
      setLoading(true)
      try {
        const data = await autovehiclePricing(trimmedData);
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
      vehicleid: updatedManualData.vehicleid.trim(),
      costperhr: updatedManualData.costperhr.trim(),
    };
    console.log(updatedManualData.vehicleid);
  
    try {
      await manualvehiclePricing(trimmedData);
      setShowManualModal(false);
      fetchData();
    } catch (error) {
      console.log(error);
    }
    setShowPricingModal(false);
}
  const handlePricing = (vehicle) =>{
    setUpdatedvehicleid(vehicle.vehicleid);
    setUpdatedManualData(vehicle);
    setShowPricingModal(true);
  }
  const tableHeaders = [
    { label: 'vehicle Id', value: 'vehicleid' },
    { label: 'Cost/Hr', value: 'costperhr' },
    { label: 'Create Date', value: 'createdAt' },
    { label: 'Update Date', value: 'updatedAt' },
  ];

  const handleAddCabRate = async () => {
    setSubmittingRate(true);
    try {
      await axios.post(`${serverApiUrl}admin/crud/hostcabratecard`, {
        ...rateForm,
        hostId: adminId || 'unknown' // Use hostId or fallback
      }, { headers: { token } });
      setShowAddRateModal(false);
      setRateForm({ city: '', cabType: cabTypes.length > 0 ? (cabTypes[0].name || cabTypes[0].type || cabTypes[0]) : '', airportTransferPrice: '', halfDayPrice: '', fullDayPrice: '', extraHourRate: '', extraKmRate: '', outstationPerKmPrice: '', driverAllowancePerDay: '', hostId: '', surgeMultiplier: '1.0', tollCharges: '0', offers: '' });
      fetchData(); // Refresh rate table
    } catch (err) {
      console.error(err);
      alert('Error saving rate card');
    } finally {
      setSubmittingRate(false);
    }
  };

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
      
      {(role === 'SUPER_ADMIN' || role === 'cabadmin') && (
        <div className='container-fluid h-fit-content mt-4 '>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="text-white">Chauffeur Driver Rates</h4>
            <CButton color="primary" onClick={() => setShowAddRateModal(true)}>+ Add Rate Card</CButton>
          </div>
          <DataTable
            columns={cabRateColumns}
            data={cabRates}
            customStyles={customStyles}
            responsive={true}
            highlightOnHover={true}
            pointerOnHover={true}
          />
        </div>
      )}

      {role === 'SUPER_ADMIN' && (
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
                  onRowClicked={(vehicle)=>handlePricing(vehicle)}
          />
          </div>
      )}

          <CModal visible={showPricingModal} onClose={() => setShowPricingModal(false)} className="custom-modal">
            <CModalHeader className="modal-header-styled">Pricing</CModalHeader>
            <CModalBody className="modal-body-styled">
              <div>
                <h2>Selected vehicle Id</h2>
                <span>{updatedvehicleid}</span>
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
                    placeholder="Enter vehicle Id"
                    value={updatedvehicleid}
                    onChange={(e) => setUpdatedvehicleid(e.target.value)}
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
                    <p><strong>vehicle Id:</strong> {updatedAutoData.vehicleid}</p>
                    <p><strong>Cost per Hour:</strong> Rs. {updatedAutoData.costperhr}</p>
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
                placeholder="Enter vehicle Id"
                value={updatedManualData.vehicleid}
                onChange={(e) => setUpdatedManualData({ ...updatedManualData, vehicleid: e.target.value })}
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

        <CModal visible={showAddRateModal} onClose={() => setShowAddRateModal(false)} size="lg">
          <CModalHeader>
            <h5>Add Chauffeur Rate Card</h5>
          </CModalHeader>
          <CModalBody>
            <CForm className="row g-3">
              <div className="col-md-6">
                <CFormInput label="City" placeholder="Mumbai/Delhi/Bangalore" value={rateForm.city} onChange={e => setRateForm({...rateForm, city: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Cab Type</label>
                <select className="form-select" value={rateForm.cabType} onChange={e => setRateForm({...rateForm, cabType: e.target.value})}>
                  {cabTypes.length === 0 && <option value="">Loading types...</option>}
                  {cabTypes.map((type, idx) => {
                    const typeName = type.name || type.type || type.vehicleType || type;
                    return <option key={idx} value={typeName}>{typeName}</option>;
                  })}
                </select>
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Airport Transfer (Rs. )" value={rateForm.airportTransferPrice} onChange={e => setRateForm({...rateForm, airportTransferPrice: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Half Day (4Hrs/40Kms)" value={rateForm.halfDayPrice} onChange={e => setRateForm({...rateForm, halfDayPrice: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Full Day (8Hrs/80Kms)" value={rateForm.fullDayPrice} onChange={e => setRateForm({...rateForm, fullDayPrice: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Extra Hours (Rs. )" value={rateForm.extraHourRate} onChange={e => setRateForm({...rateForm, extraHourRate: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Extra KMs (Rs. )" value={rateForm.extraKmRate} onChange={e => setRateForm({...rateForm, extraKmRate: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Outstation (Rs. per Km)" value={rateForm.outstationPerKmPrice} onChange={e => setRateForm({...rateForm, outstationPerKmPrice: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="D/A (Driver Allowance)" value={rateForm.driverAllowancePerDay} onChange={e => setRateForm({...rateForm, driverAllowancePerDay: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" step="0.1" label="Surge Multiplier (x)" value={rateForm.surgeMultiplier} onChange={e => setRateForm({...rateForm, surgeMultiplier: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="number" label="Toll Charges (Rs. )" value={rateForm.tollCharges} onChange={e => setRateForm({...rateForm, tollCharges: e.target.value})} />
              </div>
              <div className="col-md-4">
                <CFormInput type="text" label="Offers (Promos/Deals)" value={rateForm.offers} onChange={e => setRateForm({...rateForm, offers: e.target.value})} />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAddRateModal(false)}>Cancel</CButton>
            <CButton color="primary" onClick={handleAddCabRate} disabled={submittingRate}>{submittingRate ? 'Saving...' : 'Save Rate Card'}</CButton>
          </CModalFooter>
        </CModal>
    </>
  );
};

export default Pricing;
