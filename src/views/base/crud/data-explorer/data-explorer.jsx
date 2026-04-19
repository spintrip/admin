import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { fetchCrudRecords, updateCrudRecord, deleteCrudRecord, createCrudRecord } from '../../../../api/crud';
import {
  CButton, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CForm, CFormInput, CFormLabel, CCard, CCardHeader, CCardBody
} from '@coreui/react';
import { toast, Toaster } from 'react-hot-toast';

const customStyles = {
  headRow: { style: { backgroundColor: '#212631', color: '#ffffff' } },
  headCells: { style: { color: '#ffffff' } },
  rows: { style: { backgroundColor: '#282D37', color: '#ffffff', '&:hover': { backgroundColor: 'black' } } },
};

// Fallback schemas for when tables are completely empty
const modelSchemas = {
  Offer: { code: '', percentage: '', maxDiscount: '', minAmount: '', expiryDate: '', isActive: 'true', usageLimit: '-1', usedCount: '0', description: '' },
  City: { name: '', isActive: 'true' }
};

const DataExplorer = () => {
  const { model } = useParams(); // Gets 'City' from /admin/crud/City
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'edit' or 'add'
  const [record, setRecord] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchCrudRecords(model);
      setData(result || []);
    } catch (e) { toast.error(`Failed to load ${model}s`); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [model]);

  // Determine schema keys based on data OR fallback schema
  const schemaTemplate = data.length > 0 ? data[0] : (modelSchemas[model] || { name: '' });
  const schemaKeys = Object.keys(schemaTemplate).filter(k => !['id', 'createdAt', 'updatedAt'].includes(k));

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    const cols = schemaKeys.map(key => ({
      name: key.toUpperCase(),
      selector: row => String(row[key] ?? '--'),
      sortable: true,
    }));
    cols.push({
      name: 'OPERATIONS',
      cell: (row) => (
        <div className="d-flex gap-2">
          <CButton color="info" size="sm" onClick={() => { setRecord(row); setModal('edit'); }}>Edit</CButton>
          <CButton color="danger" size="sm" onClick={async () => { 
            if(window.confirm('Delete this record?')) {
              await deleteCrudRecord(model, row.id);
              loadData();
              toast.success('Deleted');
            }
          }}>Delete</CButton>
        </div>
      ),
    });
    return cols;
  }, [data, model, schemaKeys]);

  const handleSave = async () => {
    try {
      if (modal === 'edit') await updateCrudRecord(model, record.id, record);
      else await createCrudRecord(model, record);
      toast.success('Saved successfully');
      setModal(null);
      loadData();
    } catch (e) { toast.error('Error saving record'); }
  };

  return (
    <CCard className="mb-4 shadow-sm border-0">
      <Toaster />
      <CCardHeader className="d-flex justify-content-between align-items-center bg-dark text-white py-3">
        <h5 className="mb-0">{model} Explorer</h5>
        <CButton color="success" onClick={() => { setRecord(modelSchemas[model] || {}); setModal('add'); }}>+ Add New {model}</CButton>
      </CCardHeader>
      <CCardBody className="p-0">
        <DataTable columns={columns} data={data} progressPending={loading} customStyles={customStyles} pagination theme="dark" />
      </CCardBody>

      <CModal visible={!!modal} onClose={() => setModal(null)}>
        <CModalHeader><CModalTitle>{modal === 'edit' ? 'Edit' : 'Add'} {model}</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm>
            {schemaKeys.map(key => (
              <div key={key} className="mb-3">
                <CFormLabel>{key}</CFormLabel>
                <CFormInput 
                  type={key === 'expiryDate' ? 'datetime-local' : 'text'}
                  value={record[key] || ''} 
                  onChange={(e) => setRecord({...record, [key]: e.target.value})} 
                />
              </div>
            ))}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(null)}>Cancel</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  );
};

export default DataExplorer;
