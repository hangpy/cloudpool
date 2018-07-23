// $(function(){
//     $(document).on('click', '#table_dropbox tr', function (e) {
//       e.stopPropagation();
//       e.preventDefault();
//       var $this = $(this);
//       movepage($this);
//     });
// });
//
// var movepage = _.debounce(function($this){
//     if($this.closest('tr').data('id')==undefined){
//         var tdid = $this.find('td[data-id]').data('id');
//         $('.graph').load("dropbox/"+tdid);
//       return false;
//     }
//     else{
//         var trid = $this.closest('tr').data('id');
//         $('.graph').load("dropbox/"+trid);
//       return false;
//     }
//     }
//   ,250);

function moveFolder(obj){
  var FolderID = $(obj).attr('value');
  $('.graph').load("dropbox/"+FolderID);

}



// $(document).on('click', '#table_dropbox tr', function (e) {
//   e.stopPropagation();
//   var $this = $(this);
//   var trid = $this.find('tr[data-id]').data('id');
//   $('.graph').load("dropbox/"+trid);
// });
