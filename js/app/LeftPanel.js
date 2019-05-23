GeoPortal.Widget.LeftPanel = GeoPortal.Widget.extend({
/*
 options: {
     dustObject
     application,
	 firstElementId,
	 findEisForFirstElement
 }
 */
	_MARGIN_BOTTOM: 45,
	_MARGIN_TOP: 60,
	_BORDER: 2,	
    
	_createWidget: function(){
		this._featuresStore = this.options.application.featuresStore;
		this._layersStore = this.options.application.layersStore;
		
        this._mainElement.children("#leftpanel-div").remove();
        this._closed = false;
        this._mainElement.append('<div id="leftpanel-div"/>');
        this._leftBlock = this._mainElement.children("#leftpanel-div");
        this._leftBlock.children("#leftpanel-container").css("overflow-y","auto");
        this._setHeight();
        this._leftBlock.append('<div id="leftpanel-container"/>');
        this._leftBlock.append('<div id="close-leftpanel-button"/>');
        
        this._bind(this._leftBlock.children("#close-leftpanel-button"),"click",{},M.Util.bind(this._close,this));

        this._createContent();
    },

    _createContent: function(){
        
    },

    _dustRender: function(out){
        this._leftBlock.children("#leftpanel-container").html(out);
        
        this._bind(this._leftBlock.find(".clicked-title"),"click",{me: this},this._featureClick);
    },
    _featureClick: function(event){

    },
    _close: function(){
        this._leftBlock.remove("");
        this.fire("leftPanel:destroy",{widget:this});
        this._closed = true;
    },
    isClosed: function(){
        return this._closed;
    },

    _setHeight: function(){
        var window_height = $(window).height(),
            panelHeight = window_height - this._MARGIN_BOTTOM - this._MARGIN_TOP - (2 * this._BORDER);
		
        this._leftBlock.height(panelHeight);
    },
    _onResize: function() {
        this._setHeight();
    },
    destroy: function(){
        this._close();
    },
    isRemovedPoint: function(){
        return true;
    }



});
