function moveFolder(obj){
  var FolderID = $(obj).attr('value');
  $('.graph').load("box/folder/"+FolderID);

}
