// Utility to test authentication
export const testAuth = () => {
  const token = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  console.log('🔐 Authentication Test:');
  console.log('Access Token:', token ? '✅ Present' : '❌ Missing');
  console.log('Refresh Token:', refreshToken ? '✅ Present' : '❌ Missing');
  
  if (token) {
    try {
      // Decode JWT token (basic decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token Payload:', payload);
      console.log('User ID:', payload.user_id);
      console.log('Is Admin:', payload.is_staff || payload.is_superuser);
      console.log('Token Expires:', new Date(payload.exp * 1000));
    } catch (e) {
      console.log('❌ Error decoding token:', e);
    }
  }
  
  return {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    token: token
  };
};

// Test API call
export const testBunnyAPI = async () => {
  try {
    const { bunnyAPI } = await import('../services/bunnyAPI.service');
    
    console.log('🧪 Testing Bunny API...');
    
    // Test with a sample video ID
    const result = await bunnyAPI.validateVideo('d8b328b6-2a03-4d53-99d1-f58daed43008');
    console.log('✅ API Test Result:', result);
    
    return result;
  } catch (error) {
    console.log('❌ API Test Error:', error);
    return { error: error.message };
  }
};
