(function (window, document) {
  var STORAGE_KEY = 'analytics_consent';
  var VALID_VALUES = { accepted: true, rejected: true };

  function safeGetStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function normalize(value) {
    return VALID_VALUES[value] ? value : null;
  }

  function dispatch(consent) {
    document.dispatchEvent(
      new CustomEvent('trosyn:consent-changed', {
        detail: { consent: consent }
      })
    );
  }

  function getConsent() {
    var storage = safeGetStorage();
    if (!storage) {
      return null;
    }
    return normalize(storage.getItem(STORAGE_KEY));
  }

  function setConsent(value) {
    var normalized = normalize(value);
    var storage = safeGetStorage();

    if (!normalized) {
      throw new Error('Consent value must be "accepted" or "rejected".');
    }

    if (storage) {
      storage.setItem(STORAGE_KEY, normalized);
    }

    dispatch(normalized);
    return normalized;
  }

  function revokeConsent() {
    var storage = safeGetStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEY);
    }
    dispatch(null);
    return null;
  }

  window.TrosynConsentManager = {
    key: STORAGE_KEY,
    getConsent: getConsent,
    setConsent: setConsent,
    revokeConsent: revokeConsent
  };
})(window, document);
