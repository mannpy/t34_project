$(document).ready(function(){
    // value increasing
    increase($("#number-signs"), 87, 1000);
    increase($("#number-photos"), 251, 1000);
    increase($("#number-members"), 34, 1000);


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
    });

    menuTxt.click(function() {
      menuBtn.toggleClass('active');
      menuPage.toggleClass('active');
    });

    menuLink.click(function() {
      menuBtn.toggleClass('active');
      menuPage.toggleClass('active');
    });

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

    /*-------------------MAP---------------------------*/
    // ALL SCRIPTS IN dedal-map.js
    /*-------------------------------------------------*/


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