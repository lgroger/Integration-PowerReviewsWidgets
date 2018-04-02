define(['modules/backbone-mozu','modules/jquery-mozu', 'modules/api'], function (Backbone,$, api) {
	

	var ListView1 = Backbone.MozuView.extend({
        templateName: "modules/partyideas",
        initialize: function () {
            var me = this;
            me.getCategories();
        },
        getCategories:function(){ 
            var self = this; 
            var el = self.el; 
            console.log('before geting cat');
            $.each($('.hiddenmodelpi'),function(index,value){
                var config = $(this).text(); 
                var codes = "";
                config = JSON.parse(config);
                console.log(config);
                
                codes = "categoryId eq "+config.lgcatselectA+" or categoryId eq "+config.lgcatselectB+ " or categoryId eq "+config.smcatselectC+" or categoryId eq "+config.smcatselectD+" or categoryId eq "+config.smcatselectE+" or categoryId eq "+config.smcatselectF;
 
                if(config.lgcatselectA!==null && config.lgcatselectB!== null && config.smcatselectC !== null && config.smcatselectD !== null && config.smcatselectE !== null && config.smcatselectF !== null){
                    api.request("GET","/api/commerce/catalog/storefront/categories?filter="+codes).then(function(response){
                        console.info("categories syed",response.items);
                        self.setElement($('.lp-pi').eq(index));
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
    	console.log('Doc is now ready'); 
        var categorymodel1 = Backbone.MozuModel.extend({});
        
        var categoryView1= new ListView1({
            el: $('.lp-pi'),
            model: new categorymodel1(),
            messagesEl: $('[data-mz-message-bar]')
        });
        categoryView1.render();

   });
});