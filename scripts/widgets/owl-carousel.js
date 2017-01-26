require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
     

    $(document).ready(function() {
        try{
        // console.log($('[homepagecaraousel]'));
          if($('[homepagecaraousel]').find("img").length > 1){
            var owl = $('[homepagecaraousel]');
            owl.owlCarousel({
                loop:true,
                nav:true,
                dots: true,
                autoplay: false, 
                animateIn: 'fadeIn',
                animateOut: 'fadeOut',
                items:1
                });   
            }
        }catch(e){
            console.log(e);
        }
    });

});








