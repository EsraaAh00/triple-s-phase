import api from './api.service';

const accountFreezeService = {
  // الحصول على حالة تجميد الحساب
  getFreezeStatus: async () => {
    try {
      // التحقق من وجود token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      const response = await api.get('/api/users/account/freeze/status/');
      return response.data;
    } catch (error) {
      console.error('Error getting freeze status:', error);
      
      // معالجة أخطاء المصادقة
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      }
      
      throw error;
    }
  },

  // تجميد الحساب
  freezeAccount: async (freezeData) => {
    try {
      // التحقق من وجود token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      const response = await api.post('/api/users/account/freeze/', freezeData);
      return response.data;
    } catch (error) {
      console.error('Error freezing account:', error);
      
      // معالجة أخطاء المصادقة
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      }
      
      throw error;
    }
  },

  // إلغاء تجميد الحساب (للإدارة فقط)
  unfreezeAccount: async (unfreezeData) => {
    try {
      // التحقق من وجود token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      const response = await api.post('/api/users/account/unfreeze/', unfreezeData);
      return response.data;
    } catch (error) {
      console.error('Error unfreezing account:', error);
      
      // معالجة أخطاء المصادقة
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      }
      
      throw error;
    }
  },

  // التحقق من إمكانية إلغاء التجميد التلقائي
  checkAutoUnfreeze: async () => {
    try {
      // التحقق من وجود token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }
      
      const response = await api.get('/api/users/account/check-auto-unfreeze/');
      return response.data;
    } catch (error) {
      console.error('Error checking auto unfreeze:', error);
      
      // معالجة أخطاء المصادقة
      if (error.response?.status === 401) {
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      }
      
      throw error;
    }
  }
};

export default accountFreezeService;
