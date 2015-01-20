'use strict';

/**
 * @ngdoc function
 * @name drivein.controller:starterCtrl
 * @description
 * # LayoutCtrl
 * Controller of the Google Drive API library client (gapi).
 */
angular.module('drivein')
  .controller('starterCtrl', function($scope, $log) {
       
    $scope.app_status = APP_STATUS_INIT;

    $scope.setStatus = function(status) {
      $scope.app_status = status;
    };

    /*
      Launch the authorization process
    */
    $scope.authorize = function(immediate) {
      $log.info('starterCtrl >>> authorize');
      $scope.setStatus(APP_STATUS_BEFORE_AUTHORIZATION);
      gapi.auth.authorize({
        client_id: settings.CLIENT_ID,
        scope: settings.SCOPES,
        immediate: immediate || false
      }, function(res) {
        if (res && !res.error) {
          $scope.setStatus(APP_STATUS_AUTHORIZATION_SUCCESS);
          $log.info('Authorization confirmed. Access token has been successfully retrieved, requests can be sent to the API.')
          
          $scope.access_token = res.access_token;

          gapi.client.load('drive', 'v2', function(){
            $scope.$broadcast('GOOGLE_API_LOADED');
          });
        } else {
          $scope.setStatus(APP_STATUS_AUTHORIZATION_REQUIRED);
          $log.info('No access token could be retrieved, show the button to start the authorization flow.')
        }
        $scope.$apply()
        //console.log(res)
      });
    };

    $scope.$on('GOOGLE_CLIENT_INITIALIZED', function(e, settings) {
      $log.info('starterCtrl @GOOGLE_CLIENT_INITIALIZED');
      $scope.authorize(true);
    });

    $log.debug('starterCtrl loaded.');
  });