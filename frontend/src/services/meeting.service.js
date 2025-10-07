import api from './api.service';

// Meeting API methods
export const meetingAPI = {
  // Get all meetings
  getMeetings: async (params = {}) => {
    try {
      const response = await api.get('/api/meetings/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  },

  // Get meeting by ID
  getMeeting: async (id) => {
    try {
      const response = await api.get(`/api/meetings/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  },

  // Get detailed meeting information
  getMeetingDetails: async (id) => {
    try {
      const response = await api.get(`/api/meetings/meetings/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      throw error;
    }
  },

  // Create new meeting
  createMeeting: async (meetingData) => {
    try {
      const response = await api.post('/api/meetings/meetings/', meetingData);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  // Update meeting
  updateMeeting: async (id, meetingData) => {
    try {
      const response = await api.put(`/api/meetings/meetings/${id}/`, meetingData);
      return response.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  },

  // Delete meeting
  deleteMeeting: async (id) => {
    try {
      const response = await api.delete(`/api/meetings/meetings/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  },

  // Get my meetings
  getMyMeetings: async () => {
    try {
      const response = await api.get('/api/meetings/my-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching my meetings:', error);
      throw error;
    }
  },

  // Get upcoming meetings
  getUpcomingMeetings: async () => {
    try {
      const response = await api.get('/api/meetings/upcoming/');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      throw error;
    }
  },

  // Search meetings
  searchMeetings: async (searchParams) => {
    try {
      const response = await api.get('/api/meetings/search/', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching meetings:', error);
      throw error;
    }
  },

  // Get meeting statistics
  getMeetingStats: async () => {
    try {
      const response = await api.get('/api/meetings/stats/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting stats:', error);
      throw error;
    }
  },

  // Quick create meeting
  quickCreateMeeting: async (meetingData) => {
    try {
      const response = await api.post('/api/meetings/quick-create/', meetingData);
      return response.data;
    } catch (error) {
      console.error('Error quick creating meeting:', error);
      throw error;
    }
  },

  // Start live meeting
  startLiveMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/start_live/`);
      return response.data;
    } catch (error) {
      console.error('Error starting live meeting:', error);
      throw error;
    }
  },

  // End live meeting
  endLiveMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/end_live/`);
      return response.data;
    } catch (error) {
      console.error('Error ending live meeting:', error);
      throw error;
    }
  },

  // Join meeting
  joinMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/join/`);
      return response.data;
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw error;
    }
  },

  // Leave meeting
  leaveMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/leave/`);
      return response.data;
    } catch (error) {
      console.error('Error leaving meeting:', error);
      throw error;
    }
  },

  // Mark attendance
  markAttendance: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/mark_attendance/`);
      return response.data;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Update participant attendance (for teachers)
  updateParticipantAttendance: async (meetingId, participantId, attendanceStatus) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/update_attendance/`, {
        participant_id: participantId,
        attendance_status: attendanceStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error updating participant attendance:', error);
      throw error;
    }
  },


  // Auto join meeting (for students)
  autoJoinMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/auto-join/`);
      return response.data;
    } catch (error) {
      console.error('Error auto joining meeting:', error);
      throw error;
    }
  },

  // Mark absent participants (for teachers)
  markAbsentParticipants: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/mark-absent/`);
      return response.data;
    } catch (error) {
      console.error('Error marking absent participants:', error);
      throw error;
    }
  },

  // Register for meeting
  registerForMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/register/`);
      return response.data;
    } catch (error) {
      console.error('Error registering for meeting:', error);
      throw error;
    }
  },

  // Get meeting participants
  getMeetingParticipants: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/meetings/${meetingId}/participants/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting participants:', error);
      // Return empty array if API fails
      return [];
    }
  },

  // Start live meeting (for teachers)
  startLiveMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/start_live/`);
      return response.data;
    } catch (error) {
      console.error('Error starting live meeting:', error);
      throw error;
    }
  },

  // End live meeting (for teachers)
  endLiveMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/end_live/`);
      return response.data;
    } catch (error) {
      console.error('Error ending live meeting:', error);
      throw error;
    }
  },

  // Get chat messages
  getChatMessages: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/meetings/${meetingId}/chat/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  },

  // Send chat message
  sendChatMessage: async (meetingId, message) => {
    try {
      const response = await api.post(`/api/meetings/meetings/${meetingId}/chat/`, {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  // Add participant to meeting
  addParticipant: async (meetingId, participantData) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/add_participant/`, participantData);
      return response.data;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  },

  // Remove participant from meeting
  removeParticipant: async (meetingId, participantId) => {
    try {
      const response = await api.delete(`/api/meetings/${meetingId}/remove_participant/${participantId}/`);
      return response.data;
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  },

  // Get meeting chat (alias for getChatMessages)
  getMeetingChat: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/meetings/${meetingId}/chat/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting chat:', error);
      throw error;
    }
  },

  // Get meeting notifications
  getMeetingNotifications: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/notifications/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting notifications:', error);
      throw error;
    }
  },

  // Send meeting notification
  sendMeetingNotification: async (meetingId, notificationData) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/notifications/`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending meeting notification:', error);
      throw error;
    }
  },

  // Get meeting materials
  getMeetingMaterials: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/materials/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting materials:', error);
      throw error;
    }
  },

  // Upload meeting materials
  uploadMeetingMaterials: async (meetingId, formData) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/upload_materials/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading meeting materials:', error);
      throw error;
    }
  },

  // Download meeting materials
  downloadMeetingMaterials: async (meetingId, materialId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/download_materials/`, {
        params: { material_id: materialId },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading meeting materials:', error);
      throw error;
    }
  },

  // Get meeting attendance report
  getMeetingAttendanceReport: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/attendance_report/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting attendance report:', error);
      throw error;
    }
  },

  // Export meeting data
  exportMeetingData: async (meetingId, format = 'pdf') => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/export/`, {
        params: { format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting meeting data:', error);
      throw error;
    }
  },

  // Unregister from meeting (for students)
  unregisterFromMeeting: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/unregister/`);
      return response.data;
    } catch (error) {
      console.error('Error unregistering from meeting:', error);
      throw error;
    }
  },

  // Mark attendance with status
  markAttendanceWithStatus: async (meetingId, status) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/mark_attendance/`, {
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error marking attendance with status:', error);
      throw error;
    }
  },

  // Bulk mark attendance (for teachers)
  bulkMarkAttendance: async (meetingId, attendanceData) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/bulk_mark_attendance/`, {
        attendance_data: attendanceData
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk marking attendance:', error);
      throw error;
    }
  },

  // Get my attendance status for a meeting
  getMyAttendanceStatus: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/meetings/${meetingId}/my_attendance/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my attendance status:', error);
      // Return default status if API fails
      return {
        attendance_status: 'not_registered',
        joined_at: null,
        left_at: null,
        attendance_duration: null
      };
    }
  },

  // Check if I'm registered for a meeting
  checkRegistrationStatus: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/meetings/${meetingId}/check_registration/`);
      return response.data;
    } catch (error) {
      console.error('Error checking registration status:', error);
      // Return default status if API fails
      return {
        is_registered: false,
        meeting_id: meetingId
      };
    }
  },

  // Get available meetings for registration (for students)
  getAvailableMeetings: async () => {
    try {
      const response = await api.get('/api/meetings/available-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching available meetings:', error);
      throw error;
    }
  },

  // Get meetings I can join (for students)
  getJoinableMeetings: async () => {
    try {
      const response = await api.get('/api/meetings/joinable-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching joinable meetings:', error);
      throw error;
    }
  },

  // Get meetings I'm teaching (for teachers)
  getTeachingMeetings: async () => {
    try {
      const response = await api.get('/api/meetings/teaching-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching teaching meetings:', error);
      throw error;
    }
  },

  // Get meetings I'm attending (for students)
  getAttendingMeetings: async () => {
    try {
      const response = await api.get('/api/meetings/attending-meetings/');
      return response.data;
    } catch (error) {
      console.error('Error fetching attending meetings:', error);
      throw error;
    }
  },

  // Send meeting invitation to students
  sendMeetingInvitation: async (meetingId, studentIds) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/send_invitation/`, {
        student_ids: studentIds
      });
      return response.data;
    } catch (error) {
      console.error('Error sending meeting invitation:', error);
      throw error;
    }
  },

  // Get meeting invitations
  getMeetingInvitations: async () => {
    try {
      const response = await api.get('/api/meetings/invitations/');
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting invitations:', error);
      throw error;
    }
  },

  // Accept meeting invitation
  acceptInvitation: async (invitationId) => {
    try {
      const response = await api.post(`/api/meetings/invitations/${invitationId}/accept/`);
      return response.data;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  },

  // Decline meeting invitation
  declineInvitation: async (invitationId) => {
    try {
      const response = await api.post(`/api/meetings/invitations/${invitationId}/decline/`);
      return response.data;
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw error;
    }
  },

  // Get real-time meeting status
  getMeetingStatus: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/status/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting status:', error);
      throw error;
    }
  },

  // Start recording
  startRecording: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/start_recording/`);
      return response.data;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },

  // Stop recording
  stopRecording: async (meetingId) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/stop_recording/`);
      return response.data;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  },

  // Get meeting recordings
  getMeetingRecordings: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/recordings/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting recordings:', error);
      throw error;
    }
  },

  // Download recording
  downloadRecording: async (meetingId, recordingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/recordings/${recordingId}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading recording:', error);
      throw error;
    }
  },

  // Get meeting analytics
  getMeetingAnalytics: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}/analytics/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting analytics:', error);
      throw error;
    }
  },

  // Get meeting history
  getMeetingHistory: async () => {
    try {
      const response = await api.get('/api/meetings/meeting-history/');
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting history:', error);
      throw error;
    }
  },

  // Get meeting calendar events
  getMeetingCalendarEvents: async () => {
    try {
      const response = await api.get('/api/meetings/calendar-events/');
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting calendar events:', error);
      throw error;
    }
  },

  // Sync with calendar
  syncWithCalendar: async (meetingId, calendarData) => {
    try {
      const response = await api.post(`/api/meetings/${meetingId}/sync_calendar/`, {
        calendar_data: calendarData
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing with calendar:', error);
      throw error;
    }
  },
};

export default meetingAPI;
