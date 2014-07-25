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


    function grab(folderId, callback) {
      var files = [],
          folders = [];

      return YqlFactory.get({
        q: 'select * from html where url="' + settings.baseUrl + folderId + '" and xpath=\'//div[@class="flip-entry"]\'',
        format:'json',
        diagnostics: true
      }, function(res){ // FIRST LIST OF FILES
        
        console.log(res);
        for(var i in res.query.results.div) {
      
          var title = lookFor(res.query.results.div[i], 'class', 'flip-entry-title', function(d){
                        return d.p.split(/^\d+\s/).pop();
                      }),
              type = lookFor(res.query.results.div[i], 'class', 'flip-entry-thumb', function(d){
                        return d.img.alt; // et oui monsieur
                      }),
              id = res.query.results.div[i].id.substring(6);
          if(type === undefined) {
            // this is a real subfolder babe ...
            folders.push({
              title: title,
              id: id
            });
          } else {
            var src = lookFor(res.query.results.div[i], 'class', 'flip-entry-thumb', function(d){
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
        console.log('heyy', files, folders);

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
        var t = grab(settings.defaultFolder, function(results) {
          console.log('grabbing', results, settings.defaultFolder)
          $scope.files = results.files;
          $scope.folders = results.folders;
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
  }]);