'use strict';
angular.module('tipot', [
  'ngRoute',
  'ngSanitize',
  'tipot.controllers',
  'tipot.services',
  'tipot.directives'
])
.config(['$httpProvider', function($httpProvider) {
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