GeoPortal.Application = M.Class.extend({
    includes: M.Mixin.Events,

    _mapObject: null,
    _mainLayer: null,
    _regionLayer: null,
    _featuresStore: new GeoPortal.HashMap(),
    _featuresByRegionStore: new GeoPortal.HashMap(),
    _currentRegion: null,

    _mapCreated: false,
    _loadedFeatures: false,

    options: {
        mainLayerId: null,
        regionLayerId: null,
        baseLayerId: null,
        defaultRegion: null
    },

    initialize: function(options) {
        this.options = {};
        M.Util.setOptions(this,options);

        $("#fullpage").find(".region-page-wrap").hide();
        $(".region-page__gallery").children(".gallery__title").text("Россия");

        this._loadedAllFeatures();
        GeoPortal.requestLayers (
            M.Util.bind(function(layers) {
                var len = layers.length, i=0;
                for(i=0;i<len;i++) {
                    if(layers[i].id() == this.options.mainLayerId) {
                        this._mainLayer = layers[i];
                    }
                    if(layers[i].id() == this.options.regionLayerId) {
                        this._regionLayer = layers[i];
                    }
                }
                if(this._mainLayer != null) {
                    this._changeLayerFunc(this._mainLayer);
                } else {
                    console.log("Turned layer was not found");
                }
                if(this._regionLayer != null) {
                    this._changeLayerFunc(this._regionLayer);
                } else {
                    console.log("Turned layer was not found");
                }
            },this),

            function(status,error) {
                console.log("Error to request layers groups. Status = " + status + ". Error text: " + error);
            }
        );
    },

    _loadedAllFeatures: function () {
        var region = GeoPortal.regionsStore.get(0),
            bounds = region.get("bounds"),
            queryString = "layersid="+this.options.mainLayerId+"&srs=EPSG:4326&southwestlng="+bounds.southWest.lng+"&southwestlat="+bounds.southWest.lat+"&northeastlng="+bounds.northEast.lng+"&northeastlat="+bounds.northEast.lat;

        apiJsonGET(GeoPortal.basePath + "/layers/feature/bbox?"+queryString,{}, M.Util.bind(function(result) {
                if(typeof result.data == 'undefined' || Object.keys(result.data) == 0) {
                    console.log("Error to request layers groups. Status = 404. Error text: Features are not found.");
                    return;
                }

                var keys = Object.keys(result.data),
                    layerFeatures = result.data[keys[0]],
                    features = layerFeatures.features,
                    i = 0, len = features.length;


                for(i=0;i<len;i++) {
                    var fid = features[i].fid,
                        sub_id = features[i].sub_id;
                    this._featuresStore.add(fid, features[i]);
                    if(!this._featuresByRegionStore.containsKey(sub_id)) {
                        this._featuresByRegionStore.add(sub_id, []);
                    }
                    this._featuresByRegionStore.get(sub_id).push(fid);
                }

                this._loadedFeatures = true;
            },this),
            function(status,error) {
                console.log("Error to request features by bbox. Status = " + status + ". Error text: " + error);
            }
        );
    },

    onApplicationLoaded: function (callback, ctx) {
        if(this._loadedFeatures && this._mainLayer != null && this._regionLayer != null) {
            callback.call(ctx);
        } else {
            setTimeout(M.Util.bind(function () {
                this.onApplicationLoaded(callback,ctx);
            }, this), 500);
        }
    },

    filterFeaturesByRegion: function (regionId) {
        var region = GeoPortal.regionsStore.get(regionId);

        if(region == undefined) {
            console.log("К сожалению информация по региону не найдена");
            return;
        }
        this._currentRegion = region;

        $("#fullpage").find(".region-page-wrap").show();
        $.fn.fullpage.setAllowScrolling(false);
        $.fn.fullpage.setKeyboardScrolling(false);

        this._showFeatures(regionId, true);
    },

    _changeRegionFeatures: function (regionId) {
        var region = GeoPortal.regionsStore.get(regionId);
        if(region == undefined) {
            console.log("К сожалению информация по региону не найдена");
            return;
        }
        this._currentRegion = region;

        this._showFeatures(regionId, false);
    },

    _showFeatures: function (regionId, isGoTo) {
        if(!this._mapCreated) {
            this._createMap(this._currentRegion);
        } else {
            var bounds = this._currentRegion.get("bounds");
            this._mapObject.fitBounds(new GeoPortal.LatLngBounds(
                new M.LatLng(bounds.southWest.lat,bounds.southWest.lng),
                new M.LatLng(bounds.northEast.lat,bounds.northEast.lng)
            ));

            var cql = [{field: "id", compare: "=", type: "integer", value: this._currentRegion.get("id") ? this._currentRegion.get("id") : -1}];
            if(this._currentRegion.get("coupledId") && this._currentRegion.get("coupledId") > 0) {
                cql.push({field: "id", compare: "=", type: "integer", value: this._currentRegion.get("coupledId")})
            }
            this._regionLayer.setFilter(new GeoPortal.MyFilter.CQL(cql));
        }

        if(isGoTo) {
            this._goToSection("region-page");
        }


        $(".region-page__gallery").find(".region__photos").html("");
        $(".region-page__gallery").children(".gallery__title").text(this._currentRegion.get("name"));
        $(".region-page__gallery").children(".gallery__subtitle").text("0 памятных знаков");

        var len = 0;
        if(regionId > 0) {
            var featureIds = this._featuresByRegionStore.get(regionId);

            len = featureIds ? featureIds.length : 0;
            if(len > 0) {
                var i=0, feature;
                for(i=0; i<len;i++) {
                    feature = this._featuresStore.get(featureIds[i]);
                    if(feature) {
                        var item = new GeoPortal.Widget.ListFeature($(".region-page__gallery").find(".region__photos"),
                            {   layerId: this._mainLayer.id(),
                                feature: feature,
                                aClassName: "region__photo-block"
                            });
                        item.on("feature:click", this._listFeatureClicked, this);
                    }
                }
            }
        } else {
            len = this._featuresStore.getCount();
            if(len > 0) {
                this._featuresStore.each(M.Util.bind(function (fid, feature) {
                    var item = new GeoPortal.Widget.ListFeature($(".region-page__gallery").find(".region__photos"),
                        {   layerId: this._mainLayer.id(),
                            feature: feature,
                            aClassName: "region__photo-block"
                        });
                    item.on("feature:click", this._listFeatureClicked, this);
                },this))
            }
        }
        var countText = len+" " + caseWord(len, "памятный знак", "памятных знака", "памятных знака");
        $(".region-page__gallery").children(".gallery__subtitle").text(countText);
    },

    _goToSection: function(elemId) {
        document.getElementById(elemId).scrollIntoView({block: 'start', behavior: 'smooth'});
    },

    _createMap: function (region) {
        var baseLayer = this._findBaseLayer(this.options.baseLayerId),
            mapReady = M.Util.bind(function() {
                var bounds = region.get("bounds");
                this._mapObject.fitBounds(new GeoPortal.LatLngBounds(
                    new M.LatLng(bounds.southWest.lat,bounds.southWest.lng),
                    new M.LatLng(bounds.northEast.lat,bounds.northEast.lng)
                ));
                this._mapObject.addLayer(this._mainLayer);

                var cql = [{field: "id", compare: "=", type: "integer", value: region.get("id") ? region.get("id") : -1}];
                if(region.get("coupledId") && region.get("coupledId") > 0) {
                    cql.push({field: "id", compare: "=", type: "integer", value: region.get("coupledId")})
                }
                this._regionLayer.setFilter(new GeoPortal.MyFilter.CQL(cql));
                this._mapObject.addLayer(this._regionLayer);
            },this);


        this._mapObject = new GeoPortal.MyMap('map',{
            baseLayer: baseLayer,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            shiftDragZoom: false
        });
        this._mapCreated = true;

        this._mapObject.on("ready", mapReady, this);

        var zoomControl = new GeoPortal.Control.Zoom();
        this._mapObject.addControl(zoomControl);

        this._mapObject.on("click",function(e) {
            this.clickLatLng = e.latlng;
        }, this );
        this._mapObject.on("featureClicked", M.Util.bind(this._mapFeatureClicked,this));

    },

    _mapFeatureClicked: function (data) {
        if (data.features == undefined) {
            console.log("Request features error. Status = " + status + ". Error text: " + error);
            return;
        }

        if(data.features.length == 0) {
            alert("В точке ничего не найдено!");
            return;
        }
        var mapFeatureObj = data.features[0],
            feature = this._featuresStore.get(mapFeatureObj.feature().fid);

        if(feature == undefined) {
            feature =  mapFeatureObj.feature();
            this._featuresStore.add(feature.fid, feature);
            if(feature.sub_id != null) {
                if(!this._featuresByRegionStore.containsKey(feature.sub_id)) {
                    this._featuresByRegionStore.add(feature.sub_id, []);
                }
                this._featuresByRegionStore.get(feature.sub_id).push(feature.fid);
            }
        }

        var region = null;
        if(feature.sub_id != null) {
            if (this._currentRegion == null || feature.sub_id != this._currentRegion.get("id")) {
                this._changeRegionFeatures(feature.sub_id);
            }
            region = GeoPortal.regionsStore.get(feature.sub_id);
        }

        if(region != null) {
            setTimeout(M.Util.bind(function () {
                this._featureFullInfo(feature, region);
            },this), 1000);
        } else {
            this._featureFullInfo(feature, null);
        }

    },

    _listFeatureClicked: function (data) {
        this._featureFullInfo(data.feature, this._currentRegion);
    },

    _featureFullInfo: function(feature, region) {
        this._fullInfoWidget = new GeoPortal.Widget.FeatureFullInfo($(".more-info-page"), {feature: feature, application: this, region: region});
        this._fullInfoWidget.on("fullinfo:close", this._onFullInfoWidgetClose, this);
        this._displayFullPage();
    },

    _onFullInfoWidgetClose: function() {
        this._fullInfoWidget.off("fullinfo:close", this._onFullInfoWidgetClose, this);
        this._fullInfoWidget = null;

        this._displayFullPage();

        $("html, body").animate({
            scrollTop: $(".region-page").offset().top + "px"
        }, {
            duration: 0
        });
    },

    _displayFullPage: function () {
        var fullPage = $("#fullpage");
        fullPage.css("display", fullPage.css("display") === 'none' ? '' : 'none');
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

        layer.loadAllAttributes = function(){
            apiJsonGET(GeoPortal.basePath +"/layers/"+this._model.get('id')+"/attributes?random="+Math.random(),{}, M.Util.bind(function(data){
                var geometryType = data.geometryType,
                    attributes = data.attributes,
                    realGeometryType = data.realGeometryType;

                this._model.set("geometryType",geometryType); //= geometryType;
                this._model.set("realGeometryType",realGeometryType);//["realGeometryType"] = realGeometryType;
                this._model.set("attributes",attributes);//["attributes"] = attributes;
                var fields = this._model.get("fields");// this._values["fields"];
                for(var i in attributes){
                    for (var j=0,length=fields.length;j<length;j++) {
                        if ( fields[j].name == attributes[i].name ) {
                            fields[j].type = attributes[i].type;
                            attributes[i].withRusName = true;
                        }
                    }
                    if(attributes[i].geometryField) {
                        this._geomField = attributes[i];
                    }
                }
                this._model.set("fields",fields);//["fields"] = fields;
                this.fire("model:layer:load:attributes",{layer:this});
            },this));
        };

    }
});