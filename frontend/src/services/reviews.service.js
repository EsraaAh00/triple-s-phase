import api from './api.service';

// Reviews API service
export const reviewsAPI = {
  // Get course reviews
  getCourseReviews: async (courseId, params = {}) => {
    try {
      const response = await api.get(`/api/reviews/courses/${courseId}/reviews/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (courseId, reviewData) => {
    try {
      console.log('=== REVIEW SERVICE DEBUG ===');
      console.log('Course ID:', courseId);
      console.log('Review Data:', reviewData);
      console.log('API URL:', `/api/reviews/reviews/create/${courseId}/`);
      console.log('============================');
      
      const response = await api.post(`/api/reviews/reviews/create/${courseId}/`, reviewData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/api/reviews/reviews/${reviewId}/`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/api/reviews/reviews/${reviewId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Get review details
  getReview: async (reviewId) => {
    try {
      const response = await api.get(`/api/reviews/reviews/${reviewId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  },

  // Get course rating statistics
  getCourseRating: async (courseId) => {
    try {
      const response = await api.get(`/api/reviews/courses/${courseId}/rating/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course rating:', error);
      throw error;
    }
  },

  // Like a review
  likeReview: async (reviewId) => {
    try {
      const response = await api.post(`/api/reviews/reviews/${reviewId}/like/`);
      return response.data;
    } catch (error) {
      console.error('Error liking review:', error);
      throw error;
    }
  },

  // Report a review
  reportReview: async (reviewId, reportData) => {
    try {
      const response = await api.post(`/api/reviews/reviews/${reviewId}/report/`, reportData);
      return response.data;
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  },

  // Get user reviews
  getUserReviews: async (userId) => {
    try {
      const response = await api.get(`/api/reviews/users/${userId}/reviews/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  },

  // Get my reviews
  getMyReviews: async () => {
    try {
      const response = await api.get('/api/reviews/my-reviews/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error;
    }
  }
};
