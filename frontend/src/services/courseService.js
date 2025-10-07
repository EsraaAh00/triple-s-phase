import api from './api.service';

// Course API methods
export const courseAPI = {
  // Get all courses with filtering and pagination
  getCourses: async (params = {}) => {
    try {
      const response = await api.get('/api/courses/public/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get courses by category ID
  getCoursesByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get('/api/courses/public/', {
        params: { category: categoryId, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      throw error;
    }
  },

  // Get a specific course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course by ID:', error);
      throw error;
    }
  },

  // Get a specific course by ID (alias for getCourseById)
  getCourse: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Search courses
  searchCourses: async (query, params = {}) => {
    try {
      const response = await api.get('/api/courses/search/', {
        params: { query, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  },

  // Get featured courses
  getFeaturedCourses: async () => {
    try {
      const response = await api.get('/api/courses/featured/');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured courses:', error);
      throw error;
    }
  },

  // Get popular courses
  getPopularCourses: async () => {
    try {
      const response = await api.get('/api/courses/popular/');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular courses:', error);
      throw error;
    }
  },

  // Get recent courses
  getRecentCourses: async () => {
    try {
      const response = await api.get('/api/courses/recent/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent courses:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/courses/categories/');
      console.log('Categories API response:', response.data);
      // Ensure we return an array
      const data = response.data;
      console.log('Raw categories data:', data);
      return Array.isArray(data) ? data :
        data.results ? data.results :
          data.data ? data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // // Get subcategories
  // getSubCategories: async (categoryId = null) => {
  //   try {
  //     const params = categoryId ? { category: categoryId } : {};
  //     console.log('Fetching subcategories with params:', params);
  //     const response = await api.get('/api/courses/subcategories/', { params });
  //     console.log('Subcategories API response:', response.data);
  //     // Ensure we return an array
  //     const data = response.data;
  //     console.log('Raw subcategories data:', data);
  //     return Array.isArray(data) ? data : 
  //            data.results ? data.results : 
  //            data.data ? data.data : [];
  //   } catch (error) {
  //     console.error('Error fetching subcategories:', error);
  //     return [];
  //   }
  // },

  // Get tags
  getTags: async () => {
    try {
      const response = await api.get('/api/courses/tags/');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    try {
      const response = await api.post(`/api/courses/courses/${courseId}/enroll/`);
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId) => {
    try {
      const response = await api.post(`/api/courses/courses/${courseId}/unenroll/`);
      return response.data;
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      throw error;
    }
  },

  // Get course modules
  getCourseModules: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/modules/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course modules:', error);
      throw error;
    }
  },

  // Get my courses (enrolled courses)
  getMyCourses: async () => {
    try {
      const response = await api.get('/api/courses/my-enrolled-courses/');
      console.log('My courses API response:', response.data);
      // The API returns { enrolled_courses: [...], completed_courses: [...] }
      const data = response.data;
      console.log('Raw my courses data:', data);
      // Return both enrolled and completed courses
      const allCourses = [
        ...(data.enrolled_courses || []),
        ...(data.completed_courses || [])
      ];
      return allCourses;
    } catch (error) {
      console.error('Error fetching my courses:', error);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/courses/dashboard/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get general stats
  getGeneralStats: async () => {
    try {
      const response = await api.get('/api/courses/general/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching general stats:', error);
      throw error;
    }
  },

  // Get related courses
  getRelatedCourses: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/related/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching related courses:', error);
      throw error;
    }
  },

  // Get course collections with courses
  getCourseCollections: async () => {
    try {
      const response = await api.get('/api/extras/collections/with_courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching course collections:', error);
      throw error;
    }
  },

  // Get promotional banners
  getPromotionalBanners: async () => {
    try {
      const response = await api.get('/api/extras/banners/promotional/');
      return response.data;
    } catch (error) {
      console.error('Error fetching promotional banners:', error);
      throw error;
    }
  },

  // Get course reviews
  getCourseReviews: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/reviews/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      throw error;
    }
  },

  // Add course review
  addCourseReview: async (courseId, reviewData) => {
    try {
      const response = await api.post(`/api/courses/courses/${courseId}/reviews/`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding course review:', error);
      throw error;
    }
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/courses/${courseId}/progress/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await api.delete(`/api/courses/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },
};

// Cart API methods
export const cartAPI = {
  // Get cart items
  getCart: async () => {
    try {
      const response = await api.get('/api/store/cart/');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add course to cart
  addToCart: async (courseId) => {
    try {
      const response = await api.post('/api/store/cart/items/', { course_id: courseId });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Remove course from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await api.delete(`/api/store/cart/items/${itemId}/`);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await api.patch(`/api/store/cart/items/${itemId}/`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    try {
      const response = await api.delete('/api/store/cart/');
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};

// Payment API methods
export const paymentAPI = {
  // Create Moyasar hosted payment and get redirect URL
  createMoyasarPayment: async () => {
    try {
      const response = await api.post('/api/store/payment/moyasar/create/');
      return response.data; // { url, invoice }
    } catch (error) {
      console.error('Error creating Moyasar payment:', error);
      throw error;
    }
  },

  // Create Moyasar hosted payment for a specific course
  createCoursePayment: async (courseId) => {
    try {
      const response = await api.post(`/api/store/payment/moyasar/course/${courseId}/create/`);
      return response.data; // { url, invoice }
    } catch (error) {
      console.error('Error creating course payment:', error);
      throw error;
    }
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/api/store/payment/${paymentId}/status/`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  },
};

export default courseAPI; 