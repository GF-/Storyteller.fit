(function($) {
  Drupal.behaviors.stories = {
    attach: function (context, settings) {


    // Adding a class to each parent of images on the views (in css then we limit the 'height' and set overflow: hidden)
    $('.stories-list-medium .relative .body img').parent().addClass('img-wrapper');

    // Votes: changing the 'title' to the upvote link
    $('a.rate-button').attr('title', 'Let the author know you liked the story');

    // Votes: setting a 'title' for anonymous users
    // $('span.rate-button').attr('title', 'Log in and let the author know you liked the story');

  // Exposed filters

    // Change -Any- option name
    $('.views-exposed-form #edit-field-type-value option[value=All]').text('Activity');

    // Change placeholder filter
    $('.views-exposed-form #edit-combine').attr('placeholder', 'Search for athlete or location');

    // Sticky Exposed filters
	  $('<div class="sticky-views-anchor"></div>').insertBefore('.views-exposed-form');

      function sticky_relocate() {

          var window_top = $(window).scrollTop();

          // Sticky views exposed filters
          var views_filters_top = $('.sticky-views-anchor').offset();
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

      if ($('.sticky-views-anchor').length) {

      $(function() {
          $(window).scroll(sticky_relocate);
          sticky_relocate();
      });

      }


    }
  }
})(jQuery);