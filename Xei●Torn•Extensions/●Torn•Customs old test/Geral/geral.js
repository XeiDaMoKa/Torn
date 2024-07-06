


    // Click Life Bar to go to Items //

$(' #barLife ')

    .click(function(){

        location = "item.php";
});



    // Click Happy Bar to go to Items //

    $(' #barHappy ')

    .click(function(){

        location = "item.php";
});



    // Click Money to go to Vault //

$(' .point-block___rQyUK:nth-child(1) ')

    .click(function(){

        location = "properties.php#/p=options&tab=vault";
});



    // Click Points to go to Points Market //

    $(' .point-block___rQyUK.tt-points-value ')

    .click(function(){

        location = "pmarket.php";
});

$('.tt-sidebar-information').insertAfter('.tick-list___McObN').show();

// Change Company Addiction to CA
$('#ocTimer .title').text(function(i, oldText) {
    return oldText.replace(':', '');
});


// Change Company Addiction to CA
$('#companyAddictionLevel .title').text(function(i, oldText) {
    return oldText.replace('Company Addiction:', 'CA');
});
