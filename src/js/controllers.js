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
  .controller('layoutCtrl', ['$scope', '$rootScope', '$log', 'YqlFactory', function($scope, $rootScope, $log, YqlFactory) {

    $scope.items = {};
    $scope.status = 'ciao';
    $scope.title = settings.title;

    

    $scope.lazyLoad = function(file) {
      console.log('ehi, loading this', fileId);
      // enrich file with html content
    };

    $scope.$on(GOOGLE_LOAD_FILE,function( e, fileId) {
      //
      console.log(gapi)
      alert(fileId);
    });
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
          folders = [];

      console.log('select * from html where url="' + settings.baseUrl + folderId + '" and xpath=\'//div[@class="flip-entry"]\'')
      return YqlFactory.get({
        q: 'select * from html where url="' + settings.baseUrl + folderId + '" and xpath=\'//div[@class="flip-entry"]\'',
        format:'json',
        diagnostics: true
      }, function(res){ // FIRST LIST OF FILES
        
        if(!res.query.results) {
          $log.error("probably you didn't share the google folder, did you?");
          return
        }
        console.log(folderId, res.query.results.div.length);
        
        function structure(item) {
          var title = lookFor(item, 'class', 'flip-entry-title', function(d){
                        return d.p.split(/^\d+\s/).pop();
                      }),
              type = lookFor(item, 'class', 'flip-entry-thumb', function(d){
                        return d.img.alt; // et oui monsieur
                      }),
              id = item.id.substring(6);
          if(type === undefined) {
            // this is a real subfolder babe ...
            folders.push({
              title: title,
              id: id
            });
          } else {
            var src = lookFor(item, 'class', 'flip-entry-thumb', function(d){
                        return d.img.src.split(/=s\d+$/).shift();
                      });
            if(type=="PNG Image" || type =="Photo" || type=="JPEG Image")
              type = "image";
            else 
              console.log(type)
            

            files.push({
              title: title,
              id: id,
              type: type,
              src: src
            });
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

        callback({
          files: files,
          folders: folders
        });
        //$scope.$apply();
      });
    }; // end of grab funct
    
    
    $scope.folders = [];
    /*
      How to get google drive folder content without being trapped by authorization
    */
    $rootScope.$on(GOOGLE_API_LOADED, function(){
      $log.info('layoutCtrl@GOOGLE_API_LOADED');
        var t = $scope.grab(settings.defaultFolder, function(results) {
          console.log('grabbing', results, settings.defaultFolder)
          $scope.files = results.files;
          $scope.folders = results.folders;
          $rootScope.ready = true;
          $rootScope.$emit(GOOGLE_DEFAULT_FOLDER_LOADED);
        });
    });

    $log.info('layoutCtrl loaded.');
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

      $log.info('starterCtrl@GOOGLE_CLIENT_INITIALIZED, api key received: ', settings.apiKey);
      gapi.client.setApiKey(settings.apiKey);
      gapi.client.load('drive', 'v2', function(){
        $rootScope.$emit(GOOGLE_API_LOADED);
      });
    });


    $log.info('starterCtrl loaded.');
  }])

  .controller('indexCtrl', ['$log', function($log) {

    $log.info('indexCtrl loaded.');
  }])

  .controller('pageCtrl', ['$scope', '$rootScope', '$log', '$routeParams', function($scope, $rootScope, $log, $routeParams) {
    $scope.files = [];

    $scope.sync = function(){
      $scope.files = [];
      var t = $scope.grab($routeParams.id, function(results) {
        console.log('grabbing', results, $routeParams.id)
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