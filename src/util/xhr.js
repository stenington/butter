/* This Source Code Form is subject to the terms of the MIT license
 * If a copy of the MIT license was not distributed with this file, you can
 * obtain one at http://www.mozillapopcorn.org/butter-license.txt */

(function() {

  function parameterize(data) {
    var s = [];

    if ( !data ) {
      return null;
    }

    for(var key in data){
      if( data.hasOwnProperty( key ) ){
        s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      }
    }

    return s.join("&").replace("/%20/g", "+");
  }

  define( [], function() {

    var __csrf_token;

    function setCSRFToken() {
      var element = document.getElementById("csrf_token_id");
      if ( element ) {
        __csrf_token = element.value;
      }
    }

    if ( document.readyState !== "loading" ) {
      setCSRFToken();
    } else {
      document.addEventListener( "DOMContentLoaded", setCSRFToken, false );
    }

    var XHR = {
      "UNSENT": 0,
      "OPENED": 1,
      "HEADERS_RECEIVED": 2,
      "LOADING": 3,
      "DONE": 4,

      /**
       * getUntilComplete
       *
       * Wraps XHR.get with a cross-browser compatible check for load completeness.
       *
       * @param {String} url: Request url.
       * @param {Function} callback: Callback function which is called after XHR is complete.
       * @param {String} mimeTypeOverride: Optional. Overrides MIME type specified by the response from the server.
       * @param {Object} extraRequestHeaders: Optional. Header key/value pairs to add to the request before it is sent to the server.
       */
      "getUntilComplete": function( url, callback, mimeTypeOverride, extraRequestHeaders ) {
        XHR.get( url, function( e ) {
          if ( this.readyState === XHR.DONE ) {
            callback.call( this, e );
          }
        }, mimeTypeOverride, extraRequestHeaders );
      },

      /**
       * get
       *
       * Sends a GET request through XHR to the specified URL.
       *
       * @param {String} url: Request url.
       * @param {Function} callback: Callback function which is called when readyState changes.
       * @param {String} mimeTypeOverride: Optional. Overrides MIME type specified by the response from the server.
       * @param {Object} extraRequestHeaders: Optional. Header key/value pairs to add to the request before it is sent to the server.
       */
      "get": function( url, callback, mimeTypeOverride, extraRequestHeaders ) {
        var xhr = new XMLHttpRequest();
        xhr.open( "GET", url, true );
        xhr.onreadystatechange = callback;
        xhr.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
        if ( extraRequestHeaders ) {
          for ( var requestHeader in extraRequestHeaders ) {
            if ( extraRequestHeaders.hasOwnProperty( requestHeader ) ) {
              xhr.setRequestHeader( requestHeader, extraRequestHeaders[ requestHeader ] );
            }
          }
        }
        if ( xhr.overrideMimeType && mimeTypeOverride ) {
          xhr.overrideMimeType( mimeTypeOverride );
        }
        xhr.send( null );
      },

      /**
       * post
       *
       * Sends a POST request through XHR to the specified URL.
       *
       * @param {String} url: Request url.
       * @param {Function} callback: Callback function which is called when readyState changes.
       * @param {String} type: Optional. The Content-Type header value to supply with the request.
       */
      "post": function( url, data, callback, type ) {
        var xhr = new XMLHttpRequest();
        xhr.open( "POST", url, true );
        xhr.onreadystatechange = callback;
        xhr.setRequestHeader( "X-Requested-With", "XMLHttpRequest" );
        if ( __csrf_token ) {
          xhr.setRequestHeader( "X-CSRFToken", __csrf_token );
        }
        if ( !type ) {
          xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
          xhr.send( parameterize( data ) );
        } else {
          xhr.setRequestHeader( "Content-Type", type );
          xhr.send( data );
        }
      }
    };

    return XHR;

  }); //define
}());
