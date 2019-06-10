GeoPortal.Application = M.Class.extend({
    includes: M.Mixin.Events,

    mapObject: null,
    mainLayer: null,
    featuresStore: new GeoPortal.HashMap(),
    region: null,

    _mapCreated: false,
    _isLayerTurnOn: false,

    options: {
        mainLayerId: null,
        baseLayerId: null,
        defaultRegion: null
    },

    initialize: function(options) {
        this.options = {};
        M.Util.setOptions(this,options);

        $("#fullpage").find(".region-page-wrap").hide();
        $(".region-page__gallery").children(".gallery__title").text("Россия");

        GeoPortal.requestLayers (
            M.Util.bind(function(layers) {
                var len = layers.length, i=0;
                for(i=0;i<len;i++) {
                    if(layers[i].id() == this.options.mainLayerId) {
                        this.mainLayer = layers[i];
                        break;
                    }
                }
                if(this.mainLayer != null) {
                    this._changeLayerFunc(this.mainLayer);
                } else {
                    console.log("Turned layer was not found");
                }
            },this),

            function(status,error) {
                console.log("Error to request layers groups. Status = " + status + ". Error text: " + error);
            }
        );
    },

    _createMap: function (region) {
        var baseLayer = this._findBaseLayer(this.options.baseLayerId),
            mapReady = M.Util.bind(function() {
                var bounds = region.get("bounds");
                this.mapObject.fitBounds(new GeoPortal.LatLngBounds(
                    new M.LatLng(bounds.southWest.lat,bounds.southWest.lng),
                    new M.LatLng(bounds.northEast.lat,bounds.northEast.lng)
                ));
            },this);


        this.mapObject = new GeoPortal.MyMap('map',{
            baseLayer: baseLayer,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            shiftDragZoom: false
        });
        this._mapCreated = true;

        this.mapObject.on("ready", mapReady, this);

        var zoomControl = new GeoPortal.Control.Zoom();
        this.mapObject.addControl(zoomControl);

        this.mapObject.on("click",function(e) {
            this.clickLatLng = e.latlng;
        }, this );
        this.mapObject.on("featureClicked",
            M.Util.bind(function(data) {
                if (data.features == undefined) {
                    console.log("Request features error. Status = " + status + ". Error text: " + error);
                    return;
                }

                if(data.features.lenght == 0) {
                    alert("В точке ничего не найдено!");
                    return;
                }
                var mapFeatureObj = data.features[0],
                    feature = this.featuresStore.get(mapFeatureObj.feature().fid);

                this._featureClick({feature: feature});
            },this)
        );

    },

    _goToSection: function(elemId) {
       /* $('html, body').animate({
            scrollTop: $elem.offset().top
        }, 0);*/
        document.getElementById(elemId).scrollIntoView({block: 'start', behavior: 'smooth'});
    },

    _turnOnLayer: function (regionId) {
        this.mainLayer.cqlFilter = encodeURIComponent("(sub_id IN ("+regionId+"))");
        this.mapObject.addLayer(this.mainLayer);
        this._isLayerTurnOn = true;
    },

    _turnOffLayer: function () {
        this.mapObject.removeLayer(this.mainLayer);
        this.mainLayer._clearMapLayer(this.mapObject);
        this._isLayerTurnOn = false;
    },

    showFeatures: function (regionId) {
        var region = GeoPortal.regionsStore.get(regionId);
        if(region == undefined) {
            alert("К сожалению информация по региону не найдена");
            return;
        }

        var bounds = region.get("bounds");

        $("#fullpage").find(".region-page-wrap").show();
        $.fn.fullpage.setAllowScrolling(false);
        $.fn.fullpage.setKeyboardScrolling(false);
        if(!this._mapCreated) {
            this._createMap(region);
        } else {
            this.mapObject.fitBounds(new GeoPortal.LatLngBounds(
                new M.LatLng(bounds.southWest.lat,bounds.southWest.lng),
                new M.LatLng(bounds.northEast.lat,bounds.northEast.lng)
            ));
        }
        this._goToSection("region-page");

        if(this._isLayerTurnOn) {
            this._turnOffLayer();
        }
        this._turnOnLayer(regionId);

        $(".region-page__gallery").find(".region__photos").html("");
        $(".region-page__gallery").children(".gallery__title").text(region.get("name"));
        $(".region-page__gallery").children(".gallery__subtitle").text("0 памятных знаков");
        this.featuresStore.clear();

        var bounds = region.get("bounds"),
            queryString = "layersid="+this.mainLayer.id()+"&srs=EPSG:4326&southwestlng="+bounds.southWest.lng+"&southwestlat="+bounds.southWest.lat+"&northeastlng="+bounds.northEast.lng+"&northeastlat="+bounds.northEast.lat;

        apiJsonGET(GeoPortal.basePath + "/layers/feature/bbox?"+queryString,{}, M.Util.bind(function(result){
                if(typeof result.data == 'undefined' || Object.keys(result.data) == 0) {
                    console.log("Error to request layers groups. Status = 404. Error text: Features are not found.");
                    return;
                }

                var keys = Object.keys(result.data),
                    layerFeatures = result.data[keys[0]],
                    features = layerFeatures.features,
                    i = 0, len = features.length;


                for(i=0;i<len;i++) {
                    if(features[i].sub_id == region.get("id")){
                        var fid = features[i].fid;
                        this.featuresStore.add(fid, features[i]);
                        var item = new GeoPortal.Widget.ListFeature($(".region-page__gallery").find(".region__photos"), {layerId: this.mainLayer.id(), feature:this.featuresStore.get(fid)});
                        item.on("feature:click", this._featureClick, this);
                    }
                }
                var len = this.featuresStore.getCount(),
                    countText = len+" " + caseWord(len, "памятный знак", "памятных знака", "памятных знака");
                $(".region-page__gallery").children(".gallery__subtitle").text(countText);

            },this),
            function(status,error) {
                console.log("Error to request features by bbox. Status = " + status + ". Error text: " + error);
            }
        );
    },

    _featureClick: function(data) {
        var moreInfoPage = $(".more-info-page"),
            map = $(".region-map"),
            fullPage = $("#fullpage");

        this._fullInfoWidger = new GeoPortal.Widget.FeatureFullInfo(moreInfoPage, {feature: data.feature, application: this});
        this._fullInfoWidger.on("fullinfo:close", this._fullInfoWidgerClose, this);
        map.css("display", map.css("display") === 'none' ? '' : 'none');
        fullPage.css("display", fullPage.css("display") === 'none' ? '' : 'none');
    },

    _fullInfoWidgerClose: function() {
        this._fullInfoWidger.off("fullinfo:close", this._fullInfoWidgerClose, this);
        this._fullInfoWidger = null;

        var map = $(".region-map"),
            fullPage = $("#fullpage");

        map.css("display", map.css("display") === 'none' ? '' : 'none');
        fullPage.css("display", fullPage.css("display") === 'none' ? '' : 'none');


        $("html, body").animate({
            scrollTop: $(".region-page").offset().top + "px"
        }, {
            duration: 0
        });


    },



    _findBaseLayer: function(baseLayerId) {
        var baseLayer = null,
            i = 0, len, layer;

        len = GeoPortal.baseLayers.schemas.length;
        for (i = 0; i < len; i++) {
            layer = GeoPortal.baseLayers.schemas[i];
            if (layer.id() == baseLayerId) {
                baseLayer = layer;
                break;
            }
        }
        if (baseLayer == null) {
            len = GeoPortal.baseLayers.spaces.length;
            for (i = 0; i < len; i++) {
                layer = GeoPortal.baseLayers.spaces[i];
                if (layer.id() == baseLayerId) {
                    baseLayer = layer;
                    break;
                }
            }
        }
        return baseLayer;
    },

    _changeLayerFunc: function(layer) {
        layer._createMapLayer = function(map) {
            var id = M.Util.stamp(map),
                mapLayer;
            if(this._layersForMaps.containsKey(id))
                mapLayer = this._layersForMaps.get(id);
            else{
                var info = this._model.get("info"),
                    layerId = this.id(),
                    token = GeoPortal._accessToken != null ?  GeoPortal._accessToken : "";

                if(info == null)
                    throw "Layer with id="+ layerId + " does not have an info attribute!";

                if (GeoPortal.enums.layerServices.isWMS(info.service)){
                    mapLayer = new M.TileLayer.WMS(GeoPortal.basePath + info.requestUrl, {layers: info.typeName, styles: info.style, format: 'image/png', transparent: true, token: token});
                    if(this._filterCQL instanceof GeoPortal.Filter.CQL && mapLayer.wmsParams != undefined){
                        mapLayer.wmsParams.cql_filter = this._filterCQL.filterString();
                    }
                }
                else {
                    var wfsOptions = {};

                    if (GeoPortal.wfsDoubleSize && GeoPortal.wfsDoubleSize===true) {
                        wfsOptions.doubleSize = true;
                    }
                    if(this.cqlFilter != undefined) {
                        wfsOptions.cqlFilter = this.cqlFilter;
                    }
                    mapLayer = new GeoPortal.Layer.WFS(GeoPortal.basePath + info.requestUrl+"?token=" + token,info.typeName,GeoPortal.basePath + info.requestUrl.substring(0,info.requestUrl.length-3) + "styles/" + layerId + "/" + info.style+ ".sld?token=" + token,undefined,wfsOptions);
                }
                mapLayer.record = this;
                this._layersForMaps.add(id,mapLayer);
            }
            return mapLayer;
        };
        layer._clearMapLayer = function (map) {
            var id = M.Util.stamp(map);
            if(this._layersForMaps.containsKey(id)) {
                this._layersForMaps.removeByKey(id);
            }
        };
    },
});