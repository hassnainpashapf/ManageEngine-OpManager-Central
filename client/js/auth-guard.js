// Attaches the real session token issued by /api/auth/login to every API
// call, and bounces back to the login page when the server rejects it.
// Pages with their own inline login overlay (e.g. noc.html) set
// `window.OPM_INLINE_LOGIN = true` before loading this script to skip the
// hard redirect-on-missing-token behavior below.
(function () {
  function getToken() {
    try { return localStorage.getItem('opm_auth_token'); } catch (e) { return null; }
  }

  function clearAuth() {
    try {
      localStorage.removeItem('opm_auth_token');
      localStorage.removeItem('opm_auth_user');
      localStorage.removeItem('opm_logged_in');
      sessionStorage.removeItem('opm_logged_in');
    } catch (e) {}
  }

  var onLoginPage = /\/login\.html$/.test(location.pathname);

  if (!window.OPM_INLINE_LOGIN && !onLoginPage && !getToken()) {
    location.replace('/login.html');
    return;
  }

  var originalFetch = window.fetch ? window.fetch.bind(window) : null;
  if (!originalFetch) return;

  window.fetch = function (input, init) {
    init = init || {};
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var isApi = false;
    try {
      var resolved = new URL(url, location.origin);
      isApi = resolved.origin === location.origin &&
        resolved.pathname.indexOf('/api/') !== -1 &&
        resolved.pathname !== '/api/auth/login';
    } catch (e) {}

    if (isApi) {
      var token = getToken();
      if (token) {
        var headers = new Headers(init.headers || (typeof input !== 'string' && input.headers) || {});
        headers.set('Authorization', 'Bearer ' + token);
        init = Object.assign({}, init, { headers: headers });
      }
    }

    return originalFetch(input, init).then(function (response) {
      if (isApi && response.status === 401) {
        clearAuth();
        if (!window.OPM_INLINE_LOGIN) {
          location.replace('/login.html');
        }
      }
      return response;
    });
  };
})();
