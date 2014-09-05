'use strict';


angular.module('tipot.directives', [])
  .directive(
    "lazyFile",
    ['$window', '$document', '$log', '$rootScope', 'GoogleApiFactory', function($window, $document, $log, $rootScope, GoogleApiFactory) {
      return {
        scope: {
          file: '=' //to access $parent.bookmark stuffs
        },
        transclude: true,
        link: function(scope, element, attrs) {
          $log.debug('[directive] lazyFile', scope.file.title, scope.file.type, scope.file.id);
          
          element.text('.');//loading
          
          if(scope.file.type == "Document"){
            GoogleApiFactory.getHtml(scope.file.id).then(function(res){
              element.text('...');
              var body = res.data.match(/<body[^>]*>((.|[\n\r])*)<\/body>/i)[1];
              
              // intercept same google doc internal bookmark 
              body = body.trim().replace(/href="#([^"]{1,})"/g, function(m, bookmark) {
                return 'href="'+ $rootScope.path +'?bookmark=' + bookmark + '"';
              });
              // intercept different google docs bookmark
              // in the form of https://docs.google.com/a/sciencespo.fr/document/d/1G4l1YG8DZAx9YHmQNTNomgwJpSL6X5hwPDuf1An9b30/edit#bookmark=id.2av83x11u4rf
              body = body.trim().replace(/href="[^"]*document\/d\/([^\/]*)\/[^#]*#bookmark=([^"]{1,})"/g, function(m, fileId, bookmark) {
                return 'href="'+ $rootScope.path +'?doc='+ fileId +'&bookmark=' + bookmark + '"';
              });

              element.html(mar.makeHtml(' ' + body.trim()));

              // does this body contain the bookmark given as link?
              if(body.indexOf('name="'+$rootScope.bookmark+'"') != -1){
                $rootScope.anchoring();
              }

              // $log.debug alert($rootScope.bookmark);

              // scroll to current bookmark if it has been found on page...
            });
          } else if(scope.file.type == "html"){
            element.text('...'); // very public folder ONLY
            /*GoogleApiFactory.getView(scope.file.id).then(function(res){
              console.log(arguments);
            });*/
          } else  {
            gapi.client.drive.files.get({
              'fileId': scope.file.id
            }).execute(function(res){
              if(res.result.mimeType == 'application/vnd.google-apps.document') {
                var xhr = new XMLHttpRequest();
                element.text('....');
                xhr.open('GET', res.result.exportLinks['text/html']);
                xhr.onload = function() {
                  var body = ' ' + xhr.responseText.match(/<body[^>]*>((.|[\n\r])*)<\/body>/i)[1];
                  //console.log('oaodiapoidpaouifpafaf', body)
                  element.html('<h2>' + scope.file.title + '</h2>' + mar.makeHtml(body));
                };
                xhr.onerror = function(e) {
                  $log.error("[directive] lazyFile.onerror", e);
                };
                xhr.send();

              };
            });
          }
        }
      }
    }]);