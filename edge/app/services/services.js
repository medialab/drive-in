// Monitor the number of auth attempts.
var maxAuthAttempt = 5,
    currentAuthAttempt = 0;
/**
 * Service to authenticate app for usage of Google Drive API through OAuth2
 */
driveIn.factory('authenticator', ['$log', '$timeout', function ($log, $timeout) {
  var CLIENT_ID = '72848749493-pva84reb1v48u6ddc6l7cukmsso7qib2.apps.googleusercontent.com',
      SCOPES = [
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive'
      ];

  // Recursive call of auth function, so in case client API
  // from Google didn't load fast enough, we can retry.
  var isAttemptingAuth = false;

  function auth(callback) {
    if (isAttemptingAuth) {
      return;
    }

    $log.log('[DRIVE-IN] OAuth2: attempting authentication...');

    // Prevent ReferenceError on gapi if unable to establish connection.
    var gapi = window.gapi || {};

    // Attempt starts here. Count the number of attempt.
    // Give up if it exceeds the maximum number possible.
    if (gapi && gapi.auth) {
      isAttemptingAuth = true;
      gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, function (possibleData) {
        $log.log('[DRIVE-IN] OAuth2: done.')
        isAttemptingAuth = false;
        callback(possibleData)
      });
    } else {
      currentAuthAttempt++;
      if (currentAuthAttempt < maxAuthAttempt) {
        $log.log(
          '[DRIVE-IN] OAuth2: Google API not ready yet, retrying ('
          + currentAuthAttempt + '/' + maxAuthAttempt + ').'
        );
        $timeout(auth, 1000, false, callback);
      } else {
        $log.info(
          '[DRIVE-IN] OAuth2: Could not reach Google API after ' + maxAuthAttempt +
          'tries. I\'m giving up.');
        return;
      }
    }
  }

  return function (callback) {
    auth(callback);
  };
}])

/**
 * Service to load Drive API upon authentication.
 */
.factory('apiLoader', ['$log', function ($log) {
  $log.log('[DRIVE-IN] Loading Google Drive API.');
  return function (callback) {
    gapi.client.load('drive', 'v2', callback);
  };
}]);
