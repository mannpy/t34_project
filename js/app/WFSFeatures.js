GeoPortal.Widget.WFSFeatures = GeoPortal.Widget.WMSFeatures.extend({

    _showPopUp: function(dustGroup) {
		if(this._currentData != null){
			 var title = this._currentData.feature.title(),
				 firstId = this._currentData.feature.id(),
				 fid = this._currentData.feature.feature().fid,
				 layerId = this._currentData.feature.layerId(),
                 html = "";
            if(this._featureCount > 1)
                html = '<div class="showFeatures" id="showAllFeatures">'+ GPMessages("features.moreAndFind",this._featureCount) +'</div>';
            else
                html = '<div class="showFeatures" id="showAllFeatures">'+ GPMessages("default.more") +'</div>';
			
			if(this._currentData.hasEis)
                html = '<h4>'+title+'</h4><p class="firstImage" ><img src="'+'images/ajax-loader.gif" alt=""/></p>'+html;
            else
                html = '<h4>'+title+'</h4>'+html;
			
			var layer = this._layersStore.get(layerId),
				layerMap = layer._layersForMaps.get(M.Util.stamp(this._mapObject)),
				latLng = null;
				
			if (layerMap instanceof M.Marker) {
				latLng = layerMap.latLng();
			} else if (layerMap instanceof M.LatLng) {
				latLng = layerMap;
			}
			else if(layerMap instanceof M.Path || layerMap instanceof M.FeatureGroup){
				if(layerMap._latlng != undefined)
					latLng = layerMap._latlng;
				else{
					for(var key in layerMap._layers){
						var layer = layerMap._layers[key];
						if(layer.properties.fid == fid) {
							if(layer._latlng != undefined) {
								latLng = layer._latlng; 
							} else {
								for(var key1 in layer._layers) {
									latLng = layer._layers[key1]._latlng;
								}
							}
							break;
						}
					}
				}
			}
			
			if(latLng != null) {
				var marker = new GeoPortal.Marker(latLng);
				this._mapObject.addLayer(marker);
				marker.setPopup(html);
				this.options.application.marker = marker;
				this._popUp = marker.popup();
				
				this._bind($("#showAllFeatures"),"click",{dustGroup: dustGroup, firstId: firstId},M.Util.bind(function() {
					if(this._leftpanel != null) {
						this._leftpanel.destroy();
					}
					this._leftpanel = new GeoPortal.Widget.LayerFeaturesBox($(".content"), {dustObject: dustGroup, 
																			application: this.options.application,
																			firstElementId: firstId, 
																			findEisForFirstElement:!this._loadEis});
					this.options.application.leftpanel = this._leftpanel;
																			
				},this));
			}
			 
		}
	}
    


});