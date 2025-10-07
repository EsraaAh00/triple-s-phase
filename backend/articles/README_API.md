# Articles API Documentation

## نظرة عامة
هذا التوثيق يوضح كيفية استخدام API المقالات في نظام إدارة التعلم (LMS).

## النقاط النهائية (Endpoints)

### 1. المقالات (Articles)

#### الحصول على جميع المقالات
```
GET /articles/articles/
```

**المعاملات (Parameters):**
- `page`: رقم الصفحة (افتراضي: 1)
- `page_size`: عدد العناصر في الصفحة (افتراضي: 10)
- `search`: البحث في العنوان والمحتوى والملخص
- `status`: حالة المقالة (published, draft, archived)
- `featured`: المقالات المميزة (true/false)
- `ordering`: ترتيب النتائج (-created_at, created_at, -views_count)

**مثال:**
```
GET /articles/articles/?status=published&featured=true&ordering=-created_at
```

#### الحصول على مقالة واحدة
```
GET /articles/articles/{id}/
```

#### إنشاء مقالة جديدة
```
POST /articles/articles/
```

**البيانات المطلوبة:**
```json
{
  "title": "عنوان المقالة",
  "content": "محتوى المقالة",
  "summary": "ملخص المقالة",
  "status": "draft",
  "featured": false,
  "allow_comments": true,
  "meta_description": "وصف SEO",
  "meta_keywords": "كلمات مفتاحية",
  "tags": ["tag1", "tag2"],
  "image": "ملف الصورة"
}
```

#### تحديث مقالة
```
PATCH /articles/articles/{id}/
```

#### حذف مقالة
```
DELETE /articles/articles/{id}/
```

### 2. المقالات المميزة
```
GET /articles/featured/
```

### 3. المقالات الحديثة
```
GET /articles/recent/
```

### 4. المقالات الشائعة
```
GET /articles/popular/
```

### 5. البحث في المقالات
```
GET /articles/search/?q=كلمة البحث
```

### 6. التعليقات (Comments)

#### الحصول على تعليقات مقالة
```
GET /articles/comments/?article={article_id}
```

#### إنشاء تعليق جديد
```
POST /articles/comments/
```

**البيانات المطلوبة:**
```json
{
  "article": 1,
  "content": "محتوى التعليق"
}
```

### 7. التفاعلات (Interactions)

#### الإعجاب بمقالة
```
POST /articles/articles/{id}/likes/
```

#### إلغاء الإعجاب
```
POST /articles/articles/{id}/unlikes/
```

#### إضافة إلى المفضلة
```
POST /articles/articles/{id}/bookmarks/
```

**البيانات المطلوبة:**
```json
{
  "notes": "ملاحظات إضافية"
}
```

#### إزالة من المفضلة
```
DELETE /articles/articles/{id}/bookmarks/
```

#### تقييم مقالة
```
POST /articles/articles/{id}/ratings/
```

**البيانات المطلوبة:**
```json
{
  "rating": 5,
  "comment": "تعليق على التقييم"
}
```

### 8. التصنيفات (Categories)
```
GET /articles/categories/
```

## أمثلة الاستخدام

### إنشاء مقالة جديدة
```javascript
const formData = new FormData();
formData.append('title', 'عنوان المقالة');
formData.append('content', 'محتوى المقالة');
formData.append('summary', 'ملخص المقالة');
formData.append('status', 'draft');
formData.append('featured', false);
formData.append('allow_comments', true);
formData.append('meta_description', 'وصف SEO');
formData.append('meta_keywords', 'كلمات مفتاحية');
formData.append('tags', 'tag1');
formData.append('tags', 'tag2');
formData.append('image', imageFile);

const response = await fetch('/articles/articles/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### الحصول على المقالات المنشورة
```javascript
const response = await fetch('/articles/articles/?status=published&ordering=-created_at');
const articles = await response.json();
```

## رموز الحالة (Status Codes)

- `200`: نجح الطلب
- `201`: تم إنشاء العنصر بنجاح
- `400`: خطأ في البيانات المرسلة
- `401`: غير مصرح (يحتاج تسجيل دخول)
- `403`: محظور (لا يملك الصلاحيات)
- `404`: العنصر غير موجود
- `500`: خطأ في الخادم

## ملاحظات مهمة

1. **المصادقة**: معظم العمليات تتطلب تسجيل دخول صالح
2. **الصلاحيات**: المعلمون يمكنهم الوصول لجميع المقالات، بينما المستخدمون العاديون يرون فقط المقالات المنشورة
3. **الملفات**: عند رفع الصور، استخدم `multipart/form-data`
4. **الترقيم**: النتائج مرقمة افتراضياً بـ 10 عناصر في الصفحة
5. **البحث**: البحث يتم في العنوان والمحتوى والملخص
6. **الترتيب**: يمكن ترتيب النتائج حسب تاريخ الإنشاء أو عدد المشاهدات

## استكشاف الأخطاء

### خطأ 400 - بيانات غير صحيحة
تأكد من أن جميع الحقول المطلوبة موجودة وصحيحة.

### خطأ 401 - غير مصرح
تأكد من إرسال token المصادقة في header:
```
Authorization: Bearer <your_token>
```

### خطأ 403 - محظور
تأكد من أن المستخدم يملك الصلاحيات المطلوبة للعملية.

### خطأ 500 - خطأ في الخادم
تحقق من سجلات الخادم للحصول على تفاصيل الخطأ.
