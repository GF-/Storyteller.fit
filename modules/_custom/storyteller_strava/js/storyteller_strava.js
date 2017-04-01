(function($) {
  Drupal.behaviors.activities = {
    attach: function (context, settings) {

      var token = Drupal.settings.storyteller_strava.token;
      
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

          // For activities select
          function activities_select_date(startdate) {
            var date = startdate.slice(0,-10);
            return date;
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

        // Converting miles to km
          // function m2k (miles) {
          //     var mi = parseFloat(miles);
          //     var km = "";
          //     if (!isNaN(mi)) km = mi * 1.609344;
          //     return km;
          // }

        // Converting km to miles
          // function k2m (kilometers) {
          //     var km = parseFloat(kilometers);
          //     var mi = "";
          //     if (!isNaN(km)) mi = km * 0.621371192;
          //     return mi;
          // }

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
            miles = miles.toFixed(1);
            return miles;
          }
          function mtoFeet(meters) {
            var feet = meters * 3.28084;
            feet = feet.toFixed(1);
            return feet;
          }

        // Pace
        // Check insight here: https://groups.google.com/forum/#!searchin/strava-api/pace/strava-api/8IoTfCrPAQ4/CZPKll-7FQAJ
          // A better way to calculate pace?
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


        // Activity data: get detailed Activity from Strava, and store the values on the form fields
          function getActivity(activity_id) {
            // Calling photos json: providing token and size
              $.getJSON( "https://www.strava.com/api/v3/activities/" + activity_id +"?access_token=" + token + "&callback=?", function (activity) {
      
              // Set values on form fields: Activity name

              // Id
                // Value in form field
                $('#edit-field-activity-id-und-0-value').val(activity_id);

              // Title
                // If Title is present

                // then don't override it?
                // if ($('#edit-field-title-textarea-und-0-value').val() == '')

                // .expended class is added to work around this 'bug': when value is added via jquery, the textarea does not expand (it requires the user to focus on it and press a key)
                $('#edit-field-title-textarea-und-0-value').addClass('expanded').val('Story for ' + activity['name']);
                $('#edit-title').val('Story for ' + activity['name']);

              // Title of the activity on Strava
                // Value in form field
                $('#edit-field-strava-title-und-0-value').val(activity['name']);

              // Type
                // Value in form field
                $('#edit-field-type-und-0-value').val(activity['type']);

              // Description
                $('#edit-field-description-und-0-value').val(activity['description']);


              // Printing readable value on sidebar

                // Link to the activity on Strava
                $('.activity_data .strava-activity').html('<span class="small light-grey">Activity on Strava</span><br /><a href="https://www.strava.com/activities/' + activity_id + '" target="_blank" >' + activity['name'] + '</a></p>');

                // if 'Run'
                if (activity['type'] == 'Run') {
                  $('.activity_data .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Run.png" />');
                  // Show pace
                  $('.activity_data .pace').show();
                }

                // if 'Ride'
                if (activity['type'] == 'Ride') {
                  $('.activity_data .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Ride.png" />');
                  // Hide pace
                  $('.activity_data .pace').hide();
                }


              // Workout type
                $('#edit-field-workout-type-und').val(activity['workout_type']);

              // Date
                // Value in form field
                $('#edit-field-date-und-0-value').val(activity['start_date']);
                // Printing readable value on sidebar
                $('.activity_data .date').html('<span class="small light-grey">Date</span><br />' + readable_date(activity['start_date']) + '<br />at ' + readable_time(activity['start_date']));


              // Moving time
                // Value in form field
                $('#edit-field-moving-time-und-0-value').val(activity['moving_time']);
                // Printing readable value on sidebar
                $('.activity_data .moving-time').html('<span>' + secondsToHms(activity['moving_time']) + '</span><span class="small light-grey"> <br />Moving time</span>');

              // Distance
                // Value in form field
                $('#edit-field-distance-und-0-value').val(activity['distance']);
                
                // Printing readable value on sidebar
                if ( $('#user-data .measurement').text() == 'meters' ) {
                  $('.activity_data .distance').html('<span>' + mtoKm(activity['distance']) + ' </span><span class="small light-grey">km<br />' + activity['type'] + '</span>');
                } else {
                  $('.activity_data .distance').html('<span>' + mtoMiles(activity['distance']) + ' </span><span class="small light-grey">mi<br />' + activity['type'] + '</span>');
                }

              // Pace
                // Same value on sidebar and form field
                $('#edit-field-pace-und-0-value').val(pace(activity['moving_time'], activity['distance']) + '/km');

                // Printing readable value on sidebar
                if ( $('#user-data .measurement').text() == 'meters' ) {
                  $('.activity_data .pace').html('<span class="small light-grey">Pace</span><br />' + pace(activity['moving_time'], activity['distance']) + '/km');
                } else {
                  $('.activity_data .pace').html('<span class="small light-grey">Pace</span><br />' + pace_mi(activity['moving_time'], activity['distance']) + '/mi');
                }

              // Average speed
                // Value in form field
                $('#edit-field-average-speed-und-0-value').val(activity['average_speed']);
                
                if ( $('#user-data .measurement').text() == 'meters' ) {
                  // Printing readable value on sidebar
                  $('.activity_data .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2kmh(activity['average_speed']) + ' km/h');
                } else {
                  $('.activity_data .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2mph(activity['average_speed']) + ' mi/h');
                }


              // Elevation
                // Value in form field
                $('#edit-field-elevation-und-0-value').val(activity['total_elevation_gain']);

                if ( $('#user-data .measurement').text() == 'meters' ) {
                  // Printing readable value on sidebar
                  $('.activity_data .elevation').html('<span>' + Math.round(activity['total_elevation_gain']) + ' </span><span class="small light-grey">m<br />Elevation</span>');
                } else {
                  var elevation_ft = activity['total_elevation_gain'] * 3.2808399;
                  elevation_ft = Math.round( elevation_ft * 1 ) / 1;
                  $('.activity_data .elevation').html('<span>' + elevation_ft + ' </span><span class="small light-grey">ft<br />Elevation</span>');

                }

              // Photos

                // Value in form field -> Total-Photo-Count
                $('#edit-field-total-photo-count-und-0-value').val(activity['photos']['count']);

                // Print pics on the right sidebar
                if (activity['photos']['count'] != 0) {
                        getPhotos(activity_id);
                } // End if Photos
                else {
                  // Empty Photos box on the right sidebar
                  $('.node-column-sidebar-right .photos').html('');
                }

              // Maps

                // *Summary* value in form field
                $('#edit-field-summary-polyline-und-0-value').val(activity['map']['summary_polyline']);

                // Render image on sidebar
                // We use Google Maps Static , with summary polyline
                // Map options: https://developers.google.com/maps/documentation/static-maps/intro#Markers
                $('.node-column-sidebar-right .map').html('<img src="http://maps.googleapis.com/maps/api/staticmap?sensor=false&key=AIzaSyDJqrL0OPi8BKF6yg8FNl8wROQ6aWiZiL0&maptype=terrain&size=512x320&scale=2&path=weight:2%7Ccolor:0xff0000ff%7Cenc:' + activity['map']['summary_polyline'] + '" />');


              });
          }


        // Photos
          function getPhotos(activity_id) {
              // Calling photos json: providing token and size
              $.getJSON( "https://www.strava.com/api/v3/activities/" + activity_id +"/photos?photo_sources=true&size=800&access_token=" + token + "&callback=?", function (photos) {

                // First empty the element
                $('.node-column-sidebar-right .photos').empty();

                // Loop, working
                for(var key in photos) {
                    if (photos.hasOwnProperty(key)) {
                        $('.node-column-sidebar-right .photos').append('<img src="' + photos[key].urls[800] + '" />');
                    }
                }
              });
          }


        // Activity streams
          function getStreamActivity(activity_id) {

            // Calling stream json
            $.getJSON( "https://www.strava.com/api/v3/activities/" + activity_id +"/streams/latlng,altitude,velocity_smooth?resolution=medium&original_size=512&access_token=" + token + "&callback=?", function (streamActivity) {

              // Values in form fields
                // LatLng
                $('#edit-field-streamlatlng-und-0-value').val(JSON.stringify(streamActivity[0].data));
                // Distances
                $('#edit-field-streamdistances-und-0-value').val(JSON.stringify(streamActivity[1].data));
                // Altitudes
                $('#edit-field-streamaltitudes-und-0-value').val(JSON.stringify(streamActivity[2].data));
                // Speed
                $('#edit-field-streamvelocity-und-0-value').val(JSON.stringify(streamActivity[3].data));

            });
          }


        // Detect Internet Explorer - MSIE

          /**
           * detect IE
           * returns version of IE or false, if browser is not Internet Explorer
           * http://stackoverflow.com/questions/19999388/check-if-user-is-using-ie-with-jquery/21712356#21712356
           */
          function detectIE() {
              var ua = window.navigator.userAgent;

              var msie = ua.indexOf('MSIE ');
              if (msie > 0) {
                  // IE 10 or older => return version number
                  return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
              }

              var trident = ua.indexOf('Trident/');
              if (trident > 0) {
                  // IE 11 => return version number
                  var rv = ua.indexOf('rv:');
                  return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
              }

              var edge = ua.indexOf('Edge/');
              if (edge > 0) {
                 // Edge (IE 12+) => return version number
                 return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
              }

              // other browser
              return false;
          }

          // Detect Safari. Safari does not support CKEditor drag'n'drop
          // http://stackoverflow.com/questions/39120772/how-to-detect-safari-10-browser-in-javascript

          // (required) Opera 8.0+
          var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

          // (required) Chrome 1+
          var isChrome = !!window.chrome && !!window.chrome.webstore;

          // Safari
          isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || !isChrome && !isOpera && window.webkitAudioContext !== undefined;

        // If IE, add Class
          if(detectIE()) {
              $('.node-column-sidebar-right').addClass('IE');
          };

          // If IE or safari, enable click n drop
          if(detectIE() || isSafari) {
            $('.node-column-sidebar-right p.mobile-hidden').html('<p><strong>Click to insert</strong> pictures and maps and videos into your story</p>');

            // Click n drop
            $('.photos, .map, .field-type-image, #video-embed').unbind().bind("DOMSubtreeModified", function(){
              
              $('.photos img, .map img, .field-type-image img, #video-embed').unbind().click(function() {
                var todrop = $(this)[0].outerHTML;
                CKEDITOR.instances['edit-body-und-0-value'].insertHtml(todrop);
              });

            });
          };


        // On Mobile - until 1040px? iPad landscape included
        var isMobile = window.matchMedia("only screen and (max-width: 1040px)");

        if (isMobile.matches) {

            // Click n drop

            $('.photos, .map, .field-type-image').unbind().bind("DOMSubtreeModified", function(){
              
              if ($('.map img').length) {
                $('.node-column-sidebar-right p.mobile').html('<pclass="mobile">Tap on a picture<br />to embed it</p>');  
              }

              $('img').unbind().click(function() {
                var todrop = $(this)[0].outerHTML;
                CKEDITOR.instances['edit-body-und-0-value'].insertHtml(todrop + '<br />');
              });

            });
        }

        // Set Title, if empty assign default
            function setTitle() {
              if ($('#edit-field-title-textarea-und-0-value').val() == '') {
                $('#edit-title').val('My Strava story');
              } else {
                $('#edit-title').val($('#edit-field-title-textarea-und-0-value').val());
              }
            }


        // Set text language and cover image

            function setLang_Cover() {

             // Getting value from CKEditor and stripping html
             var cke_html = $(CKEDITOR.instances['edit-body-und-0-value'].getData());
             var cke_text = $(cke_html).text();

            // Setting the language

               // Franc does its job
               lang = franc(cke_text, {'minLength': 200});

               // Set value on languages field select
               $('#edit-field-language-und').val(lang);


            // Set a cover image

            // First we check for images
            
              // Look for the first img in the html, and find the url
               var img_url = $(cke_html).find('img:first').attr('src');

               if (img_url !== undefined) {

                  // Remove paramaters from URL
                  // var index = 0;
                  // var img_url_clean = img_url;
                  // index = img_url.indexOf('?');
                  // if(index == -1){
                  //     index = img_url.indexOf('#');
                  // }
                  // if(index != -1){
                  //     img_url_clean = img_url.substring(0, index);
                  // }
                  
                  // Setting value in the field
                  $('#edit-field-cover-image-und-0-value').val(img_url);
                } else {

                 // If there are no images, we try with the poster from a youtube video - if any
                 // THank you http://stackoverflow.com/questions/18681788/how-to-get-a-youtube-thumbnail-from-a-youtube-iframe

                 // Look for the first iframe and find the source url
                 var iframe_src = $(cke_html).find('iframe:first').attr('src');
                 if (iframe_src) {

                     // If any iframe, then find the youtube ID                  
                     var youtube_id = iframe_src.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/).pop();

                        youtube_id = youtube_id

                       if (youtube_id.length == 11) {
                        
                        // Youtube thumb format 
                        var youtube_thumb = 'https://img.youtube.com/vi/' + youtube_id + '/0.jpg';
                        
                        // Set URL on the cover image field
                        $('#edit-field-cover-image-und-0-value').val(youtube_thumb);

                     }
                  } 

               } // End cover image

             }



        // On submit, check if Title-textarea is set: if so, copy value to #edit-title . If not, set default value
          $('#edit-submit').click(function(){
            // Set title for the node
            setTitle();
            // Set Language and cover image
            setLang_Cover();
          });


        // Publish/unpublish

          // Basic basic and working working :-)
          if ($('#edit-status').is(':checked')) {
            
            // This is to enable Unpublish
            // If we enable Unpublish: the link on 'Description on Strava' should be removed too - TO DO
              // $('.draft-button').html('Unpublish');
              // $('.draft-button').click(function() {
              //    $('#edit-status').attr('checked', false);
              //    $('#story-node-form').submit();
              // });

            // Fancy 'save' button (does not unpublish the node)
            $('#edit-submit').attr('value', 'Update').addClass('orange');

            // Hide .draft-button
            $('.draft-button').hide();

          } else {
            $('.draft-button').html('Publish');
            $('.draft-button').click(function() {

               // On submit, check if Title-textarea is set: if so, copy value to #edit-title . If not, set default value
                 setTitle();
                 
              // Set Language and cover image
                 setLang_Cover();

               // Set Published
                 $('#edit-status').attr('checked', true); 
               
               // Finally submit
                 $('#story-node-form').submit();

            });
          }



      // If Activity ID is already set

      if ($('#edit-field-activity-id-und-0-value').val()) {

        // Set current activity on the activities Select
        var activity_id = $('#edit-field-activity-id-und-0-value').val();
        $('#edit-field-activities').val(activity_id);

      // Sidebar information from data stored on node

          // Link to the activity on Strava
          $('.activity_data .strava-activity').html('<span class="small light-grey">Activity on Strava</span><br /><a href="https://www.strava.com/activities/' + $('#edit-field-activity-id-und-0-value').val() + '" target="_blank" >' + $('#edit-field-strava-title-und-0-value').val() + '</a></p>');

          // Set the date
          $('.activity_data .date').html('<span class="small light-grey">Date</span><br />' + readable_date($('#edit-field-date-und-0-value').val()) + '<br />at '+ readable_time($('#edit-field-date-und-0-value').val()));

          // Activity Type: if 'Run'
          if ($('#edit-field-type-und-0-value').val() == 'Run') {
            $('.activity_data .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Run.png" />');
            // Show pace
            $('.activity_data .pace').show();
          }
      
          // Activity Type: if 'Ride'
          if ($('#edit-field-type-und-0-value').val() == 'Ride') {
            $('.activity_data .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Ride.png" />');
            // Hide pace
            $('.activity_data .pace').hide();
          }

          // Moving time
          $('.activity_data .moving-time').html('<span>' + secondsToHms($('#edit-field-moving-time-und-0-value').val()) + '</span><span class="small light-grey"> <br />Moving time</span>');

          // Distance
          // $('.activity_data .distance').html('<span class="small light-grey">Distance</span><br />' + mtoKm($('#edit-field-distance-und-0-value').val()) + ' km');
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.activity_data .distance').html('<span>' + mtoKm($('#edit-field-distance-und-0-value').val()) + ' </span><span class="small light-grey">km<br />' + $('#edit-field-type-und-0-value').val() + '</span>');
          } else {
            $('.activity_data .distance').html('<span>' + mtoMiles($('#edit-field-distance-und-0-value').val()) + ' </span><span class="small light-grey">mi<br />' + $('#edit-field-type-und-0-value').val() + '</span>');
          }

          // Pace
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.activity_data .pace').html('<span class="small light-grey">Pace</span><br />' + pace($('#edit-field-moving-time-und-0-value').val(), $('#edit-field-distance-und-0-value').val()) + '/km');
          } else {
            $('.activity_data .pace').html('<span class="small light-grey">Pace</span><br />' + pace_mi($('#edit-field-moving-time-und-0-value').val(), $('#edit-field-distance-und-0-value').val()) + '/mi');
          }

          // Avg Speed
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.activity_data .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2kmh($('#edit-field-average-speed-und-0-value').val()) + ' km/h');
          } else {
            $('.activity_data .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2mph($('#edit-field-average-speed-und-0-value').val()) + ' mi/h');
          }

          // Elevation
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.activity_data .elevation').html('<span>' + Math.round($('#edit-field-elevation-und-0-value').val()) + ' </span><span class="small light-grey">m<br />Elevation</span>');
          } else {
            var elevation_ft = $('#edit-field-elevation-und-0-value').val() * 3.2808399;
            elevation_ft = Math.round( elevation_ft * 1 ) / 1;
            $('.activity_data .elevation').html('<span>' + elevation_ft + ' </span><span class="small light-grey">ft<br />Elevation</span>');
          }

          // Photos
          if ($('#edit-field-total-photo-count-und-0-value').val() != 0) {

                  getPhotos($('#edit-field-activity-id-und-0-value').val());

          } // End if Photos

          // Maps
          // Map options: https://developers.google.com/maps/documentation/static-maps/intro#Markers
          $('.node-column-sidebar-right .map').html('<img src="http://maps.googleapis.com/maps/api/staticmap?sensor=false&key=AIzaSyDJqrL0OPi8BKF6yg8FNl8wROQ6aWiZiL0&maptype=terrain&size=640x400&scale=2&path=weight:4%7Ccolor:0xff0000ff%7Cenc:' + $('#edit-field-summary-polyline-und-0-value').val() + '" />');

      } else {

        // If there's no activity already selected, on page load

          // Focus on Select activities on document ready
          $('#edit-field-activities').focus();

      }

    
      // On document ready

        // Upload photos input html wrapper
        if (! $('.form-file').parents('.form-file-wrapper').length) {
          $('.form-file').wrap('<div class="form-file-wrapper"></div>');
        }

        // Title-textarea placeholder
        $('#edit-field-title-textarea-und-0-value').attr('placeholder', 'A title for the story');


      // When a new value is selected on the the Activities select
      $('#edit-field-activities', context).change(function () { 

        // Get the activity ID from the list of options (key)
        var activity_id = $(this).val();
        
        // If an activity is selected
        if (activity_id != 0) {

          // Get the array from Strava with the basic activity data
          getActivity(activity_id);

          // Get the stream data based on activity ID and save values on form fields
          getStreamActivity(activity_id);

          // :focus goes on Title-textarea field
          $('#edit-field-title-textarea-und-0-value').focus();
          $('.form-item-field-title-textarea-und-0-value').addClass('expanded');

          // If Title-textarea is not visible, then show it
          if(!$('.field-name-field-title-textarea label').hasClass('visible')){
            $('.field-name-field-title-textarea label').addClass('visible');
          }


        } else { // Else If 'Story not linked to an activity'

          // Clear all fields

          // Empty Title
            $('#edit-field-title-textarea-und-0-value').val('');
          // Empty Activity ID
            $('#edit-field-activity-id-und-0-value').val('');
          // Empty link to Strava activity
            $('.activity_data .strava-activity').html('');
          // Empty Type
            $('.activity_data .type').html('');
            $('#edit-field-type-und-0-value').val('');
          // Empty Description
            $('#edit-field-description-und-0-value').val('');
          // Empty Workout type
            $('#edit-field-workout-type-und').val('');
          // Empty Date
            $('.activity_data .date').html('');
            $('#edit-field-date-und-0-value').val('');
          // Empty Moving Time
            $('.activity_data .moving-time').html('');
            $('#edit-field-moving-time-und-0-value').val('');
          // Empty Distance
            $('.activity_data .distance').html('');
            $('#edit-field-distance-und-0-value').val('');
          // Empty Pace
            $('.activity_data .pace').html('');
            $('#edit-field-pace-und-0-value').val('');
            // Empty Average Speed
            $('.activity_data .avg-speed').html('');
            $('#edit-field-average-speed-und-0-value').val('');
          // Empty Elevation
            $('.activity_data .elevation').html('');
            $('#edit-field-elevation-und-0-value').val('');
          // Empty Photos
            $('.node-column-sidebar-right .photos').html('');
          // Empty Map
            $('.node-column-sidebar-right .map').html('');
          // Empty streams
            $('#edit-field-streamlatlng-und-0-value').val('');
            $('#edit-field-streamdistances-und-0-value').val('');
            $('#edit-field-streamaltitudes-und-0-value').val('');
            $('#edit-field-streamvelocity-und-0-value').val('');
        }

      });


     // CKEditor toolbar: sticky on scroll
     //  Based on: https://jsfiddle.net/livibetter/HV9HM/

      // Toolbar class is: .cke-top
      
      // On document ready:: .cke-top-anchor to the textarea field
      $('<div class="cke_top_anchor"></div>').insertAfter('.form-type-textarea');

      function sticky_relocate() {

          var window_top = $(window).scrollTop();

          // CKE bar
          var cke_bar_top = $('.cke_top_anchor').offset();
          cke_bar_top = cke_bar_top['top'] + 35; // Calibration

          // Node Column Left
          var node_column_left_top = $('.sticky-anchor').offset();
          node_column_left_top = node_column_left_top['top'];

          // Node Column Right
            // The following is commented, as non needed in the layout latest version
          // var node_column_right_top = $('.sticky-anchor').offset();
          // node_column_right_top = node_column_right_top['top'] + 0; // Calibration


          // CKE bar
          if (window_top > cke_bar_top) {
              $('.cke_top').addClass('sticky');
              // $('.cke_top-anchor').height($('.cke_top').outerHeight());
          } else {
              $('.cke_top').removeClass('sticky');
              // $('.cke_top-anchor').height(0);
          }

          // Node Column Left
          // We use .sticky-anchor as an anchor
          // if (window_top > node_column_left_top) {
          //     $('.activity_data').addClass('sticky');
          //     $('.sticky-anchor').height($('.activity_data').outerHeight());
          // } else {
          //     $('.activity_data').removeClass('sticky');
          //     $('.sticky-anchor').height(0);
          // }

          // Node Column Right
          // We use .sticky-anchor as an anchor
            // The following is commented, as non needed in the layout latest version
          // if (window_top > node_column_right_top) {
          //     $('.node-column-sidebar-right').addClass('sticky');
          //     $('.sticky-anchor').height($('.node-column-sidebar-right').outerHeight());
          // } else {
          //     $('.node-column-sidebar-right').removeClass('sticky');
          //     $('.sticky-anchor').height(0);
          // }


      }

      $(function() {
          $(window).scroll(sticky_relocate);
          sticky_relocate();
      });

    
    // Checkbox: Disable comments for this story
      $('#no-comments').click(function() {
        if ($('#no-comments').is(':checked')) {
            $('#edit-comment-1').attr('checked', true);
        } else {
            $('#edit-comment-2').attr('checked', true);
        }
      });

      // Node/edit page, check for the status of the radiobox
      if ($('#edit-comment-1').is(':checked')) {
        $('#no-comments').attr('checked', true);
      }
     


    // Embed from URL: Videos and remote pictures

      // This enables drag-drop for items loaded on the right sidebar (videos or pics), and tells CKEditor what html to 'drop' on the editor

      // Causes conflict on IE, we drop it

        if(!detectIE()) {

        // Enable CKEditor drag-drop for this object
          document.getElementById( 'video-embed' ).addEventListener( 'dragstart', function drag( $evt ) {
              var evt = { data: { $: $evt } }; // Create CKEditor event.

              // Create data transfer facade so we can set custom data types
              CKEDITOR.plugins.clipboard.initDragDataTransfer( evt );
              evt.data.dataTransfer.setData( 'video-embed', true );

              // Html to be dropped
              var video_embed_content = $('#video-embed').html();

              // Some text need to be set, otherwise drop event will not be fired.
              evt.data.dataTransfer.setData( 'text/html', video_embed_content );
          } );

        }

      var videoEmbed = {
          // What happens when the function is invoked
          invoke: function(){
              $(".input-xchange").html($('#edit-field-embed-link-und-0-url').val());
              $(".input-xchange").html(function(i, html) {
                // Embed the video on sidebar
                $('#video-embed').html('<div class="video-embed-overlay"></div>' + videoEmbed.convertMedia(html) );
              });
          },
          // Converts URLs to embedded items
          convertMedia: function(html){
              var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
              var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;
              var pattern3 = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?(?:jpg|jpeg|gif|png))/gi;
              var pattern4 = /(?:http?s?:\/\/)?(?:www\.)?(?:relive\.cc)\/(?:view\/)?(.+)/g;
              
              if(pattern1.test(html)){
                 var replacement = '<div class="video-wrapper"><iframe width="420" height="345" src="//player.vimeo.com/video/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
                 
                 var html = html.replace(pattern1, replacement);
              }
              if(pattern2.test(html)){
                    var replacement = '<iframe class="video" width="420" height="345" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>';
                    var html = html.replace(pattern2, replacement);
              } 
              if(pattern3.test(html)){
                  var replacement = '<a href="$1" target="_blank"><img class="sml" src="$1" /></a><br />';
                  var html = html.replace(pattern3, replacement);
              } 
              if(pattern4.test(html)){
                  var replacement = '<video controls><source src="https://relive.cc/view/$1/mp4?x-ref=tc" type="video/mp4"></video>';
                  var html = html.replace(pattern4, replacement);
              } 
              
              return html;
          }
      }

      // Placeholder on Embed Link field
      $("#edit-field-embed-link-und-0-url").attr('placeholder', 'http://');

      // On page load: if Embed Link field is not empty, invoke the embed function
      if ( $("#edit-field-embed-link-und-0-url").val() ) {
        videoEmbed.invoke();
      }      

      // Embed Link field: on keyup, call video convert function + JS validation
      $("#edit-field-embed-link-und-0-url").keyup(function(){
          // Validation: if not empty or not an URL, return message
          if ( $("#edit-field-embed-link-und-0-url").val().length === 0 || (/^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test($("#edit-field-embed-link-und-0-url").val()))){
            // Empty validation message
            $('.input-video-validation').html("");
            $('#video-embed').show();
          } else {
            // Return validation message
            $('.input-video-validation').html("It does not look like a URL");
            $('#video-embed').hide();
          }
          videoEmbed.invoke();
        }).keypress(function(e) { // Disable enter key on Embed Link field
          return e.which !== 13;
      });


    }
  };
})(jQuery);



// Maps
// http://maps.googleapis.com/maps/api/staticmap?sensor=false&size=300x300&path=weight:3%7Ccolor:red%7Cenc:
// itx~H{_`[gBMmDuFyFe@gMhHuE_BwEeLwDBuBuCkG|EcFs@iCgH{DqDwAz@w@uBuCl@gExKw@iFwFkKcLuGaBiDt@aKaAgIyFiLiGsGsQhBqDwMeB{SwC|@iDkDuFnH}A{C?oFzAjAH`HaF|ByIeK_H{TiCiS}GeS{JeEwDdH_GaBWvPfLvFiKkL]sX_DnB{C|MV`CfDnCwAo@s@|Cd@pM}Dnc@fE`D`T}@\t_@nBvEfFvBpDfTt@Ut@{ObBcHhFiGcBsRvKkCfAnQjJeEdIpJtLxAvLqBhBcCh@rDzMhPnBjIqAtI^hCdM~I`JlQ`EuHxGGbEdDbCxGjFjAhH}ElBlChDC~DzJ`FvCzR{GbCnDpE~@

// See https://developers.google.com/maps/documentation/static-maps/intro#ImageFormats