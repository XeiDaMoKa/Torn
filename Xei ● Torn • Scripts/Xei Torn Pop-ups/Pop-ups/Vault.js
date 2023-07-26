


    // Vault iFrame

$('body').prepend(
    " <iframe "
        +
            " id='ivault' class='iframes' scrolling='no' src= 'https://www.torn.com/properties.php#/p=options&tab=vault' "
            +
            " style='display:none ; position:fixed ; height:157px ; width:825px ; left:34% ; top:14% ; z-index:9999 ; outline:2px solid #f50' "
        +
    " </iframe> "
)
;

checkiVaultLoaded()
;

    // Hide inside iframe if its loaded

function checkiVaultLoaded() {

    let va = $("#ivault").contents().find(" body ");                                    // Background color
    let vb = $("#ivault").contents().find(" #header-root , #sidebarroot , #chatRoot "); // Header , Sideber & Chat
    let vc = $("#ivault").contents().find(" .d .m-bottom10 ");                          // Dividers
    let vd = $("#ivault").contents().find(" .property-info-cont ");                     // Property
    let ve = $("#ivault").contents().find(" .info-msg-cont ");                          // Info msg
    let vf = $("#ivault").contents().find(" .vault-trans-wrap ");                       // History
    let vg = $("#ivault").contents().find(" .vault-access-wrap ");                      // Share
    let vh = $("#ivault").contents().find(" .title ");                                  // Money Values
    let vi = $("#ivault").contents().find(" .title-black ");                            // Large Vault
    let vj = $("#ivault").contents().find(" #mainContainer ");                            // sideroot width compensation


        if ($(va).length) $(va).css('background-color', '#1c0028');
        if ($(vb).length) $(vb).remove();
        if ($(vc).length) $(vc).remove();
        if ($(vd).length) $(vd).remove();
        if ($(ve).length) $(ve).remove();
        if ($(vf).length) $(vf).remove();
        if ($(vg).length) $(vg).remove();
        if ($(vh).length) $(vh).attr('style', 'text-align: center');
        if ($(vi).length) $(vi).attr('style', 'text-align: center');
        if ($(vj).length) $(vj).attr('style', 'width: auto');

            if (
                !$(va).length ||
                !$(vb).length ||
                !$(vc).length ||
                !$(vd).length ||
                !$(ve).length ||
                !$(vf).length ||
                !$(vg).length ||
                !$(vh).length ||
                !$(vi).length ||
                !$(vj).length  )
            {
                setTimeout(checkiVaultLoaded);
            }
}
;



    // MouseOver Money Value to show iVault

let vaulttimeout;
    $("#user-money").mouseover(function(event) {
        let mouseX = event.pageX;
        let mouseY = event.pageY;
            vaulttimeout = setTimeout(function() {
                $('#ivault').css({ left: mouseX + 'px', top: mouseY + 'px' });
                $("#ivault").show();
            },1000);
                checkiVaultLoaded();
        })
    .mouseout(function() {
        clearTimeout(vaulttimeout);
        ;
    })
;



    // Click body to hide iFrame

$('body').click(function() {
    $('#ivault').hide();
})

