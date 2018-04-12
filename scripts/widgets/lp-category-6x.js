define(['modules/backbone-mozu','modules/jquery-mozu', 'modules/api'], function (Backbone,$, api) {
	

	var ListView1 = Backbone.MozuView.extend({
        templateName: "modules/lp-redesign-6x",
        initialize: function () {
            var me = this;
            me.getCategories();
        },
        getCategories:function(){
            var self = this; 
            var el = self.el; 

            $.each($('.hiddenmodel6x'),function(index,value){
                var config = $(this).text(); 
                var codes = "";
                config = JSON.parse(config);
                console.log(config);

                
                codes = "categoryId eq "+config.lgcatselectA+" or categoryId eq "+config.smcatselectB+" or categoryId eq "+config.smcatselectC+" or categoryId eq "+config.smcatselectD+" or categoryId eq "+config.smcatselectE+" or categoryId eq "+config.lgcatselectF;

                if(config.lgcatselectA!==null && config.smcatselectB!== null && config.smcatselectC !== null && config.smcatselectD !== null && config.smcatselectE !== null && config.lgcatselectF !== null){
                    api.request("GET","/api/commerce/catalog/storefront/categories?filter="+codes).then(function(response){
                        console.info("categories",response.items);
                        self.setElement($('.lp-6x').eq(index));
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
    	
        var categorymodel1 = Backbone.MozuModel.extend({});
        
        var categoryView1= new ListView1({
            el: $('.lp-6x'),
            model: new categorymodel1(),
            messagesEl: $('[data-mz-message-bar]')
        });
        categoryView1.render();

   });
});