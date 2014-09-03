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
  'tipot.directives',
  'tipot.filters',
  'angularytics'
])
.config(function(AngularyticsProvider) {
  AngularyticsProvider.setEventHandlers(['Console', 'GoogleUniversal']);
})
.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

  $routeProvider.when('/', {templateUrl: settings.partials + '/index.html', controller: 'indexCtrl', reloadOnSearch:false});
  $routeProvider.when('/bibliography', {templateUrl: settings.partials + '/bibliography.html', controller: 'bibCtrl'});
  
  $routeProvider.when('/drive-in', {templateUrl: settings.partials + '/drive-in/starter.html', controller: 'driveCtrl'});
  $routeProvider.when('/drive-in/:folderId', {templateUrl: settings.partials + '/drive-in/index.html', controller: 'driveCtrl'});
  $routeProvider.when('/drive-in/:folderId/:id', {templateUrl: settings.partials + '/drive-in/index.html', controller: 'drivePageCtrl'});
  

  $routeProvider.when('/:id', {templateUrl: settings.partials + '/page.html', controller: 'pageCtrl'});
  
  $routeProvider.otherwise({redirectTo: '/'});

  $httpProvider.responseInterceptors.push(['$q','$log', function($q, $log) {
    return function(promise) {
      return promise.then(function(response) {
        //$log.info(response);
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
}])
.run(function(Angularytics) {
    Angularytics.init();
});