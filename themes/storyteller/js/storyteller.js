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


        // If a google static map exists
        if ( $('img[src*="http://maps.googleapis.com"]').length ) {

        // Maps: replacing static img with interactive map, if #map does not exist already
          // Look for activity stream (compatibility with older stories, where streams were not stored)
          // if( !($('#map').length) && $.trim($('.field-name-field-streamdistances .field-item').text()) != '' && $.trim($('.field-name-field-streamlatlng .field-item').text()) != '') {
          if( !($('#map').length) ) {  // This is not to duplicate the map when a comment is submitted on Story page

            // Find all maps imgs and hide them
            $('img[src*="http://maps.googleapis.com"]').each(function(i){
              $(this).hide();
              $(this).after('<div id="map"></div><div class="chart" id="elevation_chart"></div>');
            }); 


              // Maps with Elevation profile

              google.charts.load('current', {packages: ['corechart', 'bar']});
              google.charts.setOnLoadCallback(initMap);


              function initMap() {
                  
                  // Map
                  map = new google.maps.Map(document.getElementById('map'), {
                    scrollwheel: false, // not to interfere with page scroll
                    mapTypeId: 'terrain'
                  });

                  // Path
                  var path = new Array();
                  
                  // Area for centering and zooming map
                  var bounds = new google.maps.LatLngBounds();

                  // If Stream data
                  if ( $.trim($('.field-name-field-streamlatlng .field-item').text()) != '' ) {
                    var streamLatLng = JSON.parse($('.field-name-field-streamlatlng .field-item').text());

                    for (var i = 0; i < streamLatLng.length; i++) {
                      path.push(new google.maps.LatLng(streamLatLng[i][0],streamLatLng[i][1]));
                      bounds.extend({lat: streamLatLng[i][0], lng: streamLatLng[i][1]});
                    }

                    // Markers                  
                      var start_icon = '/sites/default/themes/storyteller/img/icon-start.png';
                      var finish_icon = '/sites/default/themes/storyteller/img/icon-finish.png';

                      var latlnglength =  (streamLatLng.length - 1);
                      var markers = [
                          ['Start', streamLatLng[0][0],streamLatLng[0][1], start_icon],
                          ['End', streamLatLng[latlnglength][0],streamLatLng[latlnglength][1], finish_icon]
                      ];
                      

                      // Loop through our array of markers & place each one on the map  
                      for( i = 0; i < markers.length; i++ ) {
                          var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
                          bounds.extend(position);
                          marker = new google.maps.Marker({
                              position: position,
                              map: map,
                              title: markers[i][0],
                              icon: {
                                url: markers[i][3],
                                anchor: new google.maps.Point(8, 10) // visually fine tuning the position of the markers
                              }
                          });
                      }

                  } else if ( $('.field-name-field-summary-polyline .field-item').text() ) {  // else use summary polyline (older nodes)
                    
                    // Draw the line
                    var summary_polyline = $('.field-name-field-summary-polyline .field-item').text();
                    var path = google.maps.geometry.encoding.decodePath(summary_polyline);
                    
                    // Center the map
                    for (var i = 0; i < path.length; i++) {
                       bounds.extend(path[i]);
                    }
                  }

                  map.fitBounds(bounds); // Center and zoom

                  // Create an ElevationService.
                  var elevator = new google.maps.ElevationService;

                  // Draw the path, using the Visualization API and the Elevation service.
                  displayPathElevation(path, elevator, map);

              } 



                    function displayPathElevation(path, elevator, map) {
                      // Display a polyline of the elevation path.

                      // Original:  (without "var route=") -> to make infoWindow working
                      // new google.maps.Polyline({ 

                      var route = new google.maps.Polyline({
                        path: path,
                        strokeColor: '#ff0000',
                        strokeOpacity: 0.8,
                        map: map
                      });

                              // // infoWindow on hover
                              //     var infoWindow = new google.maps.InfoWindow();

                              //     // Open the InfoWindow on mouseover:
                              //     google.maps.event.addListener(route, 'mouseover', function(e) {
                              //        infoWindow.setPosition(e.latLng);
                              //        infoWindow.setContent("You are at " + e.latLng);
                              //        infoWindow.open(map);
                              //     });

                              //     // Close the InfoWindow on mouseout:
                              //     google.maps.event.addListener(route, 'mouseout', function() {
                              //        infoWindow.close();
                              //     });

                
                      // Create a PathElevationRequest object using this array.
                      // Ask for 256 samples along that path.
                      // Initiate the path request.
                      elevator.getElevationAlongPath({
                        'path': path,
                        'samples': 512
                      }, plotElevation);
                    }

                    // Takes an array of ElevationResult objects, draws the path on the map
                    // and plots the elevation profile on a Visualization API ColumnChart.
                    function plotElevation(elevations, status) {
                      
                      
                      // Create a new chart in the elevation_chart DIV.
                      // var chart = new google.visualization.ColumnChart(document.getElementById('elevation_chart'));

                      // Extract the data from which to populate the chart.
                      // Because the samples are equidistant, the 'Sample'
                      // column here does double duty as distance along the
                      // X axis.

                      var data = new google.visualization.DataTable();
                      data.addColumn('string', 'Sample');
                      data.addColumn('number', 'Elevation');
                      for (var i = 0; i < elevations.length; i++) {
                        data.addRow(['', elevations[i].elevation]);
                      }

                      var chart = new google.visualization.AreaChart(document.getElementById('elevation_chart'));

                      // Draw the chart using the data within its DIV.
                      chart.draw(data, {
                        height: 150,
                        focusTarget: 'category',
                        legend: 'none',
                        titleY: 'Elevation (m)'
                      });

                      // Show athlete avatar on the map as the mouse overs the Elevation chart
                      var mousemarker = null;
                      google.visualization.events.addListener(chart, 'onmouseover', function(e) {
                        if (mousemarker == null) {
                          mousemarker = new google.maps.Marker({
                            position: elevations[e.row].location,
                            map: map,
                            icon: {
                              url: '/sites/default/themes/storyteller/img/icon-path-location.png',
                              anchor: new google.maps.Point(8, 10)
                            }
                          });
                        } else {
                          mousemarker.setPosition(elevations[e.row].location);
                        }
                      });

                    // Remove the green rollover marker when the mouse leaves the chart
                      function clearMouseMarker() {
                        if (mousemarker != null) {
                          mousemarker.setMap(null);
                          mousemarker = null;
                        }
                      }
                      

                    }
              }

          }


      // END GOOGLE MAP


      // Sidebar information from data stored on node/VIEW

      if ($('.field-name-field-activity-id .field-item').html()) {

        // Link to the activity on Strava
        $('.activity_data .strava-activity').html('<a href="https://www.strava.com/activities/' + $('.field-name-field-activity-id .field-item').html() + '" target="_blank" >' + 'View on Strava' + '</a></p>');

        // Set the date
        $('.activity_data .date').html('<span class="small light-grey">Date</span><br />' + readable_date($('.field-name-field-date .field-item').html()) + '<br />at ' + readable_time($('.field-name-field-date .field-item').html()));

        // Activity Type: if 'Run'
        // if ($('.field-name-field-type .field-item').html() == 'Run')
        // $('.activity_data .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-Run.png" />');
    
        // Activity Type: if 'Ride'
        // if ($('.field-name-field-type .field-item').html() == 'Ride')
        $('.activity_data .type').html('<img class="icon" src="/sites/default/themes/storyteller/img/icon-' + $('.field-name-field-type .field-item').html() + '.png" />');

        // Moving time
        $('.activity_data .moving-time').html(secondsToHms($('.field-name-field-moving-time .field-item').html()) + '</span><span class="small light-grey"> <br />Moving time</span>');

        // Distance
        if ( $('#user-data .measurement').text() == 'meters' ) {
          $('.activity_data .distance').html(mtoKm($('.field-name-field-distance .field-item').html()) + '<span class="small light-grey"> km<br />' + $('.field-name-field-type .field-item').html() + '</span>');
        } else {
          $('.activity_data .distance').html(mtoMiles($('.field-name-field-distance .field-item').html()) + '<span class="small light-grey"> mi<br />' + $('.field-name-field-type .field-item').html() + '</span>');
        }

        if ($('.field-name-field-type .field-item').html() == 'Run') {
          // Pace
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.activity_data .pace').html('<span class="small light-grey">Pace</span><br />' + pace($('.field-name-field-moving-time .field-item').html(), $('.field-name-field-distance .field-item').html()) + '/km');
          } else {
            $('.activity_data .pace').html('<span class="small light-grey">Pace</span><br />' + pace_mi($('.field-name-field-moving-time .field-item').html(), $('.field-name-field-distance .field-item').html()) + '/mi');
          }
        }

        if ($('.field-name-field-type .field-item').html() == 'Ride') {
          // Avg Speed
          if ( $('#user-data .measurement').text() == 'meters' ) {
            $('.activity_data .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2kmh($('.field-name-field-average-speed .field-item').html()) + ' km/h');
          } else {
            $('.activity_data .avg-speed').html('<span class="small light-grey">Average speed</span><br />' + ms2mph($('.field-name-field-average-speed .field-item').html()) + ' mi/h');
          }
        }

        // Elevation
        if ( $('#user-data .measurement').text() == 'meters' ) {
          $('.activity_data .elevation').html(Math.round($('.field-name-field-elevation .field-item').html()) + '<span class="small light-grey"> m<br />Elevation</span>');
        } else {
          var elevation_ft = $('.field-name-field-elevation .field-item').html() * 3.2808399;
          elevation_ft = Math.round( elevation_ft * 1 ) / 1;
          $('.activity_data .elevation').html(elevation_ft + '<span class="small light-grey"> ft<br />Elevation</span>');
        }

      } // end if


      // Join the Storyteller Club
      if ( $('#user-data .storyteller_club').length && ( $('.storyteller_club').text() != '1' ) ) {
        $('.strapline .strap.club').show();
      }


    // Votes: changing the 'title' to the upvote link
    // $('a.rate-button').attr('title', 'Let the author know you liked the story');

      
    // Sticky user info

      // function sticky_relocate() {

      //     // var window_top = $(window).scrollTop();

      //     // Node Column Right
      //     // var node_column_right_top = $('.sticky-anchor').offset();
      //     // node_column_right_top = node_column_right_top['top']; // 130 so to respect the top-margin on the right sidebar

      //     // var node_comments_top = $('.comment-form').offset();
      //     // node_comments_top = node_comments_top['top']; // 130 so to respect the top-margin on the right sidebar

      //     // Sticky: Node Column Right
      //     // We use .sticky-anchor as an anchor
      //     // if (window_top > node_column_right_top) {
      //     //     $('.node-column-sidebar-right').addClass('sticky');
      //     //     $('.sticky-anchor').height($('.node-column-sidebar-right').outerHeight());
      //     // } else {
      //     //     $('.node-column-sidebar-right').removeClass('sticky');
      //     //     $('.sticky-anchor').height(0);
      //     // }

      //     // Toggle a class when the .comments box enters the screen
      //     // if (window_top < node_comments_top) {
      //     //     $('.node-column-sidebar-right').removeClass('comments');
      //     //     // $('.sticky-anchor').height($('.node-column-sidebar-right').outerHeight());
      //     // } else {
      //     //     $('.node-column-sidebar-right').addClass('comments');
      //     //     // $('.sticky-anchor').height(0);
      //     // }

      // }

      // $(function() {
      //     if ($( '.sticky-anchor' ).length) {
      //       $(window).scroll(sticky_relocate);
      //       sticky_relocate();
      //     }
      // });


    // If threaded comments are enabled
    // Logged in user info data on Reply-to-Comment
      // $( ".comment-user-avatar" ).prependTo( "#comments .comment-form" );


    }
  }

})(jQuery);