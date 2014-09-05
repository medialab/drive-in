'use strict';
/*
  Modify only in case of emergency
*/
var settings = {
  baseUrl: 'https://drive.google.com/folderview?id=', // the google drive sharing base url
  partials:'src/partials' // __relative__ basefolder URL for angular partials tamplates
};

/*
  Modify according to your own data ...
*/
settings.apiKey = 'your (browser public!) google drive api key'; // public google drive api key for browser, restricted to your domain
settings.defaultFolder = 'your public default folderId';
settings.title = 'drive-in';