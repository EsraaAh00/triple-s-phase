// Debug environment variables
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

// Get the base URL from environment variable or default to production
const getBaseURL = () => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    // Try environment variable first, then fallback to localhost
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }
  // In production, use the production URL
  return import.meta.env.VITE_API_BASE_URL || 'https://admin.triplesacademy.com';
};

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add retry configuration
  retry: {
    retries: 3,
    retryDelay: 1000,
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login/',
    REGISTER: '/api/auth/register/',
    LOGOUT: '/api/auth/logout/',
    PROFILE: '/api/auth/profile/',
    UPDATE_PROFILE: '/api/auth/profile/update/',
    CHANGE_PASSWORD: '/api/auth/change-password/',
    CHECK_EMAIL: '/api/auth/check-email/',
  },
  COURSES: {
    BASE: '/api/courses/',
    PUBLIC: '/api/courses/public/',
    POPULAR: '/api/courses/popular/',
    FEATURED: '/api/courses/featured/',
    SEARCH: '/api/courses/search/',
    CATEGORIES: '/api/courses/categories/',
    TAGS: '/api/courses/tags/',
    ENROLL: '/api/courses/courses/{id}/enroll/',
    UNENROLL: '/api/courses/courses/{id}/unenroll/',
    MODULES: '/api/courses/courses/{id}/modules/',
    REVIEWS: '/api/courses/courses/{id}/reviews/',
    RELATED: '/api/courses/courses/{id}/related/',
    PROGRESS: '/api/courses/courses/{id}/progress/',
  },
  STORE: {
    CART: '/api/store/cart/',
    CART_ITEMS: '/api/store/cart/items/',
    PAYMENT: {
      MOYASAR_CREATE: '/api/store/payment/moyasar/create/',
      MOYASAR_COURSE: '/api/store/payment/moyasar/course/{id}/create/',
      STATUS: '/api/store/payment/{id}/status/',
    },
  },
  USERS: {
    BASE: '/api/users/',
    ENROLLMENTS: '/api/users/enrollments/',
  },
  CONTENT: {
    MODULES: '/api/content/modules/',
    LESSONS: '/api/content/lessons/',
  },
  EXTRAS: {
    BANNERS: '/api/extras/banners/active/',
    COLLECTIONS: '/api/extras/collections/with_courses/',
  },
};

// Helper function to replace URL parameters
export const replaceUrlParams = (url, params) => {
  let result = url;
  Object.keys(params).forEach(key => {
    result = result.replace(`{${key}}`, params[key]);
  });
  return result;
};

// API error messages in Arabic
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الشبكة. يرجى التحقق من اتصال الإنترنت.',
  UNAUTHORIZED: 'يرجى تسجيل الدخول للوصول إلى هذه الصفحة.',
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
  NOT_FOUND: 'المحتوى المطلوب غير موجود.',
  SERVER_ERROR: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
  TIMEOUT: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
};
