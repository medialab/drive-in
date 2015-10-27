'use strict';

angular.module('driveIn.init', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/drive-in', {
    templateUrl: 'views/init/init.html',
    controller: 'InitCtrl'
  });
}])

.controller('InitCtrl', [function () {

}]);
