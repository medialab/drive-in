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
      return  html
            .replace(/<span(.*?)>/g,'')
            .replace(/<\/span(.*?)>/g,'')
            .replace(/name="(.*?)"/g,'')
            .replace(/style="(.*?)"/g,'')

            .replace(/class="(.*?)"/g,'')
            .replace(/<table(.*?)>/g, function(d, attrs){ return '<table class="table" ' + attrs + '>';})
            
            .replace(/<p\s+>/g,'<p>');
      
    }
    

    // transform the source text of a googledocument into a json object.
    function parse(text) {
      var body = text.match(/<body[^>]*>(.*?)<\/body>/i),
          Q = $('<div/>').append(body.pop()),
          result = {
            sections: []
          },
          title =  Q.find('.title'),
          subtitle = Q.find('.subtitle');


      result.title = '<p>'+ title.get().map(function(e) {
        return $(e).html()
      }).join('</p></p>') + '</p>';

      result.subtitle = '<p>'+ subtitle.get().map(function(e) {
        return $(e).html()
      }).join('</p></p>') + '</p>';

      // # sections
      title.remove();
      subtitle.remove();

      // transform vimeo links inside sections
      Q.find('a').each(function(i, el) {
        var el = $(this),
            href = el.attr('href')  || '',
            is_vimeo = href.match(/vimeo\.com.*?(\d{8,})/);

        if(is_vimeo) {
          el.replaceWith($('<div/>',{'class': 'vimeo'}).append('<iframe src="//player.vimeo.com/video/'+ is_vimeo[1] +'" width="100%" height="320" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>'));
        }
      });

      // for each section, save the world
      Q.find('h1').each(function(i, el) {
        var contents = '<p>' + $(this).nextUntil('h1').get().map(function(e) {return $(e).html()}).join('<p></p>') + '</p>', // html specific to this section
            section = {
              title: $(this).text(),
              html: clean(contents), // demander à guillaume
              type: 'text'
            };
            //nextUntil('h1')
        
        // split section if an image was found


        section.html = clean(contents);

        result.sections.push(section);
      });
      
      /*
      $('h1').each( function(i, el){
    var contents = $(this).nextUntil('h1').get().map(function(e) {return $(e).html()}).join(''), // html specific to this section
        section = {
          title: $(this).text(),
          html: cmp(contents) // guillaume
        };
        */

      console.log('documentu', result);

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
        return parse(res.data)
      });
    }

    /*
      ##eventListener $scope.items
      watch for changements in documents ROOT collection ($scope.items)
    */
    $scope.$watch('items', function(items) { // once items are in place, let's load them if needed
      if(items){ // the root folder has  benn loaded !
        $log.debug('indexCtrl @$scope.items evaluating path in order to load docs');  
        $scope.setPath($routeParams.path); // load home documents if path is undefined! 
      };
    });

    /*
      ##eventListener $scope.app_status
      If everything is ready, load main content.
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