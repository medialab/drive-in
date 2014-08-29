'use strict';

var mar = new Showdown.converter({ extensions: ['vimeo'] }),
    bib = new BibtexParser(),
    mla = function(bibtex) {
      bib.setInput(bibtex)
      bib.bibtex();
      return bib
    };

angular.module('tipot', [
  'ngRoute',
  'ngSanitize',
  'tipot.controllers',
  'tipot.services',
  'tipot.directives'
])
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

  $routeProvider.when('/', {templateUrl: '/src/partials/index.html', controller: 'indexCtrl'});
  $routeProvider.when('/bibliography', {templateUrl: '/src/partials/bibliography.html', controller: 'bibCtrl'});
  
  $routeProvider.when('/drive-in', {templateUrl: '/src/partials/drive-in/starter.html', controller: 'driveCtrl'});
  $routeProvider.when('/drive-in/:folderId', {templateUrl: '/src/partials/drive-in/index.html', controller: 'driveCtrl'});
  $routeProvider.when('/drive-in/:folderId/:id', {templateUrl: '/src/partials/drive-in/index.html', controller: 'drivePageCtrl'});
  

  $routeProvider.when('/:id', {templateUrl: '/src/partials/index.html', controller: 'pageCtrl'});
  
  $routeProvider.otherwise({redirectTo: '/'});

  $httpProvider.responseInterceptors.push(['$q','$log', function($q, $log) {
    return function(promise) {
      return promise.then(function(response) {
        $log.info(response);
        return response; 
      }, function(response) { // handle error here
        if (response.status === 401) {
          response.data = { 
            status: 'error', 
            description: 'Authentication required, or TIMEOUT session!'
          };
          return response;
        }
        return $q.reject(response);
      });
    };
  }]);
}]);