'use strict';

var mar = new Showdown.converter({ extensions: ['vimeo','twitter'] });

angular.module('tipot', [
  'ngRoute',
  'ngSanitize',
  'tipot.controllers',
  'tipot.services',
  'tipot.directives'
])
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

  $routeProvider.when('/', {templateUrl: '/src/partials/index.html', controller: 'indexCtrl'});
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