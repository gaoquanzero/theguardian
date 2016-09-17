(function () {
  var READER_VIEW_PAGE_SRC = chrome.runtime.getURL('src/html/view.html');

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request);
  });
  var Reader = function () {
    this.article = document.querySelector('article');
    this.contentText = [];
  };


  var NegativeRegEx = /breadcrumb|combx|comment|contact|disqus|foot|footer|footnote|link|media|meta|mod-conversations|promo|related|scroll|share|shoutbox|sidebar|social|sponsor|tags|toolbox|widget/i;

  Reader.prototype.init = function () {
    if (!this.article) {
      return false;
    }
    this.addWidget();
    this.parseArticle();
    this.render();
  };

  Reader.prototype.addWidget = function () {
    var widgetDom = document.createElement('div'),
      widgetRoot = widgetDom.createShadowRoot();
    var widgetWrap = 'dialog';
    var $widgetPage = $('<iframe src="' + READER_VIEW_PAGE_SRC + '" name="' + window.location.href + '"></iframe>');
    $widgetPage.css({
      'width': '100%',
      'height': '100%',
      'border': 'none'
    });
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
    }).append($widgetPage);
    $(widgetRoot).append($(widgetWrap));
    $('body').append($(widgetDom));
  };

  Reader.prototype.render = function () {
    var container = document.createElement('div');
    container.id = 'simple-read-container';

    var header = document.createElement('h1');
    header.textContent = this.header;
    container.appendChild(header);

    container.appendChild(this.mediaContent);

    var content = document.createElement('div');

    content.innerHTML = this.contentText.join('');

    container.appendChild(content);

    document.body.appendChild(container);
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


  // window.addEventListener('load', function () {
  var reader = new Reader();
  reader.init();
  // }, false);
} ());