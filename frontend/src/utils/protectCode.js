// Advanced Code Protection Utility
// This will only work in production environment

class CodeProtection {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    if (this.isProduction) {
      this.init();
    }
  }

  init() {
    this.disableConsole();
    this.preventInspect();
    // Removed detectDevTools() to prevent showing detection screens
    this.disableShortcuts();
    this.preventCopy();
  }

  disableConsole() {
    // Disable all console methods
    const noop = () => {};
    Object.keys(console).forEach(key => {
      if (typeof console[key] === 'function') {
        console[key] = noop;
      }
    });
  }

  preventInspect() {
    // Disable right-click
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Allow text selection - Ctrl+A enabled
    // document.addEventListener('selectstart', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // // Disable copy
    // document.addEventListener('copy', (e) => {
    //   e.preventDefault();
    //   return false;
    // });

    // // Disable cut
    // document.addEventListener('cut', (e) => {
    //   e.preventDefault();
    //   return false;
    // });
  }

  disableShortcuts() {
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }

      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }

      // Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        return false;
      }

      // Allow Ctrl+C (Copy) - No prevention
      // Allow Ctrl+V (Paste) - No prevention
      // Allow Ctrl+A (Select All) - No prevention
      // Allow Ctrl+Z (Undo) - No prevention
      // Allow Ctrl+Y (Redo) - No prevention
    });
  }

  // Removed detectDevTools() and handleDevToolsOpen() methods
  // to prevent showing detection screens while keeping console disabled

  preventCopy() {
    // Prevent drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevent image saving
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.getElementsByTagName('img');
      Array.from(images).forEach(img => {
        img.addEventListener('contextmenu', (e) => {
          e.preventDefault();
        });
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'none';
        img.draggable = false;
      });
    });
  }

  // Obfuscate sensitive data
  static obfuscate(data) {
    if (process.env.NODE_ENV !== 'production') return data;
    return btoa(encodeURIComponent(JSON.stringify(data)));
  }

  // Deobfuscate data
  static deobfuscate(data) {
    if (process.env.NODE_ENV !== 'production') return data;
    try {
      return JSON.parse(decodeURIComponent(atob(data)));
    } catch {
      return null;
    }
  }
}

// Initialize protection
const protection = new CodeProtection();

export default CodeProtection;

