require(["modules/jquery-mozu","hyprlive","modules/backbone-mozu","modules/api"],function(e){e(document).ready(function(){e("[homepagecaraousel]").find("img").length>1&&e("[homepagecaraousel]").owlCarousel({center:!0,loop:!0,nav:!0,dots:!0,autoplay:!1,animateIn:"fadeIn",animateOut:"fadeOut",items:1,lazyLoad:!0})})});