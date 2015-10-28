'use strict';

angular.module('driveIn.datamine', [])

.config(['$routeProvider', function ($routerProvider) {
  $routerProvider.when('/drive-in/mining', {
    templateUrl: 'components/datamine/datamine.html',
    controller: 'DatamineCtrl'
  })
}])

.controller('DatamineCtrl', [
  '$scope',
  '$log',
  'events',
function ($scope, $log, events) {

}])

.directive('datamine', function () {
  return {
    restrict: 'E',
    controller: 'DatamineCtrl',
    templateUrl: 'components/datamine/datamine.html'
  };
});
