(function($) {
  Drupal.behaviors.stories = {
    attach: function (context, settings) {


    // Adding a class to each parent of images on the views (in css then we limit the 'height' and set overflow: hidden)
    // $('.stories-list-medium .relative .body img').parent().addClass('img-wrapper');

    // Votes: changing the 'title' to the upvote link
    $('a.rate-button').attr('title', 'Let the author know you liked the story');

    // Votes: setting a 'title' for anonymous users
    // $('span.rate-button').attr('title', 'Log in and let the author know you liked the story');

  // Exposed filters

    // Change -Any- option name
      $('.views-exposed-form #edit-field-type-value label[for=edit-field-type-value-all').text('All');
      // For an option in a select
      // $('.views-exposed-form #edit-field-type-value option[value=All]').text('All');

      // Add class on focus
      $('.views-exposed-form input').focusin(function(){
        // Hide links
        $('.views-exposed-form .form-radios').addClass('mobile-hidden');
        // Show submit button
        $('#edit-submit-stories').show();
      });
      $('.views-exposed-form').focusout(function(){
        // Show links
        $('.views-exposed-form .form-radios').removeClass('mobile-hidden');
        // Hide submit button
        // $('#edit-submit-stories').hide();
      });
        
      // Submit on radio value change = This because we disable 'autosubmit'
      $('input[type=radio]').change(function() {
          $(this).closest("form").submit();
      });



      // remove class on click outside the box?
      // $(document).mouseup(function (e) {
      //     var searchbox = $(".views-exposed-form .form-item-combine");

      //     if (!searchbox.is(e.target) // if the target of the click isn't the container...
      //         && searchbox.has(e.target).length === 0) // ... nor a descendant of the container
      //     {
      //         searchbox.removeClass('active');
      //     }
      // }); 


    // Change placeholder on input text

      // On Mobile - until 1040px? iPad landscape included
      var isMobile = window.matchMedia("only screen and (max-width: 1040px)");

      // If mobile
      if (isMobile.matches) {
        // Change placeholder filter
        $('.views-exposed-form #edit-combine').attr('placeholder', 'Search');  // Short version
      } else {
        // Change placeholder filter
        $('.views-exposed-form #edit-combine').attr('placeholder', 'Search story, athlete or location');
      }


    // Sticky Exposed filters
	  $('<div class="sticky-views-anchor-views"></div>').insertBefore('.views-exposed-form');

      function sticky_relocate() {

          var window_top = $(window).scrollTop();

          // Sticky views exposed filters
          var views_filters_top = $('.sticky-views-anchor-views').offset();
          views_filters_top = views_filters_top['top'] - 55;

          // We use .sticky-anchor as an anchor
          if (window_top > views_filters_top) {
              $('.views-exposed-form').addClass('sticky');
              $('.sticky-views-anchor').height($('.views-exposed-form').outerHeight());
          } else {
              $('.views-exposed-form').removeClass('sticky');
              $('.sticky-views-anchor').height(0);
          }

      }

      // Sticky exposed filters
      if ($('.sticky-views-anchor-views').length) {
        $(function() {
            $(window).scroll(sticky_relocate);
            sticky_relocate();
        });
      }

    // Hide image if link is broken
    $("img").error(function () { 
        $(this).css({visibility:"hidden"}); 
    });

    // Language: if English, just hide the data
    $.each($("span.language"), function() {
      if ($(this).text() == 'English') {
        $(this).hide();
      }
    });


    // Login button: ajax call to set a redirection
    // We place this here as Views are present in all the main pages
     $('.add-story').click(function(){
       $.ajax({
          url: "/storyteller-login",
          type: "post",
          // data: values ,
          success: function (response) {
             // you will get response from your php page (what you echo or print)
             console.log(response);
             window.location.href = '/user/strava-login';
          },
          error: function(jqXHR, textStatus, errorThrown) {
             console.log(textStatus, errorThrown);
          }
        });
        return false;
      });




    }
  }
})(jQuery);