'use strict';

angular.module('driveIn', [
  'ngRoute',
  'driveIn.init',
  'driveIn.drivein',
]).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/drive-in'});
}]);
