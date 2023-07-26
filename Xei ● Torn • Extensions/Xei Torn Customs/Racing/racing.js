const description1 = $('#racingupdatesnew .properties-wrap li:eq(0)').attr('aria-description');
const description5 = $('#racingupdatesnew .properties-wrap li:eq(5)').attr('aria-description');
const description4 = $('#racingupdatesnew .properties-wrap li:eq(4)').attr('aria-description');

if (description1 && description5) {
  // Honda NSX Skin - Tarmac Top Speed //
  if (description1.includes('85.33') && description5.includes('46%')) {
    $('#lbr-2373510 img, .large').attr('src', 'https://i.imgur.com/3VoggSZ.png');
  }

  // Honda NSX Skin -Tarmac Acceleration //
  if (description1.includes('84.5') && description5.includes('46%')) {
    $('#lbr-2373510 img, .large').attr('src', 'https://i.imgur.com/OpYhuu8.png');
  }
}

if (description1 && description4) {
  // Honda NSX Skin - Dirt Top Speed //
  if (description1.includes('85.33') && description4.includes('34%')) {
    $('#lbr-2373510 img, .large').attr('src', 'https://i.imgur.com/C9pWXM5.png');
  }

  // Honda NSX Skin - Dirt Acceleration //
  if (description1.includes('84.5') && description4.includes('34%')) {
    $('#lbr-2373510 img, .large').attr('src', 'https://i.imgur.com/2R6eoCT.png');
  }
}
