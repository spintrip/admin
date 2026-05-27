import React, { useEffect, useState } from 'react';
import { fetchVehicleTypes, createVehicleType, deleteVehicleType, updateVehicleType } from '../../../api/vehicleType';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormLabel } from '@coreui/react';

const customStyles = {
  header: { style: { backgroundColor: 'transparent', color: '#ffffff' } },
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
  pagination: { style: { backgroundColor: '#343a40', color: '#ffffff' } },
};

const VehicleTypes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [typeDescription, setTypeDescription] = useState('');
  const [typeBasePrice, setTypeBasePrice] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const getData = async () => {
    setLoading(true);
    if (!token) { navigate('/login'); return; }
    try {
      const res = await fetchVehicleTypes();
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [token, navigate]);

  const handleEdit = (row) => {
    setIsEditMode(true);
    setSelectedId(row.id);
    setTypeName(row.vehicletype || '');
    setTypeDescription(row.description || '');
    setTypeBasePrice(row.basePrice || '');
    setModalVisible(true);
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setTypeName('');
    setTypeDescription('');
    setTypeBasePrice('');
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vehicle type?')) {
      try {
        await deleteVehicleType(id);
        getData();
      } catch (err) {
        console.error('Delete error', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: typeName,
        description: typeDescription,
        basePrice: parseFloat(typeBasePrice)
      };

      if (isEditMode) {
        await updateVehicleType(selectedId, payload);
      } else {
        await createVehicleType(payload);
      }

      setModalVisible(false);
      getData();
    } catch (err) {
      console.error('Submit error', err);
    }
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Type Name', selector: row => row.vehicletype || '--', sortable: true },
    { name: 'Description', selector: row => row.description || '--', sortable: true },
    { name: 'Base Price', selector: row => row.basePrice || '--', sortable: true },
    { name: 'Created At', selector: row => new Date(row.createdAt).toLocaleDateString(), sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <CButton color="info" size="sm" onClick={() => handleEdit(row)}>Edit</CButton>
          <CButton color="danger" size="sm" onClick={() => handleDelete(row.id)}>Delete</CButton>
        </div>
      )
    }
  ];

  return (
    <div className='container-fluid'>
      <div className="d-flex justify-content-end mb-3">
        <CButton color="primary" onClick={handleOpenCreate}>Add Vehicle Type</CButton>
      </div>

      <DataTable
        title="Vehicle Types"
        columns={columns}
        data={data}
        customStyles={customStyles}
        pagination
        responsive
        highlightOnHover
        progressPending={loading}
      />

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>{isEditMode ? 'Edit' : 'Create'} Vehicle Type</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel>Type Name</CFormLabel>
              <CFormInput type="text" value={typeName} onChange={(e) => setTypeName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <CFormLabel>Description</CFormLabel>
              <CFormInput type="text" value={typeDescription} onChange={(e) => setTypeDescription(e.target.value)} />
            </div>
            <div className="mb-3 px-2 py-1 bg-light rounded shadow-sm border">
              <CFormLabel className="text-muted small d-block">Resulting Cab Type (used in Rates/App)</CFormLabel>
              <strong className="text-primary">
                {typeName} {typeDescription ? `- ${typeDescription}` : ''}
              </strong>
            </div>
            <div className="mb-3">
              <CFormLabel>Base Price</CFormLabel>
              <CFormInput type="number" value={typeBasePrice} onChange={(e) => setTypeBasePrice(e.target.value)} />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setModalVisible(false)}>Cancel</CButton>
            <CButton color="primary" type="submit">{isEditMode ? 'Update' : 'Create'}</CButton>
          </CModalFooter>
        </CForm>
      </CModal>

    </div>
  );
};
export default VehicleTypes;
