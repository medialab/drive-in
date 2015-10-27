'use strict';

angular.module('driveIn.init', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/drive-in', {
    templateUrl: 'views/init/init.html',
    controller: 'InitCtrl'
  });
}])

.controller('InitCtrl', ['$scope', '$log', 'authenticator', 'apiLoader', function ($scope, $log, authenticator, apiLoader) {
  $scope.authenticate = function () {
    authenticator(function () {
      apiLoader(function () {
        $log.log('[DRIVE-IN] Authenticated. Broadcasting related event.');
        $scope.$emit('authenticated');
      });
    });
  };

  function handleAuthResult(res) {
    console.log(res);
  }
}])

.directive('initializer', function () {
  return {
    restrict: 'E',
    controller: 'InitCtrl',
  };
})
