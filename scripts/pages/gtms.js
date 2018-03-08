/*
 * Echidna Inc. 
 * Author : Syed Khadeer
 */

define(["modules/jquery-mozu"],
function ($) {

var dataLayer = window.dataLayer = window.dataLayer || [];
var ShindigzGTM = {
    pagesArray : ['web_page','category', 'search', 'cart', 'checkout', 'confirmation'],
    dataLayer:"",
    pageContext: "",
//    Hypr: require('hyprlive'),
    
    getPreloadJSON: function(context) {
         var f = document.getElementById("data-mz-preload-"+context);
         var o = f && (f.textContent || f.innerText || f.text || f.innerHTML), n = o && JSON.parse(o);
          return n || "";
    },
    
    registerEvents: function(){
        var self = this;
        self.pageContext = self.getPreloadJSON('pagecontext');
        self.LoadGTM();
    }, 
    
    LoadGTM: function(){
        var self = this;
        self.dataLayer = Object.assign(self.generalDataLayers(), self.checkPage());
        dataLayer.push(self.dataLayer);
        $('body').append(this.buildGTMtag());
       
    },
    
//    getCriteoContent: function(){
//        var self = this;
//        if(self.pageContext.crawlerInfo.canonicalUrl === "/homepage" || self.pageContext.cmsContext.template.path === "main-page" || self.pageContext.pageType === "product" || self.pageContext.pageType === "cart" || self.pageContext.pageType === "confirmation"){
//        
//        }
//    },
//    
    checkPage: function(){
        var self = this;
        var returnVal, price; 
        if(self.pageContext.pageType === 'product'){ 
//            if(self.getPreloadJSON('product').price.price !== 'undefined'){
//                price = self.getPreloadJSON('product').price.price;
//            }else{
//                price = self.getPreloadJSON('product').priceRange.lower.price + "-" + self.getPreloadJSON('product').priceRange.upper.price;
//            }
        }
        var deviceType = /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) ? "m" : "d";
        switch(self.pageContext.pageType) {
            case 'category':
                returnVal = Object.assign({},{
                    'PageType': 'ListingPage',
                    'ProductIDList': self.buildListingProducts(),
                    'criteo_q': self.getCriteoData()
                    });
                 break;
            case 'product':
                returnVal = Object.assign({},{
                    'PageType': 'ProductPage',
                    'ProductID': self.getPreloadJSON('product').productCode || '',
                    'criteo_q': self.getCriteoData()
//                    'Price' :price 
                    }); 
                break;
            case 'cart': 
                returnVal = Object.assign({},{
                    'PageType': 'BasketPage',
                    'ProductBasketProducts': self.buildBasketProducts(),
                    'criteo_q': self.getCriteoData()
                    });
                break;
            case "confirmation":
                if(self.getPreloadJSON('order').status === "Errored") return {};
                returnVal = Object.assign({},{
                    'PageType': 'Confirmation',
                    'transactionId': self.getPreloadJSON('order').orderNumber || '',
                    'ProductTransactionProducts': self.getOrderedProducts(),
                    'transactionTotal': self.getPreloadJSON('order').total,
                    'transactionTax': self.getPreloadJSON('order').taxTotal,
                    'transactionShipping': self.getPreloadJSON('order').shippingTotal,
                    'transactionProducts': self.buildTransProducts(),
                    "surveyType":  'pos',
                    "deviceType": deviceType,
                    'OrderTotalValue': self.getPreloadJSON('order').total,
                    'OrderId': self.getPreloadJSON('order').orderNumber || '',
                    'OrderDiscount': self.getPreloadJSON('order').discountTotal,
                    'DiscountedOrderTotal': self.getPreloadJSON('order').discountedTotal,
                    //Commission Junction specific starts
                    'CJ CID': '473140',//cid
                    'CJ Items': self.getStringofProducts(),
                    'CJ TYPE': (self.pageContext.user.isAnonymous)? 366140 : 302015,  // {{themeSettings.aidAnonymous}}: {{themeSettings.aidExist}}
                    'CJ containerTagId': (self.pageContext.user.isAnonymous)? 15734 : 15733, // self.Hypr.getThemeSetting('containerTagIdAnonymous'): self.Hypr.getThemeSetting('containerTagIdLoggedIn')
                    //Commission Junction specific ends
                    'criteo_q': self.getCriteoData()
                    
                });
            break;
            default: 
                returnVal = {};
                
        }
        return returnVal;
    },
    
    getCriteoData: function(){
        var self = this;
        var deviceType = self.pageContext.isDesktop? 'Desktop': 'Mobile';
        var returnVal = [];
        if(self.pageContext.crawlerInfo.canonicalUrl === "/homepage" || self.pageContext.cmsContext.template.path === "main-page" || self.pageContext.pageType === "product" || self.pageContext.pageType === "cart" || self.pageContext.pageType === "confirmation"  ){
            if(self.pageContext.crawlerInfo.canonicalUrl == "/homepage" || self.pageContext.cmsContext.template.path == "main-page" ){
                returnVal = [{
                    'event': 'setAccount', 
                    'account': 17770
                }, {
                    'event': 'setSiteType',
                    'type': deviceType
                }, {
                    'event': "setEmail", 
                    'email': (self.pageContext.user.email)? [self.pageContext.user.email]: ""
                }, { 
                    event: "viewHome"
                }]; 
            }else if(self.pageContext.pageType === "product"){
                 returnVal = [{
                    'event': 'setAccount', 
                    'account': 17770
                }, {
                    'event': 'setSiteType',
                    'type': deviceType
                }, {
                    'event': "setEmail", 
                    'email': (self.pageContext.user.email)? [self.pageContext.user.email]: ""
                }, { 
                    event: "viewHome",
                    item: self.getPreloadJSON('product').productCode
                }
                ]; 
            } else if(self.pageContext.pageType == "cart"){
                returnVal = [{
                    'event': 'setAccount', 
                    'account': 17770
                }, {
                    'event': 'setSiteType',
                    'type': deviceType
                }, {
                    'event': "setEmail", 
                    'email': (self.pageContext.user.email)? [self.pageContext.user.email]: ""
                }, { 
                    event: "viewBasket",
                    item: self.getOrderedProducts()
                }
                ]; 
                
            }else if(self.pageContext.pageType == "confirmation" ){
                returnVal = [{
                    'event': 'setAccount', 
                    'account': 17770
                }, {
                    'event': 'setSiteType',
                    'type': deviceType
                }, {
                    'event': "setEmail", 
                    'email': (self.pageContext.user.email)? [self.pageContext.user.email]: ""
                }, { 
                    event: "trackTransaction",
                    id: self.getPreloadJSON('order').orderNumber,
                    item: self.getOrderedProducts()
                }
                ]; 
            }
        }
        return returnVal;
        
    },
    
    getOrderedProducts : function() {
        var self = this;
        var orderItems = self.getPreloadJSON('order').items;
        if(!orderItems || orderItems === ""){
            return ; 
        }
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
    // Below function specifically written for Commission junction
    getStringofProducts: function(){
        var self = this;
        var orderItems = self.getPreloadJSON('order').items;
        if(!orderItems || orderItems === ""){
            return ; 
        }
        var product_list = '';
        for( var k=0; k < orderItems.length; k++ ) {
            product_list += "&ITEM"+k+"="+orderItems[k].product.productCode;
            product_list += "&AMT"+k+"="+orderItems[k].product.price.price;
            product_list += "&QTY"+k+"="+orderItems[k].quantity;
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
        //console.log('Cart items.', cartItems);
        var product_list = [];
        for( var j=0; j<cartItems.length; j++ ) {
            product_list.push({ id: cartItems[j].product.variationProductCode || cartItems[j].product.productCode, price: cartItems[j].product.price.price, quantity: cartItems[j].quantity  });
        }
        //console.log(product_list);
        return product_list;
    },
    
    buildListingProducts: function() {
        var self = this;
        var listItems = $('.mz-productlist-item');
        
        var productArray = [];
        for(var i=0; i<listItems.length; i++) {
            productArray.push($(listItems[i]).data('mz-product'));
        }
        return productArray;
    },
    
    generalDataLayers: function() {
        var pageContext = this.getPreloadJSON('pagecontext');
        var deviceType = pageContext.isDesktop ? "d" : "m";
        var siteType = pageContext.isDesktop ? "Desktop" : "Mobile";
//        var Hypr = require('hyprlive');
//        var hyper = require('hypr');
        return {
            'email' : pageContext.user.email,
            'firstName' : pageContext.user.firstName,
            'lastName' : pageContext.user.lastName,
            'isAnonymous': pageContext.user.isAnonymous,
            'customerId': pageContext.user.userId,
            'kiboPageType': pageContext.pageType,
            'deviceType': deviceType,
            'siteType' : siteType,
            'pageType': pageContext.crawlerInfo.canonicalUrl,
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

//setTimeout(function () {
    ShindigzGTM.registerEvents(); 
//}, 1000);

	return ShindigzGTM;
	
});