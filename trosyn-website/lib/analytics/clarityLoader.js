(function (window, document) {
  var PROJECT_ID = 'wit17hakn0';
  var SCRIPT_ID = 'trosyn-clarity-script';
  var hasInjected = false;
  var loadPromise = null;

  function ensureStub() {
    if (typeof window.clarity !== 'function') {
      window.clarity = function () {
        (window.clarity.q = window.clarity.q || []).push(arguments);
      };
    }
  }

  function isLoaded() {
    return !!document.getElementById(SCRIPT_ID);
  }

  function setConsent(granted) {
    if (typeof window.clarity === 'function') {
      window.clarity('consent', !!granted);
    }
  }

  function load() {
    if (isLoaded() || hasInjected) {
      return loadPromise || Promise.resolve();
    }

    ensureStub();
    hasInjected = true;

    loadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = 'https://www.clarity.ms/tag/' + PROJECT_ID;
      script.onload = function () {
        resolve();
      };
      script.onerror = function () {
        hasInjected = false;
        reject(new Error('Failed to load Microsoft Clarity.'));
      };
      document.head.appendChild(script);
    });

    return loadPromise;
  }

  window.TrosynClarityLoader = {
    load: load,
    isLoaded: isLoaded,
    setConsentGranted: function () {
      setConsent(true);
    },
    setConsentDenied: function () {
      setConsent(false);
    }
  };
})(window, document);
