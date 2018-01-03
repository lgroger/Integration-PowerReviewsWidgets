define(
[
	"modules/api",
    "modules/models-product",
	"modules/jquery-mozu"
], function (Api,ProductModels,$) {
	var SharedProductInfo = {
		products:	[], // will hold all items used as extras or bundle components - shared by productview.js, dndengine.js
		getExtraProduct:	function(productCode,callback){
			var me = this;
			console.log("SharedProductInfo.getExtraProduct");
			var product = null;
			if(this.products.length>0){
					for(var i=0;i < this.products.length;i++){
						if(this.products[i].get('productCode')===productCode){
							product = this.products[i];
							//console.log('found it!');
							break;
						}
					}
			}
			if(product){
				return product;
			}
			else{
				// get product
				Api.get('product',{productCode:productCode}).then(function(res){
					var product = new ProductModels.Product(res.data);
					me.products.push(product);
					console.log(typeof callback);
					if(typeof callback === "function"){
						callback();
					}
				});
				return false;
			}
		},
		getExtras: function(str,callback){
			console.log("SharedProductInfo.getExtras");
			var me = this;
			$.ajax({
					url: "/getExtras",
					method:"POST",
					data: {"extras":str},
					dataType:"json",
					success:function(arr){
						for(var i=0;i<=arr.length;i++){
							var product = new ProductModels.Product(arr[i]);
							me.products.push(product);
						}
						if(typeof callback === "function"){
							callback();
						}
					}
				});
		}
	};
	return(SharedProductInfo);
});