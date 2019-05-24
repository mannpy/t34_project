$(document).ready(function(){

    // Carousel
    $(".owl-carousel").owlCarousel({
        items:4,
        loop:false,
        center:false,
        margin:100,
        URLhashListener:true,
        autoplayHoverPause:true,
        startPosition: 'URLHash'
    });

    // Characteristics-page img change

    $('.chars-view .btn').click(function () {
      $('.chars-view .btn').removeClass('active');
      $(this).toggleClass('active');
      if ($(this).attr("id") == "chars-view__top") {
        $(".chars-view__img").attr("src","../img/characteristic-page/tank-top.jpg");
      }
      if ($(this).attr("id") == "chars-view__left") {
        $(".chars-view__img").attr("src","../img/characteristic-page/tank-left.png");
      }
      if ($(this).attr("id") == "chars-view__right") {
        $(".chars-view__img").attr("src","../img/characteristic-page/tank-right.jpg");
      }
      if ($(this).attr("id") == "chars-view__front") {
        $(".chars-view__img").attr("src","../img/characteristic-page/tank-front.jpg");
      }
      if ($(this).attr("id") == "chars-view__back") {
        $(".chars-view__img").attr("src","../img/characteristic-page/tank-back.jpg");
      }
    });

    // 

    // Dedal map

    $(function() {
      var application;
      
      GeoPortal.on("ready",geoportalReady,this);
      function geoportalReady() {
        application = new Application("oleg", "1234567892222", "-932516122", 55.29006455319217, 36.617431640625, 10, [5]);
        application.initialization();
      }
      
      function Application(login, password, baseLayerId, lon, lat, zoom, turnedLayers) {
        var self = this;
        this.mapObject = null;
        this.layersStore = new GeoPortal.HashMap();
        this.marker = null;
        this.clickLatLng = null;
        this.featuresStore = null;
        this.leftpanel = null;
        this.featureWidget = null;
        
        this.initialization = function() {
          var baseLayer = findBaseLayer(baseLayerId),
            mapReady = function() {
              self.mapObject.setZoom(zoom);
              self.mapObject.setCenter(lon,lat);
            };
          this.mapObject = new GeoPortal.Map('map',{baseLayer: baseLayer}); 
          this.mapObject.on("ready", mapReady, this)
        
          GeoPortal.authenticate(login, password,
            function(data) {
              GeoPortal.requestGroups(true,
                function(groups) {
                  var len = groups.length, i=0;
                  for(i=0;i<len;i++) {
                    drawGroup(groups[i]);
                  } 
                  
                  $("#groups").find(".layer").find("input").on("click",function() {
                    var id = $(this).val(),
                    layer = self.layersStore.get(id);
    
                    if(typeof layer != 'undefined') {
                      layer.turn(self.mapObject);
                    }
                  });
                  
                  var i=0, len = turnedLayers.length;
                  for(i=0;i<len;i++) {
                    $("#groups").find(".layer").find("input[value='"+turnedLayers[i]+"']").click();
                  }
                },
                
                function(status,error) {
                  console.log("Error to request layers groups. Status = " + status + ". Error text: " + error);
                }
              );
              controls();
              
            },
            function(status,error){
              console.log("Error to request authentication. Status = " + status + ". Error text: " + error);
            }
          );
    
          self.mapObject.on("popupclose", removeMarker, this);
          
          self.mapObject.on("click",function(e) {
            self.clickLatLng = e.latlng;
          }, this ); 
          
          self.mapObject.on("featureClicked",
            function(data) {
              self.mapObject.off("popupclose", removeMarker, self);
              removeMarker();
              self.mapObject.on("popupclose", removeMarker, self);
              
              if(self.leftpanel != null) {
                self.leftpanel.destroy();
                self.leftpanel = null;
              }
          
              if (data.features == undefined) {
                console.log("Request features error. Status = " + status + ". Error text: " + error);
                return;
              }
              
              if(data.features.lenght == 0) {
                alert("В точке ничего не найдено!");
                return;
              }
              
              var i=0, len = data.features.length;
              self.featuresStore = new GeoPortal.HashMap();
              for(i=0;i<len;i++) {
                var feature = data.features[i];
                self.featuresStore.add(feature.id(), feature);
              }
              
              if(self.featuresStore.getCount() == 1) {
                var feature = data.features[0],
                  layer = self.layersStore.get(feature.layerId());
                if(layer._model.get("info").service == 'WFS'){
                  self.featureWidget = new GeoPortal.Widget.WFSFeatures(null, {latLng: self.clickLatLng, application: self});
                } else {
                  self.featureWidget = new GeoPortal.Widget.WMSFeatures(null, {latLng: self.clickLatLng, application: self});
                }
              } else {
                self.featureWidget = new GeoPortal.Widget.WMSFeatures(null, {latLng: self.clickLatLng, application: self});
              }
            }
          );
        
        };
        
        function findBaseLayer(baseLayerId) {
          var baseLayer = null,
            i=0, len, layer;
            
          len = GeoPortal.baseLayers.schemas.length;
          for(i=0;i<len;i++) {
            layer = GeoPortal.baseLayers.schemas[i];
            if(layer.id() == baseLayerId) {
              baseLayer = layer;
              break;
            }
          }
          if(baseLayer == null) {
            len = GeoPortal.baseLayers.spaces.length;
            for(i=0;i<len;i++) {
              layer = GeoPortal.baseLayers.spaces[i];
              if(layer.id() == baseLayerId) {
                baseLayer = layer;
                break;
              }
            }
          }
          return baseLayer;
        
        };
        
        
        function drawGroup(group) {
          var GROUP_MARGIN_BOTTOM = 45,
            GROUP_MARGIN_TOP = 10,
            GROUP_PADDING = 15,
            GROUP_BORDER = 2;
      
          if(typeof group == "undefined")
            return;
            
          var groupsDiv = $("#groups"),
            groupDiv, layersDiv, layers, key, layer;
    
          groupsDiv.append('<div class="group"><div class="title-group"><h3>'+ group.name() +'</h3></div><div class="layers"></div></div>');
          groupDiv = groupsDiv.last();
          layersDiv = groupDiv.find(".layers:last");
          layers = group.layers();
          
          for(key in layers) {
            layer = layers[key];
            self.layersStore.add(layer.id(), layer);
            layersDiv.append('<div class="layer"><input type="checkbox" class="checkbox-layer" value="'+ layer.id() +'">'+ layer.rusName() +'</div>');
          }
          
          $("#groups").height($(window).height() - GROUP_MARGIN_BOTTOM - GROUP_MARGIN_TOP - (2 * GROUP_PADDING) - (2 * GROUP_BORDER));
        };
        
        function controls() {
          var distance = new GeoPortal.Control.Distance();
          
          distance.on("control:distance:enable", function(data) {
            self.mapObject.off("popupclose",removeMarker,self);
            removeMarker(); 
          }, self);
          
          distance.on("control:distance:disable", function(data) {
            self.mapObject.on("popupclose",removeMarker,self);
          }, self);
          
          self.mapObject.addControl(distance);
        }
        
        function removeMarker() {
          if (self.marker != undefined) {
            self.mapObject.removeLayer(self.marker);
            self.marker = undefined;
          }
        }
        
      }
        
      function flashVersion() {
        // Отдельно определяем Internet Explorer
        var ua = navigator.userAgent.toLowerCase();
        var isIE = (ua.indexOf("msie") != -1 && ua.indexOf("opera") == -1 && ua.indexOf("webtv") == -1);
        // Стартовые переменные
        var version = 0;
        var newversion;
        var lastVersion = 10; // c запасом
        var i;
        var plugin;
    
        if (isIE) { // browser == IE
          try {
            for (i = 3; i <= lastVersion; i++) {
              if (eval('new ActiveXObject("ShockwaveFlash.ShockwaveFlash.'+i+'")')) {
                version = i;
              }
            }
          } catch(e) {}
        } else { // browser != IE
          for (i in navigator.plugins) {
            plugin = navigator.plugins[i];
            if (plugin.name == undefined) continue;
            if (plugin.name.indexOf('Flash') > -1) {
              newversion = /\d+/.exec(plugin.description);
              if (newversion == null) newversion = 0;
              if (newversion> version) version = newversion;
            }
          }
        }
        return version;
      }
    });
  });