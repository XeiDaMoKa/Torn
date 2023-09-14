$(document).ready(function() {
    $('.torn-btn[value="WITHDRAW"]').click(function() {
      chrome.runtime.sendMessage({action: "fetchTornData"});
    });
    $('.torn-btn[value="DEPOSIT"]').click(function() {
      chrome.runtime.sendMessage({action: "fetchTornData"});
    });
  });
