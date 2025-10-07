#!/usr/bin/env node

/**
 * Local Development Setup Script
 * سكريبت إعداد التطوير المحلي
 * 
 * This script helps set up local development environment
 * يساعد هذا السكريبت في إعداد بيئة التطوير المحلية
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up local development environment...');
console.log('🚀 جاري إعداد بيئة التطوير المحلية...\n');

// Create .env.local file
const envContent = `# Local Development Environment Variables
# This file is for local development only and should not be committed to git

# API Base URL for local development
VITE_API_BASE_URL=http://localhost:8000

# Alternative local URLs (uncomment if needed)
# VITE_API_BASE_URL=http://127.0.0.1:8000
# VITE_API_BASE_URL=http://0.0.0.0:8000

# Development mode flag
VITE_DEV_MODE=true

# Enable debug logging
VITE_DEBUG=true
`;

const envPath = path.join(__dirname, '.env.local');

try {
    // Check if .env.local already exists
    if (fs.existsSync(envPath)) {
        console.log('⚠️  .env.local already exists. Skipping creation.');
        console.log('⚠️  ملف .env.local موجود بالفعل. تم تخطي الإنشاء.\n');
    } else {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env.local file');
        console.log('✅ تم إنشاء ملف .env.local\n');
    }

    // Display instructions
    console.log('📋 Next steps / الخطوات التالية:');
    console.log('1. Make sure your backend is running on port 8000');
    console.log('   تأكد من أن الـ backend يعمل على البورت 8000');
    console.log('   Command: cd ../backend && python manage.py runserver');
    console.log('');
    console.log('2. Start the frontend development server');
    console.log('   ابدأ خادم تطوير الـ frontend');
    console.log('   Command: npm run dev');
    console.log('');
    console.log('3. Open your browser to http://localhost:5173');
    console.log('   افتح المتصفح على http://localhost:5173');
    console.log('');
    console.log('🔧 Configuration / الإعدادات:');
    console.log('- API Base URL: http://localhost:8000');
    console.log('- Frontend URL: http://localhost:5173');
    console.log('- Debug mode: Enabled');
    console.log('');
    console.log('📝 To change the API URL, edit .env.local file');
    console.log('📝 لتغيير رابط الـ API، عدّل ملف .env.local');

} catch (error) {
    console.error('❌ Error setting up local environment:', error.message);
    console.error('❌ خطأ في إعداد البيئة المحلية:', error.message);
    process.exit(1);
}
