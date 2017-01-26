define([
    'modules/jquery-mozu',
    'modules/backbone-mozu',
    'modules/models-cart'  
  ],
function($, Backbone, CartModels) {
  // declare a MozuView that can rewrite its contents with a Hypr template
  // var cartUpdate = this.model.apiGet();
  function setLoginForCheckout(){
          console.log("setLoginForCheckout function called..");
          $('a#login').trigger('click'); 
          $('#cboxOverlay').show().css('height',$(document).height());
          $('.mz-cms-col-12-12.login-popover-title').hide();
          $('.mz-cms-col-12-12.login-popover-title-chkout').show();
          $('div.default-hide').show();
          $('div.popover-wrap').addClass('chkout-popover-wrap');
          $('.sign_up_link_container').hide();
          $('.popover-content .checkout-login-wrap .mz-l-slidebox-outer').addClass('mz-cms-col-6-12');
          $('.mz-popover-action.mz-cms-col-12-12.chkout-login-action').show();
          $('div.mz-popover-action.mz-cms-col-12-12.checkout-hide').hide(); 
          $('.default-hide').show();
          $('#mz-added-to-cart').hide();
          $('.checkoutflag').val("1");
          window.checkoutflag = 1;
          $('.chkout-popover-wrap').removeClass('forgot_pwd_wrap');
          // $(document).scrollTop(0);
      }
  var SoftCartView = Backbone.MozuView.extend({
    templateName: "modules/soft-cart",
    goToCart: function() {
      window.location = "/cart";
      return false;
    },
    changeQuantity: function(e, amt) {
       var $qField = $(e.currentTarget),
        id = $qField.data('mz-cart-item'),
        item = this.model.get("items").get(id);
      item.set('quantity', item.get('quantity') + amt);
      return item.saveQuantity();
    },
    increaseQuantity: function(e) {
      return this.changeQuantity(e, 1);
    },
    decreaseQuantity: function(e) {
      return this.changeQuantity(e, -1);
    },
    removeItem: function(e) {
      var $removeButton = $(e.currentTarget),
          id = $removeButton.data('mz-cart-item');
      this.model.removeItem(id);
      return false;
    },

    gotoCheckout: function () {
        if(!require.mozuData('user').isAnonymous) {
            window.location=require.mozuData('pagecontext').secureHost+"/cart/checkout";   
        }else {
            $('.trigger-login').trigger('click');
            $('#cboxOverlay').show();
        }
    }


  });

  // accessors for other modules
  var SoftCartInstance = {
    update: function() {
        // populate the cart model asynchronously from the api
        return this.model.apiGet();
    },
    /*show: function() {
        var self = this;
        this.view.$el.addClass('is-active');
        $('.soft-cart-btn.chkout-minicart-btn').removeAttr('disabled');
        // $('#cboxOverlay').show().css({'height':$(document).height(), 'background-color':'rgba(0, 0, 0, 0.37)'});
        // dismisser method so that a click away will hide the softcart
        var clickAway = function(e) {
            // if ((!$.contains(self.view.el, e.target)) || (e.target.id == 'soft-cart-close' && e.type =='click')) {
              self.view.$el.removeClass('is-active');
              $(document.body).off('click', clickAway);
              // $('#cboxOverlay').removeAttr('style').hide();
              $('.soft-cart-btn.chkout-minicart-btn').attr('disabled');
            // }
        };
        // $(document.body).on('click', clickAway);  
        $('#soft-cart-close').on('click',clickAway);
        $('.soft-cart-wrap,.mz-utilitynav-link-cart').on('mouseout', clickAway);

    },*/
    highlightItem: function(itemid) {
      this.view.$('.soft-cart-item[data-mz-cart-item="' + itemid + '"]').removeClass('highlight').addClass('highlight');
    }
  };
 
 

  $(document).ready(function() {
    //Global variable for sign-up checkout redirection.
    window.checkoutflag = 0;
    // create a blank cart model
    SoftCartInstance.model = new CartModels.Cart();
    // instantiate your view!
    SoftCartInstance.view = new SoftCartView({
      el: $('[data-mz-role="soft-cart"]'),
      model: SoftCartInstance.model
    });
    // bind a method we'll be using for the promise
    SoftCartInstance.show = $.proxy(SoftCartInstance.show, SoftCartInstance);
    SoftCartInstance.update();
    // bind cart links to open the softcart instead 
/*    $(document.body).on('mouseover', 'a[href="/cart"],.soft-cart-wrap', function(e) {
        e.preventDefault();
        var isMobile = require.mozuData('pagecontext').isMobile; 
        var isTablet = require.mozuData('pagecontext').isTablet;
        if(isMobile || isTablet){
          window.location.href=require.mozuData('pagecontext').secureHost+"/cart";
        }
        else{
          SoftCartInstance.show();  
        }
    }); */
  });  

  $(function(){
      // Hiding by default  
        $('.chkout-login-action').hide();
        $('.default-hide').hide(); 
      
        /*
        cart-form submit functionality.
        */
        $(document).on('click', '.soft-cart-btn.chkout-minicart-btn', function() {
          $('#cartform').submit(); 
        });
        $(document).on('submit','#cartform', function(e){
            var isAnonymousUser = require.mozuData('user').isAnonymous;
            if(!isAnonymousUser){
                return true;     
            }      
            else{ 
                setLoginForCheckout();
                // var formId =  $(e.target).attr('id'); 
                return false; 
            }   
        });
        $(document).on('click','.login-back,#back_to_login_link',function(e){  
            if(window.checkoutflag == 1){
                // $('.trigger-login').trigger('click');
                setLoginForCheckout(); 
                e.stopImmediatePropagation();
            }
            else{
                $('.trigger-login').trigger('click');
                $('#cboxOverlay').show();
                $('body').addClass('lock-verflow');
            }
        });
        $(document).on('click','[data-mz-action="forgotpasswordform"]',function(e){
            $('.chkout-popover-wrap').addClass('forgot_pwd_wrap');
            $('.default-hide').hide();             
        });
        $(document).on('click','button#continue-as-guest-btn',function(){
            window.location="/cart/checkout";    
        }); 
        /*         
            code for wishlist
        */ 
        $(document).on('click','#login-popover-close,a#login,a#float-login',function(){
            $('.chkout-login-action').hide(); 
            $('.default-hide').hide();
        });
         $(document).on('click','.cont-to-signup-chkout',function(){
            $('.trigger-signup').trigger('click'); 
            // $(document).scrollTop(0);
            $('#cboxOverlay').show(); 
        });
        $('.icon-image-sprite.icon-3.sticky-icons,.soft-cart-wrap.is-active::before').on('mouseover',function(e){ 
            var top = $(this).position();
            $('.soft-cart-wrap.is-active').css('top',top);
        });
      
  });

  // export the singleton
  return SoftCartInstance;

});