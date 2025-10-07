import { useState, useEffect, useCallback } from 'react';
import assessmentService from '../services/assessment.service';

const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    totalCount: 0
  });

  // Fetch flashcards
  const fetchFlashcards = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await assessmentService.getFlashcards({
        page: pagination.page,
        page_size: pagination.pageSize,
        ...params
      });

      if (result.success) {
        setFlashcards(result.data);
        setPagination(prev => ({
          ...prev,
          ...result.pagination,
          totalCount: result.pagination.count
        }));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  // Create flashcard
  const createFlashcard = useCallback(async (flashcardData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await assessmentService.createFlashcard(flashcardData);
      
      if (result.success) {
        // Add the new flashcard to the list instead of refreshing
        setFlashcards(prev => [result.data, ...prev]);
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

  // Update flashcard
  const updateFlashcard = useCallback(async (id, flashcardData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await assessmentService.updateFlashcard(id, flashcardData);
      
      if (result.success) {
        // Update the flashcard in the list
        setFlashcards(prev => 
          prev.map(flashcard => 
            flashcard.id === id ? result.data : flashcard
          )
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

  // Delete flashcard
  const deleteFlashcard = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await assessmentService.deleteFlashcard(id);
      
      if (result.success) {
        // Remove the flashcard from the list
        setFlashcards(prev => prev.filter(flashcard => flashcard.id !== id));
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

  // Get flashcard by ID
  const getFlashcard = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await assessmentService.getFlashcard(id);
      
      if (result.success) {
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

  // Review flashcard
  const reviewFlashcard = useCallback(async (id, reviewData) => {
    try {
      const result = await assessmentService.reviewFlashcard(id, reviewData);
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Pagination functions
  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const goToNextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.page]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load flashcards on mount
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    flashcards,
    loading,
    error,
    pagination,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    getFlashcard,
    reviewFlashcard,
    setPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    clearError
  };
};

export default useFlashcards;
