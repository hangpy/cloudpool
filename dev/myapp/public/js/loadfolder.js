function replaceAll(strTemp, strValue1, strValue2){
        while(1){
            if( strTemp.indexOf(strValue1) != -1 )
                strTemp = strTemp.replace(strValue1, strValue2);
            else
                break;
        }
        return strTemp;
 }

 function korToUnicode(beforename){
    var aftername = escape(replaceAll(beforename, "\\", "%"));
    return aftername;
}

function moveFolder_google(obj){
  var FolderID = $(obj).attr('value');
  $('.replace').load("google/folder/"+FolderID, function(){
    $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
      console.log("load dropzone.js: " + textStatus);
    });
  });
}

function moveFolder_box(obj){
  var FolderID = $(obj).attr('value');
  $('.replace').load("box/folder/"+FolderID, function(){
    $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
      console.log("load dropzone.js: " + textStatus);
    });
  });
}

function moveFolder_dropbox(obj){
  var beforeFolderID = $(obj).attr('value');
  var FolderID = beforeFolderID.replace(/[ ]/g,"%20");
  $('.replace').load("dropbox/"+FolderID, function(){
    $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
      console.log("load dropzone.js: " + textStatus);
    });
  });
}

function moveFolder_split(obj){
  var FolderID = $(obj).attr('value');
  $('.replace').load("split/folder/"+FolderID, function(){
    $.getScript('/js/dropzone.js', function(data, textStatus, jqxhr) {
      console.log("load dropzone.js: " + textStatus);
    });
  });


}
