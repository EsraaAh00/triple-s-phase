import api from './api.service';

const ASSESSMENT_API = {
  // Questions API
  QUESTIONS: '/api/assessment/questions/',
  QUESTION_DETAIL: (id) => `/api/assessment/questions/${id}/`,
  QUESTION_STATS: '/api/assessment/questions/stats/',
  
  // Courses and Lessons for questions
  LESSONS: '/api/content/lessons/',
  
  // Question types
  QUESTION_TYPES: '/api/assessment/question-types/',
  
  // Bulk operations
  BULK_DELETE: '/api/assessment/questions/bulk-delete/',
  BULK_UPDATE: '/api/assessment/questions/bulk-update/',
  
  // Search and filters
  SEARCH: '/api/assessment/questions/search/',
  FILTER: '/api/assessment/questions/filter/',
  
  // Flashcards API
  FLASHCARDS: '/api/assessment/flashcards/',
  FLASHCARD_DETAIL: (id) => `/api/assessment/flashcards/${id}/`,
  FLASHCARD_REVIEW: (id) => `/api/assessment/flashcards/${id}/review/`,
  FLASHCARD_PROGRESS: '/api/assessment/flashcard-progress/',
};

class AssessmentService {
  // ==================== QUESTIONS ====================
  
  /**
   * Get all questions with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Questions data with pagination
   */
  async getQuestions(params = {}) {
    try {
      console.log('Fetching questions with params:', params);
      const response = await api.get(ASSESSMENT_API.QUESTIONS, { params });
      console.log('Questions response:', response.data);
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          page: response.data.page || 1,
          totalPages: Math.ceil(response.data.count / (params.page_size || 20))
        }
      };
    } catch (error) {
      console.error('Error fetching questions:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  /**
   * Get question by ID
   * @param {string|number} id - Question ID
   * @returns {Promise<Object>} Question data
   */
  async getQuestion(id) {
    try {
      const response = await api.get(ASSESSMENT_API.QUESTION_DETAIL(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching question:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: null
      };
    }
  }

  /**
   * Create new question
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} Created question
   */
  async createQuestion(questionData) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      formData.append('question_text', questionData.question_text);
      formData.append('question_type', questionData.question_type);
      formData.append('difficulty_level', questionData.difficulty_level);
      formData.append('correct_answer', questionData.correct_answer);
      formData.append('explanation', questionData.explanation || '');
      formData.append('tags', JSON.stringify(questionData.tags || []));
      formData.append('lesson', questionData.lesson || '');
      formData.append('options', JSON.stringify(questionData.options || []));
      
      // Add media files if they exist
      if (questionData.image) {
        formData.append('image', questionData.image);
      }
      if (questionData.audio) {
        formData.append('audio', questionData.audio);
      }
      if (questionData.video) {
        formData.append('video', questionData.video);
      }
      
      console.log('Creating question with FormData:', formData);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const response = await api.post(ASSESSMENT_API.QUESTIONS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating question:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: null
      };
    }
  }

  /**
   * Update question
   * @param {string|number} id - Question ID
   * @param {Object} questionData - Updated question data
   * @returns {Promise<Object>} Updated question
   */
  async updateQuestion(id, questionData) {
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      formData.append('question_text', questionData.question_text);
      formData.append('question_type', questionData.question_type);
      formData.append('difficulty_level', questionData.difficulty_level);
      formData.append('correct_answer', questionData.correct_answer);
      formData.append('explanation', questionData.explanation || '');
      formData.append('tags', JSON.stringify(questionData.tags || []));
      formData.append('lesson', questionData.lesson || '');
      formData.append('options', JSON.stringify(questionData.options || []));
      
      // Add media files if they exist
      if (questionData.image) {
        formData.append('image', questionData.image);
      }
      if (questionData.audio) {
        formData.append('audio', questionData.audio);
      }
      if (questionData.video) {
        formData.append('video', questionData.video);
      }
      
      console.log('Updating question with FormData:', formData);
      
      const response = await api.put(ASSESSMENT_API.QUESTION_DETAIL(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating question:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: null
      };
    }
  }

  /**
   * Delete question
   * @param {string|number} id - Question ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteQuestion(id) {
    try {
      await api.delete(ASSESSMENT_API.QUESTION_DETAIL(id));
      return {
        success: true,
        message: 'Question deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting question:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk delete questions
   * @param {Array} questionIds - Array of question IDs
   * @returns {Promise<Object>} Bulk deletion result
   */
  async bulkDeleteQuestions(questionIds) {
    try {
      const response = await api.post(ASSESSMENT_API.BULK_DELETE, {
        question_ids: questionIds
      });
      return {
        success: true,
        data: response.data,
        message: `${questionIds.length} questions deleted successfully`
      };
    } catch (error) {
      console.error('Error bulk deleting questions:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Bulk update questions
   * @param {Array} updates - Array of update objects
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkUpdateQuestions(updates) {
    try {
      const response = await api.post(ASSESSMENT_API.BULK_UPDATE, {
        updates: updates
      });
      return {
        success: true,
        data: response.data,
        message: `${updates.length} questions updated successfully`
      };
    } catch (error) {
      console.error('Error bulk updating questions:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // ==================== SEARCH AND FILTERS ====================

  /**
   * Search questions
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchQuestions(searchParams) {
    try {
      const response = await api.get(ASSESSMENT_API.SEARCH, { params: searchParams });
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        }
      };
    } catch (error) {
      console.error('Error searching questions:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  /**
   * Filter questions
   * @param {Object} filterParams - Filter parameters
   * @returns {Promise<Object>} Filtered results
   */
  async filterQuestions(filterParams) {
    try {
      const response = await api.get(ASSESSMENT_API.FILTER, { params: filterParams });
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        }
      };
    } catch (error) {
      console.error('Error filtering questions:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get question statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getQuestionStats() {
    try {
      const response = await api.get(ASSESSMENT_API.QUESTION_STATS);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching question stats:', error);
      console.error('Error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: null
      };
    }
  }

  // ==================== COURSES AND LESSONS ====================

  /**
   * Get lessons for question assignment
   * @param {Object} params - Query parameters including courseId, page_size, etc.
   * @returns {Promise<Object>} Lessons data
   */
  async getLessons(params = {}) {
    try {
      const response = await api.get(ASSESSMENT_API.LESSONS, { params });
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  // ==================== QUESTION TYPES ====================

  /**
   * Get available question types
   * @returns {Promise<Object>} Question types data
   */
  async getQuestionTypes() {
    try {
      const response = await api.get(ASSESSMENT_API.QUESTION_TYPES);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching question types:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate question data before submission
   * @param {Object} questionData - Question data to validate
   * @returns {Object} Validation result
   */
  validateQuestionData(questionData) {
    const errors = {};

    if (!questionData.question_text?.trim()) {
      errors.question_text = 'نص السؤال مطلوب';
    }

    if (!questionData.question_type) {
      errors.question_type = 'نوع السؤال مطلوب';
    }

    if (!questionData.difficulty_level) {
      errors.difficulty_level = 'مستوى الصعوبة مطلوب';
    }

    if (questionData.question_type === 'mcq' && (!questionData.options || questionData.options.length < 2)) {
      errors.options = 'يجب إضافة على الأقل خيارين للأسئلة متعددة الخيارات';
    }

    if (!questionData.correct_answer?.trim()) {
      errors.correct_answer = 'الإجابة الصحيحة مطلوبة';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format question data for API submission
   * @param {Object} formData - Form data
   * @returns {Object} Formatted data for API
   */
  formatQuestionData(formData) {
    const formattedData = {
      question_text: formData.question_text,
      question_type: formData.question_type,
      difficulty_level: formData.difficulty_level,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation || '',
      tags: formData.tags || [],
      lesson: formData.lesson || null,
      course: formData.course || null
    };

    // Handle different question types
    if (formData.question_type === 'mcq') {
      formattedData.options = formData.options || [];
    }

    // Handle file uploads
    if (formData.image) {
      formattedData.image = formData.image;
    }
    if (formData.audio) {
      formattedData.audio = formData.audio;
    }
    if (formData.video) {
      formattedData.video = formData.video;
    }

    return formattedData;
  }

  // ==================== FLASHCARDS ====================
  
  /**
   * Get all flashcards with optional filters
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Flashcards data with pagination
   */
  async getFlashcards(params = {}) {
    try {
      console.log('Fetching flashcards with params:', params);
      const response = await api.get(ASSESSMENT_API.FLASHCARDS, { params });
      console.log('Flashcards response:', response.data);
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          page: response.data.page || 1,
          totalPages: Math.ceil(response.data.count / (params.page_size || 20))
        }
      };
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  /**
   * Get flashcard by ID
   * @param {string|number} id - Flashcard ID
   * @returns {Promise<Object>} Flashcard data
   */
  async getFlashcard(id) {
    try {
      const response = await api.get(ASSESSMENT_API.FLASHCARD_DETAIL(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Create new flashcard
   * @param {Object} flashcardData - Flashcard data
   * @returns {Promise<Object>} Created flashcard data
   */
  async createFlashcard(flashcardData) {
    try {
      const formData = this.formatFlashcardData(flashcardData);
      const response = await api.post(ASSESSMENT_API.FLASHCARDS, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating flashcard:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Update flashcard
   * @param {string|number} id - Flashcard ID
   * @param {Object} flashcardData - Updated flashcard data
   * @returns {Promise<Object>} Updated flashcard data
   */
  async updateFlashcard(id, flashcardData) {
    try {
      const formData = this.formatFlashcardData(flashcardData);
      const response = await api.patch(ASSESSMENT_API.FLASHCARD_DETAIL(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating flashcard:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Delete flashcard
   * @param {string|number} id - Flashcard ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFlashcard(id) {
    try {
      await api.delete(ASSESSMENT_API.FLASHCARD_DETAIL(id));
      return {
        success: true,
        message: 'Flashcard deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Record flashcard review
   * @param {string|number} id - Flashcard ID
   * @param {Object} reviewData - Review data (correct, difficulty, etc.)
   * @returns {Promise<Object>} Review result
   */
  async reviewFlashcard(id, reviewData) {
    try {
      const response = await api.post(ASSESSMENT_API.FLASHCARD_REVIEW(id), reviewData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error reviewing flashcard:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get flashcard progress for student
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Progress data
   */
  async getFlashcardProgress(params = {}) {
    try {
      const response = await api.get(ASSESSMENT_API.FLASHCARD_PROGRESS, { params });
      return {
        success: true,
        data: response.data.results || response.data,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        }
      };
    } catch (error) {
      console.error('Error fetching flashcard progress:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }

  /**
   * Format flashcard data for API submission
   * @param {Object} flashcardData - Raw flashcard data
   * @returns {FormData} Formatted data
   */
  formatFlashcardData(flashcardData) {
    const formData = new FormData();

    // Add basic fields
    Object.keys(flashcardData).forEach(key => {
      const value = flashcardData[key];
      
      if (key === 'front_image' && value instanceof File) {
        formData.append('front_image', value);
      } else if (key === 'back_image' && value instanceof File) {
        formData.append('back_image', value);
      } else if (key === 'tags' && Array.isArray(value)) {
        // Handle tags array
        value.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      } else if (value !== null && value !== undefined && value !== '') {
        // Handle other fields
        if (typeof value === 'object' && !Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    return formData;
  }
}

export default new AssessmentService();
