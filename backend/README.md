# نظام الصلاحيات المخصصة - Custom Permissions System

## 📋 نظرة عامة

نظام الصلاحيات المخصصة هو تطبيق Django يوفر إدارة صلاحيات مفصلة ومخصصة للموقع التعليمي، بدلاً من نظام الصلاحيات الافتراضي في Django. يتيح لك تحديد صلاحيات محددة لكل مستخدم بناءً على وظائف الموقع.

## 🚀 الميزات الرئيسية

- **صلاحيات مخصصة**: إدارة صلاحيات مفصلة لكل وظيفة في الموقع
- **واجهة سهلة الاستخدام**: واجهة رسومية لاختيار الصلاحيات
- **مجموعات جاهزة**: مجموعات صلاحيات محددة مسبقاً للأدوار المختلفة
- **Decorators**: أدوات سهلة لحماية الـ views
- **Cache**: نظام cache لتحسين الأداء
- **اختبارات شاملة**: تغطية اختبارات كاملة للنظام

## 📁 هيكل المشروع

```
custom_permissions/
├── models.py              # نموذج الصلاحيات
├── views.py               # واجهات إدارة الصلاحيات
├── decorators.py          # أدوات حماية الـ views
├── admin.py               # واجهة الإدارة
├── urls.py                # مسارات URL
├── signals.py             # إشارات Django
├── apps.py                # إعدادات التطبيق
├── tests.py               # اختبارات النظام
├── examples.py            # أمثلة على الاستخدام
├── README.md              # توثيق النظام
├── requirements.txt       # متطلبات النظام
├── setup.py              # إعداد الحزمة
├── LICENSE               # رخصة النظام
├── CHANGELOG.md          # سجل التحديثات
├── Makefile              # أوامر النظام
├── docker-compose.yml    # إعداد Docker
├── Dockerfile            # ملف Docker
├── pytest.ini           # إعداد الاختبارات
├── env.example          # متغيرات البيئة
└── management/
    └── commands/
        └── create_permission_groups.py  # أمر إنشاء مجموعات صلاحيات
```

## 🔧 التثبيت والإعداد

### 1. متطلبات النظام

- Python 3.8+
- Django 4.0+
- PostgreSQL (موصى به) أو SQLite

### 2. التثبيت

```bash
# استنساخ المشروع
git clone <repository-url>
cd custom_permissions

# إنشاء بيئة افتراضية
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو
venv\Scripts\activate  # Windows

# تثبيت المتطلبات
pip install -r requirements.txt

# تشغيل الـ migrations
python manage.py makemigrations custom_permissions
python manage.py migrate

# إنشاء مستخدم مدير
python manage.py createsuperuser

# تشغيل الخادم
python manage.py runserver
```

### 3. إعداد Docker

```bash
# بناء وتشغيل الخدمات
docker-compose up --build

# تشغيل في الخلفية
docker-compose up -d
```

## 🎯 كيفية الاستخدام

### 1. إدارة الصلاحيات عبر الواجهة

1. اذهب إلى: `/admin/permissions/user-permissions/`
2. اختر المستخدم من القائمة المنسدلة
3. حدد الصلاحيات المطلوبة
4. اضغط "حفظ الصلاحيات"

### 2. استخدام Decorators لحماية الـ Views

```python
from custom_permissions.decorators import has_permission, has_any_permission

# صلاحية واحدة
@has_permission('view_articles')
def articles_list(request):
    # عرض المقالات
    pass

# عدة صلاحيات (أي واحدة)
@has_any_permission(['view_articles', 'edit_articles'])
def articles_management(request):
    # إدارة المقالات
    pass
```

### 3. التحقق من الصلاحيات في الكود

```python
from custom_permissions.models import CustomPermission

# التحقق من صلاحية واحدة
if CustomPermission.has_permission(request.user, 'view_articles'):
    # المستخدم لديه صلاحية عرض المقالات
    pass
```

### 4. إنشاء مجموعات صلاحيات جاهزة

```bash
# إنشاء صلاحيات معلم
python manage.py create_permission_groups --username teacher1 --role teacher

# إنشاء صلاحيات مدير محتوى
python manage.py create_permission_groups --username content_manager --role content_manager
```

## 📊 مجموعات الصلاحيات المتاحة

### 1. معلم (Teacher)
- إدارة كورساته الخاصة
- إدارة الدروس والوحدات
- إدارة الاختبارات والأسئلة

### 2. مدير محتوى (Content Manager)
- إدارة جميع الكورسات
- إدارة المحتوى التعليمي
- إدارة المقالات والتصنيفات

### 3. مدير المستخدمين (User Manager)
- إدارة المعلمين والطلاب
- إضافة وتعديل وحذف المستخدمين

### 4. مدير مالي (Financial Manager)
- إدارة الطلبات والمدفوعات
- إدارة الكوبونات والعروض

### 5. مدير عام (General Manager)
- جميع الصلاحيات
- إدارة كاملة للنظام

## 🔐 الصلاحيات المتاحة

### إدارة المستخدمين
- `view_instructors` - عرض المعلمين
- `add_instructors` - إضافة معلمين
- `edit_instructors` - تعديل المعلمين
- `delete_instructors` - حذف المعلمين
- `view_students` - عرض الطلاب
- `add_students` - إضافة طلاب
- `edit_students` - تعديل الطلاب
- `delete_students` - حذف الطلاب

### إدارة الكورسات
- `view_all_courses` - عرض جميع الكورسات
- `add_all_courses` - إضافة جميع الكورسات
- `edit_all_courses` - تعديل جميع الكورسات
- `delete_all_courses` - حذف جميع الكورسات
- `view_my_courses` - عرض كورساتي
- `add_my_courses` - إضافة كورساتي
- `edit_my_courses` - تعديل كورساتي
- `delete_my_courses` - حذف كورساتي

### إدارة المحتوى
- `view_lessons` - عرض الدروس
- `add_lessons` - إضافة دروس
- `edit_lessons` - تعديل الدروس
- `delete_lessons` - حذف الدروس
- `view_modules` - عرض الوحدات
- `add_modules` - إضافة وحدات
- `edit_modules` - تعديل الوحدات
- `delete_modules` - حذف الوحدات

### إدارة الاختبارات
- `view_quizzes` - عرض الاختبارات
- `add_quizzes` - إضافة اختبارات
- `edit_quizzes` - تعديل الاختبارات
- `delete_quizzes` - حذف الاختبارات
- `view_questions` - عرض الأسئلة
- `add_questions` - إضافة أسئلة
- `edit_questions` - تعديل الأسئلة
- `delete_questions` - حذف الأسئلة

### إدارة الطلبات والمدفوعات
- `view_orders` - عرض الطلبات
- `add_orders` - إضافة طلبات
- `edit_orders` - تعديل الطلبات
- `delete_orders` - حذف الطلبات
- `view_payments` - عرض المدفوعات
- `add_payments` - إضافة مدفوعات
- `edit_payments` - تعديل المدفوعات
- `delete_payments` - حذف المدفوعات
- `view_coupons` - عرض الكوبونات
- `add_coupons` - إضافة كوبونات
- `edit_coupons` - تعديل الكوبونات
- `delete_coupons` - حذف الكوبونات

### إدارة الشهادات
- `view_certificates` - عرض الشهادات
- `add_certificates` - إضافة شهادات
- `edit_certificates` - تعديل الشهادات
- `delete_certificates` - حذف الشهادات

### إدارة التقييمات
- `view_reviews` - عرض التقييمات
- `add_reviews` - إضافة تقييمات
- `edit_reviews` - تعديل التقييمات
- `delete_reviews` - حذف التقييمات

### إدارة اللافتات والإعدادات
- `view_banners` - عرض اللافتات
- `add_banners` - إضافة لافتات
- `edit_banners` - تعديل اللافتات
- `delete_banners` - حذف اللافتات
- `view_settings` - عرض الإعدادات
- `add_settings` - إضافة إعدادات
- `edit_settings` - تعديل الإعدادات
- `delete_settings` - حذف الإعدادات

### إدارة المحاضرات
- `view_meetings` - عرض المحاضرات
- `add_meetings` - إضافة محاضرات
- `edit_meetings` - تعديل المحاضرات
- `delete_meetings` - حذف المحاضرات

### إدارة المقالات
- `view_articles` - عرض المقالات
- `add_articles` - إضافة مقالات
- `edit_articles` - تعديل المقالات
- `delete_articles` - حذف المقالات
- `view_article_categories` - عرض تصنيفات المقالات
- `add_article_categories` - إضافة تصنيفات مقالات
- `edit_article_categories` - تعديل تصنيفات المقالات
- `delete_article_categories` - حذف تصنيفات المقالات
- `view_article_comments` - عرض تعليقات المقالات
- `add_article_comments` - إضافة تعليقات مقالات
- `edit_article_comments` - تعديل تعليقات المقالات
- `delete_article_comments` - حذف تعليقات المقالات

## 🛠️ أمثلة عملية

### مثال 1: حماية صفحة المقالات

```python
# views.py
from custom_permissions.decorators import has_permission

@has_permission('view_articles')
def articles_list(request):
    articles = Article.objects.all()
    return render(request, 'articles/list.html', {'articles': articles})

@has_permission('add_articles')
def add_article(request):
    if request.method == 'POST':
        # إضافة مقال جديد
        pass
    return render(request, 'articles/add.html')

@has_permission('edit_articles')
def edit_article(request, article_id):
    article = get_object_or_404(Article, id=article_id)
    # تعديل المقال
    pass
```

### مثال 2: التحقق من الصلاحيات في Template

```html
<!-- template.html -->
{% if user|has_permission:'view_articles' %}
    <a href="{% url 'articles:list' %}">عرض المقالات</a>
{% endif %}

{% if user|has_permission:'add_articles' %}
    <a href="{% url 'articles:add' %}">إضافة مقال</a>
{% endif %}
```

### مثال 3: إنشاء Template Filter

```python
# templatetags/permission_tags.py
from django import template
from custom_permissions.models import CustomPermission

register = template.Library()

@register.filter
def has_permission(user, permission_code):
    return CustomPermission.has_permission(user, permission_code)
```

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
# تشغيل جميع الاختبارات
python manage.py test custom_permissions

# تشغيل اختبارات محددة
python manage.py test custom_permissions.tests.CustomPermissionsTestCase

# تشغيل الاختبارات مع تغطية الكود
coverage run --source=custom_permissions manage.py test custom_permissions
coverage report
coverage html
```

### أنواع الاختبارات

- **Unit Tests**: اختبارات الوحدات الفردية
- **Integration Tests**: اختبارات التكامل
- **Permission Tests**: اختبارات الصلاحيات
- **View Tests**: اختبارات الواجهات

## 🔧 التخصيص

### إضافة صلاحيات جديدة

1. أضف الصلاحية الجديدة إلى `PERMISSION_CHOICES` في `models.py`
2. شغل الـ migration: `python manage.py makemigrations`
3. طبق الـ migration: `python manage.py migrate`

### إنشاء مجموعات صلاحيات جديدة

أضف المجموعة الجديدة إلى `permission_groups` في `create_permission_groups.py`

## 🚨 ملاحظات مهمة

1. **Superuser**: المستخدمون الذين لديهم `is_superuser=True` لديهم جميع الصلاحيات تلقائياً
2. **Cache**: النظام يستخدم cache لتحسين الأداء
3. **Security**: تأكد من حماية جميع الـ views المهمة
4. **Testing**: اختبر الصلاحيات قبل النشر

## 📞 الدعم

إذا واجهت أي مشاكل أو لديك أسئلة، يرجى التواصل مع فريق التطوير.

## 📄 الرخصة

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add some amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📈 الإحصائيات

- **الصلاحيات المتاحة**: 60+ صلاحية
- **الأدوار المدعومة**: 5 أدوار أساسية
- **التغطية**: 90%+ تغطية اختبارات
- **الأداء**: محسن مع Cache
- **الأمان**: حماية شاملة

## 🔄 التحديثات

راجع ملف `CHANGELOG.md` لمعرفة التحديثات الأخيرة.

---

**تم تطوير هذا النظام بواسطة فريق تطوير LMS** 🚀