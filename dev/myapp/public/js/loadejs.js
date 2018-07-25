/*
  # Author: Hang
  # Developer by: Hang

  # Description
  This file is custom js file for load ejs file in dashboard as async using ajax

  # The logic is better to be programmed with selection logic
  For example, out of several buttons, only one ejs file must be responsed.
*/


$(function(){

  $('#split').click( function() {
      $('.replace').load("split/folder/");
  });

  $('#box').click( function() {
      $('.replace').load("box/folder/");
  });

  $('#dropbox').click( function() {
      $('.replace').load("dropbox/folder");
     //  for (int i = 0; i < 3; i++)
     // {
     //    alert( $("#Folder_"+i).attr('value') );
     //    console.log($("#Folder_"+i).attr('value'));
     // }
  });
  $('.setting-drive').click( function() {
      $('.replace').load("setting/page-setting-drive");
  });

  $('#google').click( function() {
    $('.replace').load("google/folder/");
});

});
