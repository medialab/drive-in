'use strict';

angular.module('driveIn.drivein', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/drive-in/:folderId', {
    templateUrl: 'views/drive-in/drive-in.html',
    controller: 'DriveInCtrl'
  });

  $routeProvider.when('/drive-in/:folderId/:pageId', {
    templateUrl: 'views/drive-in/drive-in.html',
    controller: 'DriveInCtrl'
  });
}])

.controller('DriveInCtrl', [function () {

}]);
