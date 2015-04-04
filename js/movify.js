$(function() {
  $('a.checkout').on('click', function(e) {
    e.preventDefault();
    $('#payment-modal').modal('show');
  });
});
