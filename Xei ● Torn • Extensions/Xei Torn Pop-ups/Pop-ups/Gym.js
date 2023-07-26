    // Gym iFrame

    $('body').prepend(
        " <iframe "
            +
                " id='igym' class='iframes' scrolling='no' src= 'https://www.torn.com/gym.php' "
                +
                " style='display:none ; position:fixed ; height:214px ; width:825px ; left:34% ; top:14% ; z-index:9999 ; outline:2px solid #f50' "
            +
        " </iframe> "
    )
    ;

    checkiGymLoaded()
    ;

        // Hide inside iframe if its loaded

    function checkiGymLoaded() {

        let ga = $("#igym").contents().find(" body ");                                      // Background color
        let gb = $("#igym").contents().find(" #header-root , #sidebarroot , #chatRoot ");   // Header , Sideber & Chat
        let gc = $("#igym").contents().find(" .d .m-bottom10 ");                            // Title
        let gd = $("#igym").contents().find(" .page-head-delimiter ");                      // Dividers
        let ge = $("#igym").contents().find(" .notification___PgCxM ");                     // Gym Ad
        let gf = $("#igym").contents().find(" .gymList___XJKU0 ");                          // Gyms
        let gg = $("#igym").contents().find(" #gymroot ");                            // sideroot width compensation

            if ($(ga).length) $(ga).css('background-color', '#1c0028');
            if ($(gb).length) $(gb).remove();
            if ($(gc).length) $(gc).remove();
            if ($(gd).length) $(gd).remove();
            if ($(ge).length) $(ge).remove();
            if ($(gf).length) $(gf).remove();
            if ($(gg).length) $(gg).attr('style', 'width: 785px');

                if (
                    !$(ga).length ||
                    !$(gb).length ||
                    !$(gc).length ||
                    !$(gd).length ||
                    !$(ge).length ||
                    !$(gf).length ||
                    !$(gg).length  )
                {
                    setTimeout(checkiGymLoaded);
                }
    }
    ;



        // MouseOver Eenergy bar to show iGym

    let gymtimeout;
        $("#barEnergy").mouseover(function(event) {
            let mouseX = event.pageX;
            let mouseY = event.pageY;
                gymtimeout = setTimeout(function() {
                    $('#igym').css({ left: mouseX + 'px', top: mouseY + 'px' });
                    $("#igym").show();
                },1000);
                    checkiGymLoaded();
            })
        .mouseout(function() {
            clearTimeout(gymtimeout);
            ;
        })
    ;



        // Click body to hide iFrame

    $('body').click(function() {

        $('#igym').hide();

    })