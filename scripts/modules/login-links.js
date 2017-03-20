/**
 * Adds a login popover to all login links on a page.
 */
define(['shim!vendor/bootstrap/js/popover[shim!vendor/bootstrap/js/tooltip[modules/jquery-mozu=jQuery]>jQuery=jQuery]>jQuery', 'modules/api', 'hyprlive', 'underscore', 'vendor/jquery-placeholder/jquery.placeholder'], function ($, api, Hypr, _) {

    var usePopovers = function() {
        // return !Modernizr.mq('(max-width: 480px)');
         return !Modernizr.mq('(max-width: 315px)');  
    },
    isTemplate = function(path) {
        return require.mozuData('pagecontext').cmsContext.template.path === path;
    },
    returnFalse = function () {  
        return false;
    },
    $docBody,

    polyfillPlaceholders = !('placeholder' in $('<input>')[0]);

    var DismissablePopover = function () { };

    $.extend(DismissablePopover.prototype, {
        boundMethods: [],
        setMethodContext: function () {
            for (var i = this.boundMethods.length - 1; i >= 0; i--) {
                this[this.boundMethods[i]] = $.proxy(this[this.boundMethods[i]], this);
            }
        },
        dismisser: function (e) {
            if (!$.contains(this.popoverInstance.$tip[0], e.target) && !this.loading) {
                // clicking away from a popped popover should dismiss it
                this.$el.popover('destroy');
                this.$el.on('click', this.createPopover);
                this.$el.off('click', returnFalse);
                this.bindListeners(false);
                $docBody.off('click', this.dismisser);
                $('body').removeClass('lock-verflow');
                $('#cboxOverlay').hide();
                if(!$(e.target).hasClass('trigger-signup') && e.target.id != "login"){
                    window.checkoutflag = 0;
                }
            }
        },
        setLoading: function (yes) {
            this.loading = yes;
            this.$parent[yes ? 'addClass' : 'removeClass']('is-loading');
        },
        onPopoverShow: function () {
            var self = this;
            _.defer(function () {
                $docBody.on('click', self.dismisser);
                self.$el.on('click', returnFalse);
            });
            this.popoverInstance = this.$el.data('bs.popover');
            this.$parent = this.popoverInstance.tip();
            this.bindListeners(true);
            this.$el.off('click', this.createPopover);
            if (polyfillPlaceholders) {
                this.$parent.find('[placeholder]').placeholder({ customClass: 'mz-placeholder' });
            }
        },
        createPopover: function (e) {
            // in the absence of JS or in a small viewport, these links go to the login page.
            // Prevent them from going there!
            var self = this;
            if (usePopovers()) {
                e.preventDefault();
                // If the parent element's not positioned at least relative,
                // the popover won't move with a window resize
                //var pos = $parent.css('position');
                //if (!pos || pos === "static") $parent.css('position', 'relative');
                this.$el.popover({
                    //placement: "auto right",
                    animation: true,
                    html: true,
                    trigger: 'manual',
                    content: this.template,
                    container: 'body'
                }).on('shown.bs.popover', this.onPopoverShow)
                .popover('show');
                $('#cboxOverlay').show().css('height',$(document).height());
                $('body').addClass('lock-verflow');

                if(this.$el.data("mz-action") == 'login') {
                    $('.popover').addClass('popoverLoginForm');
                } else {
                    $('.popover').addClass('popoverSignupForm');
                }

            }
        },
        retrieveErrorLabel: function (xhr) {
            var message = "";
            if (xhr.message) {
                message = Hypr.getLabel(xhr.message);
            } else if ((xhr && xhr.responseJSON && xhr.responseJSON.message)) {
                message = Hypr.getLabel(xhr.responseJSON.message);
            }

            if (!message || message.length === 0) {
                this.displayApiMessage(xhr);
            } else {
                var msgCont = {};
                msgCont.message = message;
                this.displayApiMessage(msgCont);
            }
        },
        displayApiMessage: function (xhr) {
            console.log(xhr);          
            this.displayMessage(xhr.message ||
                (xhr && xhr.responseJSON && xhr.responseJSON.message) ||
                Hypr.getLabel('unexpectedError'));
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
            setTimeout(function(){$('.mz-validationmessage').fadeOut();},4000);
        },
        init: function (el) {
            this.$el = $(el);
            this.loading = false;
            this.setMethodContext();
            if (!this.pageType){
                this.$el.on('click', this.createPopover);
            }
            else {
               this.$el.on('click', _.bind(this.doFormSubmit, this));
            }    
        },
        doFormSubmit: function(e){
            e.preventDefault();
            this.$parent = this.$el.closest(this.formSelector);
            this[this.pageType]();
        }
    });

    var LoginPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.login = _.debounce(this.login, 150);
        this.retrievePassword = _.debounce(this.retrievePassword, 150);
    };
    LoginPopover.prototype = new DismissablePopover();
    $.extend(LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'handleLoginComplete', 'displayResetPasswordMessage', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'slideRight', 'slideLeft', 'login', 'retrievePassword', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/login-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="forgotpasswordform"]', this.slideRight);
            this.$parent[onOrOff]('click', '[data-mz-action="loginform"]', this.slideLeft);
            this.$parent[onOrOff]('click', '[data-mz-action="submitlogin"]', this.login);
            this.$parent[onOrOff]('click', '[data-mz-action="submitforgotpassword"]', this.retrievePassword);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        onPopoverShow: function () {
            DismissablePopover.prototype.onPopoverShow.apply(this, arguments);
            this.panelWidth = this.$parent.find('.mz-l-slidebox-panel').first().outerWidth();
            this.$slideboxOuter = this.$parent.find('.mz-l-slidebox-outer');

            if (this.$el.hasClass('mz-forgot')){
                this.slideRight();
            }
        },
        handleEnterKey: function (e) {
            if (e.which === 13) {
                var $parentForm = $(e.currentTarget).parents('[data-mz-role]');
                switch ($parentForm.data('mz-role')) {
                    case "login-form":
                        this.login(e);
                        break;
                    case "forgotpassword-form":
                        this.retrievePassword();
                        break;
                }
                return false;
            }
        },
        slideRight: function (e) {
            if (e) e.preventDefault();
            $('.mz-login-form.mz-l-slidebox-panel').hide();  
            $('.mz-forgot-password.mz-l-slidebox-panel').show();
            // this.$slideboxOuter.css('left', -this.$parent.find('.mz-l-slidebox-outer>.mz-l-slidebox-inner>section.mz-l-slidebox-panel').first().outerWidth()); //this.panelWidth); //this.$parent.find('.mz-l-slidebox-outer>.mz-l-slidebox-inner>section.mz-l-slidebox-panel').first().outerWidth()); //this.panelWidth
        },
        slideLeft: function (e) {
            if (e) e.preventDefault();
            $('.mz-login-form.mz-l-slidebox-panel').show();
            $('.mz-forgot-password.mz-l-slidebox-panel').hide();  
            // this.$slideboxOuter.css('left', 0); 
        },   
        login: function (e) {
            // this.setLoading(true);
            $('#cboxOverlay').show().addClass('page-loading'); //show page loader
            var me = this;
            var email = this.$parent.find('[data-mz-login-email]').val().toLowerCase();
            var password = this.$parent.find('[data-mz-login-password]').val();
            var payload = {
                email : email
            };
            if(password === '' && email === ''){
            	this.displayMessage("Username and Password required.");
            	return;
            }else if(password === ''){
            	this.displayMessage("Password required.");
            	return;
            }
            if (me.validate(payload)) {
                api.action('customer', 'loginStorefront', {
                    email: this.$parent.find('[data-mz-login-email]').val(),
                    password: this.$parent.find('[data-mz-login-password]').val()
                }).then(function(res){
                    me.handleLoginComplete(e);
                }, this.displayApiMessage);
                
            }
        },
        validate:function(payload){
            var emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
            if (!emailRegex.test(payload.email)) return this.displayMessage(Hypr.getLabel('emailMissing')), false; 
            return true;
        },
        anonymousorder: function() {
            var email = "";
            var billingZipCode = "";
            var billingPhoneNumber = "";

            switch (this.$parent.find('[data-mz-verify-with]').val()) {
                case "zipCode":
                    {
                        billingZipCode = this.$parent.find('[data-mz-verification]').val();
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }
                case "phoneNumber":
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = this.$parent.find('[data-mz-verification]').val();
                        break;
                    }
                case "email":
                    {
                        billingZipCode = null;
                        email = this.$parent.find('[data-mz-verification]').val();
                        billingPhoneNumber = null;
                        break;
                    }
                default:
                    {
                        billingZipCode = null;
                        email = null;
                        billingPhoneNumber = null;
                        break;
                    }

            }

            // this.setLoading(true);
            // the new handle message needs to take the redirect.
            api.action('customer', 'orderStatusLogin', {              
                ordernumber: this.$parent.find('[data-mz-order-number]').val(),
                email: email,
                billingZipCode: billingZipCode,
                billingPhoneNumber: billingPhoneNumber
            }).then(function () { window.location.href = "/my-anonymous-account"; }, _.bind(this.retrieveErrorLabel, this));
            api.on('error', function(error){
                $(".errormessage").css("display","block");
                $(".errormessage").html(error.message);
                console.log(error);  
                return false;
            });
        },
        retrievePassword: function () {
            // this.setLoading(true);
            var payload = {
                email : this.$parent.find('[data-mz-forgotpassword-email]').val()
            };
            if (this.validate(payload)) {
                api.action('customer', 'resetPasswordStorefront', {  
                    EmailAddress: this.$parent.find('[data-mz-forgotpassword-email]').val()
                }).then(_.bind(this.displayResetPasswordMessage,this), this.displayApiMessage);
            }
        },  
        handleLoginComplete: function (e) {
            var wishlistprouct = $.cookie('wishlistprouct');
            if(wishlistprouct && wishlistprouct!==""){
                $.cookie('wishlistprouct', "",{path:'/'});
                var iframe = document.createElement('iframe');
                    iframe.id="homepageapicontext";
                    iframe.onload = function() {
                        $('#login-popover-close').trigger('click');
                        if(wishlistprouct==='direct'){
                            window.productView.addToWishlistAfterLogin();
                        }else{
                            window.productView.addToWishlistAfterLoginPersonalize();
                        }
                        
                     }; // before setting 'src'
                    var iframeloadurlafterlogin = Hypr.getThemeSetting('iframeloadurlafterlogin');
                    iframe.src = iframeloadurlafterlogin; //Simply loading Home page in iframe;
                    document.body.appendChild(iframe); // add it to wherever you need it in the document

                return;
            }
            if(e){
                var checkoutFlag = $(e.currentTarget).parents('section').find('.checkoutflag').val();
                if(checkoutFlag !== "0"){
                    window.location='/cart/checkout';   
                }
                else{
                   window.location.reload();     
                }
            }else{
                if(this.pageType==='login'){
                 if($(".mz-loginform-page input[name='returnUrl']").attr("value") !== ""){
                        window.location.href=$(".mz-loginform-page input[name='returnUrl']").attr("value");
                    }else{
                      window.location.href='/myaccount';
                 }
                }else{
                    window.location.reload();
                }
                
            }
            
            setTimeout(function(){
            	$('#cboxOverlay').hide().removeClass('page-loading'); //hide page loader
            },4000);
        },
        displayResetPasswordMessage: function () {
            this.displayMessage(Hypr.getLabel('resetEmailSent')); 
        }
    });  

    var SignupPopover = function() {
        DismissablePopover.apply(this, arguments);
        this.signup = _.debounce(this.signup, 150);
    };
    SignupPopover.prototype = new DismissablePopover();
    $.extend(SignupPopover.prototype, LoginPopover.prototype, {
        boundMethods: ['handleEnterKey', 'dismisser', 'displayMessage', 'displayApiMessage', 'createPopover', 'signup', 'onPopoverShow'],
        template: Hypr.getTemplate('modules/common/signup-popover').render(),
        bindListeners: function (on) {
            var onOrOff = on ? "on" : "off";
            this.$parent[onOrOff]('click', '[data-mz-action="signup"]', this.signup);
            this.$parent[onOrOff]('keypress', 'input', this.handleEnterKey);
        },
        handleEnterKey: function (e) {
            if (e.which === 13) { this.signup(); }
        },
        validateSignUp: function (payload) {
            var emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;
            if (!payload.account.firstName) return this.displayMessage(Hypr.getLabel('firstNameMissing')),false;
            if (!payload.account.lastName) return this.displayMessage(Hypr.getLabel('lastNameMissing')), false;
            if (!payload.account.emailAddress) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!emailRegex.test(payload.account.emailAddress)) return this.displayMessage(Hypr.getLabel('emailMissing')), false;
            if (!payload.password) return this.displayMessage(Hypr.getLabel('passwordMissing')), false;
            if (payload.password !== this.$parent.find('[data-mz-signup-confirmpassword]').val()) return this.displayMessage(Hypr.getLabel('passwordsDoNotMatch')), false;
            return true;
        },
        signup: function (e) {

            var self = this,
                email = this.$parent.find('[data-mz-signup-emailaddress]').val(),
                firstName = this.$parent.find('[data-mz-signup-firstname]').val(),
                lastName = this.$parent.find('[data-mz-signup-lastname]').val(),
                optMarketing = this.$parent.find('[data-mz-value="acceptsMarketing"]').is(':checked'),
                themeSettings = require('hyprlivecontext').locals.themeSettings,
                payload = {
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        acceptsMarketing:optMarketing,
                        attributes: [{
                             attributeDefinitionId: Hypr.getThemeSetting('emailSubscription'),
                             fullyQualifiedName: "tenant~email-subscription",
                             values: [optMarketing]
                        }],
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: this.$parent.find('[data-mz-signup-password]').val()
                };
            if (this.validateSignUp(payload)) {   
                //var user = api.createSync('user', payload);
                // this.setLoading(true);
                return api.action('customer', 'createStorefront', payload).then(function () {
                    if (self.redirectTemplate) {
                        window.location.pathname = self.redirectTemplate;
                    }
                    else {
                        if(window.checkoutflag !== 0){
                            window.location.href = "/cart/checkout";
                        }
                        else{
                            window.location.reload();
                        }
                    }
                    if(optMarketing){
                        window.email_signup.vals({"Email":email,"subscribeShindigz":"yes","unsubscribeShindigz":"no"});
                    
                        if (window.email_signup.submittable()) {                       
                           
                            window.email_signup.submit();
                            window.email_signup.onSuccess(function(values, followUpUrl) {                            
                                //$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Thanks for subscribing<br><button id='session-btn-rd' onclick='$(this).parent().parent().fadeOut(500);'>OK</button></div></div>");                            
                                return false;
                            });
                        }
                    }
                }, self.displayApiMessage);
            }
        },
        displayApiMessage: function (xhr) {
            var err='';
            if(xhr.errorCode=="MISSING_OR_INVALID_PARAMETER"){
                var errorMessage = xhr.message;
                var msgArray = errorMessage.split("Missing or invalid parameter:");  // filter out only the message
                var trimMsg = msgArray[1].trim();
                var errArray =  trimMsg.replace(/^\S+/g, '');
                // set the error message
                err = errArray; 
            }else if(xhr.errorCode =="VALIDATION_CONFLICT"){
                    this.$el.find('[data-mz-signup-email]').val('');
                    this.$el.find('[data-mz-signup-confirmemail]').val('');
                    err = 'Username already registered';
            }
            if(err !== ''){
            	this.displayMessage(err);
            }else{
            	if(xhr.message.indexOf('Login as') >= 0){
            		this.displayMessage("Invalid Email Id or Password, Please try again!"); //display message for inavlid username or password
            	}            	
            }
              
        },
        displayMessage: function (msg) {
            this.setLoading(false);
            this.$parent.find('[data-mz-role="popover-message"]').html('<span class="mz-validationmessage">' + msg + '</span>');
            //setTimeout(function(){$('.mz-validationmessage').fadeOut();},4000);
            $('[data-mz-role="popover-message"]').bind('click', function(){
            	setTimeout(function(){$('.mz-validationmessage').fadeOut();},4000); //hide error message after click on error message
            });
            
            setTimeout(function(){
            	$('#cboxOverlay').hide().removeClass('page-loading'); //hide page loader
            },100);

        }
    });

    $(document).ready(function() {
        $docBody = $(document.body);
        $('[data-mz-action="login"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signup"]').each(function() {
            var popover = new SignupPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="launchforgotpassword"]').each(function() {
            var popover = new LoginPopover();
            popover.init(this);
            $(this).data('mz.popover', popover);
        });
        $('[data-mz-action="signuppage-submit"]').each(function(){
            var signupPage = new SignupPopover();
            signupPage.formSelector = 'form[name="mz-signupform"]';
            signupPage.pageType = 'signup';
            signupPage.redirectTemplate = 'myaccount';
            signupPage.init(this);
        });
        $('[data-mz-action="loginpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-loginform"]';
            loginPage.pageType = 'login';
            loginPage.init(this);
        });
        $('[data-mz-action="anonymousorder-submit"]').each(function () {
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-anonymousorder"]';
            loginPage.pageType = 'anonymousorder';        
            loginPage.init(this);
        });
        $('[data-mz-action="forgotpasswordpage-submit"]').each(function(){
            var loginPage = new SignupPopover();
            loginPage.formSelector = 'form[name="mz-forgotpasswordform"]';
            loginPage.pageType = 'retrievePassword';
            loginPage.init(this);
        });
        /*To close popover on click of close*/
        $(document).on('click', '#login-popover-close', function(){
                $('.popover').popover('destroy');
                $('#cboxOverlay').hide();
                $('body').trigger('click');
        });
        $(document).on('click', '#signup-popover-close', function(){
                $('.popover').popover('destroy');
                $('#cboxOverlay').hide();
                $('body').trigger('click'); 
        });

        $('[data-mz-action="logout"]').each(function(){
            var el = $(this);

            //if were in edit mode, we override the /logout GET, to preserve the correct referrer/page location | #64822
            if (require.mozuData('pagecontext').isEditMode) {
 
                 el.on('click', function(e) {
                    e.preventDefault();
                    $.ajax({
                        method: 'GET',
                        url: '../../logout',
                        complete: function() { location.reload();} 
                    });
                });
            }
            
        });    
        $(document).on('click','.cont-to-signup',function(e){ 
            $('.trigger-signup').trigger('click'); 
            // $(document).scrollTop(0);
            $('body').addClass('lock-verflow');
            $('#cboxOverlay').show(); 
        });
        $(document).on('click','.forgot-password-container a, .cancel-reset-container a',function(){
            $('.mz-validationmessage').hide();
        });
        /*$(document).on('click','#back_to_login_link',function(){ 
            $('.trigger-login').trigger('click');
            $('#cboxOverlay').show();
            $('body').addClass('lock-verflow');
        });*/
        $(document).on('click','.float-login',function(){
            //$('.trigger-login').trigger('click');
            //$('#cboxOverlay').show(); 
        });
        //mz-validationmessage  mz-popover-message
        $(document).on('click','.login-back',function(){
            $('.default-hide').hide();
        });
    });//document.ready
});