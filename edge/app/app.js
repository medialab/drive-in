'use strict';

angular.module('driveIn', [
  'ngRoute',
  'driveIn.init',
  'driveIn.drivein',
])

/**
 * Default route.
 */
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/drive-in'
  });
}])

.controller('MainCtrl', ['$scope', '$log', function($scope, $log) {
  $scope.isAuthenticated = false;

  $scope.$on('authenticated', function (e) {
    $log.info(e)
  });
}])

/**
 * Service to authenticate app for usage of Google Drive API through OAuth2
 */
.factory('authenticator', ['$log', function ($log) {
  var CLIENT_ID = '72848749493-pva84reb1v48u6ddc6l7cukmsso7qib2.apps.googleusercontent.com',
      SCOPES = [
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive'
      ];

  return function (callback) {
    $log.info('[DRIVE-IN] Attempting OAuth2 authentication.');
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': true
    }, callback);
  };
}])

/**
 * Service to load Drive API upon authentication.
 */
.factory('apiLoader', ['$log', function ($log) {
  $log.info('[DRIVE-IN] Loading Google Drive API.');
  return function (callback) {
    gapi.client.load('drive', 'v2', callback);
  };
}]);
