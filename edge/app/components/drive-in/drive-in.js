'use strict';

angular.module('driveIn.drivein', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/drive-in/:folderId', {
    templateUrl: 'components/drive-in/drive-in.html',
    controller: 'DriveInCtrl'
  });

  $routeProvider.when('/drive-in/:folderId/:pageId', {
    templateUrl: 'components/drive-in/drive-in.html',
    controller: 'DriveInCtrl'
  });
}])

.controller('DriveInCtrl', [function () {

}]);
