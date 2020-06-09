var mySwiper = new Swiper(".stocks-slider.swiper-container", {
  loop: false,
  autoplay: {
    delay: 5000,
  },
  effect: "fade",
  fadeEffect: {
    crossFade: true,
  },
  navigation: {
    nextEl: ".stocks-slider__navs .stocks-slider__nav_next",
    prevEl: ".stocks-slider__navs .stocks-slider__nav_prev",
  },
  touchRatio: 0,
});
