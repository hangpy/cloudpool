$(document).on('click', '#table_google tr', function (e) {
    e.stopPropagation();
    var $this = $(this);
    if($this.closest('tr').data('id')==undefined){

      if($this.closest('td').data('id')!=undefined){
        var tdid = $this.find('td[data-id]').data('id');
        $('.replace').load("google/"+tdid);
      }
    }
    else{
      var trid = $this.closest('tr').data('id');
      $('.replace').load("google/"+trid);
    }

    // e.preventDefault();
    // var href = $this.attr('href');
    // if (href == "" || href == "#" || href.toLowerCase() == 'javascript:' || href.toLowerCase() == 'javascript:void(0)') {
    //   e.preventDefault();
    // if($this.closest('td').data('id')!=undefined){
    //   var tdid = $this.closest('td').find('td[data-id]').data('id');
    //   console.log('tdid: ',tdid);
    //   $('.replace').load("google/"+tdid);

    // }
    // e.preventDefault();
    // return false;

    });

  // e.preventDefault();
  // }).preventDefault();

  // $(document).on('click', '#table_google tr', function (e) {
  //   e.stopPropagation();
  //   var $this = $(this);
  //   var trid = $this.find('tr[data-id]').data('id');
  //   $('.replace').load("google/"+trid);
  // });
