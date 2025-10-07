import { createSlice } from '@reduxjs/toolkit';

// Load dark mode preference from localStorage if available
const loadDarkModePreference = () => {
  try {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Default to system preference if no saved preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.error('Error loading dark mode preference:', error);
    return false;
  }
};

const initialState = {
  isDarkMode: loadDarkModePreference(),
  isMobileMenuOpen: false,
  isNotificationsOpen: false,
  activeTab: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      const newMode = !state.isDarkMode;
      state.isDarkMode = newMode;
      // Save preference to localStorage
      try {
        localStorage.setItem('darkMode', newMode);
      } catch (error) {
        console.error('Error saving dark mode preference:', error);
      }
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      try {
        localStorage.setItem('darkMode', action.payload);
      } catch (error) {
        console.error('Error saving dark mode preference:', error);
      }
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    toggleNotifications: (state) => {
      state.isNotificationsOpen = !state.isNotificationsOpen;
    },
    closeNotifications: (state) => {
      state.isNotificationsOpen = false;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleMobileMenu,
  closeMobileMenu,
  toggleNotifications,
  closeNotifications,
  setActiveTab,
} = uiSlice.actions;

export const selectIsDarkMode = (state) => state.ui.isDarkMode;
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen;
export const selectIsNotificationsOpen = (state) => state.ui.isNotificationsOpen;
export const selectActiveTab = (state) => state.ui.activeTab;

export default uiSlice.reducer;
