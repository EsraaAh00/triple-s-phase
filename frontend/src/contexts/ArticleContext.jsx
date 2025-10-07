import React, { createContext, useContext, useState } from 'react';

const ArticleContext = createContext();

export const useArticle = () => {
    const context = useContext(ArticleContext);
    if (!context) {
        throw new Error('useArticle must be used within an ArticleProvider');
    }
    return context;
};

export const ArticleProvider = ({ children }) => {
    const [selectedArticleData, setSelectedArticleData] = useState(null);
    const [articlesCache, setArticlesCache] = useState(new Map());

    // Save article data to context (like shared preferences)
    const saveArticleData = (articleData) => {
        console.log('💾 Saving article data to context:', articleData);
        setSelectedArticleData(articleData);

        // Also cache it by ID for quick access
        if (articleData?.id) {
            setArticlesCache(prev => new Map(prev.set(articleData.id, articleData)));
        }
    };

    // Get article data by ID
    const getArticleById = (articleId) => {
        console.log('🔍 Getting article by ID:', articleId);
        return articlesCache.get(articleId) || selectedArticleData;
    };

    // Clear selected article data
    const clearArticleData = () => {
        console.log('🗑️ Clearing article data from context');
        setSelectedArticleData(null);
    };

    // Check if article data exists for given ID
    const hasArticleData = (articleId) => {
        return articlesCache.has(articleId) || (selectedArticleData?.id === articleId);
    };

    const value = {
        selectedArticleData,
        articlesCache,
        saveArticleData,
        getArticleById,
        clearArticleData,
        hasArticleData
    };

    return (
        <ArticleContext.Provider value={value}>
            {children}
        </ArticleContext.Provider>
    );
};

export default ArticleContext;
