(function () {
  var Reader = function () {
    this.article = $('article');
    this.contentText = [];
  };

  var NegativeRegEx = /breadcrumb|combx|comment|contact|disqus|foot|footer|footnote|link|media|meta|mod-conversations|promo|related|scroll|share|shoutbox|sidebar|social|sponsor|tags|toolbox|widget/i;

  Reader.prototype.init = function () {
    if (!this.article) {
      return false;
    }
    this.parseArticle();
    this.render();
  };

  Reader.prototype.render = function () {
    var container = $('<div></div>').attr({
      id: 'simple-read-container'
    }).css({
      display: 'none'
    });

    var widgetRoot = container.get(0).createShadowRoot ?
      container.get(0).createShadowRoot() :
      container.get(0).webkitCreateShadowRoot();
    var widgetWrap = $('<dialog></dialog>').css({
      'position': 'fixed',
      'width': '100%',
      'height': '100%',
      'top': 0,
      'left': 0,
      'background': 'rgb(251, 251, 251)',
      'zIndex': '2147483647',
      'display': 'block',
      'padding': 0,
      'border': 'none',
      'margin': 0,
      overflow: 'scroll',
      'overflow-x': 'hidden'
    });

    $wrapper = $('<div></div>').addClass('wrapper').css({
      width: '800px',
      margin: '0 auto',
      'overflow-x': 'hidden'
    });

    $innerContent = $('<div></div>').addClass('inner-content').appendTo($wrapper);

    var header = $('<h1></h1>').addClass('header').text(this.header);
    $innerContent.append(header);

    $innerContent.append($('<img />')
      .addClass('brief-img')
      .attr({ src: this.mediaContent })
      .css({
        display: 'block',
        margin: '0 auto'
      }));

    var content = $('<div></div>').addClass('content').html(this.contentText.join(''));

    $innerContent.append(content);

    widgetWrap.append($wrapper);

    widgetRoot.appendChild(widgetWrap.get(0));
    $('body').append(container);
    this.container = container;
    this.$wrapper = $wrapper;
    this.$innerContent = $innerContent;
  };

  Reader.prototype.parseArticle = function () {
    var content = this.article.find('.content__article-body');
    this.getMediaContent();
    this.getContents(content);
  };

  Reader.prototype.getHeader = function () {

  };

  Reader.prototype.getMediaContent = function () {
    var mediaContent = this.article.find('.article__img-container picture img');
    this.mediaContent = mediaContent.attr('src');
  };

  Reader.prototype.shouldKeep = function (node) {
    if (node.innerHTML === '') {
      return false;
    }

    if ($.trim(node.textContent) === '') {
      return false;
    }

    if (NegativeRegEx.test(node.className)) {
      return false;
    }

    return true;
  };

  Reader.prototype.toggleShow = function (show) {
    if (!this.container) {
      return;
    }
    if (show) {
      $('html').css({
        overflow: 'hidden'
      });

      this.container.show();
      var pageNums = Math.ceil(this.$wrapper.height() / $(window).height());


      return;
    }
    $('html').css({
      overflow: 'auto'
    });

    this.container.hide();
  };

  Reader.prototype.getContents = function (content) {
    var children = content.children();
    for (var i = 0; i < children.length; i++) {
      if (this.shouldKeep(children[i])) {
        this.contentText.push(children[i].outerHTML);
      }
    }
  };

  Reader.prototype.getPlainText = function (node) {
    var self = this;

    if (node.nodeType === 3) {
      self.contentText.push({
        type: 'text',
        content: node.nodeValue
      });
      return;
    }

    var tagName = node.tagName.toLowerCase();
    if (tagName === 'a') {
      self.contentText.push({
        type: 'a',
        url: node.getAttribute('href'),
        content: node.nodeValue
      });
      return;
    }

    var children = node.childNodes;
    for (var i = 0, length = children.length; i < length; i++) {
      self.getPlainText(children[i]);
    }
  };

  $(function () {
    var reader = new Reader();
    reader.init();
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      if (request && request.action === 'simple') {
        reader.toggleShow(request.value);
      }
    });
  });
} ());