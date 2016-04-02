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
              var GUTTER_OFFSET = 20;
              var NOTE_HEIGHT_OFFSET = 10;
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

              // Several refs in the same parag will overlap.
              // Store handy references enabling visual stacking to fix overlap if it happens.
              var $lastReferencedParagraph;
              var lastNoteHeight = 0;

              // Position each note to the right gutter next to referencing paragraph.
              sidenotes.forEach(function (n) {
                var $s = $($sup.get(n.index));
                var $note = $(n.note);
                var $parag = $s.parent();
                var paragOffset = $parag.offset();

                // Compare current reference paragraph with the one referencing the previous note.
                // If they are the same, ensure notes don't overlap.
                if ($lastReferencedParagraph) {
                  if ($lastReferencedParagraph.get(0) == $parag.get(0)) {
                    paragOffset.top += lastNoteHeight + NOTE_HEIGHT_OFFSET;
                  }
                }

                $note.addClass('sidenote');
                $note.offset({top: paragOffset.top, left: paragOffset.left + $parag.parent().width() + GUTTER_OFFSET});

                $lastReferencedParagraph = $parag;
                lastNoteHeight = $note.height()
              });

              $lastReferencedParagraph = null;
              lastNoteHeight = null;
            }
          }, 0);
        });
      }
    };
  });
