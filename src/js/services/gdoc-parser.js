String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

angular
  .module('drivein')
  .service('gdocParser', function() {
    function reduce(input, rgx, replacement) {
      var found, output = input;

      while (found = rgx.exec(input)) {
        output = output.replaceAll(found[1], replacement);
      }

      return output;
    };

    function clean(html) {
      // Reduce text to version where `<span class="c5">...</span>` becomes `<em>...</span>`,
      // then pass this transformed text to another reducer making it `<em>...</em>`,
      // effectively enabling italic text.
      var openingRgx = /(<span\s{1}class=\"c\d+\">)[^<]+(?:<\/span>)/gim,
          closingRgx = /(?:<em>)[^<]+(<\/span>)/gim;

      var em = reduce(reduce(html, openingRgx, '<em>'), closingRgx, '</em>');
      var s = em.replace(/<p class="[^"]*"><span><\/span><\/p>/gim, '<br>')
                .replace(/<span(.*?)>/g,'')
                .replace(/<\/span(.*?)>/g,'')
                .replace(/name="(.*?)"/g,'')
                .replace(/style="(.*?)"/g,'')
                .replace(/class="(.*?)"/g,'')
                .replace(/data-cl=/g, 'class=')
                .replace(/<table(.*?)>/g, function(d, attrs){ return '<table class="table" ' + attrs + '>';})
                .replace(/<p\s+>/g,'<p>');

      return s;
    }


    // return an object
    function transformHref(elements, doc) {
      elements.each(function(i, el) {
        el = $(this);
        var href = el.attr('href')  || '',
            is_vimeo = href.match(/vimeo\.com.*?(\d{8,})/),
            is_local = href.match(/^#(.*?)/);

        if(is_vimeo) {
          el.replaceWith($('<div/>',{'data-cl': 'vimeo'})
            .append('<iframe src="//player.vimeo.com/video/'+ is_vimeo[1] +'" width="100%" height="320" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>'));
        } else if(is_local) {
          el.attr('href', 'https://docs.google.com/document/d/' + doc.id + '/' +is_local[0]);
        }
      });
    }

    return {
        // transform the source text of a googledocument into a json object.
        parse: function (text, doc) {
          var body = text.match(/<body[^>]*>(.*?)<\/body>/i),
              Q = $('<div/>').append(body.pop()),
              result = {
                sections: []
              },
              title =  Q.find('.title'),
              subtitle = Q.find('.subtitle');


          result.title = title.get().map(function(e) {
            transformHref($(e).find('a'), doc);
            return '<' + e.tagName.toLowerCase() + '>' + $(e).html() + '</' + e.tagName.toLowerCase() +'>';
          }).join('');

          result.subtitle = subtitle.get().map(function(e) {
            transformHref($(e).find('a'), doc);
            return '<' + e.tagName.toLowerCase() + '>' + $(e).html() + '</' + e.tagName.toLowerCase() +'>';
          }).join('');

          // # sections
          title.remove();
          subtitle.remove();

          // transform vimeo links inside sections
          transformHref(Q.find('a'), doc);

          Q.each(function (i, el) {
            var $el = $(el);

            $el.find('img').each(function() {
              var img = $(this);
              img.replaceWith($('<div/>',{'data-cl': 'image'}).append(
                '<img src="'+img.attr('src')+'" alt="alternative text"/><div data-cl="caption">'+img.attr('title')+'</div><div data-cl="reference">'+img.attr('alt')+'</div>'
              ));
            });
            var extractedTitle = $el.find('h6').first().text();
            $el.find('h6').remove();

            var section = {
              title: extractedTitle,
              html: clean($el.html()),
              type: 'text'
            };

            result.sections.push(section);
          });

          return result;
        },

        parseMetadata: function (fileContents) {
          var text = clean(fileContents);
          var body = text.match(/<body[^>]*>(.*?)<\/body>/i);
          var Q = $('<div/>').append(body.pop());
          var result = {};
          Q.find('h3').each(function(res, element) {
            result[element.textContent] = element.nextSibling.textContent;
          });

          return result;
        }
    };
});
