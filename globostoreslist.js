var StoresApp = StoresApp || {};
StoresApp.markers = [];
StoresApp.cartFormSelector = 'form[action*="cart"][method="post"]:visible';
StoresApp.appUrl 	= 'https://app.globosoftware.net/stores';
StoresApp.CDNUrl 	= 'https://app2-czlirk8m8k.stackpathdns.com/stores';
StoresApp.searchUrl = StoresApp.appUrl+'/search?shop='+StoresApp.shopUrl;
var zoomLv = StoresApp.zoomLevel;
loadScript = function(url, callback, errcallback){
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  if (script.readyState){
      console.log("ReadyState: "+script.src);
    script.onreadystatechange = function(){
      if (script.readyState == "loaded" || script.readyState == "complete"){
        script.onreadystatechange = null;
        callback();
      }
    };
    setTimeout(function(){
      if(script.onreadystatechange !== null){
        if(errcallback !== undefined) errcallback();
      }
    },3000);
  } else {
    script.onload = function(){
      callback();
    };
    script.onerror = function(){
      if(errcallback !== undefined) errcallback();
    }
  }

  document.getElementsByTagName("head")[0].appendChild(script);
},

  StoresApp.init = function($){
  window.spuritJQ = $;
  // Check install
    var installed = false;
    $("script").each(function() {
         if ($(this).text().indexOf("globostores_init.js?") != -1 && $(this).text().indexOf("asyncLoad") != -1 && $(this).text().indexOf("initSchema") == -1) {
             installed = true;
         }
    });
    if(!installed) {console.log("Globo Store Locator + Pickup in Store App has been uninstalled ");return false;}

  //loadScript(StoresApp.CDNUrl+'/assets/js/plugin-fancybox.js', function(){
  loadScript(StoresApp.CDNUrl+'/assets/js/bootstrap-multiselect.js', function(){
  loadScript(StoresApp.CDNUrl+'/assets/js/masonry.pkgd.min.js', function(){
    $(document).ready(function(){
                // Find Cart
                $('body').on('click','a[href="/cart"] ,form[action="/cart/add"] button[type="submit"]',function() {
                    setTimeout(function(){
                        var classCheckout = $('#ajaxifyCart').find('#checkout').attr('class');
                        var html = '<a href="/cart" class="'+classCheckout+'">Cart</a>';
                        var cartSelector = $('#ajaxifyCart').find('a[href="/cart"]');
                        if(!cartSelector.length){
                            var parentCheckoutBtn = $('#ajaxifyCart').find('#checkout').parent().append(html);
                            $('#ajaxifyCart').find('#checkout').remove();
                        }


                    }, 1500);

                })

                // Append Structure
                if(StoresApp.shopUrl!=""&&StoresApp.shopUrl!==undefined){
                    $.ajax({
                        url: StoresApp.appUrl+'/list?shop='+StoresApp.shopUrl,
                        dataType: 'jsonp',
                        type: "get",
                        success: function(result){
                          $('div.store-page').empty().append(result.HTML);
                          $('#example-getting-started').multiselect();
                            // Tag Dropdown
                          $('body').on('click','button.dropdown-toggle.btn',function(){
                              $(this).siblings('ul.multiselect-container').toggle();
                          });
                          var num_tags = $('.tag-option').length;
                          if(num_tags==0){
                              $('ul.multiselect-container').css('border','none').css('padding',0);
                          }


                          $('.filter-select button.multiselect.btn').text($('#example-getting-started').attr('data-title'));

                          $('.store-wrapper').masonry({
                            itemSelector: '.g-md-1-3'
                          });
                          $('#content2').hide();
                          $('label[for="tab2"]').on('click',function() {
                              $('#content2').show();
                          })
                          $('label[for="tab1"]').on('click',function() {
                              $('#content2').hide();
                          })
                          if(document.getElementById('map')){
                              StoresApp.initMap();
                          }






                        }
                    });
                }


                // Tag Dropdown




    });
    });

});
    $(document).mouseup(function(e)
    {
        var container = $("button.dropdown-toggle.btn");

        // if the target of the click isn't the container nor a descendant of the container
        // if (!container.is(e.target) && container.has(e.target).length === 0)
        // {
        //         container.siblings('ul.multiselect-container').hide();
        // }

        var ul_container = container.siblings('ul.multiselect-container');
        if (!ul_container.is(e.target) && ul_container.has(e.target).length === 0)
        {
                ul_container.hide();
        }
    });
//});



},




  StoresApp.initMap = function(){



      map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(StoresApp.defaultLat, StoresApp.defaultLong),
        zoom: parseInt(zoomLv),
        styles:JSON.parse(StoresApp.shopGoogleMapStyle),
        mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
      });

      infoWindow = new google.maps.InfoWindow();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var geocoder = new google.maps.Geocoder;
          geocoder.geocode({'location': pos}, function(results, status) {
            if (status === 'OK') {
              if (results[0]) {
                //$('#addressInput').val(results[0].formatted_address);
              } else {
                window.alert('No results found');
              }
            } else {
              window.alert('Geocoder failed due to: ' + status);
            }
          });

          map.setCenter(pos);
        }, function() {
          handleLocationError(true, infoWindow, map.getCenter());
        });
      } else {
        handleLocationError(false, infoWindow, map.getCenter());
      }





  $('#addressInput').keypress(function(e) {
    code = e.keyCode ? e.keyCode : e.which;
    if(code.toString() == 13)
      StoresApp.searchLocations();
  });

  $(document).on('click', '#getLocation', function(e){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var geocoder = new google.maps.Geocoder;
        geocoder.geocode({'location': pos}, function(results, status) {
          if (status === 'OK') {
            if (results[0]) {
              //$('#addressInput').val(results[0].formatted_address);
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });

        StoresApp.createCustomMarker(map,pos);
        map.setCenter(pos);


      }, function() {handleLocationError(true, infoWindow, map.getCenter())});
    } else {handleLocationError(false, infoWindow, map.getCenter())}
  });


  $(document).on('click', '.stores-list-container', function(e){

    $(this).addClass('active').siblings().removeClass('active');
    markerNum = $(this).attr("data-markerid");
    google.maps.event.trigger(StoresApp.markers[markerNum], 'setCenter');
    $(this).find('input[type=radio]').prop('checked', true);

  });


  $(document).on('click', 'button[name=search_locations]', function(e){
    e.preventDefault();
    StoresApp.searchLocations();
  });





  StoresApp.initMarkers();
  console.log('here');
  if (!!$.prototype.fancybox){
      console.log('Append fancybox 1');
      $('.more-info').fancybox();
  }else {
      loadScript(StoresApp.CDNUrl+'/assets/js/plugin-fancybox.js', function(){
          console.log('Append fancybox 2');
          if (!!$.prototype.fancybox){
              console.log('Append fancybox 3');
              console.log($('.more-info'));
              $('.more-info').fancybox();
          }

      });
  }


},

  StoresApp.getPageType = function(){
  var url = window.location.toString();
  if(url.match(/\/cart/) !== null){
    return 'cart';
  }else if(url.match(/\/apps\/stores/) !== null){
    return 'stores';
  }else{
    return '';
  }
},

  StoresApp.initMarkers = function(){
  console.log('Init Markers');

  var downloadUrl = StoresApp.searchUrl;
  if(StoresApp.isCartPage)
    var downloadUrl = StoresApp.searchUrl+'&pickup=true';

  StoresApp.downloadUrl(downloadUrl, function(data) {
    var xml = StoresApp.parseXml(data.map_info.trim());
    var markerNodes = xml.documentElement.getElementsByTagName('marker');
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markerNodes.length; i++){
      var name = markerNodes[i].getAttribute('name');
      var listHTML = markerNodes[i].getAttribute('details_short');
      var id_store = markerNodes[i].getAttribute('id_store');
      var latlng = new google.maps.LatLng(parseFloat(markerNodes[i].getAttribute('lat')), parseFloat(markerNodes[i].getAttribute('lng')));
      var icon_store = markerNodes[i].getAttribute('icon');
      StoresApp.createMarker(latlng, name, id_store,icon_store);
      bounds.extend(latlng);
    }
    $('#stores-table').html(data.listHTML);
    // var monkeyList = new List('stores-list-table', {
    //     valueNames: ['store-address','stores-name']
    // });



    map.fitBounds(bounds);
    var zoomOverride = map.getZoom();
    if(zoomOverride > 10)
      zoomOverride = 10;
    map.setZoom(zoomOverride);
  });
},




  StoresApp.searchLocations = function(){
  // address = document.getElementById('addressInput').value;
  //address = "Ha Noi";
  // var geocoder = new google.maps.Geocoder();
  // geocoder.geocode({address: address}, function(results, status) {
  //   if (status === google.maps.GeocoderStatus.OK)

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var geocoder = new google.maps.Geocoder;
      geocoder.geocode({'location': pos}, function(results, status) {
        if (status === 'OK') {
          if (results[0]) {
            StoresApp.searchLocationsNear(results[0].geometry.location);
          }
        }
      });
    });
  }

    // else
    // {
    //   if (!!$.prototype.fancybox && isCleanHtml(address))
    //     $.fancybox.open([
    //       {
    //         type: 'inline',
    //         autoScale: true,
    //         minHeight: 30,
    //         content: '<p class="fancybox-error">' + address + ' ' + translation_6 + '</p>'
    //       }
    //     ], {
    //       padding: 0
    //     });
    //   else
    //     alert(address + ' ' + translation_6);
    // }

},

  StoresApp.clearLocations = function(n){
  infoWindow.close();
  for (var i = 0; i < StoresApp.markers.length; i++)
    StoresApp.markers[i].setMap(null);

  StoresApp.markers.length = 0;
  $('#stores-table').html('');
},

  StoresApp.searchLocationsNear = function(center){
  ajaxsearchUrl = StoresApp.searchUrl+'&latitude=' + center.lat() + '&longitude=' + center.lng() + '&distance=' + document.getElementById('radiusSelect').value+'&title='+encodeURI(document.getElementById('addressInput').value)+'&group='+document.getElementById('groupSelect').value+'&tags='+encodeURI(StoresApp.getSelectValues(document.getElementById('example-getting-started')));

  if(StoresApp.isCartPage)
    var ajaxsearchUrl = ajaxsearchUrl+'&pickup=true';



  StoresApp.downloadUrl(ajaxsearchUrl, function(data) {
    var xml = StoresApp.parseXml(data.map_info.trim());
    var markerNodes = xml.documentElement.getElementsByTagName('marker');
    var bounds = new google.maps.LatLngBounds();

    StoresApp.clearLocations(markerNodes.length);
    $('#stores-table').html(data.listHTML);
    for (var i = 0; i < markerNodes.length; i++)
    {
      var name = markerNodes[i].getAttribute('name');
      var icon_store = markerNodes[i].getAttribute('icon');

      var distance = parseFloat(markerNodes[i].getAttribute('distance'));
      var id_store = parseFloat(markerNodes[i].getAttribute('id_store'));

      var latlng = new google.maps.LatLng(parseFloat(markerNodes[i].getAttribute('lat')), parseFloat(markerNodes[i].getAttribute('lng')));

      StoresApp.createMarker(latlng, name, id_store,icon_store);
      bounds.extend(latlng);

    }

    if (markerNodes.length)
    {
      map.fitBounds(bounds);
      var listener = google.maps.event.addListener(map, "idle", function() {
        if (map.getZoom() > 13) map.setZoom(13);
        google.maps.event.removeListener(listener);
      });
    }

  });
},

  StoresApp.createMarker = function(latlng, name, id_store,url_icon){
      if(url_icon === undefined || url_icon === null||url_icon=="") url_icon = StoresApp.defaultIcon;
      //else url_icon = "https://app.globosoftware.net/stores/storage/app/photos/"+url_icon;
  var image = new google.maps.MarkerImage(url_icon);
  var marker = '';

  if (StoresApp.hasStoreIcon)
    marker = new google.maps.Marker({ map: map, icon: image, position: latlng });
  else
    marker = new google.maps.Marker({ map: map, position: latlng });

  google.maps.event.addListener(marker, 'click', function() {
    map.setCenter(latlng);
    map.setZoom(parseInt(zoomLv));
    $('a[href="#location-popup-'+id_store+'"]').click();
  });
  google.maps.event.addListener(marker, 'setCenter', function() {
    map.setCenter(latlng);
    map.setZoom(parseInt(zoomLv));
  });
  StoresApp.markers.push(marker);


},

// Anh EZ
StoresApp.createCustomMarker = function(map, location){
var marker = new google.maps.Marker({
        position: location,
        label:"A",
        map: map
      });
    google.maps.event.addListener(marker, 'click', function() {
      map.setCenter(location);
      map.setZoom(parseInt(zoomLv));
    });
    StoresApp.markers.push(marker);
},
StoresApp.ConvertTimeToFormat = function(from,to){
        const regex = /\d+/g;
        let m;
        var arr_t_from = [];
        var arr_t_to = [];
        while ((m = regex.exec(from)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            arr_t_from.push(m[0]);

        }
        while ((m = regex.exec(to)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            if(!m[0]) m[0] = 0;
            arr_t_to.push(m[0]);

        }
        var res = [];
        res['from'] = arr_t_from;
        res['to'] = arr_t_to;
        return res;

},
StoresApp.getSelectValues = function(select){
    if(select&&select.length){
            var result = [];
          var options = select && select.options;
          var opt;

          for (var i=0, iLen=options.length; i<iLen; i++) {
            opt = options[i];

            if (opt.selected) {
              result.push(opt.value || opt.text);
            }
          }
          return result.toString();
    }
    else
        return '';

},
StoresApp.convertTo24Hour = function(time) {
    var hours = parseInt(time.substr(0, 2));
    if(time.indexOf('AM') != -1 && hours == 12) {
        time = time.replace('12', '00');
    }
    if(time.indexOf('PM')  != -1 && hours < 12) {
        time = time.replace(time.substr(0, 2), (hours + 12));
    }
    return time.replace(/(AM|PM)/, '');
},

  StoresApp.downloadUrl = function(url, callback){
    console.log('downloadUrl :  '+url);
  $.ajax({
    url: url,
    dataType: 'jsonp',
    type: "get",
    success: function(result){
      if(result.success == true){
        callback(result);
      }
    }
  });
},

  StoresApp.parseXml = function(str){
  if (window.ActiveXObject)
  {
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.loadXML(str);
    return doc;
  }
  else if (window.DOMParser)
    return (new DOMParser()).parseFromString(str, 'text/xml');
};


try{
  if ( typeof jQuery === 'undefined' || (jQuery.fn.jquery.split(".")[0] < 2 && jQuery.fn.jquery.split(".")[1] < 7)) {
    var doNoConflict = true;
    if (typeof jQuery === 'undefined') {doNoConflict = false;}
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js', function(){
      if (doNoConflict) {
        jQuery17 = jQuery.noConflict(true);
      } else {
        jQuery17 = jQuery;
      }
      StoresApp.init(jQuery17);
    });
  } else {
    StoresApp.init(jQuery);
  }
}catch (e){ console.log('Menu app exception: ' + e)}
