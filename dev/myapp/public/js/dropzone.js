
$(function() {

 var obj = $(".dropzone");
 var area = obj.attr('name');
 var drive = (function(area) {
   switch (area) {
     case 'google-dropzone':
       return 'google'
       break;
     case 'dropbox-dropzone':
       return 'dropbox'
       break;
     case 'box-dropzone':
       return 'box'
       break;
     case 'split-dropzone':
       return 'split'
       break;
   }
 })(area);
 var folderID = $(".current-folder").attr('name');

 obj.on('dragenter', function(e) {
   e.stopPropagation();
   e.preventDefault();
   $(this).css({
     'border': '3px solid #028ee1',
     'background-color': 'rgba(2, 142, 225, 0.3)'
   });
 });

 obj.on('dragleave', function(e) {
   e.stopPropagation();
   e.preventDefault();
   $(this).css({
     'border': '3px dotted #8a8a8a',
     'background-color': 'rgb(255, 255, 255)'
   });
 });

 obj.on('dragover', function(e) {
   e.stopPropagation();
   e.preventDefault();
 });

 obj.on('drop', function(e) {
   e.preventDefault();
   $(this).css({
     'border': '3px dotted #8a8a8a',
     'background-color': 'rgb(255, 255, 255)'
   });

   var files = e.originalEvent.dataTransfer.files;
   if (files.length < 1)
     return;

   F_FileMultiUpload(files, obj, drive, folderID);
 });
});

// 각 드랍박스 인자 필요, url에다 각 드라이브 이름 전달
function F_FileMultiUpload(files, obj, drive, folderID) {
  var folderID = folderID == '' || folderID == undefined ? "" : folderID;
  if (confirm(files.length + "개의 파일을 업로드 하시겠습니까?")) {
    var data = new FormData();
    for (var i = 0; i < files.length; i++) {
      data.append('uploads_list', files[i]);
    }
    $.ajax({
      url: drive + '/upload/'+ folderID,
      type: 'POST',
      data: data,
      async: true,
      processData: false,
      contentType: false,
      success: function(response) {
        console.log("success");

        if(drive=='google') {
          $('.replace').load(drive + '/folder/'+ folderID);
        }
        else if(drive!='split'){
          Refresh();
        }

      },
      complete: function(response) {
        console.log('response : '+ response);
        console.log("complete");
        if(drive!='split'){
          Refresh();
        }
      }

    });
  }
}
