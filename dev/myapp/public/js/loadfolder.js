// $(document).on('click', '#table_google tr', function (e) {
//   e.stopPropagation();
//    e.preventDefault();
//   var $this = $(this);
//   if($this.closest('tr').data('id')==undefined){
//     var tdid = $this.find('td[data-id]').data('id');
//     e.stopPropagation();
//     e.preventDefault();
//     $('.replace').load("google/"+tdid);
//     e.stopPropagation();
//     e.preventDefault();
//   }
//   else{
//     var trid = $this.closest('tr').data('id');
//     $('.replace').load("google/"+trid);
//   }
//   e.stopPropagation();
//   e.preventDefault();
//   return false;
// }).preventDefault();

// // $(document).on('click', '#table_google tr', function (e) {
// //   e.stopPropagation();
// //   var $this = $(this);
// //   var trid = $this.find('tr[data-id]').data('id');
// //   $('.replace').load("google/"+trid);
// // });
// <!-- 한글 -> 유니코드 -->
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
  $('.replace').load("google/folder/"+FolderID);
}

function moveFolder_box(obj){
  var FolderID = $(obj).attr('value');
  $('.replace').load("box/folder/"+FolderID);
}

function moveFolder_dropbox(obj){
  var beforeFolderID = $(obj).attr('value');
  var FolderID = beforeFolderID.replace(/[ ]/g,"%20");
  $('.replace').load("dropbox/"+FolderID);
}

function moveFolder_split(obj){
  var FolderID = $(obj).attr('value');
  $('.replace').load("split/folder/"+FolderID);


}
