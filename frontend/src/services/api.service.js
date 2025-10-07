import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create(API_CONFIG);

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Request interceptor - Token exists:', !!token);
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);

    // Log request data for assessment API calls
    if (config.url && config.url.includes('/assessment/')) {
      console.log('=== ASSESSMENT API REQUEST DEBUG ===');
      console.log('Assessment API request detected');
      console.log('Request URL:', config.url);
      console.log('Request method:', config.method);
      console.log('Token exists:', !!token);
      console.log('=====================================');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.log('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('Response interceptor - Error:', error.response?.status, error.response?.data, error.config?.url);

    if (error.response?.status === 401) {
      // Check if this is a public endpoint that shouldn't require authentication
      const publicEndpoints = [
        '/api/courses/public/',
        '/api/courses/categories/',
        '/api/courses/courses/',
        '/api/articles/',
        '/api/certificates/verify/'
      ];

      const isPublicEndpoint = publicEndpoints.some(endpoint =>
        error.config?.url?.includes(endpoint)
      );

      if (isPublicEndpoint) {
        console.log('Public endpoint 401 - not redirecting to login');
        return Promise.reject(error);
      }

      console.log('Unauthorized access - clearing auth data');
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      // Don't redirect automatically - let the app handle it
    }
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login/', credentials);
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/api/auth/logout/');
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile/update/', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/api/auth/change-password/', passwordData);
    return response.data;
  },

  // Check email exists
  checkEmail: async (email) => {
    const response = await api.get(`/api/auth/check-email/?email=${email}`);
    return response.data;
  },
};

// Course API methods
export const courseAPI = {
  // Get all courses
  getCourses: async (params = {}) => {
    const response = await api.get('/api/courses/courses/', { params });
    return response.data;
  },

  // Get public courses (no authentication required)
  getPublicCourses: async (params = {}) => {
    try {
      const response = await api.get('/api/courses/public/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourse: async (id) => {
    try {
      const response = await api.get(`/api/courses/courses/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    const formData = new FormData();

    // Add basic fields
    Object.keys(courseData).forEach(key => {
      if (key === 'tags' && Array.isArray(courseData[key])) {
        courseData[key].forEach(tag => formData.append('tags', tag));
      } else if (key === 'image' && courseData[key] instanceof File) {
        formData.append('image', courseData[key]);
      } else if (key === 'syllabus_pdf' && courseData[key] instanceof File) {
        formData.append('syllabus_pdf', courseData[key]);
      } else if (key === 'materials_pdf' && courseData[key] instanceof File) {
        formData.append('materials_pdf', courseData[key]);
      } else if (courseData[key] !== null && courseData[key] !== undefined) {
        // Always send category field, even if empty
        if (key === 'category') {
          formData.append(key, courseData[key] || '');
        } else {
          formData.append(key, courseData[key]);
        }
      }
    });

    try {
      const response = await api.post('/api/courses/courses/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createCourse API call:', error);
      // If it's a 500 error, the course might have been created successfully
      if (error.response?.status === 500) {
        // Check if the course was actually created by making a GET request
        try {
          const coursesResponse = await api.get('/api/courses/courses/');
          const coursesData = coursesResponse.data;
          const coursesArray = Array.isArray(coursesData) ? coursesData :
            coursesData.results ? coursesData.results :
              coursesData.data ? coursesData.data : [];

          // Look for a course with the same title and subtitle
          const createdCourse = coursesArray.find(course =>
            course.title === courseData.title &&
            course.subtitle === courseData.subtitle
          );

          if (createdCourse) {
            // Course was created successfully, return it
            return createdCourse;
          }
        } catch (fetchError) {
          console.error('Error fetching courses to verify creation:', fetchError);
        }
      }
      throw error;
    }
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const formData = new FormData();

    // Add basic fields
    Object.keys(courseData).forEach(key => {
      if (key === 'tags' && Array.isArray(courseData[key])) {
        courseData[key].forEach(tag => formData.append('tags', tag));
      } else if (key === 'image' && courseData[key] instanceof File) {
        formData.append('image', courseData[key]);
      } else if (key === 'syllabus_pdf' && courseData[key] instanceof File) {
        formData.append('syllabus_pdf', courseData[key]);
      } else if (key === 'materials_pdf' && courseData[key] instanceof File) {
        formData.append('materials_pdf', courseData[key]);
      } else if (courseData[key] !== null && courseData[key] !== undefined) {
        // Always send category field, even if empty
        if (key === 'category') {
          formData.append(key, courseData[key] || '');
        } else {
          formData.append(key, courseData[key]);
        }
      }
    });

    try {
      const response = await api.patch(`/api/courses/courses/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateCourse API call:', error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await api.delete(`/api/courses/courses/${id}/`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/courses/categories/');
      // Ensure we return an array
      const data = response.data;
      return Array.isArray(data) ? data :
        data.results ? data.results :
          data.data ? data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get subcategories
  // getSubCategories: async (categoryId = null) => {
  //   try {
  //     const params = categoryId ? { category: categoryId } : {};
  //     const response = await api.get('/api/courses/subcategories/', { params });
  //     // Ensure we return an array
  //     const data = response.data;
  //     return Array.isArray(data) ? data :
  //       data.results ? data.results :
  //         data.data ? data.data : [];
  //   } catch (error) {
  //     console.error('Error fetching subcategories:', error);
  //     return [];
  //   }
  // },

  // Get tags
  getTags: async () => {
    const response = await api.get('/api/courses/tags/');
    return response.data;
  },

  // Search courses
  searchCourses: async (params = {}) => {
    const response = await api.get('/api/courses/search/', { params });
    return response.data;
  },

  // Get featured courses
  getFeaturedCourses: async () => {
    const response = await api.get('/api/courses/featured/');
    return response.data;
  },

  // Get popular courses
  getPopularCourses: async () => {
    const response = await api.get('/api/courses/popular/');
    return response.data;
  },

  // Get recent courses
  getRecentCourses: async () => {
    const response = await api.get('/api/courses/recent/');
    return response.data;
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/api/courses/courses/${courseId}/enroll/`);
    return response.data;
  },

  // Unenroll from course
  unenrollFromCourse: async (courseId) => {
    const response = await api.post(`/api/courses/courses/${courseId}/unenroll/`);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/api/courses/dashboard/stats/');
    return response.data;
  },

  // Get my enrolled courses
  getMyEnrolledCourses: async () => {
    try {
      const response = await api.get('/api/courses/my-enrolled-courses/');
      return response.data;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }
  },

  // Get course tracking data
  getCourseTrackingData: async (courseId) => {
    try {
      const response = await api.get(`/api/courses/course-tracking/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course tracking data:', error);
      throw error;
    }
  },

  // Get quiz data
  getQuizData: async (quizId) => {
    try {
      const response = await api.get(`/api/assignments/quiz/${quizId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      throw error;
    }
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId, answers) => {
    try {
      const response = await api.post(`/api/assignments/quiz/${quizId}/submit/`, {
        answers: answers
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  },

  // Mark lesson as completed
  markLessonCompleted: async (courseId, lessonId) => {
    try {
      const response = await api.post(`/api/content/progress/course/${courseId}/complete/`, {
        lesson_id: lessonId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      throw error;
    }
  },

  // Track lesson progress
  trackLessonProgress: async (courseId, lessonId, progressData) => {
    try {
      const response = await api.post(`/api/content/progress/course/${courseId}/track/`, {
        lesson_id: lessonId,
        ...progressData
      });
      return response.data;
    } catch (error) {
      console.error('Error tracking lesson progress:', error);
      throw error;
    }
  },

  // Update module progress
  updateModuleProgress: async (moduleId, progressData) => {
    try {
      const response = await api.post(`/api/content/modules/${moduleId}/mark_progress/`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating module progress:', error);
      throw error;
    }
  },

  // Get lesson details
  getLessonDetails: async (lessonId) => {
    try {
      const response = await api.get(`/api/content/lessons/${lessonId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson details:', error);
      throw error;
    }
  },

  // Download resource
  downloadResource: async (resourceId) => {
    try {
      const response = await api.get(`/api/content/resources/${resourceId}/download/`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading resource:', error);
      throw error;
    }
  },
};

// Payments API methods
export const paymentAPI = {
  // Create Moyasar hosted payment and get redirect URL
  createMoyasarPayment: async () => {
    const response = await api.post('/api/store/payment/moyasar/create/');
    return response.data; // { url, invoice }
  },

  // Create Moyasar hosted payment for a specific course
  createCoursePayment: async (courseId) => {
    const response = await api.post(`/api/store/payment/moyasar/course/${courseId}/create/`);
    return response.data; // { url, invoice }
  },
};

// Articles API methods
export const articleAPI = {
  // Get all articles
  getArticles: async (params = {}) => {
    try {
      const response = await api.get('/api/articles/articles/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  },

  // Get article by ID
  getArticle: async (id) => {
    try {
      const response = await api.get(`/api/articles/articles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article:', error);
      throw error;
    }
  },

  // Get article by slug
  getArticleBySlug: async (slug) => {
    try {
      const response = await api.get(`/api/articles/articles/?slug=${slug}`);
      // API returns a list, so we need to get the first item
      if (response.data && response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      } else {
        throw new Error('Article not found');
      }
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      throw error;
    }
  },

  // Create new article
  createArticle: async (articleData) => {
    const formData = new FormData();

    // Add basic fields
    Object.keys(articleData).forEach(key => {
      if (key === 'tags' && Array.isArray(articleData[key])) {
        articleData[key].forEach(tag => formData.append('tags', tag));
      } else if (key === 'image' && articleData[key] instanceof File) {
        formData.append('image', articleData[key]);
      } else if (articleData[key] !== null && articleData[key] !== undefined && articleData[key] !== '') {
        formData.append(key, articleData[key]);
      }
    });

    try {
      const response = await api.post('/api/articles/articles/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createArticle API call:', error);
      throw error;
    }
  },

  // Update article
  updateArticle: async (id, articleData) => {
    const formData = new FormData();

    // Add basic fields
    Object.keys(articleData).forEach(key => {
      if (key === 'tags' && Array.isArray(articleData[key])) {
        articleData[key].forEach(tag => formData.append('tags', tag));
      } else if (key === 'image' && articleData[key] instanceof File) {
        formData.append('image', articleData[key]);
      } else if (articleData[key] !== null && articleData[key] !== undefined && articleData[key] !== '') {
        formData.append(key, articleData[key]);
      }
    });

    try {
      const response = await api.patch(`/api/articles/articles/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateArticle API call:', error);
      throw error;
    }
  },

  // Delete article
  deleteArticle: async (id) => {
    try {
      const response = await api.delete(`/api/articles/articles/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  },

  // Get featured articles
  getFeaturedArticles: async () => {
    try {
      const response = await api.get('/api/articles/featured/');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      throw error;
    }
  },

  // Get recent articles
  getRecentArticles: async () => {
    try {
      const response = await api.get('/api/articles/recent/');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent articles:', error);
      throw error;
    }
  },

  // Get popular articles
  getPopularArticles: async () => {
    try {
      const response = await api.get('/api/articles/popular/');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular articles:', error);
      throw error;
    }
  },

  // Get related articles
  getRelatedArticles: async (articleId, category = null, limit = 3) => {
    try {
      let url = `/api/articles/articles/?limit=${limit}`;
      if (category) {
        url += `&category=${category}`;
      }
      if (articleId) {
        url += `&exclude=${articleId}`;
      }
      const response = await api.get(url);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  },

  // Get article tags
  getArticleTags: async () => {
    try {
      const response = await api.get('/api/articles/tags/');
      return response.data;
    } catch (error) {
      console.error('Error fetching article tags:', error);
      return [];
    }
  },

  // Get author profile (user data)
  getAuthorProfile: async (authorId) => {
    try {
      console.log('Fetching author profile for ID:', authorId);

      // Try different endpoints to get user profile data
      let response;
      const endpoints = [
        `/api/users/${authorId}/`,
        `/api/users/${authorId}/profile/`,
        `/api/profiles/${authorId}/`,
        `/api/users/profiles/${authorId}/`,
        `/api/instructors/${authorId}/`,
        `/api/teachers/${authorId}/`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          console.log(`Success with endpoint: ${endpoint}`);
          break;
        } catch (error) {
          console.log(`Failed with endpoint: ${endpoint}`, error.response?.status);
          continue;
        }
      }

      if (!response) {
        console.error('All endpoints failed for author profile');
        return null;
      }

      console.log('Author profile response:', response.data);

      // Transform the response to include profile data if it's nested
      let profileData = response.data;

      // If the response has a profile field, use it
      if (response.data.profile) {
        profileData = {
          ...response.data.profile,
          user: response.data,
          // Include user fields in the main object for easier access
          user_id: response.data.id,
          user_email: response.data.email,
          user_first_name: response.data.first_name,
          user_last_name: response.data.last_name,
          user_username: response.data.username
        };
      }

      // If the response is directly a profile, add user info if available
      if (response.data.user) {
        profileData = {
          ...response.data,
          user_id: response.data.user.id,
          user_email: response.data.user.email,
          user_first_name: response.data.user.first_name,
          user_last_name: response.data.user.last_name,
          user_username: response.data.user.username
        };
      }

      return profileData;
    } catch (error) {
      console.error('Error fetching author profile:', error);
      return null;
    }
  },

  // Get teacher profile (alternative method)
  getTeacherProfile: async (teacherId) => {
    try {
      console.log('Fetching teacher profile for ID:', teacherId);
      const response = await api.get(`/api/teachers/${teacherId}/`);
      console.log('Teacher profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      return null;
    }
  },

  // Search articles
  searchArticles: async (query) => {
    try {
      const response = await api.get('/api/articles/search/', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching articles:', error);
      throw error;
    }
  },

  // Get article categories
  getArticleCategories: async () => {
    try {
      const response = await api.get('/api/articles/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching article categories:', error);
      return [];
    }
  },

  // Get article comments
  getArticleComments: async (articleId) => {
    try {
      console.log('Fetching comments for article:', articleId);
      const response = await api.get(`/api/articles/comments/?article=${articleId}`);
      console.log('Comments API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching article comments:', error);
      // Return empty array instead of throwing error
      return [];
    }
  },

  // Create article comment
  createArticleComment: async (articleId, commentData) => {
    try {
      console.log('Creating comment for article:', articleId, 'with data:', commentData);
      const response = await api.post('/api/articles/comments/', {
        article: articleId,
        ...commentData
      });
      console.log('Comment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating article comment:', error);
      throw error;
    }
  },

  // Like article
  likeArticle: async (articleId) => {
    try {
      const response = await api.post(`/api/articles/articles/${articleId}/likes/`);
      return response.data;
    } catch (error) {
      console.error('Error liking article:', error);
      throw error;
    }
  },

  // Unlike article
  unlikeArticle: async (articleId) => {
    try {
      const response = await api.delete(`/api/articles/articles/${articleId}/likes/unlike/`);
      return response.data;
    } catch (error) {
      console.error('Error unliking article:', error);
      throw error;
    }
  },

  // Bookmark article
  bookmarkArticle: async (articleId, notes = null) => {
    try {
      const response = await api.post(`/api/articles/articles/${articleId}/bookmarks/`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error bookmarking article:', error);
      throw error;
    }
  },

  // Remove bookmark
  removeBookmark: async (articleId) => {
    try {
      const response = await api.delete(`/api/articles/articles/${articleId}/bookmarks/remove_bookmark/`);
      return response.data;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },

  // Rate article
  rateArticle: async (articleId, rating, comment = null) => {
    try {
      const response = await api.post(`/api/articles/articles/${articleId}/ratings/`, { rating, comment });
      return response.data;
    } catch (error) {
      console.error('Error rating article:', error);
      throw error;
    }
  },

  // Get user bookmarks
  getUserBookmarks: async () => {
    try {
      const response = await api.get('/api/articles/my/bookmarks/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      throw error;
    }
  },

  // Get user ratings
  getUserRatings: async () => {
    try {
      const response = await api.get('/api/articles/my/ratings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      throw error;
    }
  },

  // Check if article is liked by current user
  checkArticleLike: async (articleId) => {
    try {
      const response = await api.get(`/api/articles/articles/${articleId}/likes/check_like/`);
      return response.data;
    } catch (error) {
      console.error('Error checking article like:', error);
      throw error;
    }
  },

  // Check if article is bookmarked by current user
  checkArticleBookmark: async (articleId) => {
    try {
      const response = await api.get(`/api/articles/articles/${articleId}/bookmarks/check_bookmark/`);
      return response.data;
    } catch (error) {
      console.error('Error checking article bookmark:', error);
      throw error;
    }
  },

  // Get article rating stats
  getArticleRatingStats: async (articleId) => {
    try {
      const response = await api.get(`/api/articles/articles/${articleId}/ratings/stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching article rating stats:', error);
      throw error;
    }
  },
};

// Banners API methods
export const bannerAPI = {
  // Get all banners
  getBanners: async (params = {}) => {
    try {
      const response = await api.get('/api/extras/banners/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  // Get banners by type
  getBannersByType: async (bannerType) => {
    try {
      console.log(`🔍 Fetching banners for type: ${bannerType}`);
      const response = await api.get('/api/extras/banners/by_type/', {
        params: { type: bannerType }
      });
      console.log(`✅ Banners for ${bannerType}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching banners for type ${bannerType}:`, error);
      throw error;
    }
  },

  // Get active banners
  getActiveBanners: async (params = {}) => {
    try {
      const response = await api.get('/api/extras/banners/active/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching active banners:', error);
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

  // Get header banners
  getHeaderBanners: async () => {
    try {
      const response = await api.get('/api/extras/banners/header/');
      return response.data;
    } catch (error) {
      console.error('Error fetching header banners:', error);
      throw error;
    }
  },

  // Get main banners
  getMainBanners: async () => {
    try {
      const response = await api.get('/api/extras/banners/main/');
      return response.data;
    } catch (error) {
      console.error('Error fetching main banners:', error);
      throw error;
    }
  },

  // Get about us banners
  getAboutUsBanners: async () => {
    try {
      const response = await api.get('/api/extras/banners/about_us/');
      return response.data;
    } catch (error) {
      console.error('Error fetching about us banners:', error);
      throw error;
    }
  },

  // Get why choose us banners
  getWhyChooseUsBanners: async () => {
    try {
      console.log('🔍 Fetching why choose us banners...');
      const response = await api.get('/api/extras/banners/why_choose_us/');
      console.log('✅ Why choose us banners:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching why choose us banners:', error);
      throw error;
    }
  },

  // Get banner by ID
  getBanner: async (id) => {
    try {
      const response = await api.get(`/api/extras/banners/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  }
};

// Course Collections API methods
export const collectionAPI = {
  // Get all collections
  getCollections: async (params = {}) => {
    try {
      const response = await api.get('/api/extras/collections/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  // Get collection by ID
  getCollection: async (id) => {
    try {
      const response = await api.get(`/api/extras/collections/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw error;
    }
  }
};

export default api;
