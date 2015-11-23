$('.page-guess .guess-correct .btn').click(function() {
    $(this).removeClass('btn-default').addClass('btn-success');
});

$('.page-guess .guess-incorrect .btn').click(function() {
    $(this).removeClass('btn-default').addClass('btn-danger');
});
