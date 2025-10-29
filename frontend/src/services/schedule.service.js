import api from './api.service';

const scheduleService = {
  /**
   * Get study schedule for a course
   * @param {number} courseId - Course ID
   * @returns {Promise} API response
   */
  getSchedule: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/student/schedule/${courseId}/`);
      return {
        success: true,
        data: response.data?.schedule,
        message: response.data?.message || 'Schedule retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting schedule:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get schedule',
        data: null
      };
    }
  },

  /**
   * Create or update study schedule
   * @param {number} courseId - Course ID
   * @param {Object} scheduleData - Schedule configuration
   * @returns {Promise} API response
   */
  createSchedule: async (courseId, scheduleData) => {
    try {
      const response = await api.post(`/api/courses/student/schedule/${courseId}/`, scheduleData);
      return {
        success: true,
        data: response.data?.schedule,
        message: response.data?.message || 'Schedule created successfully'
      };
    } catch (error) {
      console.error('Error creating schedule:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to create schedule';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else {
          // Handle validation errors from serializer
          const errors = error.response.data;
          const errorKeys = Object.keys(errors);
          if (errorKeys.length > 0) {
            const firstError = errors[errorKeys[0]];
            if (Array.isArray(firstError)) {
              errorMessage = firstError[0];
            } else if (typeof firstError === 'object') {
              const nestedKey = Object.keys(firstError)[0];
              errorMessage = firstError[nestedKey]?.[0] || firstError[nestedKey] || errorMessage;
            } else {
              errorMessage = firstError;
            }
          }
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        data: null,
        errors: error.response?.data
      };
    }
  },

  /**
   * Rebalance schedule (auto-generate schedule items)
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise} API response
   */
  rebalanceSchedule: async (scheduleId) => {
    try {
      const response = await api.post(`/api/courses/student/schedule/${scheduleId}/rebalance/`);
      return {
        success: true,
        data: response.data?.schedule,
        message: response.data?.message || 'Schedule rebalanced successfully'
      };
    } catch (error) {
      console.error('Error rebalancing schedule:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to rebalance schedule',
        data: null
      };
    }
  },

  /**
   * Toggle completion status of a schedule item
   * @param {number} itemId - Schedule item ID
   * @returns {Promise} API response
   */
  toggleItemCompletion: async (itemId) => {
    try {
      const response = await api.patch(`/api/courses/student/schedule/item/${itemId}/toggle/`);
      return {
        success: true,
        data: response.data?.item,
        message: 'Item completion status updated'
      };
    } catch (error) {
      console.error('Error toggling item completion:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to toggle item completion',
        data: null
      };
    }
  },

  /**
   * Get schedule items for a date range
   * @param {number} scheduleId - Schedule ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} API response
   */
  getScheduleItems: async (scheduleId, startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get(
        `/api/courses/student/schedule/${scheduleId}/items/`,
        { params }
      );
      return {
        success: true,
        data: response.data?.items || [],
        total: response.data?.total || 0,
        completed: response.data?.completed || 0
      };
    } catch (error) {
      console.error('Error getting schedule items:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get schedule items',
        data: [],
        total: 0,
        completed: 0
      };
    }
  }
};

export default scheduleService;

