import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { fetchCrudRecords, updateCrudRecord, deleteCrudRecord, createCrudRecord } from '../../../api/crud';
import {
  CFormSelect, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormLabel
} from '@coreui/react';
import { toast, Toaster } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';



const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const CabRates = () => {
  const [selectedModel, setSelectedModel] = useState('HostCabRateCard');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({});

  useEffect(() => {
    loadData(selectedModel);
  }, [selectedModel]);

  const loadData = async (modelName) => {
    setIsLoading(true);
    try {
      const records = await fetchCrudRecords(modelName);
      setData(records);
      
      if (records.length > 0) {
        // Dynamically build columns based on the keys of the first record
        const sampleRecord = records[0];
        const dynamicColumns = Object.keys(sampleRecord).map(key => ({
          name: key,
          selector: row => row[key] !== null ? String(row[key]).substring(0, 50) : '--',
          sortable: true,
          wrap: true
        }));
        
        if (modelName === 'HostCabRateCard') {
            if (!dynamicColumns.find(c => c.name === 'offers')) {
               dynamicColumns.unshift({ name: 'offers', selector: row => row.offers !== null ? String(row.offers) : '--', sortable: true, wrap: true });
            }
            if (!dynamicColumns.find(c => c.name === 'surgeMultiplier')) {
               dynamicColumns.unshift({ name: 'surgeMultiplier', selector: row => row.surgeMultiplier !== null ? String(row.surgeMultiplier) : '1.0', sortable: true, wrap: true });
            }
            if (!dynamicColumns.find(c => c.name === 'tollCharges')) {
               dynamicColumns.unshift({ name: 'tollCharges', selector: row => row.tollCharges !== null ? String(row.tollCharges) : '0', sortable: true, wrap: true });
            }
        }
        
        dynamicColumns.push({
          name: 'Actions',
          cell: (row) => (
            <div className="d-flex gap-2">
              <CButton color="primary" size="sm" onClick={() => handleEditClick(row)}>Edit</CButton>
              <CButton color="danger" size="sm" onClick={() => handleDeleteClick(row)}>Delete</CButton>
            </div>
          ),
          ignoreRowClick: true,
          allowOverflow: true,
          button: true,
        });
        
        setColumns(dynamicColumns);
      } else {
        setColumns([]);
      }
    } catch (error) {
      toast.error(`Error fetching ${modelName}`);
      setData([]);
      setColumns([]);
    }
    setIsLoading(false);
  };

  const handleEditClick = (row) => {
    setEditingRecord({ ...row });
    setEditModalVisible(true);
  };

  const handleAddClick = () => {
    // Generate empty shell based on recent data or standard schema mapping
    let shell = data.length > 0 ? Object.keys(data[0]).reduce((acc, key) => { acc[key] = ''; return acc; }, {}) : {};
    
    if (selectedModel === 'HostCabRateCard') {
      shell = { ...shell, city: '', cabType: 'Sedan', airportTransferPrice: '', halfDayPrice: '', fullDayPrice: '', extraHourRate: '', extraKmRate: '', outstationPerKmPrice: '', driverAllowancePerDay: '', surgeMultiplier: '1.0', tollCharges: '0', offers: '' };
    }
    setNewRecord(shell);
    setAddModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if(editModalVisible) setEditingRecord(prev => ({ ...prev, [name]: value }));
    else setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Find the primary key dynamically. 
      // Sequelize standard is 'id', but some might use 'bookingId', 'vehicleid' etc..
      const pkFields = ['id', 'bookingId', 'vehicleid', 'driverid'];
      let primaryKey = pkFields.find(field => editingRecord[field] !== undefined);
      
      if (!primaryKey) {
        toast.error("Failed to automatically determine Primary Key for Save.");
        return;
      }

      const payload = { ...editingRecord };
      Object.keys(payload).forEach(key => { if (payload[key] === '') payload[key] = null; });

      await updateCrudRecord(selectedModel, payload[primaryKey], payload);
      toast.success("Record updated successfully!");
      setEditModalVisible(false);
      loadData(selectedModel);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update record");
    }
  };

  const handleDeleteClick = async (row) => {
    if(!window.confirm("Are you sure you want to completely delete this row?")) return;
    
    try {
      const pkFields = ['id', 'bookingId', 'vehicleid', 'driverid'];
      let primaryKey = pkFields.find(field => row[field] !== undefined);
      
      if (!primaryKey) await deleteCrudRecord(selectedModel, row.id);
      else await deleteCrudRecord(selectedModel, row[primaryKey]);
      
      toast.success("Record deleted");
      loadData(selectedModel);
    } catch(err) {
      toast.error("Delete failed");
    }
  };

  const handleCreateNew = async () => {
    try {
      const payload = { ...newRecord };
      Object.keys(payload).forEach(key => { if (payload[key] === '') payload[key] = null; });

      if(selectedModel === 'HostCabRateCard') {
          if (!payload.hostId) {
             try { 
                 const token = localStorage.getItem('adminToken');
                 payload.hostId = token ? jwtDecode(token).id : null;
             } catch(e) {}
          }
          if (!payload.cabType) payload.cabType = 'Sedan';
          if (!payload.city) return toast.error("City is permanently required by the database.");
      }

      await createCrudRecord(selectedModel, payload);
      toast.success("New Record created successfully!");
      setAddModalVisible(false);
      loadData(selectedModel);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create record");
    }
  };

  return (
    <div className='container-fluid px-4'>
      <Toaster />
      <div className='d-flex align-items-center justify-content-between mb-4'>
        <h3 className="text-white">Cab Rate Cards</h3>
        <div className="d-flex align-items-center gap-3">
          <CButton color="success" onClick={handleAddClick}>+ Add New Record</CButton>
        </div>
      </div>

      <div className="bg-dark p-3 rounded h-fit-content">
        <DataTable
          title={`${selectedModel} Records`}
          columns={columns}
          data={data}
          customStyles={customStyles}
          pagination
          progressPending={isLoading}
          responsive
          highlightOnHover
        />
      </div>

      {editingRecord && (
        <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} size="lg" scrollable>
          <CModalHeader>
            <CModalTitle>Edit {selectedModel} Record</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <div className="row">
                {Object.keys(editingRecord).map(key => {
                  if(typeof editingRecord[key] === 'object' && editingRecord[key] !== null) return null; // Skip deeply nested objects
                  if(['id', 'createdAt', 'updatedAt', 'hostId'].includes(key)) return null; // Skip DB generated/hidden fields
                  return (
                    <div className="col-md-6 mb-3" key={key}>
                      <CFormLabel>{key}</CFormLabel>
                      {key === 'cabType' && selectedModel === 'HostCabRateCard' ? (
                        <CFormSelect name={key} value={editingRecord[key] || ''} onChange={handleInputChange}>
                          <option value="">Select Cab Type</option>
                          {['Mini', 'Sedan', 'SUV', '12 Seater', 'Luxury'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </CFormSelect>
                      ) : key === 'city' && selectedModel === 'HostCabRateCard' ? (
                        <CFormSelect name={key} value={editingRecord[key] || ''} onChange={handleInputChange}>
                          <option value="">Select City</option>
                          {['Hyderabad', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </CFormSelect>
                      ) : (
                        <CFormInput 
                          name={key}
                          value={editingRecord[key] || ''}
                          onChange={handleInputChange}
                          disabled={['id', 'createdAt', 'updatedAt'].includes(key)}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setEditModalVisible(false)}>Cancel</CButton>
            <CButton color="primary" onClick={handleSave}>Save Changes</CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* CREATE NEW RECORD MODAL */}
      <CModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} size="lg" scrollable>
        <CModalHeader>
          <CModalTitle>Create New {selectedModel}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="row">
              {Object.keys(newRecord).map(key => {
                if(typeof newRecord[key] === 'object' && newRecord[key] !== null) return null;
                if(['id', 'createdAt', 'updatedAt', 'hostId'].includes(key)) return null; // Skip DB generated/hidden fields
                return (
                  <div className="col-md-6 mb-3" key={key}>
                    <CFormLabel>{key}</CFormLabel>
                      {key === 'cabType' && selectedModel === 'HostCabRateCard' ? (
                        <CFormSelect name={key} value={newRecord[key] || ''} onChange={handleInputChange}>
                          <option value="">Select Cab Type</option>
                          {['Mini', 'Sedan', 'SUV', '12 Seater', 'Luxury'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </CFormSelect>
                      ) : key === 'city' && selectedModel === 'HostCabRateCard' ? (
                        <CFormSelect name={key} value={newRecord[key] || ''} onChange={handleInputChange}>
                          <option value="">Select City</option>
                          {['Hyderabad', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </CFormSelect>
                      ) : (
                        <CFormInput 
                          name={key}
                          value={newRecord[key] || ''}
                          onChange={handleInputChange}
                        />
                      )}
                  </div>
                )
              })}
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddModalVisible(false)}>Cancel</CButton>
          <CButton color="success" onClick={handleCreateNew}>Create Record</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default CabRates;
