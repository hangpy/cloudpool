/* DropZone 관련 임시 문서임. 곧 지울거 */

$(function() {
  var obj = $("#dropzone");

  obj.on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
    /*
    $(this).css({
      'width': maskWidth,
      'height': maskHeight,
      'border': '3px solid #028ee1'
    });
    */
    var maskHeight = $(this).height();
    var maskWidth = $(this).width();
    $('.dropzone-mask').css({
      'width': maskWidth,
      'height': maskHeight,
      'border': '3px solid #028ee1'
    }).show();
  });

  obj.on('dragleave', function(e) {
    e.stopPropagation();
    e.preventDefault();
    /* $(this).css('border', '2px dotted #8296C2'); */
    $('.dropzone-mask').hide();
  });


  obj.on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();

  });

  obj.on('drop', function(e) {
    e.preventDefault();
    $(this).css('border', '2px dotted #8296C2');

    var files = e.originalEvent.dataTransfer.files;
    if (files.length < 1)
      return;

    F_FileMultiUpload(files, obj);
  });
});
