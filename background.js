(function () {
  var searchedWords = {};
  var ajax = null;

  chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.sendMessage(tab.id, 'toggle');
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.action) {
      case 'searchWord':
        // if (!!searchedWords[request.word]) {
        //   return true;
        // }

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

