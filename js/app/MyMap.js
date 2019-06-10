//container,options
GeoPortal.MyMap = GeoPortal.Map.extend({
    options: {
        zoom: undefined,
        center: undefined,
        baseLayer: undefined, //GepPortal.BaseLayer
        layers: [],  //GepPortal.Layers,
        // interaction
        dragging: undefined,
        touchZoom: undefined,
        scrollWheelZoom: undefined,
        doubleClickZoom: undefined,
        shiftDragZoom: undefined
    },
    //container – либо DOM element, либо строка id DOM элемента”
    initialize: function(container,options) {
        M.Util.setOptions(this, options);
        this._currentBaseLayer = undefined; //GepPortal.BaseLayer

        this._wmsLayers = new GeoPortal.HashMap(); //GepPortal.Layers,
        this._wfsLayers = new GeoPortal.HashMap();   //GepPortal.Layers,
        this._controls = new GeoPortal.HashMap();
        this._layers = new GeoPortal.HashMap();

        if(typeof container == 'undefined')
            throw "Container of map is undefined";

        this._map = undefined;
        this._ready = false;
        this._mapContainer = typeof container == "string" ? $("#"+container) : $(container);

        /*baseLayers*/
        var layers = [],
            mapBaseLayer;
        if(this.options.baseLayer != undefined && this.options.baseLayer instanceof GeoPortal.BaseLayer){
            mapBaseLayer = this.options.baseLayer.className();
            this._currentBaseLayer = this.options.baseLayer;
        }
        else{
            var baseLayers = GeoPortal.baseLayers;
            if (typeof baseLayers != 'undefined'){
                if(baseLayers.schemas.length > 0){
                    mapBaseLayer = baseLayers.schemas[0].className();
                    this._currentBaseLayer = baseLayers.schemas[0];
                }
                else if(baseLayers.spaces.length > 0){
                    mapBaseLayer = baseLayers.spaces[0].className();
                    this._currentBaseLayer = baseLayers.spaces[0];
                }
            }
        }
        if(typeof mapBaseLayer != 'undefined')
            layers = [mapBaseLayer];
        /*---------------------------*/

        /*turned by default layers*/
        if(this.options.layers instanceof Array && this.options.layers.length > 0){
            var optionLayers = this.options.layers,
                layersLen = optionLayers.length,
                i, layer, id;
            for(var i=0;i<layersLen;i++){
                layer = optionLayers[i];
                if(layer instanceof GeoPortal.Layer){
                    var model = layer._model,
                        mapLayer = layer._createMapLayer(this);

                    if(GeoPortal.enums.layerServices.isWFS(model.get("info").service)){
                        mapLayer.on('click', this._wfsLayersClicked, this);
                        mapLayer.on('featureparse', this._featureParsedWfs, this);
                        this._wfsLayers.add(layer.id(),layer);
                    }
                    else{
                        this._wmsLayers.add(layer.id(),layer);
                    }
                    layers.push(mapLayer);

                }
                else{
                    layers.push(layer);
                }
                id = M.Util.stamp(layer);
                this._layers.add(id,layer);
            }
        }
        /*---------------------------*/
        var center = this.options.center,
            zoom = this.options.zoom,
            changeView = false,
            fitBounds = false;

        if(typeof center == 'undefined' ||  typeof zoom == 'undefined'){
            center = {
                lng: 88.681640625,
                lat: 55.37911044801047
            };
            zoom = 3;
        }
        if(GeoPortal.mapExtent instanceof GeoPortal.MapExtent && (typeof this.options.center == 'undefined' ||  typeof this.options.zoom == 'undefined')) {
            changeView = true;
        }
        var mapOptions = {
            center: new M.LatLng(center.lat,center.lng),
            zoom: zoom,
            layers: layers,
            attributionControl: true
        };
        if(this.options.dragging != undefined) {
            mapOptions['dragging'] = this.options.dragging;
        }
        if(this.options.touchZoom != undefined) {
            mapOptions['touchZoom'] = this.options.touchZoom;
        }
        if(this.options.scrollWheelZoom != undefined) {
            mapOptions['scrollWheelZoom'] = this.options.scrollWheelZoom;
        }
        if(this.options.doubleClickZoom != undefined) {
            mapOptions['doubleClickZoom'] = this.options.doubleClickZoom;
        }
        if(this.options.shiftDragZoom != undefined) {
            mapOptions['shiftDragZoom'] = this.options.shiftDragZoom;
        }

        // console.log(mapOptions);
        this._map = new M.Map(container, mapOptions);
        if(changeView) {
            this.fitBounds(GeoPortal.mapExtent.minLon(),GeoPortal.mapExtent.minLat(),GeoPortal.mapExtent.maxLon(),GeoPortal.mapExtent.maxLat());
            fitBounds = true;
        }

        this._map.on("zoomend",function(){
            this.fire("zoomend");
        },this);
        this._map.on("moveend",function(){
            this.fire("move");
        },this);

        this._map.on("move",function(){
            this.fire("move");
        },this);
        this._map.on("viewreset",function(data){
            if(!this._ready){
                if(!changeView){
                    this._ready = true;
                    setTimeout(M.Util.bind(function(){
                        this.fire("ready");
                    },this),20);
                }
                else if(changeView && fitBounds){
                    this._ready = true;
                    setTimeout(M.Util.bind(function(){
                        this.fire("ready");
                    },this),20);
                }
            }
            this.fire("viewreset",data);

        },this);
        this._map.on("popupclose",function(data){
            this.fire("popupclose",data);
        },this);
        this._map.on("popupopen",function(data){
            this.fire("popupopen",data);
        },this);


        this._map.on('click', this._clickEvent, this);
        this._map.on('dblclick', this._disableClickEvent, this);
        this._map.on('zoomstart', this._disableClickEvent, this);
        this._map.on('movestart', this._disableClickEvent, this);

        GeoPortal.on("change:access:token",this._changeAccessToken,this);
    }

});
