# نظام الترجمة (i18n) - Translation System

## نظرة عامة
تم إعداد نظام ترجمة شامل للتطبيق يدعم اللغتين العربية والإنجليزية مع الإنجليزية كلغة افتراضية.

## المكونات الرئيسية

### 1. ملفات الترجمة
- `src/locales/en/translation.json` - الترجمات الإنجليزية
- `src/locales/ar/translation.json` - الترجمات العربية

### 2. إعداد i18n
- `src/i18n/index.js` - ملف التكوين الرئيسي لـ react-i18next

### 3. Context إدارة اللغة
- `src/contexts/LanguageContext.jsx` - Context لإدارة حالة اللغة وتبديلها

### 4. Hook مخصص
- `src/hooks/useTranslation.js` - Hook مخصص يجمع بين i18next والـ LanguageContext

## كيفية الاستخدام

### في المكونات
```jsx
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { t } = useTranslation();
  const { currentLanguage, toggleLanguage, isRTL } = useLanguage();

  return (
    <div>
      <h1>{t('header.home')}</h1>
      <button onClick={toggleLanguage}>
        {currentLanguage === 'en' ? 'العربية' : 'English'}
      </button>
    </div>
  );
};
```

### إضافة ترجمات جديدة
1. أضف المفتاح في ملف الترجمة الإنجليزية:
```json
{
  "mySection": {
    "newKey": "New Translation"
  }
}
```

2. أضف الترجمة العربية المقابلة:
```json
{
  "mySection": {
    "newKey": "ترجمة جديدة"
  }
}
```

3. استخدمها في المكون:
```jsx
{t('mySection.newKey')}
```

## الميزات

### 1. اللغة الافتراضية
- الإنجليزية هي اللغة الافتراضية
- يتم حفظ اختيار المستخدم في localStorage

### 2. دعم RTL
- يتم تبديل اتجاه النص تلقائياً للعربية
- يتم تحديث `dir` attribute في HTML

### 3. كشف اللغة
- كشف اللغة من المتصفح
- حفظ اختيار المستخدم
- fallback للغة الإنجليزية

### 4. تبديل سهل
- زر تبديل في الـ Header
- متاح في النسخة المكتبية والموبايل
- تبديل فوري للغة

## بنية ملفات الترجمة

```json
{
  "header": {
    "home": "Home / الرئيسية",
    "courses": "Courses / الدورات",
    "about": "About / من نحن"
  },
  "common": {
    "loading": "Loading... / جاري التحميل...",
    "error": "Error / خطأ"
  },
  "auth": {
    "login": "Login / تسجيل الدخول",
    "register": "Register / إنشاء حساب"
  }
}
```

## نصائح للتطوير

1. **استخدم مفاتيح وصفية**: `user.profile.editButton` بدلاً من `button1`
2. **نظم الترجمات**: قسم الترجمات حسب الوظيفة
3. **اختبر كلا اللغتين**: تأكد من عمل الترجمة في كلا الاتجاهين
4. **استخدم المتغيرات**: `t('welcome', { name: userName })`

## استكشاف الأخطاء

### مشكلة: النص لا يظهر
- تأكد من وجود المفتاح في ملفي الترجمة
- تحقق من صحة مسار المفتاح

### مشكلة: الترجمة لا تتغير
- تأكد من استيراد `useTranslation`
- تحقق من تحديث `currentLanguage` في الـ context

### مشكلة: اتجاه النص خطأ
- تأكد من استخدام `isRTL` في الـ styling
- تحقق من تحديث `dir` attribute في HTML
