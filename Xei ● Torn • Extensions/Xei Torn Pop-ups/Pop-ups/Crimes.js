    // document ready

    $(document).ready(function() {
    
        // Crimes iFrame
    
        $('body').prepend(
            " <iframe "
                +
                    " id='icrimes' class='iframes' scrolling='no' src= 'https://www.torn.com/crimes.php' "
                    +
                    " style='display:none ; position:fixed ; height:159px ; width:825px ; left:34% ; top:14% ; z-index:9999 ; outline:2px solid #f50' "
                +
            " </iframe> "
        )
        ;
    
            // Hide inside iframe if its loaded
    
        function checkiCrimesLoaded() {
    
            let ca = $("#icrimes").contents().find(" body ");                                                       // Background Color
            let cb = $("#icrimes").contents().find(" #header-root , #sidebarroot , #chatRoot ");                    // Head Sidebar Chat
            let cc = $("#icrimes").contents().find(" .d .m-bottom10 ");                                             // Title
            let cd = $("#icrimes").contents().find(" .page-head-delimiter ");                                       // Dividers
            let ce = $("#icrimes").contents().find(" .info-msg.border-round ");                                     // Tip
            let cf = $("#icrimes").contents().find(" .item:not(:has(#arson)):not(:has(#warehouse))");               // Hide all but X
            let cg = $("#icrimes").contents().find(" .specials-cont > li:not(:has(#arson)):not(:has(#warehouse))"); // Hide all lines
            let ch = $("#icrimes").contents().find(" .desc.info.t-blue-cont.h ");     // Hide all names
            let ci = $("#points").contents().find(" .d.with-sidebar .content-wrapper ");                            // sideroot width compensation
    
                if ($(ca).length) $(ca).css('background-color', '#1c0028');
                if ($(cb).length) $(cb).remove();
                if ($(cc).length) $(cc).remove();
                if ($(cd).length) $(cd).remove();
                if ($(ce).length) $(ce).remove();
                if ($(cf).length) $(cf).remove();
                if ($(cg).length) $(cg).remove();
                if ($(ch).length) $(ch).remove();
                if ($(ci).length) $(ci).attr('style', 'flex: none !important;');
    
                    if (
                        !$(ca).length ||
                        !$(cb).length ||
                        !$(cc).length ||
                        !$(cd).length ||
                        !$(ce).length ||
                        !$(cf).length ||
                        !$(cg).length ||
                        !$(ch).length ||
                        !$(ci).length  )
                    {
                        setTimeout(checkiCrimesLoaded);
                    }
        }
        ;
    
    
    
            // MouseOver Eenergy bar to show iCrimes
    
        let crimestimeout;
            $("#barNerve").mouseover(function(event) {
                let mouseX = event.pageX;
                let mouseY = event.pageY;
                    crimestimeout = setTimeout(function() {
                        $('#icrimes').css({ left: mouseX + 'px', top: mouseY + 'px' });
                        $("#icrimes").show();
                    },1000);
                        checkiCrimesLoaded();
                })
            .mouseout(function() {
                clearTimeout(crimestimeout);
                ;
            })
        ;
    
    
    
            // Click body to hide iFrame
    
        $('body').click(function() {
    
            $('#icrimes').hide();
    
        })
    
    }) ;