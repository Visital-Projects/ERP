import apiClient from './apiClient';

export const getCompanyPolicies = async () => {
  try {
    const response = await apiClient.get('/company-policies');
   return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }
};

export const createCompanyPolicy = async (data) => {
  try {
    const formData = new FormData();
    
    // Append all fields including the file
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const response = await apiClient.post('/company-policies', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
   return response.data?.data || [];
  } catch (error) {
    console.error('Error creating policy:', error);
    throw error;
  }
};

export const updateCompanyPolicy = async (id, data) => {
  try {
    const formData = new FormData();
    
    // Append all fields including the file
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    const response = await apiClient.put(`/company-policies/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error('Error updating policy:', error);
    throw error;
  }
};

export const deleteCompanyPolicy = async (id) => {
  try {
    const response = await apiClient.delete(`/company-policies/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting policy:', error);
    throw error;
  }
};