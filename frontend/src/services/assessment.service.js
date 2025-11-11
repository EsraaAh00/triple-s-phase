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
  
  // Product APIs
  QUESTION_BANK_PRODUCTS: '/api/assessment/question-bank-products/',
  QUESTION_BANK_PRODUCT_DETAIL: (id) => `/api/assessment/question-bank-products/${id}/`,
  QUESTION_BANK_ENROLLMENTS: '/api/assessment/question-bank-enrollments/',
  
  FLASHCARD_PRODUCTS: '/api/assessment/flashcard-products/',
  FLASHCARD_PRODUCT_DETAIL: (id) => `/api/assessment/flashcard-products/${id}/`,
  FLASHCARD_ENROLLMENTS: '/api/assessment/flashcard-enrollments/',
  
  // Chapter and Topic APIs
  QUESTION_BANK_CHAPTERS: '/api/assessment/question-bank-chapters/',
  QUESTION_BANK_CHAPTER_DETAIL: (id) => `/api/assessment/question-bank-chapters/${id}/`,
  QUESTION_BANK_TOPICS: '/api/assessment/question-bank-topics/',
  QUESTION_BANK_TOPIC_DETAIL: (id) => `/api/assessment/question-bank-topics/${id}/`,
  QUESTION_BANK_TOPIC_TEMPLATE: '/api/assessment/question-bank-topics/excel_template/',
  
  FLASHCARD_CHAPTERS: '/api/assessment/flashcard-chapters/',
  FLASHCARD_CHAPTER_DETAIL: (id) => `/api/assessment/flashcard-chapters/${id}/`,
  FLASHCARD_TOPICS: '/api/assessment/flashcard-topics/',
  FLASHCARD_TOPIC_DETAIL: (id) => `/api/assessment/flashcard-topics/${id}/`,
  FLASHCARD_TOPIC_TEMPLATE: '/api/assessment/flashcard-topics/excel_template/',
  
  // Enrollment Status API
  ENROLLMENT_STATUS: '/api/assessment/enrollment-status/',
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
      formData.append('product', questionData.product || '');
      formData.append('topic', questionData.topic || '');
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
      formData.append('product', questionData.product || '');
      formData.append('topic', questionData.topic || '');
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
    console.log('formatQuestionData - Input formData:', formData);
    
    const formattedData = {
      question_text: formData.question_text,
      question_type: formData.question_type,
      difficulty_level: formData.difficulty_level,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation || '',
      tags: formData.tags || [],
      product: formData.product || null,
      topic: formData.topic || null
    };
    
    console.log('formatQuestionData - Output formattedData:', formattedData);
    console.log('formatQuestionData - Product ID:', formattedData.product);
    console.log('formatQuestionData - Topic ID:', formattedData.topic);

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

  /**
   * Generic helper to build FormData for product create/update
   */
  makeFormData(data) {
    const formData = new FormData();
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (key === 'image' && value instanceof File) {
        formData.append('image', value);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          formData.append(`${key}[${idx}]`, item);
        });
        return;
      }
      formData.append(key, value);
    });
    return formData;
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

  // ==================== PRODUCTS ====================
  
  /**
   * Get all question bank products
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products data with pagination
   */
  async getQuestionBankProducts(params = {}) {
    try {
      const response = await api.get(ASSESSMENT_API.QUESTION_BANK_PRODUCTS, { params });
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
      console.error('Error fetching question bank products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch question bank products'
      };
    }
  }

  /**
   * Get question bank product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getQuestionBankProduct(id) {
    try {
      const response = await api.get(ASSESSMENT_API.QUESTION_BANK_PRODUCT_DETAIL(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching question bank product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch question bank product'
      };
    }
  }

  /**
   * Create new question bank product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product data
   */
  async createQuestionBankProduct(productData) {
    try {
      const formData = new FormData();
      Object.entries(productData || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => formData.append(`${key}[${idx}]`, item));
        } else {
          formData.append(key, value);
        }
      });
      const response = await api.post(ASSESSMENT_API.QUESTION_BANK_PRODUCTS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating question bank product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create question bank product'
      };
    }
  }

  /**
   * Update question bank product
   * @param {number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  async updateQuestionBankProduct(id, productData) {
    try {
      const formData = new FormData();
      Object.entries(productData || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => formData.append(`${key}[${idx}]`, item));
        } else {
          formData.append(key, value);
        }
      });
      const response = await api.put(ASSESSMENT_API.QUESTION_BANK_PRODUCT_DETAIL(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating question bank product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update question bank product'
      };
    }
  }

  /**
   * Delete question bank product
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteQuestionBankProduct(id) {
    try {
      await api.delete(ASSESSMENT_API.QUESTION_BANK_PRODUCT_DETAIL(id));
      return {
        success: true,
        message: 'Question bank product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting question bank product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete question bank product'
      };
    }
  }

  /**
   * Get all flashcard products
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Products data with pagination
   */
  async getFlashcardProducts(params = {}) {
    try {
      const response = await api.get(ASSESSMENT_API.FLASHCARD_PRODUCTS, { params });
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
      console.error('Error fetching flashcard products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch flashcard products'
      };
    }
  }

  /**
   * Get flashcard product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  async getFlashcardProduct(id) {
    try {
      const response = await api.get(ASSESSMENT_API.FLASHCARD_PRODUCT_DETAIL(id));
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching flashcard product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch flashcard product'
      };
    }
  }

  /**
   * Create new flashcard product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product data
   */
  async createFlashcardProduct(productData) {
    try {
      const formData = new FormData();
      Object.entries(productData || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => formData.append(`${key}[${idx}]`, item));
        } else {
          formData.append(key, value);
        }
      });
      const response = await api.post(ASSESSMENT_API.FLASHCARD_PRODUCTS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating flashcard product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create flashcard product'
      };
    }
  }

  /**
   * Update flashcard product
   * @param {number} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  async updateFlashcardProduct(id, productData) {
    try {
      const formData = new FormData();
      Object.entries(productData || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'image' && value instanceof File) {
          formData.append('image', value);
        } else if (Array.isArray(value)) {
          value.forEach((item, idx) => formData.append(`${key}[${idx}]`, item));
        } else {
          formData.append(key, value);
        }
      });
      const response = await api.put(ASSESSMENT_API.FLASHCARD_PRODUCT_DETAIL(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating flashcard product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update flashcard product'
      };
    }
  }

  /**
   * Delete flashcard product
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFlashcardProduct(id) {
    try {
      await api.delete(ASSESSMENT_API.FLASHCARD_PRODUCT_DETAIL(id));
      return {
        success: true,
        message: 'Flashcard product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting flashcard product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete flashcard product'
      };
    }
  }

  // ==================== CHAPTERS ====================
  
  /**
   * Get chapters for a product
   * @param {number} productId - Product ID
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Chapters data
   */
  async getChapters(productId, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_CHAPTERS
        : ASSESSMENT_API.FLASHCARD_CHAPTERS;
      
      const response = await api.get(endpoint, { params: { product: productId, page_size: 1000 } });
      
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch chapters'
      };
    }
  }

  /**
   * Create new chapter
   * @param {Object} chapterData - Chapter data
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Created chapter data
   */
  async createChapter(chapterData, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_CHAPTERS
        : ASSESSMENT_API.FLASHCARD_CHAPTERS;
      
      const response = await api.post(endpoint, chapterData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating chapter:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create chapter'
      };
    }
  }

  /**
   * Update chapter
   * @param {number} id - Chapter ID
   * @param {Object} chapterData - Updated chapter data
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Updated chapter data
   */
  async updateChapter(id, chapterData, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_CHAPTER_DETAIL(id)
        : ASSESSMENT_API.FLASHCARD_CHAPTER_DETAIL(id);
      
      const response = await api.put(endpoint, chapterData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating chapter:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update chapter'
      };
    }
  }

  /**
   * Delete chapter
   * @param {number} id - Chapter ID
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Deletion result
   */
  async deleteChapter(id, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_CHAPTER_DETAIL(id)
        : ASSESSMENT_API.FLASHCARD_CHAPTER_DETAIL(id);
      
      await api.delete(endpoint);
      return {
        success: true,
        message: 'Chapter deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete chapter'
      };
    }
  }

  // ==================== TOPICS ====================
  
  /**
   * Get topics for a chapter
   * @param {number} chapterId - Chapter ID
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Topics data
   */
  async getTopics(chapterId, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_TOPICS
        : ASSESSMENT_API.FLASHCARD_TOPICS;
      
      const response = await api.get(endpoint, { 
        params: { chapter: chapterId, page_size: 1000 } 
      });
      
      return {
        success: true,
        data: response.data.results || response.data
      };
    } catch (error) {
      console.error('Error fetching topics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch topics'
      };
    }
  }

  /**
   * Create new topic
   * @param {Object} topicData - Topic data
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Created topic data
   */
  async createTopic(topicData, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_TOPICS
        : ASSESSMENT_API.FLASHCARD_TOPICS;
      
      const response = await api.post(endpoint, topicData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating topic:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create topic'
      };
    }
  }

  /**
   * Update topic
   * @param {number} id - Topic ID
   * @param {Object} topicData - Updated topic data
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Updated topic data
   */
  async updateTopic(id, topicData, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_TOPIC_DETAIL(id)
        : ASSESSMENT_API.FLASHCARD_TOPIC_DETAIL(id);
      
      const response = await api.put(endpoint, topicData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating topic:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update topic'
      };
    }
  }

  /**
   * Delete topic
   * @param {number} id - Topic ID
   * @param {string} type - Type ('questionbank' or 'flashcard')
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTopic(id, type) {
    try {
      const endpoint = type === 'questionbank' 
        ? ASSESSMENT_API.QUESTION_BANK_TOPIC_DETAIL(id)
        : ASSESSMENT_API.FLASHCARD_TOPIC_DETAIL(id);
      
      await api.delete(endpoint);
      return {
        success: true,
        message: 'Topic deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting topic:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete topic'
      };
    }
  }

  // ==================== ENROLLMENT STATUS ====================
  
  /**
   * Check enrollment status for Question Bank and Flashcards
   * @returns {Promise<Object>} Enrollment status data
   */
  async checkEnrollmentStatus() {
    try {
      const response = await api.get(ASSESSMENT_API.ENROLLMENT_STATUS);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check enrollment status',
        data: {
          questionBank: { is_enrolled: false, enrollments_count: 0 },
          flashcards: { is_enrolled: false, enrollments_count: 0 }
        }
      };
    }
  }

  // ==================== IMPORT EXCEL ====================
  
  /**
   * Import questions from Excel file into a topic
   * @param {number} topicId - Topic ID
   * @param {File} file - Excel file
   * @returns {Promise<Object>} Import result
   */
  async importQuestionsExcel(topicId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(
        `${ASSESSMENT_API.QUESTION_BANK_TOPIC_DETAIL(topicId)}import_excel/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error importing questions from Excel:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Import flashcards from Excel file into a topic
   * @param {number} topicId - Topic ID
   * @param {File} file - Excel file
   * @returns {Promise<Object>} Import result
   */
  async importFlashcardsExcel(topicId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(
        `${ASSESSMENT_API.FLASHCARD_TOPIC_DETAIL(topicId)}import_excel/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error importing flashcards from Excel:', error);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Download Question Bank Excel template
   * @returns {Promise<Blob>} Excel blob
   */
  async downloadQuestionTemplate() {
    try {
      const response = await api.get(ASSESSMENT_API.QUESTION_BANK_TOPIC_TEMPLATE, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Download Flashcards Excel template
   * @returns {Promise<Blob>} Excel blob
   */
  async downloadFlashcardTemplate() {
    try {
      const response = await api.get(ASSESSMENT_API.FLASHCARD_TOPIC_TEMPLATE, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

export default new AssessmentService();
