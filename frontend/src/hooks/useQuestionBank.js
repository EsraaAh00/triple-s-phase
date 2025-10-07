import { useState, useEffect, useCallback } from 'react';
import assessmentService from '../services/assessment.service';

const useQuestionBank = () => {
  // ==================== STATE ====================
  const [questions, setQuestions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0
  });

  // ==================== QUESTIONS ====================

  const fetchQuestions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('useQuestionBank: Token exists:', !!token);
      
      const queryParams = {
        page: pagination.page,
        page_size: pagination.pageSize,
        ...params
      };

      const result = await assessmentService.getQuestions(queryParams);
      
      if (result.success) {
        setQuestions(result.data);
        setPagination(prev => ({
          ...prev,
          ...result.pagination,
          page: result.pagination.page || prev.page
        }));
      } else {
        setError(result.error);
        setQuestions([]);
      }
    } catch (err) {
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  const fetchQuestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await assessmentService.getQuestion(id);
      
      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuestion = useCallback(async (questionData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate data
      const validation = assessmentService.validateQuestionData(questionData);
      if (!validation.isValid) {
        setError(validation.errors);
        return { success: false, error: validation.errors };
      }

      // Format data
      const formattedData = assessmentService.formatQuestionData(questionData);
      
      const result = await assessmentService.createQuestion(formattedData);
      
      if (result.success) {
        // Refresh questions list
        await fetchQuestions();
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchQuestions]);

  const updateQuestion = useCallback(async (id, questionData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate data
      const validation = assessmentService.validateQuestionData(questionData);
      if (!validation.isValid) {
        setError(validation.errors);
        return { success: false, error: validation.errors };
      }

      // Format data
      const formattedData = assessmentService.formatQuestionData(questionData);
      
      const result = await assessmentService.updateQuestion(id, formattedData);
      
      if (result.success) {
        // Update local state
        setQuestions(prev => 
          prev.map(q => q.id === id ? result.data : q)
        );
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await assessmentService.deleteQuestion(id);
      
      if (result.success) {
        // Remove from local state
        setQuestions(prev => prev.filter(q => q.id !== id));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteQuestions = useCallback(async (questionIds) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await assessmentService.bulkDeleteQuestions(questionIds);
      
      if (result.success) {
        // Remove from local state
        setQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
        return { success: true, message: result.message };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== SEARCH AND FILTERS ====================

  const searchQuestions = useCallback(async (searchTerm, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = {
        search: searchTerm,
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const result = await assessmentService.searchQuestions(searchParams);
      
      if (result.success) {
        setQuestions(result.data);
        setPagination(prev => ({
          ...prev,
          ...result.pagination,
          page: result.pagination.page || prev.page
        }));
      } else {
        setError(result.error);
        setQuestions([]);
      }
    } catch (err) {
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  const filterQuestions = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize
      };

      const result = await assessmentService.filterQuestions(filterParams);
      
      if (result.success) {
        setQuestions(result.data);
        setPagination(prev => ({
          ...prev,
          ...result.pagination,
          page: result.pagination.page || prev.page
        }));
      } else {
        setError(result.error);
        setQuestions([]);
      }
    } catch (err) {
      setError(err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  // ==================== COURSES AND LESSONS ====================


  const fetchLessons = useCallback(async (courseId = null) => {
    try {
      console.log('Fetching lessons...', courseId);
      const result = await assessmentService.getLessons(courseId);
      console.log('Lessons result:', result);
      
      if (result.success) {
        console.log('Lessons data:', result.data);
        setLessons(result.data || []);
      } else {
        console.error('Error fetching lessons:', result.error);
        setLessons([]);
      }
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setLessons([]);
    }
  }, []);

  // ==================== STATISTICS ====================

  const fetchStats = useCallback(async () => {
    try {
      const result = await assessmentService.getQuestionStats();
      
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Error fetching stats:', result.error);
        setStats(null);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(null);
    }
  }, []);

  // ==================== PAGINATION ====================

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const goToNextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, setPage]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      setPage(pagination.page - 1);
    }
  }, [pagination.page, setPage]);

  // ==================== EFFECTS ====================

  // Fetch questions when page or pageSize changes
  useEffect(() => {
    console.log('useQuestionBank: Fetching questions on mount');
    fetchQuestions();
  }, [fetchQuestions]);

  // Fetch lessons and stats on mount
  useEffect(() => {
    console.log('useQuestionBank: Fetching lessons and stats on mount');
    fetchLessons();
    fetchStats();
  }, [fetchLessons, fetchStats]);

  // ==================== RETURN ====================

  return {
    // Data
    questions,
    lessons,
    stats,
    pagination,
    
    // Loading states
    loading,
    error,
    
    // Question operations
    fetchQuestions,
    fetchQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkDeleteQuestions,

    // Search and filter
    searchQuestions,
    filterQuestions,
    
    // Pagination
    setPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,

    // Utility
    clearError: () => setError(null)
  };
};

export default useQuestionBank;