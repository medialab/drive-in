'use strict';

/**
 * @ngdoc directive
 * @name drivein.directive:gdoc
 * @description
 * # parse a google document on demand
 */
angular.module('drivein')
  .directive('gdoc', function($log, $sce) {
    return {
      templateUrl: settings.baseurl + '/src/partials/gdoc.html',
      restrict: 'E',
      scope: {
        doc: '=',
        load: '&'
      },
      link: function postLink(scope, element, attrs) {
        //$log.log('directive gdoc, loading google doc:', scope.doc.title);
        // get my message
        scope.load({doc:scope.doc}).then(function(data){
          scope.title = $sce.trustAsHtml(data.title);
          scope.subtitle = $sce.trustAsHtml(data.subtitle);
          scope.html = $sce.trustAsHtml(data.html);

          var sections = data.sections.filter(function(d) {
            d.html = $sce.trustAsHtml(d.html);
            return true;
          });
          //$log.info(data.sections, sections)

          scope.sections = sections;


        });
      }
    };
  });
