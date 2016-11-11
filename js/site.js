(function () {

  /**
   * Your Required Weather Underground API Key
   * @link https://www.wunderground.com/weather/api/
   * @type {string}
   */
  var API_KEY = '';

  /**
   * Weather Unit
   * Choose Either F or C
   * @type {string}
   */
  var WEATHER_UNIT = 'F';

  /**
   * Track if making WU Ajax Call
   * @type {boolean}
   */
  var fetchingWeather = false;

  /**
   * Fetch Weather for provided Zipcode
   * @param zipcode
   */
  function getWeather (zipcode) {
    $('.weather-input .error-message').fadeOut();

    fetchingWeather = true;

    if (!/[0-9]{5}/.test(zipcode)) {
      showError('Invalid Zipcode');
      return false;
    } else if (API_KEY == '') {
      showError('Invalid Weather Underground API Key');
      return false;
    }

    var weatherUrl = 'https://api.wunderground.com/api/' + API_KEY + '/forecast/q/zmw:' + zipcode + '.1.99999.json';

    $.ajax({
      url: weatherUrl,
      jsonp: 'callback',
      dataType: 'jsonp',
      success: function( data ) {
        fetchingWeather = false;
        if (data.response.error) {
          showError(data.response.error.description);
        } else if (typeof data.forecast !== 'undefined' && typeof data.forecast.simpleforecast !== 'undefined') {
          buildForecast(zipcode, data.forecast.simpleforecast.forecastday);
        } else {
          showError('An Unknown Error Occurred');
        }

        if (typeof(Storage) !== 'undefined') {
          localStorage.setItem('zipcode', zipcode);
        }
      }
    });
  }

  /**
   * Build Weather Forecast
   * @param zipcode
   * @param forecast
   */
  function buildForecast (zipcode, forecast) {
    for (var i = 0; i < forecast.length; i++) {
      var date = '<div class="weather-date">' + forecast[i].date.monthname_short + ' ' + forecast[i].date.day + '</div>';
      var image = weatherIcon(forecast[i].icon);
      var high = (WEATHER_UNIT == 'F') ? forecast[i].high.fahrenheit : forecast[i].high.celsius;
      var low = (WEATHER_UNIT == 'F') ? forecast[i].low.fahrenheit : forecast[i].low.celsius;

      var weather = '<div class="weather-details">' + low + '&deg; / ' + high + '&deg;</div>';

      $('.day-' + ( i + 1)).html(date + image + weather);
    }

    $('#zipcode').blur();
    $('.weather-forecast .header').text(zipcode + ' Forecast');
    $('.weather-input').fadeOut(500);
    $('.weather-forecast').fadeIn(500);

    window.scrollTo(0, 0);
  }

  /**
   * Get local image for WU icon
   * Copy whatever set of icons you want from the following URL and drop them in your /img/icons folder
   * @link https://github.com/manifestinteractive/weather-underground-icons
   * @param icon
   */
  function weatherIcon (icon) {
    return '<img src="img/icons/' + icon + '.svg">';
  }

  /**
   * Show Error Message
   * @param message
   */
  function showError (message) {
    $('.weather-input .error-message').text(message).fadeIn(500);
  }

  /**
   * Initialize Interface
   * @param message - Whether to focus input
   */
  function init (focus) {
    fetchingWeather = false;
    $('#zipcode').val('');
    $('.weather-input').fadeIn(500);
    $('.weather-forecast').fadeOut(500);
    $('.weather-input .error-message').text('').hide();

    localStorage.removeItem('zipcode');

    if (focus) {
      $('#zipcode').focus();
    }
  }

  /**
   * Load on Document Ready
   */
  $(function() {
    var date = new Date();
    var month = date.getMonth();
    var season = '';

    if (month == 12 || month < 3) {
      season = 'winter';
    } else if (month >= 3 && month < 6) {
      season = 'spring';
    } else if (month >=6 && month < 9) {
      season = 'summer';
    } else if (month >= 9  && month < 12) {
      season = 'fall';
    }

    $('html').addClass(season);

    var elmZipcode = $('#zipcode');
    var elmBackButton = $('.back-button a');

    elmZipcode.on('keydown', function(e)  {
      var key = e.charCode || e.keyCode || 0;
      return (key == 8 || key == 9 || key == 13 || key == 46 || key == 110 || key == 190 || (key >= 35 && key <= 40) || (key >= 48 && key <= 57) || (key >= 96 && key <= 105));
    });

    elmZipcode.on('keyup', function() {
      var zipcode = $(this).val();
      if (!fetchingWeather && zipcode && zipcode.length === 5) {
        getWeather(zipcode);
      }
    });

    elmBackButton.on('click', function(e) {
      init(true);
      e.preventDefault();
    });

    if (typeof(Storage) !== 'undefined') {
      var zipcode = localStorage.getItem('zipcode');
      if (API_KEY !== '' && zipcode) {
        getWeather(zipcode);
      } else {
        init();
      }
    } else {
      init();
    }
  });
})();