var SearchWord = function () {
  this.$el = $('<div></div>').appendTo('body');

  this.init();
};

SearchWord.prototype.init = function () {
  this.render();
  this.bindEvent();
};

SearchWord.prototype.render = function () {
};

SearchWord.prototype.renderTranslate = function (data) {
  console.log(data)
};

SearchWord.prototype.bindEvent = function () {
  var self = this;
  $(document).on('mousedown', function (event) {
    self.$el.hide();
  }).on('mouseup', function (event) {
    var sel = window.getSelection();
    if (sel.rangeCount === 0) {
      return;
    }
    var range = sel.getRangeAt(0);
    var rect = range.getBoundingClientRect();
    var result = $.trim(sel.toString());
    var commonAncestorContainer = range.commonAncestorContainer;
    var $parentNode;
    if (commonAncestorContainer === '#text') {
      $parentNode = $(commonAncestorContainer.parentNode);
    } else {
      $parentNode = $(commonAncestorContainer);
    }

    if (!result || result.length <= 1) {
      return;
    }
    if (!/[^(\u4E00-\u9FA5)]+/i.test(result)) {
      return;
    }

    chrome.runtime.sendMessage({
      action: 'searchWord',
      word: result
    }, function (response) {
      console.log(response);
    });
  });
};

$(function () {
  var searchWord = new SearchWord();
});