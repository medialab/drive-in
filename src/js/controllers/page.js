/**
 * @ngdoc function
 * @name drivein.controller:pageCtrl
 * @description
 * # LayoutCtrl
 * Controller of static pages.
 */
angular.module('drivein')
  .controller('pageCtrl', function($scope, $log, $http, $routeParams, $route) {
    'use strict';

    $scope.$parent.path = $route.current.originalPath.split('/').pop();

    /*
      ##eventListener $scope.app_status
      If everything is ready, load main content.
    */
    $scope.$watch('app_status', function(app_status){
      if(app_status !== APP_STATUS_READY) {
        return;
      }

      if($routeParams.folder && $scope.fileId != $routeParams.folder) {
        $scope.discover($routeParams.folder);
      }
    });
  });
