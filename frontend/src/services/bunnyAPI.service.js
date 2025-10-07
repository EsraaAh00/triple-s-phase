import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const bunnyAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
bunnyAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
bunnyAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const bunnyAPI = {
  // Validate Bunny video ID
  validateVideo: async (videoId) => {
    try {
      const response = await bunnyAxios.post('/content/bunny/validate/', {
        video_id: videoId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في التحقق من الفيديو');
    }
  },

  // Get Bunny video information
  getVideoInfo: async (videoId) => {
    try {
      const response = await bunnyAxios.get(`/content/bunny/video/${videoId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في الحصول على معلومات الفيديو');
    }
  },

  // Get Bunny embed URL
  getEmbedUrl: async (videoId) => {
    try {
      const response = await bunnyAxios.get(`/content/bunny/embed/${videoId}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في الحصول على رابط التضمين');
    }
  },

  // Update module with Bunny video
  updateModuleVideo: async (moduleId, videoId) => {
    try {
      const response = await bunnyAxios.post(`/content/modules/${moduleId}/bunny-video/`, {
        video_id: videoId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في تحديث الوحدة بالفيديو');
    }
  },

  // Update lesson with Bunny video
  updateLessonVideo: async (lessonId, videoId) => {
    try {
      const response = await bunnyAxios.post(`/content/lessons/${lessonId}/bunny-video/`, {
        video_id: videoId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في تحديث الدرس بالفيديو');
    }
  },

  // Update course with Bunny promotional video
  updateCoursePromotionalVideo: async (courseId, videoId) => {
    try {
      const response = await bunnyAxios.post(`/content/courses/${courseId}/bunny-promotional-video/`, {
        video_id: videoId,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في تحديث الكورس بالفيديو التعريفي');
    }
  },

  // Remove Bunny video from module
  removeModuleVideo: async (moduleId) => {
    try {
      const response = await bunnyAxios.delete(`/content/modules/${moduleId}/bunny-video/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في إزالة الفيديو من الوحدة');
    }
  },

  // Remove Bunny video from lesson
  removeLessonVideo: async (lessonId) => {
    try {
      const response = await bunnyAxios.delete(`/content/lessons/${lessonId}/bunny-video/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في إزالة الفيديو من الدرس');
    }
  },

  // Remove Bunny promotional video from course
  removeCoursePromotionalVideo: async (courseId) => {
    try {
      const response = await bunnyAxios.delete(`/content/courses/${courseId}/bunny-promotional-video/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'خطأ في إزالة الفيديو التعريفي من الكورس');
    }
  },
};

export default bunnyAPI;
