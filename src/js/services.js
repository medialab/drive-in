'use strict';

/* Services */
angular.module('tipot.services', ['ngResource' ])//'ngAnimate'])
  
  .factory('YqlFactory', function($resource) {
    return $resource('https://query.yahooapis.com/v1/public/yql', {}, {});
  })

  .factory('GoogleFileFactory', function($resource) {
    return $resource('/api/job/:id', {}, {
      query: {method: 'GET', params: {id: '@id'}},
    });
  });