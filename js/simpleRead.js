(function () {
  var Reader = function () {
    this.article = document.querySelector('article');
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
    var container = document.createElement('div');
    $(container).attr({
      id: 'simple-read-container'
    }).css({
      display: 'none'
    });

    var widgetRoot = container.createShadowRoot ? container.createShadowRoot() : container.webkitCreateShadowRoot();
    var widgetWrap = document.createElement('dialog');

    $(widgetWrap).css({
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

    var header = document.createElement('h1');
    header.textContent = this.header;
    widgetWrap.appendChild(header);

    widgetWrap.appendChild(this.mediaContent);

    var content = document.createElement('div');

    content.innerHTML = this.contentText.join('');

    widgetWrap.appendChild(content);

    widgetRoot.appendChild(widgetWrap);
    this.container = $(container);
    $('body').append($(container));
  };

  Reader.prototype.parseArticle = function () {
    var content = this.article.querySelector('.content__article-body');
    this.getHeader();
    this.getMediaContent();
    this.getContents(content);
  };

  Reader.prototype.getHeader = function () {

  };

  Reader.prototype.getMediaContent = function () {
    this.mediaContent = this.article.querySelector('.media-primary');
  };

  Reader.prototype.shouldKeep = function (node) {
    if (node.innerHTML === '') {
      return false;
    }

    if (NegativeRegEx.test(node.className)) {
      return false;
    }

    return true;
  };

  Reader.prototype.toggleShow = function(show) {
    if (!this.container) {
      return;
    }
    if (show) {
      $('html').css({
        overflow: 'hidden'
      });

      this.container.show();
      return;
    }
    $('html').css({
      overflow: 'auto'
    });

    this.container.hide();
  };

  Reader.prototype.getContents = function (content) {
    var children = content.childNodes;
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


  window.addEventListener('load', function () {
    var reader = new Reader();
    reader.init();
    var show = false;
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      show = !show;
      reader.toggleShow(show);
    });
  }, false);
} ());