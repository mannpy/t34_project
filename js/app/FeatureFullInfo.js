GeoPortal.Widget.FeatureFullInfo = GeoPortal.Widget.extend({
	
	options: {
		application: null
	},

	_featuresItems: [],
	
    _createWidget: function(){

		this._application = this.options.application;

		this._mainElement.addClass('active');

		this._bind(this._mainElement.find(".more-info__btn"),"click",{me:this},function(event){
			var me = event.data.me;
			me._close();
		
		});
		this._bind(this._mainElement.find(".more-info__close-btn"),"click",{me:this},function(event){
			var me = event.data.me;
			me._close();
		
		});
		
		
		this._fullInfoBlock = this._mainElement.find(".more-info__descr");
		this._photosBlock = this._mainElement.find(".more-info__photo");
		this._featuresBlock = this._mainElement.find(".more-info__gallery");
		
		if(this.options.region != null) {
            this._mainElement.find(".gallery__title").text(this.options.region.get("name"));
            this._mainElement.find(".gallery__subtitle").text("0 памятных знаков");
            this._regionId = this.options.region.get("id");
        } else {
            this._regionId = -1;
            this._mainElement.find(".gallery__title").text("");
            this._mainElement.find(".gallery__subtitle").text("");
        }

		
		this._clean();
		this._setFullInfo(this.options.feature);
		this._showEisFiles(this.options.feature);
		this._showFeatures();
		
	},
	
	_close: function() {
		this._mainElement.removeClass('active');
		this._clean();
		this.fire("fullinfo:close");
	},
	
	_setFullInfo: function(feature) {
		this._fullInfoBlock.find(".more-info-descr__title").html(feature.title);
		this._fullInfoBlock.find(".more-info-descr__place").html(feature.adres);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".model_modif_tanka").children(".descr-field__value").html(feature.model_modif_tanka);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".teh_sost_tanka").children(".descr-field__value").html(feature.teh_sost_tanka);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".nomer_tank").children(".descr-field__value").html(feature.nomer_tank);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".zvd_proizv_tanka").children(".descr-field__value").html(feature.zvd_proizv_tanka);
		var text = feature.ist_pam;
		if(feature.ist_ekipazh && feature.ist_ekipazh != "") {
            text = text + "<br/><br/>" + feature.ist_ekipazh;
		}
		this._fullInfoBlock.find(".descr-block__text").html(text);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".sost_dorog").children(".descr-field__value").html(feature.sost_dorog);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".sost_territ").children(".descr-field__value").html(feature.sost_territ);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".sost_obj_new").children(".descr-field__value").html(feature.sost_obj_new);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".neobh_rabot").children(".descr-field__value").html(feature.neobh_rabot);
	},
	
	_showEisFiles: function(feature) {
        this.on("eisLoaded", this._onEisFilesLoaded, this);
        if(feature.eisStoreLoaded) {
            this.fire("eisLoaded", {feature: feature});
        } else {
            apiJsonGET(GeoPortal.basePath + "/layers/eis/"+this._application.options.mainLayerId+"/"+feature.fid+"?random="+Math.random(),{},M.Util.bind(function(data){
                feature.eisStoreLoaded = true;
                if(data && data.files && data.files.length) {
                    feature.eisStore = data.files;

                }
                this.fire("eisLoaded", {feature: feature});
            },this));
		}
		
	},

    _onEisFilesLoaded: function(data) {
        this.off("eisLoaded", this._onEisFilesLoaded, this);

        var files = data.feature.eisStore;
        if (files && files.length > 0) {
            var i, len = files.length;
            for (i = 0; i < len; i++) {
                var file = files[i];
                if (file.type.name == 'photo') {
                    this._appendPhoto(file);
                } else if (file.type.name == 'page') {
                    this._appendPage(file);
                }
            }
        } else {
            var $div = $('<div class="more-info-carousel__item"/>').appendTo(this._photosBlock);
            $div.append('<img src="img/more-info/Image_11.jpg" alt="Tank" class="more-info__img"/>');
        }
		this._owlCarousel();
    },
	
	_appendPhoto: function(file){
		var url = file.url,
			fullUrl = url+'/1080/1080';
	
		if(url.startsWith("/")) {
			var token = GeoPortal._accessToken != null ? GeoPortal._accessToken : "";
			fullUrl = GeoPortal.basePath + fullUrl+ "?token=" + token;
		} 
		var $div = $('<div class="more-info-carousel__item"/>').appendTo(this._photosBlock);
		$div.append('<img src="img/region-page/ajax-loader.gif" alt="" class="ajax-loader"/>');
		
		var image = $('<img src="'+fullUrl+'" alt="Tank" class="more-info__img"/>').appendTo($div);

        this._bind(image,"load",{},function(event){
			// more-info page protrait image autosizing
			$div.children(".more-info__img").each(function(){ //you need to put this inside the window.onload-function (not document.ready), otherwise the image dimensions won't be available yet
				if ($(this).width()/$(this).height() < 1) {
					$(this).addClass('portrait');
				}
			});
			$div.children(".ajax-loader").remove();
		});

        setTimeout(M.Util.bind(function () {
            this._photosBlock.find(".ajax-loader").remove();
		},this), 500);
	
		
	},

    _appendPage: function(file){
        var url = file.url;

        var $div = $('<div class="more-info-carousel__item"/>').prependTo(this._photosBlock);
        $div.append('<iframe src="'+url+'" width="100%" height="100%"></iframe>');
    },


    _owlCarousel :function() {
		var moreInfoCars = $('.more-info-carousel');
 
		moreInfoCars.owlCarousel({
		  items:1,
		  loop:true,
		  center:true,
		  nav:true,
			autoplayHoverPause:true,
			mouseDrag: false,
			touchDrag: false,
			pullDrag: false,
		  navClass: ['owl-prev', 'owl-next'],
		  navText: ['<img src="img/more-info/slider-arrow.svg" alt="arrow" class="slider-left-arrow__img">','<img src="img/more-info/slider-arrow.svg" alt="arrow" class="slider-right-arrow__img">']
		});

		var owl = $('.owl-carousel');

		owl.on('DOMMouseScroll','.owl-stage',function(e){
		  if (e.originalEvent.detail > 0){ 
			  owl.trigger('next.owl');
			  } else {
			  owl.trigger('prev.owl');
		  }
		  e.preventDefault();
		  });
	  
		//Chrome, IE
		owl.on('mousewheel','.owl-stage',function(e){
			if (e.originalEvent.wheelDelta > 0){
				owl.trigger('next.owl');
				} else {
					owl.trigger('prev.owl');
			}
			e.preventDefault();
		});
	},
	
	_showFeatures: function() {
        if(this._regionId > -1) {
            var len = 0,
                featuresByRegionStore = this._application._featuresByRegionStore,
                featuresStore = this._application._featuresStore;

            if (this._regionId > 0) {
                var featureIds = featuresByRegionStore.get(this._regionId);

                len = featureIds ? featureIds.length : 0;
                if (len > 0) {
                    var i = 0,
                        feature;
                    for (i = 0; i < len; i++) {
                        feature = featuresStore.get(featureIds[i]);
                        if (feature) {
                        	var item = new GeoPortal.Widget.ListFeature(this._featuresBlock.find(".more-info__photos"), {
                                layerId: this._application.options.mainLayerId,
                                feature: feature,
                                aClassName: "more-info__photo-block"
                            });
                            item.on("feature:click", this._featureClick, this);
                            if(feature.fid == this.options.feature.fid) {
                                item.active(true);
                            }
                            this._featuresItems.push(item);
                        }
                    }
                }
            } else {
                len = featuresStore.getCount();
                if (len > 0) {
                    featuresStore.each(M.Util.bind(function (fid, feature) {
                        var item = new GeoPortal.Widget.ListFeature(this._featuresBlock.find(".more-info__photos"), {
                            layerId: this._application.options.mainLayerId,
                            feature: feature,
                            aClassName: "more-info__photo-block"
                        });
                        item.on("feature:click", this._featureClick, this);
                        if(feature.fid == this.options.feature.fid) {
                            item.active(true);
                        }
                        this._featuresItems.push(item);
                    }, this))
                }
            }
            var countText = len + " " + caseWord(len, "памятный знак", "памятных знака", "памятных знаков");
            this._mainElement.find(".gallery__subtitle").text(countText);
        }
	},
	
	_featureClick: function(data) {
		this._fullInfoBlockClean();		
		this._photosBlock.html('');
		
		this._setFullInfo(data.feature);
		this._showEisFiles(data.feature);

		var len = this._featuresItems.length, i=0;
		for(i=0;i<len;i++) {
            this._featuresItems[i].active(false);
        }
        data.element.active(true);
	},
	
	_clean: function(){
		this._fullInfoBlockClean();
		this._photosBlock.html('');
		
		this._featuresBlock.find(".more-info__photos").html('');
		
	},
	
	_fullInfoBlockClean: function() {
		var owl = $('.owl-carousel');
		owl.trigger('destroy.owl.carousel');
		
		this._fullInfoBlock.find(".more-info-descr__title").html("");
		this._fullInfoBlock.find(".more-info-descr__place").html("");
		this._fullInfoBlock.find(".more-info-descr__fields").find(".descr-field__value").html("");
		this._fullInfoBlock.find(".descr-block__text").html("");
	}

	
	

});