(function () {
  var searchedWords = {};
  var ajax = null;

  var show = false;

  chrome.browserAction.onClicked.addListener(function (tab) {
    console.log(tab)
    show = !show;
    chrome.tabs.sendMessage(tab.id, {
      action: 'simple',
      value: show
    });
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
      case 'searchWord':
        ajax = $.ajax({
          url: 'http://api.shanbay.com/api/v1/bdc/search',
          dataType: 'json',
          timeout: 5000,
          data: {
            word: request.word
          }
        }).then(function (data) {
          searchedWords[request.word] = data
          sendResponse(data);
        }).fail(function (data) {
          sendResponse({
            result: 'fail'
          });
        }).always(function () {
          ajax = null;
        });
        return true;
      default:
        sendResponse({
          result: 'test'
        });
        break;
    }
  });
} ());

