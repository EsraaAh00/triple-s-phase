import api from './api.service';

export const profileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/auth/profile/update/', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/api/auth/settings/', settings);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/api/auth/change-password/', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      const response = await api.post('/api/auth/profile/upload-picture/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getStatistics: async () => {
    try {
      // Try student stats first, then fallback to general stats
      try {
        const response = await api.get('/api/courses/student/dashboard/stats/');
        return response.data;
      } catch (studentError) {
        // Fallback to general dashboard stats
        const response = await api.get('/api/courses/dashboard/stats/');
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  },

  // Get user education
  getEducation: async () => {
    try {
      const response = await api.get('/api/auth/profile/education/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add education
  addEducation: async (educationData) => {
    try {
      const response = await api.post('/api/auth/profile/education/', educationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update education
  updateEducation: async (id, educationData) => {
    try {
      const response = await api.put(`/api/auth/profile/education/${id}/`, educationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete education
  deleteEducation: async (id) => {
    try {
      const response = await api.delete(`/api/auth/profile/education/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user experience
  getExperience: async () => {
    try {
      const response = await api.get('/api/auth/profile/experience/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add experience
  addExperience: async (experienceData) => {
    try {
      const response = await api.post('/api/auth/profile/experience/', experienceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update experience
  updateExperience: async (id, experienceData) => {
    try {
      const response = await api.put(`/api/auth/profile/experience/${id}/`, experienceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete experience
  deleteExperience: async (id) => {
    try {
      const response = await api.delete(`/api/auth/profile/experience/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update skills
  updateSkills: async (skills) => {
    try {
      const response = await api.put('/api/auth/profile/skills/', { skills });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
