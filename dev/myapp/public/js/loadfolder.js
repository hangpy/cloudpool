// $(document).on('click', '#table_google tr', function (e) {
//   e.stopPropagation();
//    e.preventDefault();
//   var $this = $(this);
//   if($this.closest('tr').data('id')==undefined){
//     var tdid = $this.find('td[data-id]').data('id');
//     e.stopPropagation();
//     e.preventDefault();
//     $('.graph').load("google/"+tdid);
//     e.stopPropagation();
//     e.preventDefault();
//   }
//   else{
//     var trid = $this.closest('tr').data('id');
//     $('.graph').load("google/"+trid);
//   }
//   e.stopPropagation();
//   e.preventDefault();
//   return false;
// }).preventDefault();

// // $(document).on('click', '#table_google tr', function (e) {
// //   e.stopPropagation();
// //   var $this = $(this);
// //   var trid = $this.find('tr[data-id]').data('id');
// //   $('.graph').load("google/"+trid);
// // });


function moveFolder(obj){
  var FolderID = $(obj).attr('value');
  $('.graph').load("google/"+FolderID);

}