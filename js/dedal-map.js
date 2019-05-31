var mapApplication;
$(document).ready(function(){
    // Dedal map

    $(function() {
		GeoPortal.regionsStore = new GeoPortal.HashMap();
		var i=0, len = GeoPortal.config.regions.length; 
		for(i=0;i<len;i++){
			var region = GeoPortal.config.regions[i],
				bboxArr = region.bbox.split(","),
				southWest = bboxArr[0].split(" "),
				northEast = bboxArr[1].split(" ");
			
			region.bounds = {
				southWest: {
					lng: southWest[0],
					lat: southWest[1]
				},
				northEast: {
					lng: northEast[0],
					lat: northEast[1]
				}
			};
			var model = new GeoPortal.Model.Region(region);
			GeoPortal.regionsStore.add(region.id, model);
		}
		GeoPortal.wfsDoubleSize = true;
		
		GeoPortal.on("ready",geoportalReady,this);
		
		function geoportalReady() {
			mapApplication = new Application("-932516122", GeoPortal.regionsStore.get(35), 207);
			mapApplication.initialization();
		}
      
		function Application(baseLayerId, region, turnedLayerId) {
			//var self = this;

			this.turnedLayerId = turnedLayerId;
			this.region = region;
			this.mapObject = null;
			this.turnedLayer = null;
			this.featuresStore = new GeoPortal.HashMap();
			this.featureWidgetsStore = new GeoPortal.HashMap(); 


			this.initialization = function() {
				var baseLayer = findBaseLayer(baseLayerId),
				mapReady = M.Util.bind(function() {
					var bounds = region.get("bounds");
					this.mapObject.fitBounds(new GeoPortal.LatLngBounds(
						new M.LatLng(bounds.southWest.lat,bounds.southWest.lng),
						new M.LatLng(bounds.northEast.lat,bounds.northEast.lng)
					));
				},this);
				this.mapObject = new GeoPortal.Map('map',{baseLayer: baseLayer}); 
				this.mapObject.on("ready", mapReady, this);
				
				$(".region-page__gallery").children(".gallery__title").text(this.region.get("name"));

				GeoPortal.requestLayers (
					M.Util.bind(function(layers) {
						var len = layers.length, i=0;
						for(i=0;i<len;i++) {
							if(layers[i].id() == turnedLayerId) {
								this.turnedLayer = layers[i];
								break;
							}
						} 
						if(this.turnedLayer != null) {
							changeLayerFunc(this.turnedLayer)
							this.turnedLayer.cqlFilter = encodeURIComponent("(sub_id IN ("+this.region.get("id")+"))")  
							
							this.turnedLayer.turn(this.mapObject);
							
							var bounds = region.get("bounds");
								queryString = "layersid="+this.turnedLayer.id()+"&srs=EPSG:4326&southwestlng="+bounds.southWest.lng+"&southwestlat="+bounds.southWest.lat+"&northeastlng="+bounds.northEast.lng+"&northeastlat="+bounds.northEast.lat;
							apiJsonGET(GeoPortal.basePath + "/layers/feature/bbox?"+queryString,{}, M.Util.bind(function(result){
									if(typeof result.data == 'undefined' || Object.keys(result.data).length == 0) {
										console.log("Error to request layers groups. Status = 404. Error text: Features are not found.");
										return;
									}
									var keys = Object.keys(result.data),
										layerFeatures = result.data[keys[0]],
										features = layerFeatures.features,
										i = 0, len = features.length;										
										
										
									for(i=0;i<len;i++) {
										if(features[i].sub_id == this.region.get("id")){
											var fid = features[i].fid;
											this.featuresStore.add(fid, features[i]);
											var item = new GeoPortal.Widget.ListFeature($(".region-page__gallery").find(".region__photos"), {layerId:turnedLayerId, feature:this.featuresStore.get(fid)});
											item.on("feature:click", this._featureClick, this);
											this.featureWidgetsStore.add(fid, item);
										}
									}
									var len = this.featuresStore.getCount(); 
									countText = len+" "+caseWord(len, "памятный знак", "памятных знака", "памятных знака");
									$(".region-page__gallery").children(".gallery__subtitle").text(countText);
														
								},this),
								function(status,error) {
									console.log("Error to request layers groups. Status = " + status + ". Error text: " + error);
								}
							);

						} else {
							console.log("Turned layer was not found");
						}
					},this),

					function(status,error) {
						onsole.log("Error to request layers groups. Status = " + status + ". Error text: " + error);
					}
				);
				
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
				
			};


			this._featureClick = function(data) {
				//var photoBlocksButtons = $(".region__photo-block, .more-info__btn, .more-info__close-btn")
				var moreInfoPage = $(".more-info-page"),
				map = $(".region-map");

				this._fullInfoWidger = new GeoPortal.Widget.FeatureFullInfo(moreInfoPage, {feature: data.feature, application: this});
				this._fullInfoWidger.on("fullinfo:close", this._fullInfoWidgerClose, this);
				map.css("display", map.css("display") === 'none' ? '' : 'none');
			}

			this._fullInfoWidgerClose = function() {
				this._fullInfoWidger.off("fullinfo:close", this._fullInfoWidgerClose, this);
				this._fullInfoWidger = null;

				var map = $(".region-map");
				map.css("display", map.css("display") === 'none' ? '' : 'none');

			}


		}
  
		function changeLayerFunc(layer) {
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
		}
		  
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
		
		 function caseWord(number, case1, case2, case3) {
			var base = number - Math.floor(number / 100) * 100,
				result;
			if (base > 9 && base < 20) {
				result = case3;
			} else {
				var remainder = number - Math.floor(number / 10) * 10;

				if (1 == remainder) result = case1;
				else if (0 < remainder && 5 > remainder) result = case2;
				else result = case3;
			}

			return result;
		}
    });
});