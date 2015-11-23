$('.guess-correct .btn').click(function() {
    $('.guess-correct .btn').removeClass('btn-default').addClass('btn-success');
});

$('.guess-incorrect .btn').click(function() {
    $('.guess-incorrect .btn').removeClass('btn-default').addClass('btn-danger');
});
