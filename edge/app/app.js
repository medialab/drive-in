'use strict';

var driveIn = angular.module('driveIn', [
  'ngRoute',
  'driveIn.auth',
  'driveIn.datamine',
  'driveIn.drivein',
])

.constant('events', {
  'AUTH': 'authenticated',
  'START_MINING': 'start mining',
  'END_MINING': 'end mining'
})

/**
 * Default route -> authenticate via OAuth, authorize Drive-In.
 */
.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.otherwise({
    redirectTo: '/drive-in/auth'
  });
}])

.controller('MainCtrl', [
  '$rootScope',
  '$scope',
  '$log',
  '$location',
  'events',
function($rootScope, $scope, $log, events) {
  $scope.isAuthenticated = false;
}]);
