// Static data for quiz-related pages
export const quizData = {
  courseId: 'course-123',
  courseTitle: 'دورة الرياضيات المتقدمة',
  quizzes: [
    {
      id: 'quiz-1',
      title: 'امتحان الفصل الأول',
      description: 'امتحان شامل على الفصل الأول من المقرر',
      duration: 60, // minutes
      questionCount: 10,
      totalPoints: 100,
      createdAt: '2025-07-15T10:00:00Z',
      updatedAt: '2025-07-15T10:00:00Z',
      isActive: true,
      questions: [
        {
          id: 'q1',
          text: 'ما هو ناتج جمع 2+2؟',
          type: 'multiple_choice',
          points: 10,
          options: [
            { id: 'a1', text: '3', isCorrect: false },
            { id: 'a2', text: '4', isCorrect: true },
            { id: 'a3', text: '5', isCorrect: false },
          ]
        },
        // Add more questions as needed
      ]
    },
    // Add more quizzes as needed
  ],
  attempts: [
    {
      id: 'attempt-1',
      quizId: 'quiz-1',
      studentName: 'أحمد محمد',
      studentId: 'std-123',
      status: 'completed',
      score: 85,
      maxScore: 100,
      startedAt: '2025-07-20T10:00:00Z',
      submittedAt: '2025-07-20T10:45:00Z',
      answers: [
        {
          questionId: 'q1',
          answerId: 'a2',
          isCorrect: true,
          pointsAwarded: 10
        }
      ]
    }
    // Add more attempts as needed
  ]
};

export default quizData;
