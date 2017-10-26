define(
[
	"modules/jquery-mozu"
],function ($){
	$('.my_account_left ul li a').on('click', function(){
		//event.preventDefault();
		$(this).parent().addClass('active_my_account_menu');
    	$(this).parent().siblings().removeClass('active_my_account_menu');
    	
         $('.button.accordion1.active,button.accordion.active').trigger('click');
    	var tab = $(this).attr("href");
    	$(".enable-print").removeClass("enable-print");
    	$("div[id='"+tab.replace("#","")+"'] > button").addClass("enable-print");
    	$("div[id='"+tab.replace("#","")+"']").find("mz-orderhistory-section").addClass("enable-print");
    	$("div[id='"+tab.replace("#","")+"'] > button").next().addClass("enable-print");
        $(".account_tab-content").not(tab).css("display", "none");
        $("div"+tab).fadeIn(); 
        return false;
	});
	var faq_text = $('#mz-drop-zone-faq a').text();
	var cust_supp_text = $('#mz-drop-zone-customer-support a').text();
	var about_us_text = $('#mz-drop-zone-about-us a').text();
	var our_ser_text = $('#mz-drop-zone-our-services a').text();
	var faq_src = $('#mz-drop-zone-faq a').attr("href");
	var cust_supp_src = $('#mz-drop-zone-customer-support a').attr("href");
	var about_us_src = $('#mz-drop-zone-about-us a').attr("href");
	var our_ser_src = $('#mz-drop-zone-our-services a').attr("href");
	$('.mob-faq-app a').attr("href", faq_src).text(faq_text);  
	$('.mob-cust-sup a').attr("href", cust_supp_src).text(cust_supp_text);
	$('.mob-about-app a').attr("href", about_us_src).text(about_us_text);
	$('.mob-our-app a').attr("href", our_ser_src).text(our_ser_text);
	// $(window).on("orientationchange",function(event){
	// 	if (window.matchMedia("(orientation: landscape)").matches) {
 //   			$('body').css('opacity','0.1').css('background-color', "#000");
   			
	// 	}else{
	// 		$('body').css('opacity','1').css('background-color', "inherit");
	// 	} 
 //  	});
	// $(document).ready(function(){
	// 	if (window.matchMedia("(orientation: landscape)").matches) {
 //   			$('body').css('opacity','0.1').css('background-color', "#000");
	// 	}else{
	// 		$('body').css('opacity','1').css('background-color', "inherit");
	// 	} 
	// });
	
/*
	$(function(){  
		//Fixed-Header
		$('#fixed-header-login').on('mouseover',function(e){  
			//if(e.target !== e.currentTarget) return;
			$('.welcome-text-container').show().css(
				{
					'top': $(this).position().top + 12,
					'left': $(this).position().left - 20
				}
			);
			$('.pop-tip').css({'left': '32px'});
		});

		//Floating Header
		$('#float-header-login').on('mouseover',function(e){
			//if(e.target !== e.currentTarget) return;
			if($('.header-float.menu-container').css('display') != 'none')
			{
				//var pos = $('#float-header-login').position();
				//$('.welcome-text-container').show().css({'top':pos.top}); //  .css({'top':pos.top,'left':pos.left});  //'top':pos.top,
				$('.welcome-text-container').show().css(
					{
						'top': '22px',//$('#float-header-login > img').position().top + 25,
						'left': $(this).position().left - 20
					}
				);
				$('.pop-tip').css({'left': '32px'});
			}
		});  
		var $mouseFlag = false;
		//popover Dismissal
		$('#float-header-login,#fixed-header-login').parent().on('mouseleave',function(){
			//$('.welcome-text-container').removeAttr('style');
			//$('.pop-tip').removeAttr('style');
			if(!$mouseFlag) {
				$('.welcome-text-container').hide();
			}
		});
		$('.welcome-text-container').on('mouseenter', function(){
			$mouseFlag = true;
		});
		$('.welcome-text-container').on('mouseleave',function(){
			//$('.welcome-text-container').removeAttr('style');
			//$('.pop-tip').removeAttr('style');
			$mouseFlag = false;
		 	$('.welcome-text-container').hide();	     
		}); 
	});
	*/
});  