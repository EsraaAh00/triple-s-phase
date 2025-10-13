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
    this.detectDevTools();
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

    // Disable text selection
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });

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
    });
  }

  detectDevTools() {
    let devtools = { isOpen: false };
    const threshold = 160;

    const detectOpenDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devtools.isOpen) {
          devtools.isOpen = true;
          this.handleDevToolsOpen();
        }
      } else {
        devtools.isOpen = false;
      }
    };

    // Check every 500ms
    setInterval(detectOpenDevTools, 500);

    // Debugger detection
    setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        this.handleDevToolsOpen();
      }
    }, 1000);
  }

  handleDevToolsOpen() {
    // Clear the page
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
      ">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️</h1>
        <h2 style="font-size: 2rem; margin-bottom: 1rem;">Access Denied</h2>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Developer tools are not allowed on this site.</p>
        <button onclick="window.location.reload()" style="
          padding: 12px 32px;
          font-size: 1rem;
          background: white;
          color: #667eea;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: bold;
        ">Reload Page</button>
      </div>
    `;
  }

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

