(function($) {
  Drupal.behaviors.activities = {
    attach: function (context, settings) {

    // Functions manipulating Strava data
    
      // Readable data and time. Format provided is: 2016-06-10T17:27:54Z
        function readable_date(startdate) {
          var date = new Date(Date.parse(startdate)).toUTCString();
          date = date.slice(0,-13);
          return date;
        }

        function readable_time(startdate) {
          var time = new Date(Date.parse(startdate)).toUTCString();
          time = time.slice(17,-7);
          return time;
        }

        // Converting seconds to HH:MM:SS
          // http://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss/5539081#5539081
          function secondsToHms(d) {
            d = Number(d);
            var h = Math.floor(d / 3600);
            var m = Math.floor(d % 3600 / 60);
            var s = Math.floor(d % 3600 % 60);
            return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
          }
          // var moving_time = secondsToHms(activities[$(this).val()]['moving_time']);

        // Converting meters to Km
          // http://stackoverflow.com/questions/2471323/unit-conversion-in-javascript
          function mtoKm(meters) {
            var km = meters / 1000;
            km = km.toFixed(1);
            return km;
          }
          function mtoMiles(meters) {
            var miles = meters * 0.000621371192;
            miles = miles = miles.toFixed(1);
            return miles;
          }

        // Converting m/s to km/h
          function ms2kmh(avg_speed) {
            var avg_speed = avg_speed * 3.60;
            // rounded
            avg_speed = Math.round( avg_speed * 10 ) / 10;
            return avg_speed;
          }        
        // Converting m/s to miles/h
          function ms2mph(avg_speed) {
            var avg_speed = avg_speed * 2.236936292;
            // rounded
            avg_speed = Math.round( avg_speed * 10 ) / 10;
            return avg_speed;
          }        

        // Pace
        // Check insight here: https://groups.google.com/forum/#!searchin/strava-api/pace/strava-api/8IoTfCrPAQ4/CZPKll-7FQAJ
          // Personal implementation. A btter way to calculate pace is welcome
          function pace(moving_time, distance) {
            var pace_decimal = (moving_time/60)/(distance/1000);
            var pace_minutes = (Math.floor(pace_decimal));
            var pace_seconds = (Math.round((pace_decimal % 1) * 60));
              if (pace_seconds < 10) {
                pace_seconds = '0' + pace_seconds;
              }
            return pace_minutes + ':' + pace_seconds;
          }
          function pace_mi(moving_time, distance) {
            var pace_decimal = (moving_time/60)/(distance/1609.344);
            var pace_minutes = (Math.floor(pace_decimal));
            var pace_seconds = (Math.round((pace_decimal % 1) * 60));
              if (pace_seconds < 10) {
                pace_seconds = '0' + pace_seconds;
              }
            return pace_minutes + ':' + pace_seconds;
          }


      // Sidebar information from data stored on node/VIEW

      if ($('.field-name-field-activity-id .field-item').html()) {

        // Link to the activity on Strava
        $('.node-column-sidebar-left .strava-activity').html('<span class="small light-grey">Activity on Strava</span><br /><a href="https://www.strava.com/activities/' + $('.field-name-field-activity-id .field-item').html() + '" target="_blank" >' + $('.field-name-field-strava-title .field-item').html() + '</a></p>');

        // Set the date
        $('.node-column-sidebar-left .date').html('<span class="small light-grey">Date</span><br />' + readable_date($('.field-name-field-date .field-item').html()) + '<br />at ' + readable_time($('.field-name-field-date .field-item').html()));

        // Activity Type: if 'Run'
        if ($('.field-name-field-type .field-item').html() == 'Run')
        $('.node-column-sidebar-left .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Run.png" />');
    
        // Activity Type: if 'Ride'
        if ($('.field-name-field-type .field-item').html() == 'Ride')
        $('.node-column-sidebar-left .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Ride.png" />');

        // Moving time
        $('.node-column-sidebar-left .moving-time').html('<span class="small light-grey">Moving time</span><br />' + secondsToHms($('.field-name-field-moving-time .field-item').html()));

        // Distance
        if ( $('#user-data .measurement').text() == 'meters' ) {
          $('.node-column-sidebar-left .distance').html('<span class="small light-grey">Distance</span><br />' + mtoKm($('.field-name-field-distance .field-item').html()) + ' km');
        } else {
          $('.node-column-sidebar-left .distance').html('<span class="small light-grey">Distance</span><br />' + mtoMiles($('.field-name-field-distance .field-item').html()) + ' mi');
        }

        if ($('.field-name-field-type .field-item').html() == 'Run') {
          // Pace
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.node-column-sidebar-left .pace').html('<span class="small light-grey">Pace</span><br />' + pace($('.field-name-field-moving-time .field-item').html(), $('.field-name-field-distance .field-item').html()) + '/km');
          } else {
            $('.node-column-sidebar-left .pace').html('<span class="small light-grey">Pace</span><br />' + pace_mi($('.field-name-field-moving-time .field-item').html(), $('.field-name-field-distance .field-item').html()) + '/mi');
          }
        }

        if ($('.field-name-field-type .field-item').html() == 'Ride') {
          // Avg Speed
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.node-column-sidebar-left .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2kmh($('.field-name-field-average-speed .field-item').html()) + ' km/h');
          } else {
            $('.node-column-sidebar-left .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2mph($('.field-name-field-average-speed .field-item').html()) + ' mi/h');
          }
        }

        

        

        // Elevation
        if ( $('#user-data .measurement').text() == 'meters' ) {
          $('.node-column-sidebar-left .elevation').html('<span class="small light-grey">Elevation gain</span><br />' + $('.field-name-field-elevation .field-item').html() + ' m');
        } else {
          var elevation_ft = $('.field-name-field-elevation .field-item').html() * 3.2808399;
          elevation_ft = Math.round( elevation_ft * 1 ) / 1;
          $('.node-column-sidebar-left .elevation').html('<span class="small light-grey">Elevation gain</span><br />' + elevation_ft + ' ft');
        }

      } // end if


    // Votes: changing the 'title' to the upvote link
    // $('a.rate-button').attr('title', 'Let the author know you liked the story');

      
    // Sticky user info

      function sticky_relocate() {

          var window_top = $(window).scrollTop();

          // Node Column Right
          var node_column_right_top = $('.sticky-anchor').offset();
          node_column_right_top = node_column_right_top['top'];

          // Node Column Right
          // We use .sticky-anchor as an anchor
          if (window_top > node_column_right_top) {
              $('.node-column-sidebar-right').addClass('sticky');
              $('.sticky-anchor').height($('.node-column-sidebar-right').outerHeight());
          } else {
              $('.node-column-sidebar-right').removeClass('sticky');
              $('.sticky-anchor').height(0);
          }

      }

      $(function() {
          $(window).scroll(sticky_relocate);
          sticky_relocate();
      });


    // Logged in user info data on Reply-to-Comment - **if threaded comments are enabled**
      // $( ".comment-user-avatar" ).prependTo( "#comments .comment-form" );

    }
  }

})(jQuery);