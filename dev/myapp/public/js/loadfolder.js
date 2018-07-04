$(document).on('click', '#table_box tr', function (e) {
  e.stopPropagation();
  var $this = $(this);
  if($this.closest('tr').data('id')==undefined){
    var tdid = $this.find('td[data-id]').data('id');
    $('.graph').load("box/"+tdid);
  }
  else{
    var trid = $this.closest('tr').data('id');
    $('.graph').load("box/"+trid);
  }
});

// $(document).on('click', '#table_dropbox tr', function (e) {
//   e.stopPropagation();
//   var $this = $(this);
//   var trid = $this.find('tr[data-id]').data('id');
//   $('.graph').load("dropbox/"+trid);
// });
