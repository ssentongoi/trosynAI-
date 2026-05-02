(function (window, document) {
  var consentManager = window.TrosynConsentManager;
  var clarityLoader = window.TrosynClarityLoader;
  var banner;
  var message;
  var closeButton;

  if (!consentManager || !clarityLoader) {
    return;
  }

  function injectStyles() {
    if (document.getElementById('trosyn-consent-styles')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'trosyn-consent-styles';
    style.textContent = [
      '.consent-banner{position:fixed;left:20px;right:20px;bottom:20px;z-index:1000;max-width:860px;margin:0 auto;background:rgba(15,56,48,0.96);color:#f4faf8;border:1px solid rgba(220,240,240,0.18);border-radius:16px;box-shadow:0 24px 46px rgba(7,35,36,0.28);padding:22px 22px 18px;backdrop-filter:blur(14px);}',
      '.consent-banner[hidden]{display:none;}',
      '.consent-banner__title{font-family:"DM Sans",sans-serif;font-size:1rem;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px;}',
      '.consent-banner__body{font-size:0.92rem;line-height:1.65;color:rgba(244,250,248,0.82);max-width:720px;}',
      '.consent-banner__actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;}',
      '.consent-banner__button{appearance:none;border:none;cursor:pointer;border-radius:8px;padding:11px 18px;font:600 0.9rem "DM Sans",sans-serif;transition:transform 0.2s ease,background 0.2s ease,color 0.2s ease,border-color 0.2s ease;}',
      '.consent-banner__button:hover{transform:translateY(-1px);}',
      '.consent-banner__button--accept{background:#e05a3a;color:#ffffff;}',
      '.consent-banner__button--accept:hover{background:#c44030;}',
      '.consent-banner__button--reject,.consent-banner__button--close{background:transparent;color:#dcefed;border:1px solid rgba(220,240,240,0.22);}',
      '.consent-banner__button--reject:hover,.consent-banner__button--close:hover{background:rgba(220,240,240,0.08);}',
      '.consent-banner__status{display:block;margin-top:10px;font-size:0.8rem;color:rgba(220,240,240,0.62);}',
      '@media (max-width: 640px){.consent-banner{left:12px;right:12px;bottom:12px;padding:18px 16px 16px;}.consent-banner__actions{flex-direction:column;}.consent-banner__button{width:100%;justify-content:center;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function ensureBanner() {
    if (banner) {
      return banner;
    }

    banner = document.createElement('section');
    banner.className = 'consent-banner';
    banner.hidden = true;
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = [
      '<div class="consent-banner__title">Privacy settings</div>',
      '<div class="consent-banner__body"></div>',
      '<div class="consent-banner__actions">',
      '  <button type="button" class="consent-banner__button consent-banner__button--reject" data-consent-action="reject">Reject All</button>',
      '  <button type="button" class="consent-banner__button consent-banner__button--accept" data-consent-action="accept">Accept All</button>',
      '  <button type="button" class="consent-banner__button consent-banner__button--close" data-consent-action="close">Close</button>',
      '</div>',
      '<span class="consent-banner__status"></span>'
    ].join('');

    message = banner.querySelector('.consent-banner__body');
    closeButton = banner.querySelector('[data-consent-action="close"]');

    banner.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-consent-action');
      if (!action) {
        return;
      }

      if (action === 'accept') {
        consentManager.setConsent('accepted');
        hideBanner();
        return;
      }

      if (action === 'reject') {
        consentManager.setConsent('rejected');
        hideBanner();
        return;
      }

      if (action === 'close' && consentManager.getConsent() !== null) {
        hideBanner();
      }
    });

    document.body.appendChild(banner);
    return banner;
  }

  function updateBannerMessage(isSettingsView) {
    var consent = consentManager.getConsent();
    var status = banner.querySelector('.consent-banner__status');

    if (isSettingsView && consent === 'accepted') {
      message.textContent = 'At our company we and our trusted partners use cookies and similar technologies to enhance your browsing experience, improve our services, and personalize content, including advertisements. You have the option to manage your cookie preferences at any time.';
      status.textContent = 'Current choice: accepted';
    } else if (isSettingsView && consent === 'rejected') {
      message.textContent = 'At our company we and our trusted partners use cookies and similar technologies to enhance your browsing experience, improve our services, and personalize content, including advertisements. You have the option to manage your cookie preferences at any time.';
      status.textContent = 'Current choice: rejected';
    } else {
      message.textContent = 'At our company we and our trusted partners use cookies and similar technologies to enhance your browsing experience, improve our services, and personalize content, including advertisements. You have the option to manage your cookie preferences at any time.';
      status.textContent = '';
    }

    closeButton.hidden = consent === null;
  }

  function showBanner(isSettingsView) {
    ensureBanner();
    updateBannerMessage(!!isSettingsView);
    banner.hidden = false;
  }

  function hideBanner() {
    if (banner) {
      banner.hidden = true;
    }
  }

  function syncAnalytics(consent) {
    if (consent === 'accepted') {
      clarityLoader.load().then(function () {
        clarityLoader.setConsentGranted();
      }).catch(function () {
        // Fail closed: do not retry automatically after a load failure.
      });
      return;
    }

    if (consent === 'rejected') {
      clarityLoader.setConsentDenied();
      return;
    }

    clarityLoader.setConsentDenied();
  }

  function bindPrivacySettingsLinks() {
    var links = document.querySelectorAll('.js-privacy-settings');
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        showBanner(true);
      });
    });
  }

  function init() {
    injectStyles();
    ensureBanner();
    bindPrivacySettingsLinks();

    var consent = consentManager.getConsent();
    if (consent === null) {
      showBanner(false);
    }
    syncAnalytics(consent);

    document.addEventListener('trosyn:consent-changed', function (event) {
      var nextConsent = event.detail ? event.detail.consent : consentManager.getConsent();
      syncAnalytics(nextConsent);
      if (nextConsent === null) {
        showBanner(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);
