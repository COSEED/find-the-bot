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
    var guess_is_bot = $form.attr('data-bot');

    var postdata = {
        tuser_id: tuser_id,
        guess_is_bot: guess_is_bot
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
            "left": clientRects.left + window.scrollX,
            "width": clientRects.right - clientRects.left,
            "height": clientRects.bottom - clientRects.top,
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

    HandleGuessResponse_ClickHandler(response, 0);
}

function HandleGuessResponse_ClickHandler(response, currentIndex)
{
    if(currentIndex == response.lessons.length) {
        window.location = response.next;
    } else {
        var target;
        $('.guess-footer a.btn').one('click', function() { 
            if(target) {
                target.$clone.popover('destroy');
                target.$clone.remove();
            }

            HandleGuessResponse_ClickHandler(response, currentIndex + 1); 
        });
        target = ShowLesson(response.lessons[currentIndex]);
        
        if(!target.$target.is(":in-viewport")) {
            $(window).scrollTo(target.$clone, {
                duration: 500,
                offset: {
                    top: -200
                }
            });
        }
    }
}

function ShowLesson(lesson)
{
    var $target;

    if(lesson.pointer_type == 'profile_photo') {
        $target = $(".icon img");
    } else if(lesson.pointer_type == 'tweet') {
        $target = $("#tweet-" + lesson.pointer_id);
    } else if(lesson.pointer_type == 'tweet_count') {
        $target = $("#tweet_count");
    } else if(lesson.pointer_type == 'follower_count') {
        $target = $("#follower_count");
    } else if(lesson.pointer_type == 'following_count') {
        $target = $("#following_count");
    } else if(lesson.pointer_type == 'full_name') {
        $target = $("#full_name");
    } else if(lesson.pointer_type == 'screen_name') {
        $target = $("#screen_name");
    } else if(lesson.pointer_type == 'location') {
        $target = $("#location");
    } else if(lesson.pointer_type == 'website') {
        $target = $("#website");
    } else if(lesson.pointer_type == 'bio') {
        $target = $("#bio");
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

        return {
            $target: $target,
            $clone: $clone
        };
    }
}
