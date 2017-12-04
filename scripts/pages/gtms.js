/*
 * Echidna Inc. 
 * Author : Syed Khadeer
 */

var dataLayer = window.dataLayer = window.dataLayer || [];
var ShindigzGTM = {
    pagesArray : ['web_page','category', 'search', 'cart', 'checkout', 'confirmation'],
    dataLayer:"",
    pageContext: "",
    jQuery: "",
    
    getPreloadJSON: function(context) {
         var f = document.getElementById("data-mz-preload-"+context);
         var o = f && (f.textContent || f.innerText || f.text || f.innerHTML), n = o && JSON.parse(o);
          return n || "";
    },
    
    registerEvents: function(){
        var self = this;
        self.pageContext = self.getPreloadJSON('pagecontext');
        self.jQuery = require('jquery');
        self.LoadGTM();
    },
    
    LoadGTM: function(){
        var self = this;
        self.dataLayer = Object.assign(self.generalDataLayers(), self.checkPage());
        dataLayer.push(self.dataLayer);
        this.jQuery('body').append(this.buildGTMtag());
    },
    
    checkPage: function(){
        var self = this;
        var returnVal, price; 
        console.log('self context', self.pageContext);
        if(self.pageContext.pageType === 'product'){ 
//            if(self.getPreloadJSON('product').price.price !== 'undefined'){
//                price = self.getPreloadJSON('product').price.price;
//            }else{
//                price = self.getPreloadJSON('product').priceRange.lower.price + "-" + self.getPreloadJSON('product').priceRange.upper.price;
//            }
        }
        switch(self.pageContext.pageType) {
            case 'category':
                returnVal = Object.assign({},{
                    'PageType': 'ListingPage',
                    'ProductIDList': self.buildListingProducts()
                    });
                 break;
            case 'product':
                returnVal = Object.assign({},{
                    'PageType': 'ProductPage',
                    'ProductID': self.getPreloadJSON('product').productCode || ''
//                    'Price' :price 
                    }); 
                break;
            case 'cart': 
                returnVal = Object.assign({},{
                    'PageType': 'BasketPage',
                    'ProductBasketProducts': self.buildBasketProducts()
                    });
                break;
            case "confirmation":
                if(self.getPreloadJSON('order').status === "Errored") return {};
                returnVal = Object.assign({},{
                    'PageType': 'TransactionPage',
                    'transactionId': self.getPreloadJSON('order').orderNumber || '',
                    'ProductTransactionProducts': self.getOrderedProducts(),
                    'transactionTotal': self.getPreloadJSON('order').total,
                    'transactionTax': self.getPreloadJSON('order').taxTotal,
                    'transactionShipping': self.getPreloadJSON('order').shippingTotal,
                    'transactionProducts': self.buildTransProducts() 
                    });
                break;
            default: 
                returnVal = {};
                
        }
        return returnVal;
    },
    
    getOrderedProducts : function() {
        var self = this;
        var orderItems = self.getPreloadJSON('order').items;
        var product_list = [];
        for( var k=0; k < orderItems.length; k++ ) {
            product_list.push({
                id: orderItems[k].product.variationProductCode || orderItems[k].product.productCode, 
                price: orderItems[k].product.price.price, 
                quantity: orderItems[k].quantity  
            });
        }
        return product_list;
    },
    
    buildTransProducts: function() {
        var self = this;
        var orderItems = self.getPreloadJSON('order').items;
        var trans_product_list = [];
        for( var p=0; p<orderItems.length; p++ ) {
            trans_product_list.push({ 
                sku: orderItems[p].product.variationProductCode || orderItems[p].product.productCode, 
                name: orderItems[p].product.name, category: '', 
                price: orderItems[p].product.price.price, 
                quantity: orderItems[p].quantity  });
        }
        return trans_product_list;
    },
     
    buildBasketProducts: function() {
        var self = this;
        var cartItems = self.getPreloadJSON('cart').items;
        console.log('Cart items.', cartItems);
        var product_list = [];
        for( var j=0; j<cartItems.length; j++ ) {
            product_list.push({ id: cartItems[j].product.variationProductCode || cartItems[j].product.productCode, price: cartItems[j].product.price.price, quantity: cartItems[j].quantity  });
        }
        console.log(product_list);
        return product_list;
    },
    
    buildListingProducts: function() {
        var self = this;
        var listItems = self.jQuery('.mz-productlist-item');
        
        var productArray = [];
        for(var i=0; i<listItems.length; i++) {
            productArray.push(self.jQuery(listItems[i]).data('mz-product'));
        }
        return productArray;
    },
    
    generalDataLayers: function() {
        var pageContext = this.getPreloadJSON('pagecontext');
        return {
            'email' : pageContext.user.email,
            'firstName' : pageContext.user.firstName,
            'lastName' : pageContext.user.lastName,
            'isAnonymous': pageContext.user.isAnonymous,
            'customerId': pageContext.user.userId,
            'kiboPageType': pageContext.pageType,
            'accountId': (pageContext.user.isAuthenticated) ? pageContext.user.accountId : ''
        };
    },
    
    buildGTMtag: function(){
        return "<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':"+
        "new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],"+
        "j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src="+
        "'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);"+
        "})(window,document,'script','dataLayer','GTM-MJPM95J');</script>";
    }
};

ShindigzGTM.registerEvents(); 