GeoPortal.Widget.AFeatures = GeoPortal.Widget.extend({
	
	_loadEisFiles: function(features, layerId, fid, featureKey){
        this._loadEis = true;
        this._firstEisElem = undefined;

        this.on("eisLoaded",this._showEisFile,this);
        apiJsonGET(GeoPortal.basePath + "/layers/eis/"+layerId+"/"+fid+"?random="+Math.random(),{},M.Util.bind(function(data){

            if(data && data.files && data.files.length){
				var feature = features.get(featureKey),
					eisStore = [],
					len = data.files.length,
					i = 0;
					
				for(i=0;i<len;i++) {
					eisStore.push(new GeoPortal.Model.Eis(data.files[i]));
				}
					
				feature._model.set("eisStore",eisStore);
				GeoPortal.fire("features:store:updated");
                var i,len = data.files.length,
                    firstPage = null,
                    firstVideo = null,
                    firstPhoto = null;
                for(i=0;i<len;i++){
                    var file = data.files[i];
                    if(file.type.name == 'page' && firstPage == undefined){
                        firstPage = {
                            type: 'page',
                            file: file
                        };
                    }
                    else  if(file.type.name == 'photo' && firstPhoto == undefined){
                        firstPhoto = {
                            type: 'photo',
                            file: file
                        };
                    }
                    else if(file.type.name == 'video' && firstVideo == undefined){
                        var url = file.url,
                            http = url.substr(0,4),
                            https = url.substr(0,5),
                            ext = url.substr(-3);
                        if(((http == "http" || https == "https") && ext == 'flv') || (http != "http" && https != "https")) {
                            firstVideo = {
                                type: 'video',
                                file: file
                            };
                        }
                    }
                }
                if(firstPage != undefined)
                    this._firstEisElem = firstPage;
                else if(firstPhoto != undefined)
                    this._firstEisElem = firstPhoto;
                else if(firstVideo != undefined)
                    this._firstEisElem = firstVideo;
            }

            if(this._firstEisElem != undefined)
                this.fire("eisLoaded");
            else{
                this.off("eisLoaded",this._showEisFile,this);
                $(".mapsurfer-popup-data").find(".firstImage").html("");
            }
        },this));
    },

    _showEisFile: function(){
		this.off("eisLoaded",this._showEisFile,this);
        if(this._popUp != undefined && this._firstEisElem != undefined) {
            var eisFile = this._firstEisElem.file,
				url = eisFile.url;
			
			if(this._firstEisElem.type == 'page'){
                $(".mapsurfer-popup-data").find(".firstImage").html('<div style="width:'+eisFile.width+'px;height:'+eisFile.height+'px">' +
                    '<iframe src="'+url+'" width="'+eisFile.width+'" height="'+eisFile.height+'">' +
                    '</iframe></div>');

                this._popUp.options.maxWidth = eisFile.width+80;
                this._popUp.update();
            }
            else if(this._firstEisElem.type == 'video'){
                $(".mapsurfer-popup-data").find(".firstImage").html('<div id="videoPopUpContainer">Для отображения видео вам необходимо установить flash player</div>');
                if (flashVersion() > 0){
					if(url.startsWith("/")) {
						url = GeoPortal.basePath + url;
						url = (url.indexOf("?") == -1) ? url += "?" : url += "&";
						var token = GeoPortal._accessToken != null ? GeoPortal._accessToken : "";
						url += "token=" + token;
					}
					
                    var options = {
                        'modes': [
                            { type: 'flash', src: 'jwplayer/jwplayer.player.swf' }
                        ],
                        file: url,
                        width: "480",
                        height: "270",
                        image: "images/videoView.png",
                        autostart: "true"
                    };
                    jwplayer('videoPopUpContainer').setup(options);
                    this._popUp.options.maxWidth = 550;
                }
                this._popUp.update();
            }
            else if(this._firstEisElem.type == 'photo'){
				var fullUrl =  url,
					shortUrl = url+'/150';
					
				if(url.startsWith("/")) {
					var token = GeoPortal._accessToken != null ? GeoPortal._accessToken : "";
					fullUrl = GeoPortal.basePath + fullUrl + "?token=" + token + '&1.png';
					shortUrl = GeoPortal.basePath + shortUrl+ "?token=" + token;
				} else {
					fullUrl =  fullUrl + '?1.png';
				}
				
				
                var a = $('<a class="fancybox-thumbs" data-fancybox-group="thumb" href="' + fullUrl +'"/>'),
                    image = $('<img src="'+shortUrl+'" alt=""/>').appendTo(a);
                a.fancybox({
                    prevEffect : 'none',
                    nextEffect : 'none',
                    closeBtn  : true,
                    arrows    : false,
                    nextClick : false,
                    overlayShow: true
                });
                this._bind(image,"load",{me:this},function(event){
                    var me = event.data.me,
                        height = $(this).get(0).height,
                        width = $(this).get(0).width;
                    var firstImage =  $(".mapsurfer-popup-data").find(".firstImage");
                    firstImage.html('');
                    firstImage.append(a);
                    if(height > 150)
                        $(this).height(150);
                    if(width > 250){
                        me._popUp.options.maxWidth = width + 50;
                    }
                    me._popUp.update();
                });
            }
            else
                $(".mapsurfer-popup-data").find(".firstImage").html('');
        }
    }


});