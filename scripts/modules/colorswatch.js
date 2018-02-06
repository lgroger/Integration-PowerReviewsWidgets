define(['modules/jquery-mozu', 'modules/api', 'underscore'], function($, Api,_) {
	var ColorSwatch = {
	    init: function(){
	    	var self = this;
	    	self.startIndex = 0;
	    	self.pageSize=12;
	        self.container = $('.color-swatch'); //Color Swatch container for each product
	        self.colorswacthproductcodelist=[]; // Init array for carry for cross sell products list
	        window.addEventListener('scroll',function() {
	            /*var lazyLoadIndex = (self.startIndex+self.pageSize)-8;
	            if(lazyLoadIndex<=60){
	                var ele =  self.container.eq(lazyLoadIndex).closest('.mz-productlist-item');
	                if(ele.length>0){
	                	if($(window).scrollTop() > ele.position().top){
	                       self.startIndex=self.startIndex+self.pageSize;
	                	   self.lazLoadColorSwatch();
	                    }
	                }
	            }*/
	            self.lazLoadColorSwatch();
	            //self.lazyLoadImage();
	        });
	        self.lazLoadColorSwatch();
	        self.lazyLoadImage();
	    },
	    lazyLoadImage: function(){
			/**Lazy load - it will replace img src with data-src attributes **/
	        $('img[data-src]').each(function(index,el){
	                    // Getting jquery window seector
	                    var win = $(window);
	                    // Storing top and left scroll position of window
	                    var viewport = {
	                        top : win.scrollTop(),
	                        left : win.scrollLeft()
	                    };
	                    // Getting the right and bottom position of the view port
	                    viewport.right = viewport.left + win.width();
	                    viewport.bottom = viewport.top + win.height();
	                    // Geting element boundary informations
	                    var bounds = $(el).offset();
	                    // calculating the bottom and right position of the element
	                    bounds.right = bounds.left + $(el).outerWidth();
	                    bounds.bottom = bounds.top + $(el).outerHeight();
	                    // checking if any part of the element is not out side the view
	                    // Check 1 : element left edge is above view port right edge
	                    // Check 2 : element right edge is below view port left edge 
	                    // Check 3 : element top edge is above view port bottom
	                    // Check 4 : element bottom edget is view port bottom 
	                    var isVisible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

	                    if(isVisible){
	                        // If image is updated with src attribute, donot process again
	                        if(!$(el).attr('src')){
	                                $(el).attr('src',$(el).attr('data-src'));
	                        }   
	                    }
	        });

	    },
	    lazLoadColorSwatch:function(){
	    	var self = this;
	        if(self.container.length>0 && self.startIndex < self.container.length){
	            this.loadSwatchData(self.startIndex,self.pageSize);
	        }
	    },
	    loadSwatchData:function(startindex, pagesize){
	        var self=this, productCodesArr = [];
	        self.colorswacthproductcodelist=[];
	        self.container.closest('.mz-productlisting').each(function(i, el){
	        	    var win = $(window);
	                    // Storing top and left scroll position of window
	                    var viewport = {
	                        top : win.scrollTop(),
	                        left : win.scrollLeft()
	                    };
	                    // Getting the right and bottom position of the view port
	                    viewport.right = viewport.left + win.width();
	                    viewport.bottom = viewport.top + win.height();
	                    // Geting element boundary informations
	                    var bounds = $(el).offset();
	                    // calculating the bottom and right position of the element
	                    bounds.right = bounds.left + $(el).outerWidth();
	                    bounds.bottom = bounds.top + $(el).outerHeight();
	                    // checking if any part of the element is not out side the view
	                    // Check 1 : element left edge is above view port right edge
	                    // Check 2 : element right edge is below view port left edge 
	                    // Check 3 : element top edge is above view port bottom
	                    // Check 4 : element bottom edget is view port bottom 
	                    var isVisible = (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

	                    if(isVisible){
					            if($(el).find('.colorswacthproductcodelist').length>0){
						              	var productCodesStr = $(el).find('.colorswacthproductcodelist').html().trim();
						            if(productCodesStr && $(el).find('.colorswacthproductcodelist').attr('colorshow')===undefined){
						              	$(el).find('.colorswacthproductcodelist').attr('colorshow',1);
						                var productArr = _.without(productCodesStr.split(','),"");
						                productCodesArr.push.apply(productCodesArr,productArr.slice(0,6)); 
						            }
					            }
					    }
	        	 
	        });
	        /*for(var i=startindex;i<(startindex+pagesize);i++){
	            //if(i>0){
	            var productCodesStr;
	            //}
	            if(self.container.eq(i).find('.colorswacthproductcodelist').length>0){
	              self.colorswacthproductcodelist.push(self.container.eq(i).find('.colorswacthproductcodelist'));
	              var productCodesStr = $('.color-swatch').eq(i).find('.colorswacthproductcodelist').html().trim();
	              if(productCodesStr && self.container.eq(i).find('.colorswacthproductcodelist').attr('colorshow')===undefined){
	                var productArr = _.without(productCodesStr.split(','),"");
	                productCodesArr.push.apply(productCodesArr,productArr.slice(0,5)); 
	              }
	            }
	        //}*/
	        var productCodes = _.uniq(productCodesArr);
	       // console.log(productCodes);
	        if(productCodes.length>0){
	            var filter = '';
	            for(var p=0;p<productCodes.length;p++){
	                
	                if(p>0){
	                        filter+=' or '; 
	                }
	                filter+='productCode eq '+productCodes[p];
	            }
	            Api.get('products',{filter:filter, pageSize:200, responseFields:"items(productCode,content,properties)"}).then(function(res){
	                 var items = res.data.items;
	                self.rendercolorswatchImage(items);
	                /*if(self.colorswacthproductcodelist.length>0){
	                    for(var inc = 0; inc < self.colorswacthproductcodelist.length; inc++){
	                        productCodesStr=$(self.colorswacthproductcodelist[inc]).html().trim();
	                        if(productCodesStr){
	                        	$(self.colorswacthproductcodelist[inc]).attr('colorshow',1);
	                            var productArr = _.without(productCodesStr.split(','),"");
	                            self.displayColorSwatch($(self.colorswacthproductcodelist[inc]), self.getMatchProduct(productArr.slice(0,5),items),productArr.length);
	                        }
	                    }
	                }*/ 

	            });
	        }
	    },
	    getMatchProduct : function(productcodes, items){
	        var productList = productcodes;
	        var productArr = [];
	        for(var i=0;i<productList.length;i++){
	            for(var j=0;j<items.length;j++){
	                if(items[j].productCode===productList[i]){
	                    productArr.push(items[j]);
	                    break;
	                }
	            }
	        }
	        return productArr;
	    },
	    rendercolorswatchImage : function(items){
	    	var el = null,swatchobj,colorhidecount;
	    	for(var i = 0; i < items.length; i++){
	    		if(items[i].content.productImages.length>0){
	    			el = $('[data-color-prdcode="'+items[i].productCode+'"]');
	    			$(el).closest('a').attr('href', "/p/"+items[i].productCode); 
	    			$(el).closest('a').attr('data-pro-id', items[i].productCode); 
	    			$(el).attr('src',items[i].content.productImages[0].imageUrl+'?max=12');
	    			$(el).closest('li').show();
	    			swatchobj = $(el).closest('ul+span.total-color');
	    			if(swatchobj && swatchobj.length>0){
	    				colorhidecount = parseInt(swatchobj.text(),10)-($(el).closest('ul').find('li:not(:visible)').length);
	    				swatchobj.text(colorhidecount);
	    			}
	    		}
	    	}
	    },
	    displayColorSwatch:function(obj, products, total){
	        var displaytype = obj.attr('displaytype');
	        var htmlcontent = '';
	        if(displaytype=='image' || displaytype=='color'){ 
	            htmlcontent='<ul>';
	            var active = "";
	            for(var i =0;i<products.length; i++){
	                active = "";
	                if(i===0){
	                    active='class="active"';
	                }
	                htmlcontent+='<li '+active+'>'+
	                        '<a class="swatch-color" href="/p/'+products[i].productCode+'"  data-pro-id="'+products[i].productCode+'">';
	                        if(products[i].content.productImages.length>0){
	                        	htmlcontent+='<img src="'+products[i].content.productImages[0].imageUrl+'?max=12" height="12px"/>';
	                    	}
	                    htmlcontent+='</a>'+
	                    '</li>';
	            }        

	            htmlcontent+='</ul>';
	            if(total>6){
	            	htmlcontent+='<span class="total-color">'+total+' Colors</span>';
	        	}
	            obj.next().html(htmlcontent);
	            //obj.show();
	        }else{
	            
	        }
	    }

	};
	$(document).ready(function() {
		//ColorSwatch.init();
	});
	return {ColorSwatch:ColorSwatch};
});