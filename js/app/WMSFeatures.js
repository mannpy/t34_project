GeoPortal.Widget.WMSFeatures = GeoPortal.Widget.AFeatures.extend({
	options: {
		application: null
	},
	
    _createWidget: function(){
		this._featuresStore = this.options.application.featuresStore;
		this._layersStore = this.options.application.layersStore;
		this._mapObject = this.options.application.mapObject;
        this._latLng = this.options.latLng;
		this._leftpanel = this.options.application.leftpanel;
		
		
		this._dustObject = {
           featureGroups: []
        };
        this._featureCount = this._featuresStore.getCount();
        this._currentData = null;
        this._firstEisElem = undefined;
        this._popUp = undefined;
        this._loadEis = false;
		
		var i=0,
			dustGroup = new Array();
		this._featuresStore.each(function(id, feature){
			var layer = this._layersStore.get(feature.layerId()),
				dustItem;
			
            if(layer != null) {
				if(i == 0){
                    this._currentData = {
                        feature: feature,
                        layer: layer,
                        hasEis: false
                    }
                }
				if(dustGroup[layer.id()] == null) {
					dustGroup[layer.id()] = {
						name: layer.rusName(),
						layerId: layer.id(),
						features: []
					}
				}
				dustItem = {
					id: feature.id(),
					title: feature.title(),
					display: i==0,
					html: ""
				};
				dustItem.html = this._featureData(layer.fields(), feature.feature());
				dustGroup[layer.id()].features.push(dustItem);
            }
			i++;
		}, this);
	
        if(this._currentData != null){
            this._prepareLoadEisFiles(this._currentData.layer, this._currentData.feature);
        }
        this._showPopUp(dustGroup);

    },
	
	 _prepareLoadEisFiles: function(layer, feature){
        this._currentData.hasEis = true;
		this._loadEisFiles(this._featuresStore, layer.id(), feature.feature().fid, feature.id());
    },
	
	_featureData: function(fields, properties){
        var html = '',
            filter = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[\.0-9]*Z/,
            name = "",
            date, month;

        if (fields && fields.length) {
            for (var i=0,length=fields.length;i<length;i++) {
                if (fields[i] && fields[i].view && !fields[i].title && properties[fields[i].name] != null) {
                    name = properties[fields[i].name];
                    
					if(fields[i].type == "dateTime") {
						date = new Date(name);
						name = date.format("DD.MM.YYYY hh:mm:ss");
					}else if(fields[i].type == "date") {
						date = objectFromDate(name);
						if(date && !isNaN(date.getDate()))
							name = date.format("DD.MM.YYYY");
						else name = ""

					}
					html += "<p><b>" + escapeHtml(fields[i].nameRu) + ":</b> " + name + "</p>";
				}
            }
        }
        else{
            for(var key in properties){
                if(properties[key] != null){
                    if(properties[key] != "" && key != 'fid' && key != 'geom' && key != 'the_geom'){
                        name = properties[key];
						if(filter.test(name)) {
							date = new Date(name);
							name = date.format("DD.MM.YYYY hh:mm:ss");
						}
						html += "<p><b>" + escapeHtml(key) + ":</b>" + name + "</p>";
					}
                }
            }

        }

        return html;
    },

    _showPopUp: function(dustGroup){
        if(this._currentData != null){
            var title = this._currentData.feature.title(),
                firstId = this._currentData.feature.id(),
                html = "";
            if(this._featureCount > 1)
                html = '<div class="showFeatures" id="showAllFeatures">'+ GPMessages("features.moreAndFind",this._featureCount) +'</div>';
            else
                html = '<div class="showFeatures" id="showAllFeatures">'+ GPMessages("default.more") +'</div>';

            if(this._currentData.hasEis)
                html = '<h4>'+title+'</h4><p class="firstImage" ><img src="'+'images/ajax-loader.gif" alt=""/></p>'+html;
            else
                html = '<h4>'+title+'</h4>'+html;
			
			var marker = new GeoPortal.Marker(this._latLng);
			this._mapObject.addLayer(marker);
			marker.setPopup(html);
			this.options.application.marker = marker;
			this._popUp = marker.popup();

            this._bind($("#showAllFeatures"),"click",{dustGroup: dustGroup, firstId: firstId},M.Util.bind(function() {
				if(this._leftpanel != null) {
					this._leftpanel.destroy();
				}
				this._leftpanel = new GeoPortal.Widget.LayerFeaturesBox($(".content"), {dustObject: dustGroup, application: this.options.application,
																firstElementId: firstId, findEisForFirstElement:!this._loadEis});
				this.options.application.leftpanel = this._leftpanel;
			},this));
        }
    }
});

