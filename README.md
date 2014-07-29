drive-in
========

publish a simple website from a public google drive folder without coding in HTML.
Only some [markdown syntax](http://daringfireball.net/projects/markdown/syntax) are required for __bod__ or _italic_
Everythiong else is driven by googledocs!


To be used in conjunction with (aaa)http://www.editey.com/ which allow you to comment and edit collaboratively evarey pieces of code!

## How to install: 30 sec. installation

Drive-in uses just one (public) folder as website root and generates a one-level structure of subfolders as _menu entries_.

Apply for a google public API key, clone the project, copy the file [settings.sample.js](http://) into [settings.js](http://example.com/ ) and modify it according to your need...
Voila the default settings :
	
	'use strict';

	var settings = {
  		baseUrl: 'https://drive.google.com/folderview?id='// the google drive sharing base url
	};

	/*
	  	Modify according to your own data ...
	*/
	settings.apiKey = 'your (public!) api key';
	settings.defaultFolder = 'your public default folder';
	settings.title = 'DRIVE-IN'

That'is

###"... and if I want to use vimeo videos?"
This is a markdown magic. Just type in a google doc a __line__ starting with `^^vimeo` followed by the vimeo share link:

	Oh! bla bla bla...
	
	^^vimeo http://vimeo.com/38447770
	
	Eh! bla bla bla...
