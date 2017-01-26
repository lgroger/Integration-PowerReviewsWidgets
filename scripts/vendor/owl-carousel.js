require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
      

    $(document).ready(function() {
        if($('[homepagecaraousel]').find("img").length > 1){
            $('[homepagecaraousel]').owlCarousel({
                center:true,
                loop:true,
                nav:true,
                dots: true,
                autoplay:false, 
                animateIn: 'fadeIn',
                animateOut: 'fadeOut',
                items:1,
                lazyLoad:true
            });    
        }
    });

});








