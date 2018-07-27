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
      $('.replace').load("split/folder/", function(){
        $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
          console.log("load dropzone.js: " + textStatus);
        });
        $.getScript('/js/context_menu.js', function(data, textStatus, jqxhr) {
          console.log("load context_menu.js: " + textStatus);
        });
      });
  });

  $('#box').click( function() {
      $('.replace').load("box/folder/", function(){
        $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
          console.log("load dropzone.js: " + textStatus);
        });
        $.getScript('/js/context_menu.js', function(data, textStatus, jqxhr) {
          console.log("load context_menu.js: " + textStatus);
        });
      });
  });

  $('#dropbox').click( function() {
      $('.replace').load("dropbox/folder", function(){
        $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
          console.log("load dropzone.js: " + textStatus);
        });
        $.getScript('/js/context_menu.js', function(data, textStatus, jqxhr) {
          console.log("load context_menu.js: " + textStatus);
        });
      });
  });

  $('#google').click( function() {
    $('.replace').load("google/folder/", function(){
      $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
        console.log("load dropzone.js: " + textStatus);
      });
      $.getScript('/js/context_menu.js', function(data, textStatus, jqxhr) {
        console.log("load context_menu.js: " + textStatus);
      });
    });
  });

  $('#dashboard').click( function() {
    $('.replace').load("dashboard", function(){
      $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
        console.log("load dropzone.js: " + textStatus);
      });
      $.getScript('/js/context_menu.js', function(data, textStatus, jqxhr) {
        console.log("load context_menu.js: " + textStatus);
      });
    });
  });


  $('.setting-drive').click( function() {
      $('.replace').load("setting/page-setting-drive");
  });

});
