'use strict';

/* Services */
angular.module('tipot.services', ['ngResource' ])//'ngAnimate'])
  
  .factory('YqlFactory', function($resource) {
    return $resource('https://yql.yahooapis.com/v1/public/yql', {}, {});
  })

  .factory('GoogleApiFactory', function($http) {
    return {
      getHtml: function(id) {
        return $http.get('https://docs.google.com/feeds/download/documents/export/Export?id='+id+'&exportFormat=html')
      },
      getText: function(id) {
        return $http.get('https://docs.google.com/feeds/download/documents/export/Export?id='+id+'&exportFormat=txt')
      },
      getSource: function(src) {
        return $http.get(src);
      }
    }
  })
  
  .factory('GoogleFileFactory__', function($resource) {
    return $resource('/api/job/:id', {}, {
      query: {method: 'GET', params: {id: '@id'}},
    });
  });