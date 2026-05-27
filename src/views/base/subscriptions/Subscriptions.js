import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { fetchCrudRecords, updateCrudRecord, deleteCrudRecord, createCrudRecord } from '../../../api/crud';
import {
  CFormSelect, CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormLabel
} from '@coreui/react';
import { toast, Toaster } from 'react-hot-toast';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const Subscriptions = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [newRecord, setNewRecord] = useState({
    PlanName: '',
    vehicleType: '1',
    expiry: '30',
    amount: '0',
    Remarks: '',
    targetAudience: 'both'
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await fetchCrudRecords('Subscriptions');
      setData(records);
    } catch (error) {
      toast.error('Error fetching Subscriptions');
      setData([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { name: 'Plan Name', selector: row => row.PlanName, sortable: true },
    { name: 'Audience', selector: row => row.targetAudience?.toUpperCase() || 'BOTH', sortable: true },
    { name: 'Vehicle Type', selector: row => row.vehicleType, sortable: true },
    { name: 'Duration (Days)', selector: row => row.expiry, sortable: true },
    { name: 'Price (₹)', selector: row => row.amount, sortable: true },
    {
      name: 'Actions',
      minWidth: '150px',
      cell: (row) => (
        <div className="d-flex align-items-center justify-content-start gap-2 py-2">
          <CButton color="primary" size="sm" onClick={() => { setEditingRecord({...row}); setEditModalVisible(true); }}>Edit</CButton>
          <CButton color="danger" size="sm" onClick={() => handleDeleteClick(row.PlanType)}>Delete</CButton>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editModalVisible) setEditingRecord(prev => ({ ...prev, [name]: value }));
    else setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateCrudRecord('Subscriptions', editingRecord.PlanType, editingRecord);
      toast.success("Subscription updated successfully!");
      setEditModalVisible(false);
      loadData();
    } catch (error) {
      toast.error("Failed to update subscription");
    }
  };

  const handleDeleteClick = async (planType) => {
    if (!window.confirm("Are you sure you want to delete this subscription?")) return;
    try {
      await deleteCrudRecord('Subscriptions', planType);
      toast.success("Subscription deleted");
      loadData();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleCreateNew = async () => {
    try {
      await createCrudRecord('Subscriptions', newRecord);
      toast.success("Subscription created successfully!");
      setAddModalVisible(false);
      loadData();
    } catch (error) {
      toast.error("Failed to create subscription");
    }
  };

  return (
    <div className='container-fluid px-4'>
      <Toaster />
      <div className='d-flex align-items-center justify-content-between mb-4'>
        <h3 className="text-white">Manage Subscriptions</h3>
        <CButton color="success" onClick={() => {
          setNewRecord({ PlanName: '', vehicleType: '1', expiry: '30', amount: '0', Remarks: '', targetAudience: 'both' });
          setAddModalVisible(true);
        }}>+ Add New Plan</CButton>
      </div>

      <div className="bg-dark p-3 rounded h-fit-content">
        <DataTable
          title="Active Plans"
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
        <CModal visible={editModalVisible} onClose={() => setEditModalVisible(false)}>
          <CModalHeader><CModalTitle>Edit Subscription</CModalTitle></CModalHeader>
          <CModalBody>
            <CForm>
              <div className="mb-3">
                <CFormLabel>Plan Name</CFormLabel>
                <CFormInput name="PlanName" value={editingRecord.PlanName || ''} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <CFormLabel>Target Audience</CFormLabel>
                <CFormSelect name="targetAudience" value={editingRecord.targetAudience || 'both'} onChange={handleInputChange}>
                  <option value="host">Self-Drive Hosts</option>
                  <option value="driver">Cab Drivers</option>
                  <option value="both">Both</option>
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Vehicle Type (1=Bike, 2=Car, 3=Cab)</CFormLabel>
                <CFormInput name="vehicleType" value={editingRecord.vehicleType || ''} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <CFormLabel>Duration (Days)</CFormLabel>
                <CFormInput name="expiry" type="number" value={editingRecord.expiry || ''} onChange={handleInputChange} />
              </div>
              <div className="mb-3">
                <CFormLabel>Price</CFormLabel>
                <CFormInput name="amount" type="number" value={editingRecord.amount || ''} onChange={handleInputChange} />
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setEditModalVisible(false)}>Cancel</CButton>
            <CButton color="primary" onClick={handleSave}>Save Changes</CButton>
          </CModalFooter>
        </CModal>
      )}

      <CModal visible={addModalVisible} onClose={() => setAddModalVisible(false)}>
        <CModalHeader><CModalTitle>Create New Subscription</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Plan Name</CFormLabel>
              <CFormInput name="PlanName" value={newRecord.PlanName} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel>Target Audience</CFormLabel>
              <CFormSelect name="targetAudience" value={newRecord.targetAudience} onChange={handleInputChange}>
                <option value="host">Self-Drive Hosts</option>
                <option value="driver">Cab Drivers</option>
                <option value="both">Both</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <CFormLabel>Vehicle Type (1=Bike, 2=Car, 3=Cab)</CFormLabel>
              <CFormInput name="vehicleType" value={newRecord.vehicleType} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel>Duration (Days)</CFormLabel>
              <CFormInput name="expiry" type="number" value={newRecord.expiry} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
              <CFormLabel>Price</CFormLabel>
              <CFormInput name="amount" type="number" value={newRecord.amount} onChange={handleInputChange} />
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setAddModalVisible(false)}>Cancel</CButton>
          <CButton color="success" onClick={handleCreateNew}>Create</CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Subscriptions;
