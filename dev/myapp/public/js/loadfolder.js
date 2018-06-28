$(document).on('click', '#table_dropbox tr', function (e) {
  e.stopPropagation();
  var $this = $(this);
  var tdid = $this.find('td[data-id]').data('id');
  $('.graph').load("dropbox/"+tdid);
});
