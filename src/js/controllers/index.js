'use strict';

/**
 * @ngdoc function
 * @name drivein.controller:indexCtrl
 * @description
 * # LayoutCtrl
 * Controller of the index page, is the basic controller of drive-in sections.
 * (e.g. subfolders). If there is no GAPI connection, handle the connect with google drive view.
 *
 */
angular.module('drivein')
  .controller('indexCtrl', function($scope, $log, $http, $q, $routeParams) {
    $log.debug('indexCtrl loaded.');

    function clean(html) {
      var s = html.replace(/<p class="[^"]*"><span><\/span><\/p>/gim, '<br>')
                  .replace(/<span(.*?)>/g,'')
                  .replace(/<\/span(.*?)>/g,'')
                  .replace(/name="(.*?)"/g,'')
                  .replace(/style="(.*?)"/g,'')

                  .replace(/class="(.*?)"/g,'')
                  .replace(/data-cl=/g, 'class=')
                  .replace(/<table(.*?)>/g, function(d, attrs){ return '<table class="table" ' + attrs + '>';})

                  .replace(/<p\s+>/g,'<p>');

      return s;
    }

    // reurn an object
    function transformHref(elements, doc) {
      elements.each(function(i, el) {
        var el = $(this),
            href = el.attr('href')  || '',
            is_vimeo = href.match(/vimeo\.com.*?(\d{8,})/),
            is_local = href.match(/^#(.*?)/);

        if(is_vimeo) {
          el.replaceWith($('<div/>',{'data-cl': 'vimeo'}).append('<iframe src="//player.vimeo.com/video/'+ is_vimeo[1] +'" width="100%" height="320" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>'));
        } else if(is_local) {
          el.attr('href', 'https://docs.google.com/document/d/' + doc.id + '/' +is_local[0])
        }
      });
    }

    // transform the source text of a googledocument into a json object.
    function parse(text, doc) {
      //console.log('parse', doc)
      var body = text.match(/<body[^>]*>(.*?)<\/body>/i),
          Q = $('<div/>').append(body.pop()),
          result = {
            sections: []
          },
          title =  Q.find('.title'),
          subtitle = Q.find('.subtitle');


      result.title = title.get().map(function(e) {
        transformHref($(e).find('a'), doc);
        return '<' + e.tagName.toLowerCase() + '>' + $(e).html() + '</' + e.tagName.toLowerCase() +'>';
      }).join('');

      result.subtitle = subtitle.get().map(function(e) {
        transformHref($(e).find('a'), doc);
        return '<' + e.tagName.toLowerCase() + '>' + $(e).html() + '</' + e.tagName.toLowerCase() +'>';
      }).join('');

      // # sections
      title.remove();
      subtitle.remove();

      // transform vimeo links inside sections
      transformHref(Q.find('a'), doc);

      Q.each(function (i, el) {
        var $el = $(el);

        $el.find('img').each(function() {
          var img = $(this);
          img.replaceWith($('<div/>',{'data-cl': 'image'}).append(
            '<img src="'+img.attr('src')+'" alt="alternative text"/><div data-cl="caption">'+img.attr('title')+'</div><div data-cl="reference">'+img.attr('alt')+'</div>'
          ));
        });

        var section = {
          title: $('h1,h2,h3,h4,h5,h6').first().get(),
          html: clean($el.html()),
          type: 'text'
        };

        result.sections.push(section);
      });

      return result;
    };

    // load the given fileId and allow parsing
    $scope.load = function(doc) {
      $log.info('indexCtrl >>> load ', doc.title);// doc.exportLinks['text/html']);

      return $http({
        url: doc.exportLinks['text/html'],
        method: 'GET',
        headers: {
         'Authorization': 'Bearer ' + $scope.access_token
        }
      }).then(function(res) {
        return parse(res.data, doc)
      });
    }

    /*
      ##eventListener $scope.items
      Watch for changements in documents ROOT collection ($scope.items)
    */
    $scope.$watch('items', function(items) { // once items are in place, let's load them if needed
      if(items){ // the root folder has  benn loaded !
        $log.debug('indexCtrl @$scope.items evaluating path in order to load docs');
        $scope.setPath($routeParams.path); // load home documents if path is undefined!
      };
    });

    /*
      ##eventListener $scope.app_status
      If everything is ready app_status has been set to APP_STATUS_READY.
      This allow to load folder content and start the parsing chain.
    */
    $scope.$watch('app_status', function(app_status){
      $log.log('indexCtrl @app_status', app_status);
      if(app_status != APP_STATUS_READY) {
        return;
      };

      if($routeParams.folder && $scope.fileId != $routeParams.folder) {
        $log.log('indexCtrl @app_status', app_status, 'let us discover new contents!')
        $scope.discover($routeParams.folder);
      };
    })

  })
