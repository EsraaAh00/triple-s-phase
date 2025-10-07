# Assessment System

نظام التقييمات الشامل لدعم Assignments, Quizzes, Exams, و Flashcards في نظام LMS.

## الميزات الرئيسية

### 🎯 أنواع التقييمات المدعومة
- **Assignments** - الواجبات
- **Quizzes** - الاختبارات القصيرة
- **Exams** - الامتحانات
- **Flashcards** - البطاقات التعليمية

### 📊 أنواع الأسئلة
- **MCQ** - أسئلة الاختيار من متعدد
- **True/False** - أسئلة صح/خطأ
- **Short Answer** - الإجابة القصيرة
- **Essay** - المقالات
- **Fill in the Blank** - ملء الفراغات
- **Matching** - المطابقة
- **Ordering** - الترتيب

## النماذج (Models)

### 1. Assessment
النموذج الرئيسي للتقييمات
```python
- title: عنوان التقييم
- type: نوع التقييم (assignment/quiz/exam/flashcard)
- status: الحالة (draft/published/archived)
- start_date/end_date: تواريخ البداية والنهاية
- duration_minutes: المدة بالدقائق
- total_marks: إجمالي الدرجات
- passing_marks: درجات النجاح
- is_randomized: عشوائية الأسئلة
- allow_multiple_attempts: السماح بمحاولات متعددة
```

### 2. QuestionBank
بنك الأسئلة القابل لإعادة الاستخدام
```python
- question_text: نص السؤال
- question_type: نوع السؤال
- difficulty_level: مستوى الصعوبة
- options: الخيارات (للمتعدد)
- correct_answer: الإجابة الصحيحة
- explanation: الشرح
- tags: العلامات
- lesson: الدرس المرتبط (اختياري)
- image/audio/video: الوسائط
```

### 3. AssessmentQuestions
ربط الأسئلة بالتقييمات
```python
- assessment: التقييم
- question: السؤال
- marks_allocated: الدرجات المخصصة
- order: ترتيب السؤال
```

### 4. StudentSubmission
تقديمات الطلاب
```python
- student: الطالب
- assessment: التقييم
- status: الحالة (in_progress/submitted/graded/late)
- attempt_number: رقم المحاولة
- total_score: إجمالي النقاط
- percentage: النسبة المئوية
- is_passed: نجح أم لا
```

### 5. StudentAnswer
إجابات الطلاب
```python
- submission: التقديم
- question: السؤال
- answer_text: نص الإجابة
- selected_options: الخيارات المختارة
- is_correct: صحيح أم لا
- marks_obtained: النقاط المحصلة
- is_auto_graded: تم التصحيح تلقائياً
```

### 6. Flashcard
البطاقات التعليمية
```python
- front_text: النص الأمامي
- back_text: النص الخلفي
- related_question: السؤال المرتبط
- front_image/back_image: الصور
```

### 7. StudentFlashcardProgress
تتبع تقدم الطلاب مع البطاقات
```python
- student: الطالب
- flashcard: البطاقة
- times_reviewed: عدد المراجعات
- correct_count: عدد الإجابات الصحيحة
- accuracy_rate: معدل الدقة
```

## API Endpoints

### Assessments
- `GET /api/assessment/assessments/` - قائمة التقييمات
- `POST /api/assessment/assessments/` - إنشاء تقييم جديد
- `GET /api/assessment/assessments/{id}/` - تفاصيل التقييم
- `PUT /api/assessment/assessments/{id}/` - تحديث التقييم
- `DELETE /api/assessment/assessments/{id}/` - حذف التقييم
- `GET /api/assessment/assessments/{id}/questions/` - أسئلة التقييم
- `POST /api/assessment/assessments/{id}/add_question/` - إضافة سؤال
- `DELETE /api/assessment/assessments/{id}/remove_question/` - إزالة سؤال
- `GET /api/assessment/assessments/{id}/submissions/` - تقديمات التقييم
- `GET /api/assessment/assessments/{id}/stats/` - إحصائيات التقييم

### Question Bank
- `GET /api/assessment/questions/` - قائمة الأسئلة
- `POST /api/assessment/questions/` - إنشاء سؤال جديد
- `GET /api/assessment/questions/{id}/` - تفاصيل السؤال
- `GET /api/assessment/questions/by_type/` - أسئلة حسب النوع
- `GET /api/assessment/questions/by_difficulty/` - أسئلة حسب الصعوبة
- `GET /api/assessment/questions/stats/` - إحصائيات بنك الأسئلة

### Student Submissions
- `GET /api/assessment/submissions/` - قائمة التقديمات
- `GET /api/assessment/submissions/{id}/` - تفاصيل التقديم
- `POST /api/assessment/submissions/{id}/submit_assessment/` - تقديم التقييم
- `POST /api/assessment/submissions/{id}/grade/` - تصحيح التقديم
- `GET /api/assessment/submissions/my_submissions/` - تقديماتي

### Flashcards
- `GET /api/assessment/flashcards/` - قائمة البطاقات
- `POST /api/assessment/flashcards/` - إنشاء بطاقة جديدة
- `POST /api/assessment/flashcards/{id}/review/` - مراجعة البطاقة
- `GET /api/assessment/flashcard-progress/my_progress/` - تقدمي مع البطاقات

## الاستخدام

### إنشاء تقييم جديد
```python
# إنشاء تقييم
assessment_data = {
    "title": "اختبار الرياضيات",
    "description": "اختبار في الجبر والهندسة",
    "type": "quiz",
    "status": "published",
    "start_date": "2024-01-15T09:00:00Z",
    "end_date": "2024-01-15T11:00:00Z",
    "duration_minutes": 120,
    "total_marks": 100,
    "passing_marks": 60,
    "course": 1,
    "questions": [
        {"question_id": 1, "marks_allocated": 20, "order": 1},
        {"question_id": 2, "marks_allocated": 30, "order": 2},
        {"question_id": 3, "marks_allocated": 50, "order": 3}
    ]
}
```

### إنشاء سؤال جديد
```python
# سؤال اختيار من متعدد
question_data = {
    "question_text": "ما هو ناتج 2 + 2؟",
    "question_type": "mcq",
    "difficulty_level": "easy",
    "options": ["3", "4", "5", "6"],
    "correct_answer": "[1]",  # الفهرس الثاني (4)
    "explanation": "2 + 2 = 4",
    "tags": ["رياضيات", "جمع", "مبتدئ"]
}
```

### تقديم إجابة
```python
# تقديم إجابة على سؤال
answer_data = {
    "question": 1,
    "selected_options": [1],  # اختيار الخيار الثاني
    "time_spent_seconds": 30
}
```

## الميزات المتقدمة

### التصحيح التلقائي
- يدعم التصحيح التلقائي لأسئلة MCQ و True/False
- حساب النقاط تلقائياً
- تحديث حالة التقديم

### إحصائيات شاملة
- إحصائيات التقييمات
- إحصائيات بنك الأسئلة
- تتبع تقدم الطلاب
- معدلات النجاح

### الأمان والصلاحيات
- فلترة البيانات حسب دور المستخدم
- الطلاب يرون فقط التقييمات المنشورة
- المعلمون يرون تقييماتهم فقط
- حماية من التلاعب في النتائج

## التكامل مع النظام

### ربط مع الدورات
- كل تقييم مرتبط بدورة
- إمكانية الوصول للطلاب المسجلين فقط

### ربط مع المستخدمين
- دعم أدوار مختلفة (طالب، معلم، إداري)
- تتبع منشئ التقييم
- تتبع مصحح التقديمات

### دعم الوسائط
- صور للأسئلة
- ملفات صوتية
- ملفات فيديو
- صور للبطاقات التعليمية

## التطوير المستقبلي

- [ ] دعم أسئلة الرسم
- [ ] دعم الأسئلة التفاعلية
- [ ] تحليلات متقدمة
- [ ] دعم التقييمات الجماعية
- [ ] دعم التقييمات المكيفة
- [ ] دعم التقييمات بالذكاء الاصطناعي

## العلاقات (Relationships)

### 1. Course → Assessment (1:N)
- كل دورة يمكن أن تحتوي على عدة تقييمات
- Assessment.course_id → Course.id

### 2. Lesson → QuestionBank (1:N)
- كل درس يمكن أن يحتوي على عدة أسئلة
- QuestionBank.lesson_id → Lesson.id

### 3. Assessment → StudentSubmission (1:N)
- كل تقييم يمكن أن يكون له عدة تقديمات من طلاب مختلفين
- StudentSubmission.assessment_id → Assessment.id

### 4. StudentSubmission → StudentAnswer (1:N)
- كل تقديم يحتوي على عدة إجابات
- StudentAnswer.submission_id → StudentSubmission.id

### 5. QuestionBank → StudentAnswer (1:N)
- كل سؤال يمكن أن يكون له عدة إجابات من طلاب مختلفين
- StudentAnswer.question_id → QuestionBank.id

### 6. Assessment ↔ QuestionBank (N:M)
- علاقة many-to-many عبر AssessmentQuestions
- AssessmentQuestions.assessment_id → Assessment.id
- AssessmentQuestions.question_id → QuestionBank.id

### 7. User → Flashcard (1:N)
- كل مستخدم يمكن أن ينشئ عدة بطاقات تعليمية
- Flashcard.created_by → User.id

### 8. Flashcard → StudentFlashcardProgress (1:N)
- كل بطاقة يمكن أن يكون لها تقدم من عدة طلاب
- StudentFlashcardProgress.flashcard_id → Flashcard.id
