drive-in
========

publish a simple website from a _public_ google drive folder without coding in HTML.
Only some [markdown syntax](http://daringfireball.net/projects/markdown/syntax) are required for __bod__ or _italic_
Everythiong else is driven by googledocs!


#### advanced usages
You can use drive-in in conjunction with [editey](http://www.editey.com/) in order to work directly with html files - with google drive realtime comments and edits. If you decide to use html and personal css files, you must set the folder permission to "publicly visible on the web". 

## How to install: 30 sec. installation
Drive-in show in a "one page" manner the files and the subfolders of one (public) google drive folder.
Drive-in generates _menu entries_ from the subfolders list and simply print on screen the google docs contents as html respecting the alphabetic ordering.

Apply for a google public API key, clone the project, copy the file [settings.sample.js](http://) into [settings.js](http://example.com/ ) and modify it according to your needs...
Voila the default settings :
	
	'use strict';

	var settings = {
  		baseUrl: 'https://drive.google.com/folderview?id='// the google drive sharing base url that you do not need to change
	};

	/*
	  	Modify according to your own data ...
	*/
	settings.apiKey = 'your (public!) api key';
	settings.defaultFolder = 'your public default folder';
	settings.title = 'DRIVE-IN'

That'is

## Q&A
#### "I want to add a bookmark (internal link) into a google document"
In Google Docs, the links between different parts of the same documents are made by [bookmarks](https://support.google.com/docs/answer/45352?hl=en). Drive-in can recognize those links and transform them in html anchor links.

#### "... and if I want to use vimeo videos?"
This is a markdown magic. Just type in a google doc a __line__ starting with `^^vimeo` followed by the vimeo share link:

	Oh! bla bla bla...
	
	^^vimeo http://vimeo.com/38447770
	
	Eh! bla bla bla...

### configure google analytics
Thanks to [angularytics](https://github.com/mgonto/angularytics). The google analytics script is executed directly inside index.html. Every step in every angular view is quietly recorded.


<!--
#### "How can UI intagrate BIBTEX references?"
There is a bibtex javascript parser for google docs named . -->
