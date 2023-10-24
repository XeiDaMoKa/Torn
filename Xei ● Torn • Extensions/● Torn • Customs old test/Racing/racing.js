// Honda NSX Skin - Tarmac Top Speed //
if ($('.properties-wrap li[tabindex="0"]:eq(0)')
    .attr('aria-description')
    .includes('85.333333333333%')
    && $('.properties-wrap li[tabindex="0"]:eq(5)')
    .attr('aria-description')
    .includes('46%')) {

    // Update for all Honda NSX images
    $('*[title="Honda NSX"] img.torn-item')
        .attr('src', 'https://i.imgur.com/3VoggSZ.png')
        .attr('srcset', 'https://i.imgur.com/3VoggSZ.png 1x, https://i.imgur.com/3VoggSZ.png 2x, https://i.imgur.com/3VoggSZ.png 3x, https://i.imgur.com/3VoggSZ.png 4x');

    // Update for the specific ID
    $('#lbr-2373510 img')
        .attr('src', 'https://i.imgur.com/3VoggSZ.png');
}


// Honda NSX Skin - Tarmac Acceleration //
if ($('.properties-wrap li[tabindex="0"]:eq(0)')
    .attr('aria-description')
    .includes('84.5')
    && $('.properties-wrap li[tabindex="0"]:eq(5)')
    .attr('aria-description')
    .includes('46%')) {

    $('#lbr-2373510 img, .torn-item.large')
        .attr('src', 'https://i.imgur.com/OpYhuu8.png');
}

// Honda NSX Skin - Dirt Top Speed //
if ($('.properties-wrap li[tabindex="0"]:eq(0)')
    .attr('aria-description')
    .includes('85.333333333333%')
    && $('.properties-wrap li[tabindex="0"]:eq(4)')
    .attr('aria-description')
    .includes('34%')) {

    $('#lbr-2373510 img, .torn-item.large')
        .attr('src', 'https://i.imgur.com/C9pWXM5.png');
}

// Honda NSX Skin - Dirt Acceleration //
if ($('.properties-wrap li[tabindex="0"]:eq(0)')
    .attr('aria-description')
    .includes('84.5')
    && $('.properties-wrap li[tabindex="0"]:eq(4)')
    .attr('aria-description')
    .includes('34%')) {

    $('#lbr-2373510 img, .torn-item.large')
        .attr('src', 'https://i.imgur.com/2R6eoCT.png');
}
