'use strict';

/**
 * @ngdoc function
 * @name drivein.controller:referencesCtrl
 * @description
 * # LayoutCtrl
 * Controller of the references page.
 */
angular.module('drivein')
  .controller('referencesCtrl', function($scope, $log, $http, $routeParams) {
    $log.debug('referencesCtrl loaded.');

    /*
      ##eventListener $scope.app_status
      If everything is ready, load main content.
    */
    $scope.$watch('app_status', function(app_status){
      $log.log('indexCtrl @app_status', app_status);
      if(app_status != APP_STATUS_READY) {
        return;
      };
      
      if($routeParams.folder && $scope.fileId != $routeParams.folder) {
        $log.log('indexCtrl @app_status', app_status, 'let us discover new contents!')
        $scope.discover($routeParams.folder);
      };
    })

  })