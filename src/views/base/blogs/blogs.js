import React, { useState, useEffect } from 'react';
import { createBlog, getBlog, updateBlog, deleteBlog } from '../../../api/blog';
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
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
  CCardImage,
  CAlert,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import '../../../scss/blog.css';

const Blog = () => {
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [formValues, setFormValues] = useState({
    blogName: '',
    blogAuthor: '',
    description: '',
    keywords: '',
    carImage1: null,
    carImage2: null,
    blobId: '',
  });
  const [updateFormValues, setUpdateFormValues] = useState({
    blogId: '',
    blogName: '',
    blogAuthor: '',
    description: '',
    keywords: '',
    carImage1: null,
    carImage2: null,
  });
  const [blogData, setBlogData] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    try {
      const data = await getBlog();
      setBlogData(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCardClick = (blog) => {
    setSelectedBlog(blog);
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormValues({
        ...formValues,
        [name]: files[0],
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    e.preventDefault();
    const formData = new FormData();
    formData.append('blogName', formValues.blogName);
    formData.append('blogAuthor', formValues.blogAuthor);
    formData.append('description', formValues.description);
    formData.append('keywords', formValues.keywords);
    formData.append('blogImage_1', formValues.carImage1);
    formData.append('blogImage_2', formValues.carImage2);
    formData.append('blobId', formValues.blobId);

    try {
      await createBlog(formData);
      fetchBlogData();
      setVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setUpdateFormValues({
        ...updateFormValues,
        [name]: files[0],
      });
    } else {
      setUpdateFormValues({
        ...updateFormValues,
        [name]: value,
      });
    }
  };

  const handleUpdateSubmit = async (e) => {
    if (!token) {
      console.log('No token Found');
      navigate('/login');
    }
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', updateFormValues.blogId);
    formData.append('blogName', updateFormValues.blogName);
    formData.append('blogAuthor', updateFormValues.blogAuthor);
    formData.append('description', updateFormValues.description);
    formData.append('keywords', updateFormValues.keywords);
    formData.append('blogImage_1', updateFormValues.carImage1);
    formData.append('blogImage_2', updateFormValues.carImage2);

    try {
      await updateBlog(formData);
      fetchBlogData();
      setUpdateModal(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000); 
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async () => {
    try {
      await deleteBlog(selectedBlog.blogId);
      fetchBlogData();
      setModalVisible(false)
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateClick = () => {
    setUpdateFormValues({
      blogId: selectedBlog.blogId,
      blogName: selectedBlog.blogName,
      blogAuthor: selectedBlog.blogAuthor,
      description: selectedBlog.description,
      keywords: selectedBlog.keywords,
      carImage1: null,
      carImage2: null,
    });
    setUpdateModal(true);
    setModalVisible(false);
  };

  return (
    <>
      <div className='container-fluid px-4 d-flex align-items-center '>
        <CButton className="fw-bolder bg-light text-black mx-2" onClick={() => setVisible(true)}>Create</CButton>
      </div>

      <div className="blog-container mt-4">
        {blogData.map((blog, index) => (
          <div key={blog.blogId} className="blog-card" onClick={() => handleCardClick(blog)}>
            <CCard>
              <CCardImage orientation="top" src={blog.blogImage1} style={{ height: '200px', objectFit: 'cover' }} />
              <CCardBody>
                <CCardTitle>{blog.blogName}</CCardTitle>
                <CCardText><strong>Author:</strong> {blog.blogAuthor}</CCardText>
                <CCardText><strong>Description:</strong> {blog.description}</CCardText>
                <CCardText><strong>Keywords:</strong> {blog.keywords}</CCardText>
                <CCardText><strong>Created At:</strong> {new Date(blog.createdAt).toLocaleString()}</CCardText>
                <CCardText><strong>Updated At:</strong> {new Date(blog.updatedAt).toLocaleString()}</CCardText>
                <CCardImage orientation="bottom" src={blog.blogImage2} style={{ height: '200px', objectFit: 'cover', marginTop: '10px' }} />
              </CCardBody>
            </CCard>
          </div>
        ))}
      </div>

      {selectedBlog && (
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} alignment="center" size="lg">
          <CModalHeader>
            <CModalTitle>{selectedBlog.blogName}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CCardImage orientation="top" src={selectedBlog.blogImage1} style={{ height: '200px', width:'200px', objectFit: 'cover' }} />
            <CCardImage orientation="bottom" src={selectedBlog.blogImage2} style={{ height: '200px', width:'200px', objectFit: 'cover', marginLeft: '10px' }} />
            <p><strong>Author:</strong> {selectedBlog.blogAuthor}</p>
            <p><strong>Description:</strong> {selectedBlog.description}</p>
            <p><strong>Keywords:</strong> {selectedBlog.keywords}</p>
            <p><strong>Created At:</strong> {new Date(selectedBlog.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(selectedBlog.updatedAt).toLocaleString()}</p>
          </CModalBody>
          <CModalFooter className="d-flex justify-content-between">
            <div>
                <CButton color="danger" onClick={handleDelete}>Delete</CButton>
            </div>
            <div>
                <CButton color="primary me-3" onClick={handleUpdateClick}>Update</CButton>
                <CButton color="secondary" onClick={() => setModalVisible(false)}>Close</CButton>
            </div>
          </CModalFooter>
        </CModal>
      )}

      {/* Update Modal Component */}
      <CModal visible={updateModal} onClose={() => setUpdateModal(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Update Blog</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleUpdateSubmit}>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Blog ID</CFormLabel>
              <CFormInput type="text" name="blogId" value={updateFormValues.blogId} readOnly />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Blog Name</CFormLabel>
              <CFormInput type="text" name="blogName" value={updateFormValues.blogName} onChange={handleUpdateInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Blog Author</CFormLabel>
              <CFormInput type="text" name="blogAuthor" value={updateFormValues.blogAuthor} onChange={handleUpdateInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Description</CFormLabel>
              <CFormInput type="text" name="description" value={updateFormValues.description} onChange={handleUpdateInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Keywords</CFormLabel>
              <CFormInput type="text" name="keywords" value={updateFormValues.keywords} onChange={handleUpdateInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Car Image 1</CFormLabel>
              <CFormInput type="file" name="carImage1" onChange={handleUpdateInputChange} />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Car Image 2</CFormLabel>
              <CFormInput type="file" name="carImage2" onChange={handleUpdateInputChange} />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setUpdateModal(false)}>Close</CButton>
              <CButton color="primary" type="submit">Update Info</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
        {updateSuccess && <CAlert color="success">Update Successful!</CAlert>}
      </CModal>

      {/* Create Blog Modal */}
      <CModal visible={visible} onClose={() => setVisible(false)} alignment="center" size="lg">
        <CModalHeader>
          <CModalTitle>Create Blog</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Blog Name</CFormLabel>
              <CFormInput type="text" name="blogName" value={formValues.blogName} onChange={handleInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Blog Author</CFormLabel>
              <CFormInput type="text" name="blogAuthor" value={formValues.blogAuthor} onChange={handleInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Description</CFormLabel>
              <CFormInput type="text" name="description" value={formValues.description} onChange={handleInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Keywords</CFormLabel>
              <CFormInput type="text" name="keywords" value={formValues.keywords} onChange={handleInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Car Image 1</CFormLabel>
              <CFormInput type="file" name="carImage1" onChange={handleInputChange} required />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CFormLabel className='me-3'>Car Image 2</CFormLabel>
              <CFormInput type="file" name="carImage2" onChange={handleInputChange} required />
            </CInputGroup>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
              <CButton color="primary" type="submit">Save changes</CButton>
            </CModalFooter>
          </CForm>
        </CModalBody>
      </CModal>

    </>
  );
};

export default Blog;
