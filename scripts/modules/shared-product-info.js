define(
[
	"modules/api",
    "modules/models-product",
	"modules/jquery-mozu"
], function (Api,ProductModels,$) {
	var responseFields = "productCode,properties,supplierInfo(mfgPartNumber),content(productName,productImages)"; //info we'll store for extras
	var SharedProductInfo = {
		models:	[],// will hold json needed to create full product models when it's needed (usually b/c the item is in the cart/wishlist and we need to see what all of the options were before it was configured)
		products:	[], // will hold all items used as extras or bundle components, limited info included  responseFields: "items(productCode,properties,supplierInfo(mfgPartNumber),content(productName,productImages))" - shared by productview.js, dndengine.js
		getExtraProduct:	function(productCode,callback,onerror){
			var me = this;
			console.log("SharedProductInfo.getExtraProduct");
			var product = null;
			console.log(this.products.length);
			if(this.products.length>0){
					for(var i=0;i < this.products.length;i++){
						if(this.products[i].get('productCode')===productCode){
							product = this.products[i];
							return product; // no need to copy element, reference is fine
						}
					}
			}

			// get product
			Api.get('product',{productCode:productCode,responseFields: responseFields}).then(function(res){
				var product = new ProductModels.Product(res.data);
				me.products.push(product);
				console.log(typeof callback);
				if(typeof callback === "function"){
					callback();
				}
			},function(err){
				if(typeof onerror === "function"){
					onerror();
				}
			});
			return false;
		},
		getExtras: function(str,callback,onerror){ // this gets limited information about all product codes in list
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
					},
					error: function(jqXHR, textStatus, errorThrown){
						if(typeof onerror === "function"){
							onerror();
						}
					}
				});
		},
		getProductModel: 	function(productCode,callback,onerror){ // populates this.models - full product model whereas extras are limited pieces of info
			console.log("SharedProductInfo.getProductModel");
			var me = this;
			if(this.models.length>0){
				for(var i=0;i < this.models.length;i++){
					if(this.models[i].productCode===productCode){
						var product = new ProductModels.Product(JSON.parse(JSON.stringify(this.models[i]))); // use a copy of array element
						return product;
					}
				}
			}
			// get product
			Api.get('product',productCode).then(function(res){
				console.log('SharedProductInfo.getProductModel() api request');
				me.models.push(res.data);
				if(typeof callback === "function"){
					callback();
				}
			},function(err){
				if(typeof onerror === "function"){
					onerror();
				}
			});
			return false;
		}
	};
	return(SharedProductInfo);
});