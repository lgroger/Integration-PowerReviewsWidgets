/* global MktoForms2 */ // ignore MktoForms2 in jshint
define(["modules/jquery-mozu","hyprlive"], function ($,Hypr) {
	var myObj = {
		formsLoaded: false, // set to true after initial forms script library is loaded
		mktoAccNumber: Hypr.getThemeSetting('mktoAccNumber'), // "{{ themeSettings.mktoAccNumber }}"
		mktoEmailSubscription: Hypr.getThemeSetting('mktoEmailSubscription'), // {{ themeSettings.mktoEmailSubscription }}
		mktoHolidayEmailPreferences: Hypr.getThemeSetting('mktoHolidayEmailPreferences'), // {{ themeSettings.mktoHolidayEmailPreferences }}
		email_signup: null, // placeholder to hold form for subscribing to list
		email_pre: null, // placeholder to hold form for subscribing to preferences
		subscribeEmailId: "", // pages/global.js uses this
		loadForms: function(callback){ // loads global variable MktoForms2 from "//app-sj14.marketo.com/js/forms2/js/forms2.min.js"
			//console.log("loadForms start");
			var me = this;
			if(this.formsLoaded){
				 // already loaded
				if(typeof callback === "function"){
					callback();	
				}
			}
			else{
				var newCallback = function(){
					//console.log("loadForms newCallback");
					me.formsLoaded = true;
					if(typeof callback === "function"){
						callback();	
					}
				};
				// load it now
				$.getScript("//app-sj14.marketo.com/js/forms2/js/forms2.min.js").done(newCallback);
			}
		},
		loadSubscribe: function(callback){
			//console.log("loadSubscribe start");
			var me = this;
			var newCallback = function(){
				console.log("loadSubscribe newCallback");
				if($("form[id='mktoForm_"+me.mktoEmailSubscription+"']").length === 0){
					$("body").append($("<form></form>").attr("id","mktoForm_"+me.mktoEmailSubscription).css("display","none"));
				}
				MktoForms2.loadForm("//app-sj14.marketo.com", me.mktoAccNumber, me.mktoEmailSubscription,function(form){
					me.email_signup = form;
					if(typeof callback === "function"){
						callback();	
					}
				});
			};
			this.loadForms(newCallback); // load MktoForms2
		},
		unsubscribe:	function(email,callback){
			//console.log("unsubscribe start");
			var me = this;
			var newCallback = function(){
				//console.log("unsubscribe newCallback");
				//set values of form
				me.email_signup.vals({"Email":email,"subscribeShindigz":"no","unsubscribeShindigz":"yes"});

				if (me.email_signup.submittable()) {

					me.email_signup.submit();
					me.email_signup.onSuccess(function(values, followUpUrl) {
						if(typeof callback === "function"){
							callback();	
						}
						return false;
					});
				}
			};
			if(this.email_signup){
				newCallback();
			}
			else{
				this.loadSubscribe(newCallback);
			}
		},
		subscribe: 	function(email,callback){
			//console.log("subscribe start");
			var me = this;
			var newCallback = function(){
				//console.log("subscribe newCallback");
				//set values of form
				me.email_signup.vals({"Email":email,"subscribeShindigz":"yes","unsubscribeShindigz":"no"});

				if (me.email_signup.submittable()) {

					me.email_signup.submit();
					me.email_signup.onSuccess(function(values, followUpUrl) {
						if(typeof callback === "function"){
							callback();	
						}
						return false;
					});
				}
			};
			if(this.email_signup){
				newCallback();
			}
			else{
				this.loadSubscribe(newCallback);
			}
			
		},
		subscription: function(email,tr,fa,callback){
			//console.log("subscription start");
			var me = this;
			var newCallback = function(){
				//console.log("subscription newCallback");
				//set values of form
				me.email_signup.vals({"Email":email,"subscribeShindigz":tr,"unsubscribeShindigz":fa});
				me.subscribeEmailId += ";"+email;

				if (me.email_signup.submittable()) {
					// Set it to be non submittable
					me.email_signup.submit();
					me.email_signup.onSuccess(function(values, followUpUrl) {
						if(typeof callback === "function"){
							callback();	
						}
						return false;
					});
				}
			};
	
			if(this.email_signup){
				newCallback();
			}
			else{
				this.loadSubscribe(newCallback);
			}
		},
		loadPreferences: function(callback){
			//console.log("loadPreferences start");
			var me = this;
			var newCallback = function(){
				//console.log("loadPreferences newCallback");
				if($("form[id='mktoForm_"+me.mktoHolidayEmailPreferences+"']").length === 0){
					$("body").append($("<form></form>").attr("id","mktoForm_"+me.mktoHolidayEmailPreferences).css("display","none"));
				}
				MktoForms2.loadForm("//app-sj14.marketo.com", me.mktoAccNumber, me.mktoHolidayEmailPreferences,function(form){
					me.email_pre = form;
					if(typeof callback === "function"){
						callback();	
					}
				});
			};
			this.loadForms(newCallback);
		},
		setPreferences: function(uniqueList,email,callback){
			//console.log("setPreferences start");
			var me = this;
			var newCallback = function(){
				//console.log("setPreferences newCallback");
				//set values of form
				me.email_pre.vals({ "emailPreferncesSZ": uniqueList, "Email": email });

				if (me.email_pre.submittable()) {
					// Set it to be non submittable
					//window.email_pre.submittable(false);
					me.email_pre.submit();
					me.email_pre.onSuccess(function(values, followUpUrl) {
						if(typeof callback === "function"){
							callback();	
						}
						return false;
					});
				}
			};
			if(this.email_pre){
				newCallback();
			}
			else{
				this.loadPreferences(newCallback);
			}
		}
	};
	return(myObj);
});