require(["modules/jquery-mozu","hyprlive","modules/backbone-mozu","modules/api"],function(e){e(document).ready(function(){try{if(e("[homepagecaraousel]").find("img").length>1){var o=e("[homepagecaraousel]");o.owlCarousel({loop:!0,nav:!0,dots:!0,autoplay:!1,animateIn:"fadeIn",animateOut:"fadeOut",items:1})}}catch(a){console.log(a)}})});