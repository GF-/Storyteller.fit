(function($) {

  Drupal.behaviors.stravaServices = {
    attach: function(context, settings) {
      var self = this;
      this.token = settings.strava_api_data.token; 
      this.apiUrl = settings.strava_api_data.api_url;

      // Check for any missing athlete's image 
      this.remoteImage = function() {
        var image = new Image();
        var images = $('.view-stories img.round');
        images.each(function(index, img) {
          $(this).load(function(el) {
            // Something here? Not for now
            //console.log('success');
          }).error(function(event) {
             var sibling = $(event.target).parents().eq(0);
             var athleteID = sibling.prev().text();
             $.getJSON(self.apiUrl + 'athletes/' + athleteID + '?access_token=' + self.token + '&callback=?', function(athlete) {
               $(event.target).attr('src', athlete.profile);
             });
          });
        });
      };
      
      this.remoteImage();
    }

  };

})(jQuery);