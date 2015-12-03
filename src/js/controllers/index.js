
/**
 * @ngdoc function
 * @name drivein.controller:indexCtrl
 * @description
 * # LayoutCtrl
 * Controller of the index page, is the basic controller of drive-in sections.
 * (e.g. subfolders). If there is no GAPI connection, handle the connect with google drive view.
 *
 */
angular.module('drivein')
  .controller('indexCtrl', function($scope, $log, $http, $q, $routeParams, gdocParser) {
    'use strict';

    $log.debug('indexCtrl loaded.');

    // load the given fileId and allow parsing
    $scope.load = function(doc) {
      if (doc.title === 'metadata') return;       // Prevent displaying metadata in Homepage.
      $log.info('indexCtrl >>> load ', doc.title);// doc.exportLinks['text/html']);

      return $http({
        url: doc.exportLinks['text/html'],
        method: 'GET',
        headers: {
         'Authorization': 'Bearer ' + $scope.access_token
        }
      }).then(function(res) {
        return gdocParser.parse(res.data, doc);
      });
    };

    /*
      ##eventListener $scope.items
      Watch for changements in documents ROOT collection ($scope.items)
    */
    $scope.$watch('items', function(items) { // once items are in place, let's load them if needed
      if(items){ // the root folder has  been loaded !
        $log.debug('indexCtrl @$scope.items evaluating path in order to load docs');
        $scope.setPath($routeParams.path); // load home documents if path is undefined!
      }
    });

    /*
      ##eventListener $scope.app_status
      If everything is ready app_status has been set to APP_STATUS_READY.
      This allow to load folder content and start the parsing chain.
    */
    $scope.$watch('app_status', function(app_status){
      $log.log('indexCtrl @app_status', app_status);
      if(app_status != APP_STATUS_READY) {
        return;
      }

      if($routeParams.folder && $scope.fileId != $routeParams.folder) {
        $log.log('indexCtrl @app_status', app_status, 'let us discover new contents!');
        $scope.discover($routeParams.folder);
      }
    });
  });
