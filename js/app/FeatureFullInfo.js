GeoPortal.Widget.FeatureFullInfo = GeoPortal.Widget.extend({
	
	options: {
		application: null
	},
	
    _createWidget: function(){

		this._feature = this.options.feature;
		this._application = this.options.application;
		
		this._createOwlCarousel = false;
		
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
		
		this._photosBlock.css("background-color","#1e1e24");
		
		this._clean();
		this._setFullInfo(this.options.feature);
		this._showPhotos(this.options.feature);
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
		this._fullInfoBlock.find(".descr-block__text").html(feature.ist_pam);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".sost_dorog").children(".descr-field__value").html(feature.sost_dorog);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".sost_territ").children(".descr-field__value").html(feature.sost_territ);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".sost_obj_new").children(".descr-field__value").html(feature.sost_obj_new);
		this._fullInfoBlock.find(".more-info-descr__fields").children(".neobh_rabot").children(".descr-field__value").html(feature.neobh_rabot);
	},
	
	_showPhotos: function(feature) {
		var files = feature.eisStore;
		if(files && files.length > 0) {
			var i,len = files.length;
			for(i=0;i<len;i++){
				var file = files[i];
				if(file.type.name == 'photo'){
					this._appendPhoto(file);
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
					
		this._bind(image,"load",{me: this},function(event){
			var me = event.data.me;
			$div.children(".ajax-loader").remove();
		});
		
	},
	
	_owlCarousel :function() {
		var moreInfoCars = $('.more-info-carousel');
 
		moreInfoCars.owlCarousel({
		  items:1,
		  loop:true,
		  center:true,
		  nav:true,
		  autoplayHoverPause:true,
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
		var featuresStore = this._application.featuresStore;
		featuresStore.each(M.Util.bind(function(key, feature){
			var fid = feature.fid;
			var item = new GeoPortal.Widget.ListFeatureInfo(this._featuresBlock.find(".more-info__photos"), {layerId:this._application.turnedLayerId, feature:feature});
			item.on("feature:click", this._featureClick, this);
			
			
		},this));
	},
	
	_featureClick: function(data) {
		this._fullInfoBlockClean();		
		this._photosBlock.html('');
		
		this._setFullInfo(data.feature);
		this._showPhotos(data.feature);
		
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