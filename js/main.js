$(document).ready(function(){
    // value increasing


    function increase(element, toValue) {

      $({numberValue: 0}).animate({numberValue: toValue}, {
      
        duration: 2000, // Продолжительность анимации, где 500 = 0,5 одной секунды, то есть 500 миллисекунд
        easing: "easeOutCubic",
        
        step: function(val) {
        
          element.html(Math.ceil(val)); // Блок, где необходимо сделать анимацию
          
        }
        
      });
    }

    increase($("#number-signs"), 1524);
    increase($("#number-photos"), 1256);
    increase($("#number-members"), 155);


    // smoot scrolling

    $("a.main-page-btn__link").click(function() {
      $("html, body").animate({
         scrollTop: $($(this).attr("href")).offset().top + "px"
      }, {
         duration: 500,
         easing: "swing"
      });
      return false;
   });

    // menu

    var menuBtn = $(".menu__btn");
    var menuTxt = $(".menu__text");
    var menuPage = $("#menu-page");
    var menuLink = $(".menu-page-blocks__link");

    menuBtn.click(function() {
      menuBtn.toggleClass('active');
      menuPage.toggleClass('active');
    })

    menuTxt.click(function() {
      menuBtn.toggleClass('active');
      menuPage.toggleClass('active');
    })

    menuLink.click(function() {
      menuBtn.toggleClass('active');
      menuPage.toggleClass('active');
    })

    // Carousel
    var history = $('.history-carousel');

    history.owlCarousel({
        items:4,
        loop:false,
        center:false,
        margin:80,
        smartSpeed: 1000,
        stagePadding: 80,
        useMouseWheel: true,
        URLhashListener:true,
        autoplayHoverPause:true,
        startPosition: 'URLHash'
    });

    // more-info carousel

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

    // more-info popup
    var photoBlocksButtons = $(".region__photo-block, .more-info__btn, .more-info__close-btn"),
        moreInfoPage = $(".more-info-page");
        photoBlocksButtons.click(function() {
          moreInfoPage.toggleClass('active');
        })




    // Characteristics-page img change

    $('.chars-view .btn').click(function () {
      $('.chars-view .btn').removeClass('active');
      $(this).toggleClass('active');
      if ($(this).attr("id") == "chars-view__top") {
        $(".chars-view__img").attr("src","img/characteristic-page/tank-top.jpg");
      }
      if ($(this).attr("id") == "chars-view__left") {
        $(".chars-view__img").attr("src","img/characteristic-page/tank-left.png");
      }
      if ($(this).attr("id") == "chars-view__right") {
        $(".chars-view__img").attr("src","img/characteristic-page/tank-right.jpg");
      }
      if ($(this).attr("id") == "chars-view__front") {
        $(".chars-view__img").attr("src","img/characteristic-page/tank-front.jpg");
      }
      if ($(this).attr("id") == "chars-view__back") {
        $(".chars-view__img").attr("src","img/characteristic-page/tank-back.jpg");
      }
    });
  });