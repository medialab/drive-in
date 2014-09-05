'use strict';

var GOOGLE_CLIENT_INITIALIZED = 'GOOGLE_CLIENT_INITIALIZED',
    GOOGLE_API_LOADED = 'GOOGLE_API_LOADED',
    GOOGLE_DEFAULT_FOLDER_LOADED = 'GOOGLE_DEFAULT_FOLDER_LOADED',

    GOOGLE_LOAD_FILE = 'GOOGLE_LOAD_FILE';


angular.module('tipot.controllers', [])
  /*
    
    The very main controller. 
    ===
  */
  .controller('layoutCtrl', ['$scope', '$rootScope', '$log', '$location', '$routeParams', '$anchorScroll', 'YqlFactory', function($scope, $rootScope, $log, $location, $routeParams, $anchorScroll, YqlFactory) {

    $scope.items = {};
    $scope.status = 'ciao';
    $scope.title = settings.title;
    $scope.sections = [];
    $scope.folders = [];// menu entries
    
    $scope.setSections = function(folders) {
      $scope.sections = folders;
    }

    $scope.lazyLoad = function(file) {
      console.log('ehi, loading this', fileId);
      // enrich file with html content
    };

    $scope.$on(GOOGLE_LOAD_FILE,function( e, fileId) {
      //
      console.log(gapi)
      alert(fileId);
    });

    $scope.path = '';
    

    

    /*
      This simple function return the callback(object) of the object having the key=value
    */
    function lookFor(obj, key, value, callback){ // return the very first object, search is a couple key value
      for(var i in obj.div){
        //console.log('scanning',key,value,' ',i,obj.div[i]);
        if(typeof value === 'function' && obj.div[i][key])// looking only for the key args 
          return callback(obj.div[i]);

        if(i == key && obj.div[i] == value)
          return callback(obj.div);

        if(obj.div[i][key] && obj.div[i][key] == value){
          //console.log('ffound', callback(obj.div[i]));
        
          return callback(obj.div[i]);
        }

        if(typeof obj.div[i] === 'object'){
          var loop = lookFor(obj.div[i], key, value, callback);
          if(loop !== undefined)
            return loop;
        }
      }
      return undefined; // i.e. not found
    };


    $scope.grab = function(folderId, callback) {
      var files = [],
          folders = [],
          sections = [],
          bibliography =[], // entries from a specific bib file!!!
          styles =[]; // list of stylesheet to be applied

      console.log('select * from html where url="' + settings.baseUrl + folderId + '" and xpath=\'//div[@class="flip-entry"]\'')
      return YqlFactory.get({
        q: 'select * from html where url="' + settings.baseUrl + folderId + '" and xpath=\'//div[@class="flip-entry"]\'',
        format:'json',
        diagnostics: true
      }, function(res){ // FIRST LIST OF FILES
        
        if(!res.query.results) {
          $log.error("probably you didn't share the google folder, did you?");
          $log.info("received", res);
          return callback({
            files: files,
            folders: folders,
            styles: styles,
            sections: sections,
            bibliography: bibliography,
          });;
        }
        console.log(folderId, res.query.results.div.length);
        
        function structure(item) {
          var title = lookFor(item, 'class', 'flip-entry-title', function(d){
                        return {
                          text: d.p.replace(/\([^\)]*\)/g, '').split(/^\d+\s/).pop(),
                          raw: d.p
                        };
                      }),
              type = lookFor(item, 'class', 'flip-entry-thumb', function(d){
                        return d.img.alt; // et oui monsieur
                      }),
              id = item.id.substring(6);
          // add folders
          if(type === undefined) {
            var slugs = folders.map(function(d){return d.slug}), // slug of previous folders
                slug  = slugify(title.text),
                c = 0;

            while(slugs.indexOf(slug) != -1) {
              c++;
              slug = slugify(title.text + ' ' + c);
            };
             
            // this is a real subfolder babe ...
            folders.push({
              title: title.text,
              slug: slug,
              id: id
            });
            sections.push({
              title: title.text,
              sort: title.raw,
              id: id
            });
          } else {
            var src = lookFor(item, 'class', 'flip-entry-thumb', function(d){
                        return d.img.src.split(/=s\d+$/).shift();
                      });
            // type assignation based on file naming 
            if(title.text && title.text.match(/\.html$/))
              type = "html";
            else if(title == "style.css")
              type = "css";
            //else if(title == "bibliography")
            //  type = "bibtex";

            switch(type) {
              case "bibtex":
                bibliography.push({
                  title: title.text,
                  id: id,
                  type: type,
                  src: src
                });
                break;
              case "css":
                styles.push({
                  title: title.text,
                  id: id,
                  type: type,
                  src: src
                });
                break;
              case "JPEG Image":
              case "PNG Image":
              case "Photo":
                files.push({
                  title: title.text,
                  id: id,
                  type: 'image',
                  src: src
                });
                break;
              case "Document":
                sections.push({
                  title: title.text,
                  id: id,
                  sort: title.raw,
                  type: type,
                  src: src
                }); // and go on with default placement
              default:
                files.push({
                  title: title.text,
                  id: id,
                  type: type,
                  src: src
                });
                break;
            };
              
          };
        };
    
        if(res.query.results.div.length) {
          for(var i in res.query.results.div) {
            structure(res.query.results.div[i]);
          };
        } else { // just one item under folder
          structure(res.query.results.div);
        }
        console.log('found', folderId, files, folders);

        // this last loop allow to put together same name files

        callback({
          files: files,
          folders: folders,
          styles: styles,
          sections: sections,
          bibliography: bibliography,
        });
        //$scope.$apply();
      });
    }; // end of grab funct
    
    
    
    /*
      Load Default folder (cfr. settings.js)
      How to get google drive folder content without being trapped by authorization
    */
    $rootScope.$on(GOOGLE_API_LOADED, function(){
      $log.debug('layoutCtrl @GOOGLE_API_LOADED');
        var t = $scope.grab(settings.defaultFolder, function(results) {
          $log.info('grabbing', results, settings.defaultFolder)
          $scope.files = results.files;
          $scope.folders = results.folders;

          $scope.bibliography = results.bibliography;
          
          /* inject javascript, todo
          for( var s in results.styles) {
            alert('aosdpaodpod');
            $('head').append('<link rel="stylesheet" href="' + results.styles[s].src +'" type="text/css" />');
          };
          */

          $rootScope.ready = true;
          $rootScope.$emit(GOOGLE_DEFAULT_FOLDER_LOADED);
        });
    });


    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
      $log.debug('layoutCtrl @$routeChangeSuccess', $location, $routeParams.bookmark? 'bookmark=' + $routeParams.bookmark:'');
      $rootScope.path = '/#' + $location.path();
      $rootScope.bookmark = $routeParams.bookmark;
    });


    $rootScope.$on('$routeUpdate', function() {
      $log.debug('layoutCtrl @$routeUpdate', arguments);
      $rootScope.bookmark = $routeParams.bookmark; // try to scroll to, hopeing with success...
      $rootScope.anchoring();
    });

    /*
      #function anchoring
      Scroll to $rootScope.bookmark anchor inside current VIEW, according to its content. This function have to be available for our `file` directive (cfr. directives.js)
    */
    $rootScope.anchoring = function() {
      $location.hash($rootScope.bookmark);
      $anchorScroll();
      $location.hash('d');
    };


    $log.log('%c layoutCtrl loaded.', 'color: #c0c0c0');
  }])
  
  

  /*

    StarterCtrl
    ---
    
    This controller just start the chain:
    emit with rootscope the signal that google drive api is correctly enabled.
    This is mainly due to gapi library loading method.
    the "load" function on the index.html page emit a single event when everything is in plce. We just rebound the signal through rootscope.

  */
  .controller('starterCtrl', ['$scope', '$rootScope', '$log', function($scope, $rootScope, $log) {
    

    $scope.$on(GOOGLE_CLIENT_INITIALIZED, function(e, settings){

      $log.debug('starterCtrl @GOOGLE_CLIENT_INITIALIZED, api key received: ', settings.apiKey);
      gapi.client.setApiKey(settings.apiKey);
      gapi.client.load('drive', 'v2', function(){
        $rootScope.$emit(GOOGLE_API_LOADED);
      });
    });


    $log.log('%c starterCtrl loaded.', 'color: #c0c0c0');
  }])


  /*

    INDEX
    =====
    Main page controller.

  */
  .controller('indexCtrl', ['$log', '$scope', function($log, $scope) {
    $scope.folderUrl = '';// test if folderURl is a valid one. If yes, fill the folderId dir var
    $scope.folderId = '';

    $scope.setSections([]);

    $scope.$watch('folderUrl', function(v){
      if(!v)
        return;

      var candidate = v.match(/[A-Za-z0-9_]{12,}/);
      if(candidate)
        $scope.folderId = candidate.pop();
    });

    $log.log('%c indexCtrl loaded.', 'color: #c0c0c0');
  }])
  
  /*

    BIBLIOGRAPHY
    ===
    This special controller handle the BIBLIOGRAPHY view.
    Normally you should have at least a file called bibliography something in your home folder
  
  */
  .controller('bibCtrl', ['$scope', '$rootScope', '$log', 'GoogleApiFactory', function($scope, $rootScope, $log, GoogleApiFactory) {
    $scope.entries = [];


    $scope.sync = function(){
      $log.info('bibCtrl.sync', $scope.bibliography);

      GoogleApiFactory.getText($scope.bibliography[0].id).then(function(res) {
        $scope.entries = mla(res.data).getEntries(); // todo some sorting babe
      });
    };


    $rootScope.$on(GOOGLE_DEFAULT_FOLDER_LOADED, function() {
      $log.info('pageCtrl@GOOGLE_DEFAULT_FOLDER_LOADED');
      $scope.sync();
    });


    if($rootScope.ready){ 
      $log.info("rootscpoe is ready, we're loaading this stuff again and again...");
      $scope.sync();
    }


    $log.log('%c bibCtrl loaded.', 'color: #c0c0c0');
  }])
  /*
    driveCtrl
    ===
    A very special controller happening when urling '/drive-in/:folderId' or '/drive-in/'
    It forces the reloading of everything based on a new folderId;
    Note: it does not change settings.baseFolder.
  */
  .controller('driveCtrl', ['$scope', '$rootScope', '$log', '$routeParams', function($scope, $rootScope, $log, $routeParams) {
    
    $scope.folderUrl = '';
    $scope.folderId = '';

    $scope.driveIsReady = false;

    $scope.sync =function() {
      $log.info("driveCtrl @$rootScope is ready", $routeParams.folderId);
      if($routeParams.folderId) {
        $log.info("driveCtrl $rootScope is ready and have a nice google drive id", $routeParams.folderId);

        $scope.grab($routeParams.folderId, function(results) {
          $log.info('grabbing', results, $routeParams.folderId)
          $scope.files = results.files;
          $scope.sections = $scope.setSections(results.sections);



          $scope.bibliography = results.bibliography;

          $scope.driveIsReady = true;
        });
      }
    };




    
    if($rootScope.ready){ 
      $log.info("everything is ready, we're already loaded the default folder.");
      $scope.sync();
    } else {
      $rootScope.$on(GOOGLE_DEFAULT_FOLDER_LOADED, $scope.sync);

    }
    
    $log.info('driveCtrl loaded.');
  }])
  .controller('drivePageCtrl', ['$scope', '$log', '$routeParams', function($scope, $rootScope, $log, $routeParams) {

    if($rootScope.ready){ 
      $log.info("driveCtrl $rootScope is ready");
      //$scope.sync();
    }
    
    $log.info('drivePageCtrl loaded.');
  }])
  /*
    This special controller handle the basic view.
  */
  .controller('pageCtrl', ['$scope', '$rootScope', '$log', '$routeParams', function($scope, $rootScope, $log, $routeParams) {
    $scope.files = [];
    $scope.pageIsReady = false; // every time we reload the page

    $scope.sync = function(){
      var folderIndex = $scope.folders
            .map(function(d){return d.slug})
            .indexOf($routeParams.id),
          pageId = folderIndex != -1 ? $scope.folders[folderIndex].id: $routeParams.id;

      $log.debug('pageCtrl.sync, $routeParams.id', $routeParams.id, 'mapped to', pageId);
      // reset files
      $scope.files = [];
      
      var t = $scope.grab(pageId, function(results) {
        $scope.pageIsReady = true;
        console.log('grabbing', results, pageId)
        $scope.files = results.files;
        
      });
    }
    // FIRST PAGE CTRL LOAD owaiting for the menu to be completed... then check if the folder is under the tree...
    $rootScope.$on(GOOGLE_DEFAULT_FOLDER_LOADED, function() {
      $log.info('pageCtrl@GOOGLE_DEFAULT_FOLDER_LOADED');
      $scope.sync();
    });


    if($rootScope.ready){ 
      $log.info("rootscpoe is ready, we're loaading this stuff again and again...");
      $scope.sync();
    }
    
    $log.info('pageCtrl loaded.');
  }])