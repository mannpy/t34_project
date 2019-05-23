$(document).ready(function(){
    $(".owl-carousel").owlCarousel({
        items:4,
        loop:false,
        center:false,
        margin:100,
        URLhashListener:true,
        autoplayHoverPause:true,
        startPosition: 'URLHash'
    });
  });

// $(function(){

// 	GeoPortal.on("ready",function() {

//         mapObject = new GeoPortal.Map('map');
    
//         GeoPortal.findLayerById (
//             207,
//             function(layer){
//                 console.log('layer: ', layer);
//                 mapObject.addLayer(layer);
//             },
//             function(status,error){
//                 console.log(error);
//             });
//         },this);

//     });

// //lat=55.29006455319217&lon=36.617431640625&zoom=8&baselayer=-932516122&layers=207&outformat=frame"></iframe>