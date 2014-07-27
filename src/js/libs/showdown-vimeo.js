
        (function(){
          var vimeo = function(converter) {
            // ... extension code here ...
            return [

            {
              type: 'lang',
              regex: '\\^\\^vimeo\\s+([^\\d]*(\\d+)[^\\s]*)\\s+(\\d+)?',
              replace: function(match, url, id, height) {
                var h = height || 281;
                //return '<img src="http://b.vimeocdn.com/thumbnails/defaults/default.300x400.jpg">';
                return '<iframe src="//player.vimeo.com/video/'+ id +'" width="100%" height="' + h + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
              }
            }

            ]
          };

          // Client-side export
          if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.vimeo = vimeo; }
          // Server-side export
          if (typeof module !== 'undefined') module.exports = vimeo;
        }());

