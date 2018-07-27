
/* Pop context menu when click mouse right button */


$(function() {

    var $contextMenu = $("ul.contextMenu");
    var $driveArea = $(".drive-area").attr('name');
    var _drive = (function(area) {
      switch (area) {
        case 'google-area':
          return 'google'
          break;
        case 'dropbox-area':
          return 'dropbox'
          break;
        case 'box-area':
          return 'box'
          break;
        case 'split-area':
          return 'split'
          break;
      }
    })($driveArea);
    var _input;


    $(".checkbox").click( function() {
      event.stopPropagation();
      if($(this).is(':checked')){
        $(this).parents('tr').addClass('active');
      } else {
        $(this).parents('tr').removeClass('active');
        $(this).css('visibility', 'hidden');
        $($contextMenu).css('display', 'none');
        _input = null;
        console.log(_input)
      }
    });

    $('.table tbody tr').on('click', function(){
      _input = $(this).find('input:checkbox').attr('value');
      $(this).find('input:checkbox').each(function(){
        if(!this.checked){
          this.checked = true;
          $(this).parents('tr').addClass('active');
          $(this).css('visibility', 'visible');
          console.log(_input);
        } else {
          this.checked = false;
          $(this).parents('tr').removeClass('active');
          $(this).css('visibility', 'hidden');
          _input = null;
          console.log(_input);
        }
      });

      $('table').find('input:checkbox').each(function(e){
        if($(this).attr('value') != _input){
          this.checked = false;
          $(this).parents('tr').removeClass('active')
          $(this).css('visibility', 'hidden');
        }
      })

    });

    $('body').on('contextmenu', 'table tbody tr', function(e){
      event.preventDefault();
      $(this).find('input:checkbox').each(function(){
        if(this.checked) {
        } else {
          this.checked = true;
          $(this).parents('tr').addClass('active');
          $(this).css('visibility', 'visible');
        }
      })
    });


    $('body').on("contextmenu", "table tbody tr", function(e) {
      event.preventDefault();
      $contextMenu.show().css({top: event.pageY, left: event.pageX});
      _input = $(this).find('input:checkbox').attr('value');
      console.log(_input);
      // $('input:checkbox[value=\"' + _input + '\"]').attr('checked', true);
      // $(':input[value=\"' + _input + '\"]').parents('tr').addClass('active');
      // .parents('tr').addClass('active');
      $('table').find('input:checkbox').each(function(e){
        if($(this).attr('value') != _input){
          this.checked = false;
          $(this).parents('tr').removeClass('active')
          $(this).css('visibility', 'hidden');
        }
      })
    });

    $(document).click(function() {
      isHovered = $contextMenu.is(":hover");
      if (isHovered == false){
        $contextMenu.fadeOut("fast");

      } else {
        alert(_input);
        alert(_drive);
      }
    });

    // context_menu event define
    (function(drive, input){


    })(_drive, _input);
});
