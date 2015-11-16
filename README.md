drive-in
========

publish a simple website from a _public_ google drive folder without coding in HTML.
Only some [markdown syntax](http://daringfireball.net/projects/markdown/syntax) are required for __bold__ or _italic_
Everythiong else is driven by googledocs!


#### advanced usages
You can use drive-in in conjunction with [editey](http://www.editey.com/) in order to work directly with html files - with google drive realtime comments and edits. If you decide to use html and personal css files, you must set the folder permission to "publicly visible on the web". 

## How to install
Drive-in show in a "one page" manner the files and the subfolders of one (public) google drive folder.
Drive-in generates _menu entries_ from the subfolders list and simply print on screen the google docs contents as html respecting the alphabetic ordering.

- Apply for a google public API key
- clone the project
- copy the file [settings.sample.js](http://) into [settings.js](http://example.com/ ) and complete it with your API key

Here are the default settings :

	var settings;
	
	(function() {
	    'use strict';
	
	    settings = {
	      title:        'drive-in',
	      baseurl:       '', // your base url useful for subpath, if any.
	      sharing_link: 'https://drive.google.com/folderview?id=XXXXYYYYZZZZ&usp=sharing',
	      CLIENT_ID:    'your (public!) api key',
	      SCOPES:       'https://www.googleapis.com/auth/drive',
	    };
	})();
	
- you also need to launch a server that will serve drivein sources (like python -m SimpleHTTPServer or http-server for example)
- you need to add a host to your /etc/hosts file that will point to your server. This is required because drive's api doesn't allow to be called from localhost.
- now you can launch your browser at your server's URL and append to it the id of the folder where your drive data resides

## Q&A
#### "I want to add a bookmark (internal link) into a google document"
In Google Docs, the links between different parts of the same documents are made by [bookmarks](https://support.google.com/docs/answer/45352?hl=en). Drive-in can recognize those links and transform them in html anchor links.

#### "... and if I want to use vimeo videos?"
Simply insert a __link__ to your video in the document. It will be converted to an embedded video.

### configure google analytics
Thanks to [angularytics](https://github.com/mgonto/angularytics). The google analytics script is executed directly inside index.html. Every step in every angular view is quietly recorded.
