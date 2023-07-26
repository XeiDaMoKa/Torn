


  // Flip Plane if its to Torn

  var description = $(".description").text();
    if (description.includes("to Torn")) {
      $('<style>#plane{content: url("https://i.imgur.com/0p1dxbH.png") !important;}</style>').appendTo('head');
    }
