


    // Points iFrame

$('body').prepend(
    " <iframe "
        +
            " id='ipoints' class='iframes' scrolling='no' src= 'https://www.torn.com/points.php' "
            +
            " style='display:none ; position:fixed ; height:225px ; width:625px ; left:34% ; top:15% ; z-index:9999 ; outline:2px solid #f50' "
        +
    " </iframe> "
)
;

checkiPointsLoaded()
;
// Resize iframe according to its contents
function resizeIframe() {
    let iframe = $('#ipoints').get(0);
    let iframeWin = iframe.contentWindow || iframe;
    let iframeDoc = iframe.contentDocument || iframeWin.document;
    let height = iframeDoc.body.scrollHeight;
    $(iframe).height(height);
}
    // Hide inside iframe if its loaded

function checkiPointsLoaded() {

    let pa = $("#ipoints").contents().find(" body ");                                                 // Background color
    let pb = $("#ipoints").contents().find(" #header-root , #sidebarroot , #chatRoot ");              // Header , Sideber &
    let pc = $("#ipoints").contents().find(" .m-bottom10 ");                                          // Title
    let pd = $("#ipoints").contents().find(" .points-list li:gt(2) ");                                // hide all but first 3
    let pe = $("#ipoints").contents().find(" div .active .btn button ");                              // Move comfirm button
    let pf = $("#ipoints").contents().find(" .hovered .border-round ");                               // background color confirmation
    let pg = $("#ipoints").contents().find(" .confirm-question , .white , .desc , .bold , .cancel");  // hide all in confirmation
    let ph = $("#points").contents().find(" #mainContainer ");                            // sideroot width compensation

        if ($(pa).length) $(pa).css('background-color', '#1c0028');
        if ($(pb).length) $(pb).remove();
        if ($(pc).length) $(pc).remove();
        if ($(pd).length) $(pd).remove();
        if ($(pe).length) $(pe).css('position', 'relative').css('top', '-150px').css('left', '238px');
        if ($(pf).length) $(pf).css('position', 'relative').css('top', '100px');
        if ($(pg).length) $(pg).css('position', 'relative').css('top', '100px');
        if ($(ph).length) $(ph).attr('style', 'width: auto');

            if (
                !$(pa).length ||
                !$(pb).length ||
                !$(pc).length ||
                !$(pd).length ||
                !$(pe).length ||
                !$(pf).length ||
                !$(pg).length ||
                !$(ph).length  )
            {
                setTimeout(checkiPointsLoaded, 250);
            }
}
;



    // MouseOver Points Value to show Refills

let pointstimeout;
    $(" .point-block___rQyUK.tt-points-value .value___mHNGb:nth-child(2) ").mouseover(function(event) {
        let mouseX = event.pageX;
        let mouseY = event.pageY;
            pointstimeout = setTimeout(function() {
                $('#ipoints').css({ left: mouseX + 'px', top: mouseY + 'px' });
                $("#ipoints").show();
        },1000);
            checkiPointsLoaded();
    })
        .mouseout(function() {
        clearTimeout(pointstimeout);
    })
;



// click body to hide iFrame

$('body').click(function() {

    $('#ipoints').hide();

})
;







