
$(document).ready(function(){
  $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
    console.log("load dropzone.js: " + textStatus);
  });
  $.getScript('/js/context_menu.js', function(data, textStatus, jqxhr) {
    console.log("load context_menu.js: " + textStatus);
  });
})
