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
settings.apiKey = 'AIzaSyCYfU7l7KYDkw9bDOQ6xGR85T0xzJg7MvQ'; // public google drive api key for browser, restricted to your domain
settings.defaultFolder = '0ByZTyEnzm9qqLWVPaE9kaDc4YW8';
settings.title = 'drive-in';