
/* Pop context menu when click mouse right button */


$(function() {

    var $contextMenu = $("ul.contextMenu");

    $('body').on("contextmenu", "table tr.file-row", function(e) {
      event.preventDefault();
      $contextMenu
          .show()
          .css({top: event.pageY, left: event.pageX});
    });

    $(document).click(function() {
      isHovered = $contextMenu.is(":hover");
      if (isHovered == false){
        $contextMenu.fadeOut("fast");
      }
    });

});
