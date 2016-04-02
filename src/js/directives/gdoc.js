'use strict';

/**
 * @ngdoc directive
 * @name drivein.directive:gdoc
 * @description
 * # parse a google document on demand
 */
angular.module('drivein')
  .directive('gdoc', function($log, $sce, $timeout) {
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
        scope.load({doc: scope.doc}).then(function(data){
          scope.title = $sce.trustAsHtml(data.title);
          scope.subtitle = $sce.trustAsHtml(data.subtitle);
          scope.html = $sce.trustAsHtml(data.html);

          var sections = data.sections.filter(function(d) {
            d.html = $sce.trustAsHtml(d.html);
            return true;
          });

          scope.sections = sections;

          // Deal with sidenotes, if any.
          $timeout(function() {
            var $gdoc = $(element.find('.gdoc'));
            var $sup = $gdoc.find('sup');
            if ($sup.length > 0) {
              var OFFSET = 20;
              var rawSidenotes = $gdoc.find('.contents div');

              var sidenotes = [];
              rawSidenotes.each(function (i, note) {
                // HTML output starts with "[X]", so the actual comment is at
                // indexAt(3). Find * at indexAt(3) to consider it a sidenote,
                // otherwise remove it from DOM.
                if (note.innerText.indexOf('*') === 3) {
                  sidenotes.push({index: i, note: note});
                } else {
                  $(note).remove();
                }
              });

              sidenotes.forEach(function (n) {
                var $s = $($sup.get(n.index));
                var $note = $(n.note);
                var $parag = $s.parent();
                var paragOffset = $parag.offset();
                $note.addClass('sidenote');
                $note.offset({top: paragOffset.top, left: paragOffset.left + $parag.parent().width() + OFFSET});
              });
            }
          }, 0);
        });
      }
    };
  });
