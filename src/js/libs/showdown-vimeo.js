
        (function(){
          var vimeo = function(converter) {
            // ... extension code here ...
            return [
            {
              type: 'lang',
              regex: '\\^\\^vimeo.*(http://vimeo.com/)(\\d+)',
              replace: function(match, url, id, height) {
                console.log('ciao', arguments)
                var h = 400;
                return '<iframe src="//player.vimeo.com/video/'+ id +'" width="100%" height="' + h + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
                return ''
              }
            }
            ]
          };

          // Client-side export
          if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.vimeo = vimeo; }
          // Server-side export
          if (typeof module !== 'undefined') module.exports = vimeo;
        }());

