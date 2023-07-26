




var GetLocal = chrome.runtime.getURL;

    $("[class^='message___']:contains('race')").each(function() {

        $(this).before(

            "<img src='" +
                GetLocal (
                    'Images/HondaNSX-Rainbow.png') + " ' " +
                    "width='20px' height='20px' " + " ' " +
                    "style='margin-top: 6px; margin-left: 9px;'>"

        );

    })
;

