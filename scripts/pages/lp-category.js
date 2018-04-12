define(["modules/jquery-mozu", "modules/api", "underscore", "hyprlive", "modules/backbone-mozu"],function ($, Api,_, Hypr, Backbone) {

    function setscrollbar(){
        setTimeout(function(){
            if($(window).width() > 992){
                var leftnav = $('#left-nav');
                var rightcontent = $('#mz-drop-zone-lp-category-right');
                var rightcontentheight = rightcontent.height();

                if(rightcontentheight > 500){
                    leftnav.css("max-height", rightcontentheight);    
                }
            } 
        },2000);   
    }
    $(window).on("load", function(){
        setscrollbar();
    });
    $(window).resize(function(){
        setscrollbar();
    }); 
});