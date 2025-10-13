// Disable DevTools in Production
(function() {
  'use strict';

  // Check if in production
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.includes('dev');

  if (!isProduction) return; // Allow DevTools in development

  // Disable right-click
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
    // Ctrl+S (Save)
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault();
      return false;
    }
  }, false);

  // Detect DevTools
  const devtools = {
    isOpen: false,
    orientation: null
  };

  const threshold = 160;

  const emitEvent = (isOpen, orientation) => {
    window.dispatchEvent(new CustomEvent('devtoolschange', {
      detail: { isOpen, orientation }
    }));
  };

  const checkDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    if (!(heightThreshold && widthThreshold) &&
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) ||
         widthThreshold || heightThreshold)) {
      if (!devtools.isOpen || devtools.orientation !== orientation) {
        emitEvent(true, orientation);
        devtools.isOpen = true;
        devtools.orientation = orientation;
      }
    } else {
      if (devtools.isOpen) {
        emitEvent(false, null);
        devtools.isOpen = false;
        devtools.orientation = null;
      }
    }
  };

  // Check every 500ms
  setInterval(checkDevTools, 500);

  // Redirect or alert when DevTools detected
  window.addEventListener('devtoolschange', (e) => {
    if (e.detail.isOpen) {
      // Option 1: Redirect to another page
      // window.location.href = 'about:blank';
      
      // Option 2: Show alert and reload
      alert('⚠️ Developer tools are not allowed on this site!');
      window.location.reload();
    }
  });

  // Disable console methods
  if (typeof console !== 'undefined') {
    console.log = function() {};
    console.error = function() {};
    console.warn = function() {};
    console.info = function() {};
    console.debug = function() {};
    console.dir = function() {};
    console.dirxml = function() {};
    console.trace = function() {};
    console.clear = function() {};
  }

  // Detect debugger
  (function() {
    const detectDebugger = function() {
      const start = new Date();
      debugger;
      const end = new Date();
      if (end - start > 100) {
        window.location.href = 'about:blank';
      }
    };
    setInterval(detectDebugger, 1000);
  })();

  // Disable text selection
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // Disable copy
  document.addEventListener('copy', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // Disable cut
  document.addEventListener('cut', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // Disable paste
  document.addEventListener('paste', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // Disable drag
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  }, false);

  // Additional DevTools detection using toString
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      devtools.isOpen = true;
      throw new Error('DevTools detected!');
    }
  });

  console.log(element);

  // Prevent inspect element
  document.addEventListener('DOMContentLoaded', function() {
    const images = document.getElementsByTagName('img');
    for (let i = 0; i < images.length; i++) {
      images[i].addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });
    }
  });

})();

