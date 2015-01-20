'use strict';

var APP_STATUS_INIT  = 'app_status_init',

    APP_STATUS_BEFORE_AUTHORIZATION    = 'APP_STATUS_BEFORE_AUTHORIZATION',
    APP_STATUS_AUTHORIZATION_SUCCESS   = 'APP_STATUS_AUTHORIZATION_SUCCESS',
    APP_STATUS_AUTHORIZATION_REQUIRED  = 'APP_STATUS_AUTHORIZATION_REQUIRED',
    APP_STATUS_READY                   = 'APP_STATUS_READY',
    APP_STATUS_DISCOVERING_COMPLETED   = 'APP_STATUS_DISCOVERING_COMPLETED';



angular.module('drivein', [
  'ngRoute'
])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: settings.baseurl + 'src/views/index.html',
        controller: 'indexCtrl'
      })
      .when('/references', {
        templateUrl: settings.baseurl + 'src/views/references.html',
        controller: 'referencesCtrl'
      })
      .when('/drive-to/:folder', { // set new starting url
        templateUrl: settings.baseurl + 'src/views/index.html',
        controller: 'indexCtrl'
      })
      .when('/:folder', { // home
        templateUrl: settings.baseurl + 'src/views/index.html',
        controller: 'indexCtrl'
      })
      .when('/:folder/:path', { // subpath (1 level max)
        templateUrl: settings.baseurl + 'src/views/index.html',
        controller: 'indexCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });