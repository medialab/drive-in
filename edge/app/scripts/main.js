/*global require*/
'use strict';

require.config({
  shim: {
  },
  paths: {
    jquery: '../bower_components/jquery/dist/jquery',
    backbone: '../bower_components/backbone/backbone',
    underscore: '../bower_components/lodash/dist/lodash'
  }
});

require([
  'backbone'
], function (Backbone) {

  var CLIENT_ID = '72848749493-pva84reb1v48u6ddc6l7cukmsso7qib2.apps.googleusercontent.com',
      SCOPES = [
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive'
      ],
      FOLDER_ID = '0BzN4DMSEkyAFUENlamlIUVhDalU',
      TYPE_FOLDER = 'application/vnd.google-apps.folder',
      TYPE_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  var AuthModel = Backbone.Model.extend({
    auth: function (callback) {
      var isAttemptingAuth = false,
          currentAuthAttempt = 0,
          maxAuthAttempt = 5;

      var attemptAuth = function (callback) {
        if (isAttemptingAuth) return;

        console.log('[DRIVE-IN] OAuth2: attempting authentication...');

        // Prevent ReferenceError on gapi if unable to establish connection.
        var gapi = window.gapi || {};

        // Attempt starts here. Count the number of attempt.
        // Give up if it exceeds the maximum number possible.
        if (gapi && gapi.auth) {
          isAttemptingAuth = true;
          gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
          }, function (oauthToken) {
            console.log('[DRIVE-IN] OAuth2: done.')
            isAttemptingAuth = false;
            callback(oauthToken)
          });
        } else {
          currentAuthAttempt++;
          if (currentAuthAttempt < maxAuthAttempt) {
            console.log(
              '[DRIVE-IN] OAuth2: Google API not ready yet, retrying ('
              + currentAuthAttempt + '/' + maxAuthAttempt + ').'
            );
            _.delay(attemptAuth, 1000, callback)
          } else {
            console.info(
              '[DRIVE-IN] OAuth2: Could not reach Google API after ' + maxAuthAttempt +
              'tries. I\'m giving up.'
            );
            return;
          }
        }
      };

      // Start here.
      attemptAuth(callback);
    }
  });

  var auth = new AuthModel();
  auth.auth(function (token) {
    console.log(token)
  })

  Backbone.history.start();
});
