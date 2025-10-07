# Triple S Academy - Frontend

## Local Development Setup / إعداد التطوير المحلي

### Quick Start / البدء السريع

1. **Setup local environment / إعداد البيئة المحلية:**
```bash
npm run setup:local
```

2. **Start development server / بدء خادم التطوير:**
```bash
npm run dev:local
```

3. **Or manually / أو يدوياً:**
```bash
npm run dev
```

### Environment Configuration / إعداد البيئة

The application automatically detects development mode and connects to `http://localhost:8000` for the backend API.

التطبيق يكتشف تلقائياً وضع التطوير ويتصل بـ `http://localhost:8000` لـ API الخاص بالـ backend.

#### Manual Configuration / الإعداد اليدوي

Create `.env.local` file in the frontend directory:
أنشئ ملف `.env.local` في مجلد frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_DEV_MODE=true
VITE_DEBUG=true
```

### Available Scripts / الأوامر المتاحة

- `npm run dev` - Start development server
- `npm run dev:local` - Setup local environment and start dev server
- `npm run setup:local` - Setup local environment only
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### API Configuration / إعداد الـ API

The application uses Vite proxy configuration to route API calls to the backend. All API calls are automatically proxied to the configured backend URL.

يستخدم التطبيق إعداد Vite proxy لتوجيه استدعاءات الـ API إلى الـ backend. جميع استدعاءات الـ API يتم توجيهها تلقائياً إلى رابط الـ backend المُعد.

For detailed setup instructions, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)
للحصول على تعليمات الإعداد التفصيلية، راجع [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)


Here are all the quiz-related routes we've created in the application:

Teacher Routes:
Create Quiz
/teacher/courses/[courseId]/quizzes/create
Renders: 
pages/teacher/quizzes/create.jsx
e:\projects\LMS-Osama\frontend\src\pages\teacher\quizzes\create.jsx
Edit Quiz
/teacher/courses/[courseId]/quizzes/[id]/edit
Renders: pages/teacher/quizzes/edit/[id].jsx
Quiz Details
/teacher/courses/[courseId]/quizzes/[id]
Renders: pages/teacher/quizzes/[id].jsx
Quiz Attempts List
/teacher/courses/[courseId]/quizzes/[id]/attempts
Renders: pages/teacher/quizzes/[id]/attempts/index.jsx
Quiz Attempt Review
/teacher/courses/[courseId]/quizzes/[id]/attempts/[attemptId]
Renders: pages/teacher/quizzes/[id]/attempts/[attemptId].jsx
Student Routes:
Quiz Attempt
/student/courses/[courseId]/quizzes/[id]
Renders: pages/student/quizzes/[id].jsx
Quiz Results
/student/courses/[courseId]/quizzes/results/[id]
Renders: pages/student/quizzes/results/[id].jsx
API Endpoints (used in components):
Teacher API Endpoints:
GET /api/teacher/quizzes/ - List all quizzes
GET /api/teacher/quizzes/[id] - Get quiz details
POST /api/teacher/quizzes/ - Create new quiz
PUT /api/teacher/quizzes/[id] - Update quiz
DELETE /api/teacher/quizzes/[id] - Delete quiz
GET /api/teacher/quizzes/[id]/attempts - List quiz attempts
GET /api/teacher/quizzes/[id]/attempts/[attemptId] - Get attempt details
POST /api/teacher/quizzes/[id]/attempts/[attemptId]/grade - Grade attempt
Student API Endpoints:
GET /api/student/quizzes/[id] - Get quiz for attempt
POST /api/student/quizzes/[id]/attempt - Start/Submit quiz attempt
GET /api/student/quizzes/attempts/[attemptId] - Get attempt details
GET /api/student/quizzes/results/[id] - Get quiz results
These routes cover the complete flow of quiz management for both teachers and students, including creation, editing, attempting, and reviewing quizzes.