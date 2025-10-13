# Security & Code Protection

## 🔒 Code Protection Features

This project includes multiple layers of code protection that are **automatically activated in production mode**.

### Features Enabled in Production:

#### 1. **DevTools Detection & Prevention**
- ✅ Detects when Developer Tools are opened
- ✅ Automatically redirects or reloads the page
- ✅ Monitors window size changes
- ✅ Debugger statement detection

#### 2. **Keyboard Shortcuts Disabled**
- ❌ F12 (DevTools)
- ❌ Ctrl+Shift+I (Inspect Element)
- ❌ Ctrl+Shift+J (Console)
- ❌ Ctrl+Shift+C (Element Picker)
- ❌ Ctrl+U (View Source)
- ❌ Ctrl+S (Save Page)
- ❌ Ctrl+P (Print)

#### 3. **Right-Click Prevention**
- ❌ Context menu disabled
- ❌ Inspect element blocked
- ❌ Image saving prevented

#### 4. **Copy Protection**
- ❌ Text selection disabled
- ❌ Copy/Cut/Paste blocked
- ❌ Drag and drop prevented

#### 5. **Console Protection**
- All console methods disabled:
  - console.log()
  - console.error()
  - console.warn()
  - console.info()
  - console.debug()

## 📝 Implementation

### Files Added:

1. **`public/disable-devtools.js`**
   - Main protection script loaded before React
   - Runs immediately on page load
   - Works independently of React

2. **`src/utils/protectCode.js`**
   - Advanced React-integrated protection
   - Additional layer of security
   - Only loads in production

3. **Modified Files:**
   - `index.html` - Added protection script
   - `main.jsx` - Added conditional import

## 🚀 Usage

### Development Mode
Protection is **DISABLED** automatically when:
- Running on `localhost`
- Running on `127.0.0.1`
- URL contains `dev`
- `NODE_ENV !== 'production'`

### Production Mode
Protection is **ENABLED** automatically when:
- Deployed to production server
- `NODE_ENV === 'production'`

## 🛠️ Build for Production

```bash
npm run build
```

The built files will include all protection features.

## ⚙️ Configuration

### To Disable Protection in Production (Not Recommended):

Remove or comment out the script tag in `index.html`:
```html
<!-- <script src="/disable-devtools.js"></script> -->
```

### To Customize Protection Behavior:

Edit `public/disable-devtools.js` and modify:
- `threshold` value for DevTools detection
- Alert message when DevTools detected
- Redirect behavior

## 📋 Testing

### Test in Development:
```bash
npm run dev
```
Protection should be **disabled**.

### Test in Production Mode:
```bash
npm run build
npm run preview
```
Protection should be **enabled**.

## ⚠️ Important Notes

1. **These protections are not foolproof** - Determined users can still bypass them
2. **Protection works best when combined with**:
   - Server-side validation
   - API authentication
   - Encrypted communications
   - Code obfuscation

3. **The goal is to**:
   - Discourage casual inspection
   - Protect intellectual property
   - Prevent easy code copying
   - Add security layers

## 🔐 Additional Security Recommendations

1. **Enable HTTPS** on your production server
2. **Use environment variables** for sensitive data
3. **Implement Content Security Policy (CSP)**
4. **Add rate limiting** on API endpoints
5. **Use code obfuscation** tools during build
6. **Enable CORS** restrictions
7. **Add authentication tokens** for API calls

## 📞 Support

If you need to adjust the protection settings, contact the development team.

---

**Last Updated:** 2025-10-13
**Version:** 1.0.0

