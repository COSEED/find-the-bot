$.fn.hasBack = function() {
    var me = $.fn.hasBack;

    if(!me.cache) {
        // get the background color and image transparent/none values
        // create a temporary element
        var $tmpElem = $('<div />').hide().appendTo('body');
        $.fn.hasBack.cache = {
            color: $tmpElem.css('background-color'),
            image: $tmpElem.css('background-image')
        };
        $tmpElem.remove();
    }

    var elem = this.eq(0);
    return !(elem.css('background-color') === me.cache.color && elem.css('background-image') === me.cache.image);
};

$('.page-guess .guess-form.guess-correct .btn').click(function() {
    $(this).removeClass('btn-default').addClass('btn-success');
});

$('.page-guess .guess-form.guess-incorrect .btn').click(function() {
    $(this).removeClass('btn-default').addClass('btn-danger');
});

$('.page-guess .guess-form .btn').click(function() {
    // Show the glyph
    $(this).closest('.guess-form').addClass('guess-form-guessed');

    // Let the button we pressed poke through the modal
    $(this).closest('.guess-form').parent().css("z-index", "1");

    // Extact the data from the data attributes to POST
    var $form = $(this).closest('.guess-form');

    var test_id = $form.attr('data-test-id');
    var tuser_id = $form.attr('data-tuser-id');
    var is_bot = Boolean($form.attr('data-bot'));

    var postdata = {
        tuser_id: tuser_id,
        guess_is_bot: is_bot,
    };

    $('.lessons-modal').removeClass('hidden');

    $.ajax({
        method: 'POST',
        url: "/test/" + test_id + "/guess", 
        data: postdata, 
        success: function(response, textStatus, jqXHR) {
            HandleGuessResponse(response);
        },
        error: function(jqXHR) {
            $('#modal-bad-response').find('pre').text(jqXHR.responseText);
            $('#modal-bad-response').modal();
        }
    });
});

/**
 * This element clones the element and overlays it above the modal
 */
function PokeHoleThroughModal($element)
{
    $clone = $element.clone();

    var computeCss = function() {
        var clientRects = $element.get(0).getClientRects()[0];
        $clone.css({
            "top": clientRects.top + window.scrollY,
            "left": clientRects.left + window.scrollX
        });
    };

    computeCss();

    $clone.addClass("poke");

    $('body').append($clone);

    // @todo performance
    $(window).on('resize', computeCss);

    return $clone;
}

function HandleGuessResponse(response)
{
    $('.guess-footer').removeClass('hidden');
    $('.guess-footer a.btn').attr('href', response.next);

    for(var i = 0; i < response.lessons.length; i++) {
        var lesson = response.lessons[i];

        ShowLesson(lesson);
    }

    if(response.complete) {

    } else {

    }
}

function ShowLesson(lesson)
{
    var $target;

    if(lesson.pointer_type == 'profile_photo') {
        $target = $(".icon img");
    }

    if($target) {
        $clone = PokeHoleThroughModal($target);

        $clone.popover({
            container: "body",
            content: lesson.message_body,
            title: lesson.message_title,
            animation: true,
            placement: "auto",
            html: true,
        }).popover("show");
    }
}
