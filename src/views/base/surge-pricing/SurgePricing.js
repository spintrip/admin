import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import {
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormLabel, CFormSelect, CFormCheck, CRow, CCol
} from '@coreui/react';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import serverApiUrl from '../../../env';
import { fetchVehicleTypes } from '../../../api/vehicleType';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const SurgePricing = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [cities, setCities] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    loadSurgeRules();
    loadCities();
    loadVehicleTypes();
  }, []);

  const loadSurgeRules = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${serverApiUrl}admin/surge-pricing`, {
        headers: { token: localStorage.getItem('adminToken') }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      toast.error("Failed to load surge rules");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const res = await axios.get(`${serverApiUrl}admin/cities`, {
        headers: { token: localStorage.getItem('adminToken') }
      });
      if (res.data.success) setCities(res.data.cities);
    } catch (e) { console.error("Error loading cities", e); }
  };

  const loadVehicleTypes = async () => {
    try {
      const types = await fetchVehicleTypes();
      setVehicleTypes(types || []);
    } catch (e) { console.error("Error loading types", e); }
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingRecord({ ...record });
    } else {
      setEditingRecord({
        name: '',
        multiplier: 1.2,
        city: null,
        cabType: null,
        bookingType: null,
        startTime: '08:00:00',
        endTime: '10:00:00',
        startDate: null,
        endDate: null,
        daysOfWeek: '1,2,3,4,5',
        isActive: true
      });
    }
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingRecord(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value === '' ? null : value)
    }));
  };

  const handleSave = async () => {
    try {
      const url = editingRecord.id 
        ? `${serverApiUrl}admin/surge-pricing/${editingRecord.id}` 
        : `${serverApiUrl}admin/surge-pricing`;
      
      const method = editingRecord.id ? 'put' : 'post';
      
      const res = await axios[method](url, editingRecord, {
        headers: { token: localStorage.getItem('adminToken') }
      });

      if (res.data.success) {
        toast.success(editingRecord.id ? "Rule updated" : "Rule created");
        setModalVisible(false);
        loadSurgeRules();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save rule");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this surge rule?")) return;
    try {
      const res = await axios.delete(`${serverApiUrl}admin/surge-pricing/${id}`, {
        headers: { token: localStorage.getItem('adminToken') }
      });
      if (res.data.success) {
        toast.success("Rule deleted");
        loadSurgeRules();
      }
    } catch (e) { toast.error("Delete failed"); }
  };

  const columns = [
    { name: 'Name', selector: row => row.name || 'Unnamed Rule', sortable: true },
    { name: 'City', selector: row => row.city || 'Any', sortable: true },
    { name: 'Trip Type', selector: row => row.bookingType || 'Any', sortable: true },
    { name: 'Category', selector: row => row.cabType || 'Any', sortable: true },
    { name: 'Multiplier', selector: row => `${row.multiplier}x`, sortable: true },
    { name: 'Time Window', selector: row => `${row.startTime} - ${row.endTime}` },
    { name: 'Status', selector: row => row.isActive ? '🟢 Active' : '🔴 Inactive' },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-2 py-2">
          <CButton color="primary" size="sm" onClick={() => handleOpenModal(row)}>Edit</CButton>
          <CButton color="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</CButton>
        </div>
      )
    }
  ];

  return (
    <div className='container-fluid px-4'>
      <Toaster />
      <div className='d-flex align-items-center justify-content-between mb-4'>
        <h3 className="text-white">Dynamic Surge Multipliers</h3>
        <CButton color="success" onClick={() => handleOpenModal()}>+ Add New Rule</CButton>
      </div>

      <div className="bg-dark p-3 rounded h-fit-content">
        <DataTable
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
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
          <CModalHeader><CModalTitle>{editingRecord.id ? 'Edit' : 'Create'} Surge Rule</CModalTitle></CModalHeader>
          <CModalBody>
            <CForm>
              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Rule Name</CFormLabel>
                  <CFormInput name="name" value={editingRecord.name || ''} onChange={handleInputChange} placeholder="e.g. Morning Rush" />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Multiplier</CFormLabel>
                  <CFormInput name="multiplier" type="number" step="0.1" value={editingRecord.multiplier || ''} onChange={handleInputChange} />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <CFormLabel>City (Optional)</CFormLabel>
                  <CFormSelect name="city" value={editingRecord.city || ''} onChange={handleInputChange}>
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Trip Type (Optional)</CFormLabel>
                  <CFormSelect name="bookingType" value={editingRecord.bookingType || ''} onChange={handleInputChange}>
                    <option value="">All Trip Types</option>
                    <option value="Local">Local</option>
                    <option value="Outstation">Outstation</option>
                    <option value="Airport">Airport</option>
                    <option value="Rentals">Rentals</option>
                  </CFormSelect>
                </CCol>
                <CCol md={4}>
                  <CFormLabel>Cab Category (Optional)</CFormLabel>
                  <CFormSelect name="cabType" value={editingRecord.cabType || ''} onChange={handleInputChange}>
                    <option value="">All Categories</option>
                    {vehicleTypes.map(v => <option key={v.id} value={v.vehicletype}>{v.vehicletype}</option>)}
                  </CFormSelect>
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Start Time</CFormLabel>
                  <CFormInput name="startTime" type="time" step="1" value={editingRecord.startTime || ''} onChange={handleInputChange} />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>End Time</CFormLabel>
                  <CFormInput name="endTime" type="time" step="1" value={editingRecord.endTime || ''} onChange={handleInputChange} />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={6}>
                  <CFormLabel>Active From Date (Optional)</CFormLabel>
                  <CFormInput name="startDate" type="date" value={editingRecord.startDate || ''} onChange={handleInputChange} />
                </CCol>
                <CCol md={6}>
                  <CFormLabel>Active To Date (Optional)</CFormLabel>
                  <CFormInput name="endDate" type="date" value={editingRecord.endDate || ''} onChange={handleInputChange} />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={12}>
                  <CFormLabel>Days of Week (0=Sun, 1=Mon... comma separated)</CFormLabel>
                  <CFormInput name="daysOfWeek" value={editingRecord.daysOfWeek || ''} onChange={handleInputChange} placeholder="e.g. 1,2,3,4,5" />
                </CCol>
              </CRow>

              <CFormCheck 
                id="isActive"
                name="isActive" 
                label="Rule is Active" 
                checked={editingRecord.isActive} 
                onChange={handleInputChange} 
              />
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
            <CButton color="primary" onClick={handleSave}>Save Rule</CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  );
};

export default SurgePricing;
