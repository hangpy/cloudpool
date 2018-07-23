/*

  # Author: Hang
  # Developer by: Hang

  # Description
  This file is custom js file for load ejs file in dashboard as async using ajax

  # The logic is better to be programmed with selection logic
  For example, out of several buttons, only one ejs file must be responsed.



*/


$(function(){
  // 버튼을 누를 때 해당 ejs 파일만 로드할 수 있게
  $('#graph').click( function() {
      $('.graph').load("graph");
  });

  $('#card1').click( function() {
      $('.graph').load("card");
  });

  $('#split').click( function() {
      $('.graph').load("split/");
  });
  $('#box').click( function() {
      $('.graph').load("box/folder/");
  });
  $('#dropbox').click( function() {
      $('.graph').load("dropbox/folder");
     //  for (int i = 0; i < 3; i++)
     // {
     //    alert( $("#Folder_"+i).attr('value') );
     //    console.log($("#Folder_"+i).attr('value'));
     // }
  });
  $('.setting-drive').click( function() {
      $('.graph').load("setting/page-setting-drive");
  });

  $('#google').click( function() {
    $('.graph').load("google/folder/");
});

});
