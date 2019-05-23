GeoPortal.Widget.LayerFeaturesBox = GeoPortal.Widget.LeftPanel.extend({
    /*
     firstElementId - id of  features in store
     findEisForFirstElement - true,false
     */
    _videoBox: undefined,
    _selectedFeature: undefined,
    _editFeatureElem: undefined,
	
	_createContent: function() {
		var dustObject = this.options.dustObject,
			html = "",
			layerFeatures,
			i, len, feature, displayStyle="";
		
		for(var key in dustObject) {
			layerFeatures = dustObject[key];
			html += '<div class="feature-group">';
			html += '<h4 data-layerId="'+layerFeatures.layerId+'">'+layerFeatures.name+'</h4>';
			len = layerFeatures.features.length;
			for(i=0;i<len;i++) {
				feature = layerFeatures.features[i];
				displayStyle = feature.display ? 'features-shown' : '';
				html += '<div class="feature-item '+displayStyle+'">';
				html += '<div class="feature-item-div" id="'+feature.id+'"><span class="feature-title clicked-title">'+feature.title+'</span></div>';
				displayStyle = feature.display ? '' : 'style="display:none;"';
				html += '<div class="feature-content" '+displayStyle+'>';
				html += feature.html;
				html += '</div></div>';
			}
			html += '</div>';
		}
		this._dustRender(html);
   },

    _dustRender: function(out){
        GeoPortal.Widget.LeftPanel.prototype._dustRender.call(this,out);
        var firstFeature = this._featuresStore.get(this.options.firstElementId);
        if(typeof firstFeature == 'undefined')
            return;
        if(typeof this.options.findEisForFirstElement != 'undefined' && this.options.findEisForFirstElement){
            var layerId = firstFeature.layerId(),
                layer = this._layersStore.get(layerId);

            if(typeof layer != 'undefined' && typeof layer._model.get("info").eisInfo != 'undefined' && layer._model.get("info").eisInfo.hasEis)
                this._getEis(layerId,this.options.firstElementId);
        } else {
            if(firstFeature._model.get("eisStore") != null) {
                this._showEis(firstFeature._model.get("eisStore"),this.options.firstElementId);
            } else {
				GeoPortal.on("features:store:updated", M.Util.bind(function() {
					var eis =  firstFeature._model.get("eisStore");
                    if(eis != null)
                        this._showEis(eis,this.options.firstElementId);
				},this));
            }
        }
       
    },
    
    _showEis: function(eisStore,fValue){
        var files = [], videos = [], photos = [], pages = [],
            object, container = this._leftBlock.children("#leftpanel-container").find("#"+fValue).parent("div"),
            arr = fValue.split("_"),
            fid = fValue;

        if(container == undefined || eisStore == undefined)
            return;

        if(arr.length > 1)
            fid = arr[arr.length-1];
		
		var len = eisStore.length, 
		    i, elem;
			
		for(i=0;i<len;i++) {
			elem = eisStore[i];
			object = {
                url: elem.get("url"),
                fileName: elem.get("fileName") != "" ? elem.get("fileName") : GPMessages("noName")
            };
            if(elem == undefined)
                return;

            if(elem.get("type").name == "photo") {
				var fullUrl =  object.url,
					shortUrl = object.url+'/100';
					
				if(object.url.startsWith("/")) {
					var token = GeoPortal._accessToken != null ? GeoPortal._accessToken : "";
					fullUrl = GeoPortal.basePath + fullUrl + "?token=" + token + '&'+fid+'.png';
					shortUrl = GeoPortal.basePath + shortUrl+ "?token=" + token + '&'+fid+'.png';
				} else {
					fullUrl = fullUrl + '?'+fid+'.png';
					shortUrl = shortUrl+ '?'+fid+'.png';
				}
				object.fullUrl = fullUrl;
				object.shortUrl = shortUrl;
				
                photos.push(object);
            } else if(elem.get("type").name == "page")
                pages.push(object);
            else if(elem.get("type").name == "video"){
                if(object.url.startsWith("/")) {
					object.url = GeoPortal.basePath + object.url;
					object.url = (object.url.indexOf("?") == -1) ? object.url += "?" : object.url += "&";
					var token = GeoPortal._accessToken != null ? GeoPortal._accessToken : "";
					object.url += "token=" + token;
				}
					
				var url = elem.get("url"),
                    filter = /^(http|https):\/\/(.+)$/;
                if(filter.test(url)) {
                    if(url.substr(-3) == 'flv')
                        videos.push(object);
                    else
                        files.push(object);
                }
                else
                    videos.push(object);
            }
            else {
				if(object.url.startsWith("/")) {
					object.url = GeoPortal.basePath + object.url;
					object.url = (object.url.indexOf("?") == -1) ? object.url += "?" : object.url += "&";
					var token = GeoPortal._accessToken != null ? GeoPortal._accessToken : "";
					object.url += "token=" + token;
				}
                files.push(object);
			}
		}

        if(photos.length > 0 ){
            if(container.find(".feature-eis-photos").length)
                container.find(".feature-eis-photos").remove();

            container.children(".feature-content").prepend('<div class="feature-eis-photos"/>');
            for(var key in photos){
                container.find(".feature-eis-photos").append('<a class="fancybox-thumbs" data-fancybox-group="thumb" href="'+photos[key].fullUrl+'">' +
                    '<img src="'+photos[key].shortUrl+'" height="100" alt=""/></a>');
                this._bind(container.find(".feature-eis-photos").find("img"),"load",{me:this},function(event){
                    var me = event.data.me,
                        height = $(this).get(0).height;

                    if(height > 100)
                        $(this).height(100);
                });
            }
        }
        if(files.length > 0 || videos.length > 0 || pages.length > 0){
            if(container.find(".feature-eis-files").length)
                container.find(".feature-eis-files").remove();

            container.children(".feature-content").append('<div class="feature-eis-files"/>');
            if(videos.length > 0){
                for(var key in videos){
                    container.find(".feature-eis-files").append('<div class="item video"><span class="clickedVideo" data-url="'+videos[key].url+'">'+videos[key].fileName+'</span></div>');
                }
            }
            if(pages.length > 0){
                for(var key in pages){
                    container.find(".feature-eis-files").append('<div class="item page"><a class="clickedPage" href="'+pages[key].url+'">'+pages[key].fileName+'</a></div>');
                }
            }
            if(files.length > 0){
                for(var key in files){
                    container.find(".feature-eis-files").append('<div class="item"><a href="'+files[key].url+'" target="_blank">'+files[key].fileName+'</a></div>');
                }
            }
        }
        $(".features-shown").find('.fancybox-thumbs').fancybox({
            prevEffect : 'none',
            nextEffect : 'none',
            closeBtn  : true,
            arrows    : false,
            nextClick : true,
            overlayShow: true,
            helpers : {
                thumbs : {
                    width  : 50,
                    height : 50
                }
            }
        });


        $(".clickedPage").fancybox({
            'transitionIn' : 'none',
            'transitionOut' : 'none',
            'autoScale' : false,
            'type' : 'iframe',
            'scrolling' : 'no'
        });

        this._bind(container.find('.clickedVideo'),"click",{me: this},function(event){
            var me = event.data.me,
                url = $(this).data('url');
            me._showVideoBox(url);
            return;
        });
    },

    _featureClick: function(event){

        var me = event.data.me,
            parent = $(this).parent("div"),
            id = parent.attr("id");

        if(parent.next("div").css("display") == "none"){
            me._leftBlock.children("#leftpanel-container").find(".feature-content").hide();
            me._leftBlock.children("#leftpanel-container").find(".feature-item").removeClass("features-shown");
            parent.next("div[class='feature-content']").show("fast");
            parent.parent(".feature-item").addClass("features-shown");
            var feature = me._featuresStore.get(id),
			    layerId = feature.layerId(),
                layer = me._layersStore.get(layerId);

            if(feature._model.get("eisStore") == null)
                me._getEis(layerId,id);
            else
                me._showEis(feature._model.get("eisStore"),id);
        }
        else{
            parent.next("div[class='feature-content']").hide("fast");
            parent.parent(".feature-item").removeClass("features-shown");
        }
        $(".features-shown").find('.fancybox-thumbs').fancybox({
            prevEffect : 'none',
            nextEffect : 'none',
            closeBtn  : true,
            arrows    : false,
            nextClick : true,
            overlayShow: true,
            helpers : {
                thumbs : {
                    width  : 50,
                    height : 50
                }
            }
        });
    },

    _getEis: function(layerId,pkValue){
       var arr = pkValue.split("_"),
           fid = pkValue;
        if(arr.length > 1)
            fid = arr[arr.length-1];

        apiJsonGET(GeoPortal.basePath + "/layers/eis/"+layerId+"/"+fid+"?random="+Math.random(),{},M.Util.bind(function(data){
            if(data && data.files && data.files.length){
                var feature = this._featuresStore.get(pkValue),
					eisStore = [],
					len = data.files.length,
					i = 0;
					
				for(i=0;i<len;i++) {
					eisStore.push(new GeoPortal.Model.Eis(data.files[i]));
				}
                feature._model.set("eisStore",eisStore);
                this._showEis(feature._model.get("eisStore"),pkValue);
            }
        },this));
    },

	_showVideoBox: function(file){
        if(GeoPortal.widgets.videoBox == undefined){
            GeoPortal.widgets.videoBox = new GeoPortal.Widget.DialogBox({dialogBoxId:"videoBox",width:520,top:80,left:430},".wrap");
            GeoPortal.widgets.videoBox.on("closeDialog",this._closeDialog,this);
        }
        var container = GeoPortal.widgets.videoBox.container;
        if(!container.children("#videoContainer").length)
            GeoPortal.widgets.videoBox.setContainer('<div id="videoContainer">'+ GPMessages("notFoundFlashPlayer") +'</div>');

        if (flashVersion() > 0){
            var options = {
                'modes': [
                    { type: 'flash', src: 'js/jwplayer/jwplayer.player.swf' }
                ],
                file: file,
                width: "480",
                height: "270",
                image: "images/videoView.png",
                autostart: "true"
            };
            jwplayer('videoContainer').setup(options);
        }
        GeoPortal.widgets.videoBox.show();

    },

    _closeDialog: function(){
        GeoPortal.widgets.videoBox.off("closeDialog",this._closeDialog,this);
        GeoPortal.widgets.videoBox.remove();
        GeoPortal.widgets.videoBox = null;
        delete GeoPortal.widgets.videoBox;
    },

    _close: function(){
        GeoPortal.Widget.LeftPanel.prototype._close.call(this);
    },

    isRemovedPoint: function(){
        return false;
    }

});

