define(['modules/backbone-mozu','modules/jquery-mozu', 'modules/api'], function (Backbone,$, api) {
	

	var ListView = Backbone.MozuView.extend({
        templateName: "modules/lp-redesign-3xl",
        initialize: function () {
            var me = this;
            me.getCategories();
        },
        getCategories:function(){
            var self = this; 
            var el = self.el; 
 
            $.each($('.hiddenmodel3xl'),function(index,value){
                var config = $(this).text(); 
                var codes = "";
                config = JSON.parse(config);
                console.log(config);

                codes = "categoryId eq "+config.lgcatselect+" or categoryId eq "+config.smcatselectA+" or categoryId eq "+config.smcatselectB;

	            if(config.lgcatselect!==null && config.smcatselectA!== null && config.smcatselectB !== null){
	            	api.request("GET","/api/commerce/catalog/storefront/categories?filter="+codes).then(function(response){
		                console.info("categories",response.items);
		                self.setElement($('.lp-3xl').eq(index));
		                self.model.set({"categories":response.items,"data":config});
		                self.render();
		            });
	            }
            }); 
        },
        render: function() {
            Backbone.MozuView.prototype.render.call(this);
        }
    });



	$(document).ready(function() {
    	
        var categorymodel = Backbone.MozuModel.extend({});
        
        var categoryView = new ListView({
            el: $('.lp-3xl'),
            model: new categorymodel(),
            messagesEl: $('[data-mz-message-bar]')
        });
        categoryView.render();

   });
});