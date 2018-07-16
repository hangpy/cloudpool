
function moveFolder_google(obj){
  var FolderID = $(obj).attr('value');
  $('.graph').load("google/folder/"+FolderID);
}

function moveFolder_box(obj){
  var FolderID = $(obj).attr('value');
  $('.graph').load("box/folder/"+FolderID);
}
