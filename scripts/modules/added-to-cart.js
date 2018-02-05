define(
[
    "modules/jquery-mozu",
    "underscore",
    'modules/backbone-mozu',
    "hyprlive",
    "modules/api",
    'hyprlivecontext',
	"modules/dnd-token"
], function ($, _, Backbone, Hypr, Api, HyprLiveContext,DNDToken) {
	var productAttributes = Hypr.getThemeSetting('productAttributes');
    var AddedToCartOverlay = Backbone.MozuView.extend({
        templateName: 'modules/product/added-to-cart-overlay',
        additionalEvents: {
            "click #mz-added-to-cart-close": "closeView",
            "click #mz-go-to-cart": "jumpToCart"
          /*  "click #mz-go-to-checkout": "jumpToCheckOut" */
        },
        closeView: function(e) {
            if(e.target !== e.currentTarget) return;
            $('#mz-added-to-cart').fadeOut(350);
            $('#mz-added-to-cart').remove();
        },
        jumpToCart: function() {
            //window.location.href = "/cart";
        },
    /*    jumpToCheckOut: function() {
            window.location.href = "/cart";
        }, */
        render: function () {
            var me = this;
            Backbone.MozuView.prototype.render.apply(this);
        },
        afterRender: function() {
            var me = this;
            if($('#mz-added-to-cart .owl-carousel .item').length > 0){
                setTimeout(function(){
                    $('#mz-added-to-cart .owl-next, #mz-quick-view-container .owl-prev').html('');
                    $('#mz-added-to-cart .owl-carousel').owlCarousel({
                        loop:true, nav:true, responsive:{0:{items:2}, 600:{items:2}, 1000:{items:4}}
                    });
                }, 50);
            }
            $('#mz-added-to-cart, .popup').fadeIn(300); 

            /*$("#mz-added-to-cart").on('click', function(e){
                me.closeview(e);
            });*/
            $("#mz-added-to-cart:empty").remove();
            //$('#addThis-conainer').attr('data-url', window.location.origin + $('#addThis-conainer').attr('data-url'));
        },
        showPersonalizeImage: function(){
            var self = this;
            var product = this.model.get('product');
			if(product.productUsage !== 'Bundle'){
				var dndTokenJSON = null;
				for(var j =0 ; j < product.options.length; j++){
					if(product.options[j].attributeFQN === productAttributes.dndToken){
						if(product.options[j].shopperEnteredValue && product.options[j].shopperEnteredValue!==""){
							try{
								dndTokenJSON = JSON.parse(product.options[j].shopperEnteredValue);
							}
							catch(e){
								console.log(e);
							}
						}
					}
				}
				if(dndTokenJSON){
					var info = DNDToken.getTokenData(dndTokenJSON);
					if(info.type ==="mc"){
						// no action for now
					}
					else{
						product.imageUrl = info.src;
					}
				}
			}
        },
        initialize: function () {
            var me = this;
            me.showPersonalizeImage();
            this.on('render', this.afterRender);
        }
    });

    var proFunction = function(model) {
        if($("#mz-added-to-cart").length === 0) {
            $('body').append('<div id="mz-added-to-cart"></div>');
        }
        var addedToCartOverlay = new AddedToCartOverlay({
            el: $('#mz-added-to-cart'),
            model: model
        });
        addedToCartOverlay.render();
    };
    return {
        proFunction : proFunction
    };
});