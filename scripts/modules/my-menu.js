define(['modules/jquery-mozu', 'modules/api', 'vendor/jQuery.selectric'], function ($, api) {
	
	 function setCookie(cname, cvalue, exdays) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + "; path=/;" + expires;
	}

	function OwlCarouselSlider(){

		try{

			$('.echi-shi-products_slider .owl-next, .echi-shi-products_slider .owl-prev').html('');
			$('.echi-shi-products_slider .owl-carousel').owlCarousel({
				loop:true,
				margin:20,
				nav:true,
				responsive:{
					0:{items:1},
					600:{items:2},
					1000:{items:4}
				}
			});

			$('.echi-shi-related-products-slider .owl-next, .echi-shi-related-products-slider .owl-prev').html('');
				$('.echi-shi-related-products-slider .owl-carousel').owlCarousel({
				loop:true,					   
				nav:true,
				responsive:{
					0:{items:2},
					600:{items:2},
					1000:{items:4}
				}
			});	  
		if($('.echi-shi-related-products-slider .owl-item').length < 5) { 
			$('.echi-shi-related-products-slider .owl-prev').hide();
			$('.echi-shi-related-products-slider .owl-next').hide();
		}				
		$('.echi-shi-bundle-products-slider .owl-next, .echi-shi-bundle-products-slider .owl-prev').html('');
		$('.echi-shi-bundle-products-slider .owl-carousel').owlCarousel({
			loop:true,
			margin:10,
			nav:true,
			responsive:{
				0:{items:2},
				600:{items:3},
				768:{items:4},
				1000:{items:6}
			},onRefreshed:function(){
		    	//console.log("loaded");
				$(".owl-carousel .owl-controls .owl-next").css("cssText","background:#fff !important;");
				$(".owl-carousel .owl-controls .owl-prev").css("cssText","left:0 !important;background:#fff !important;");
				//$(".owl-controls .owl-nav .owl-prev").css("cssText","");
			}
		});
	if($('.echi-shi-bundle-products-slider .owl-item').length < 5) { 
		$('.echi-shi-bundle-products-slider .owl-prev').hide();
		$('.echi-shi-bundle-products-slider .owl-next').hide();
	}
	$('.echi-shi-bundle-theme-slider .owl-next, .echi-shi-bundle-theme-slider .owl-prev').html('');
	$('.echi-shi-bundle-theme-slider .owl-carousel').owlCarousel({
		loop:true,
		nav:true,
		responsive:{
			0:{items:1},
			600:{items:2},
			1000:{items:4}
		}
	});
	if($('.echi-shi-bundle-theme-slider .owl-item').length < 5) { 
		$('.echi-shi-bundle-theme-slider .owl-prev').hide();
		$('.echi-shi-bundle-theme-slider .owl-next').hide();
	}
	$('.echi-shi-superpage-slider .owl-next, .echi-shi-superpage-slider .owl-prev').html('');
	$('.echi-shi-superpage-slider .owl-carousel').owlCarousel({
		loop:true,
		margin:10,
		nav:true,
		responsive:{
			0:{items:2},
			600:{items:3},
			768:{items:4},
			1000:{items:5}
		}
	});
	if($('.echi-shi-superpage-slider .owl-item').length < 5) { 
		$('.echi-shi-superpage-slider .owl-prev').hide();
		$('.echi-shi-superpage-slider .owl-next').hide();
	}
	$('.echi-shi-superpage-theme-slider .owl-next, .echi-shi-superpage-theme-slider .owl-prev').html('');
	$('.echi-shi-superpage-theme-slider .owl-carousel').owlCarousel({
		loop:true,
		margin:20,
		nav:true,
		responsive:{
			0:{items:2},
			600:{items:4},
			1000:{items:5}
		}
	});

	if($('.echi-shi-superpage-theme-slider .owl-item').length < 5) { 
		$('.echi-shi-superpage-theme-slider .owl-nav').hide();
		$('.echi-shi-superpage-theme-slider .owl-prev').hide();
		$('.echi-shi-superpage-theme-slider .owl-next').hide();
	}  
		if($('.button-slider-loop .owl-carousel').length > 0){                       
		$('.button-slider-loop .owl-next, .button-slider-loop .owl-prev').html('');                          
		$('.button-slider-loop .owl-carousel').owlCarousel({
			dots: true,loop: true,nav: true,margin:0,
			responsive:{ 
				0:{ items:1}, 
				600:{items:2},
				1000:{items:5}
			}
		});
		$('.button-slider-loop .owl-dots').hide();
			if($('.button-slider-loop .owl-carousel .owl-item').length < 5) { 
				$('.button-slider-loop .owl-prev').hide();
				$('.button-slider-loop .owl-next').hide();
			}     
		}

		if($('.button-search-slider-loop .owl-carousel').length > 0){                       
			$('.button-search-slider-loop .owl-next, .button-search-slider-loop .owl-prev').html('');                          
			$('.button-search-slider-loop .owl-carousel').owlCarousel({
				dots: true,
				loop: true,
				nav: true,
				margin:0,
				responsive:{
					0:{items:1}, 
					600:{items:2},
					1000:{items:5}
				}
			});
			$('.button-search-slider-loop .owl-dots').hide();
			if($('.button-search-slider-loop .owl-carousel .owl-item').length < 5) { 
				$('.button-search-slider-loop .owl-prev').hide();
				$('.button-search-slider-loop .owl-next').hide();
			}                   

		}


	 }catch(e){
	 	console.log(e);
	 }
}
$(document).on("click",".mz-accountaddressbook-edit",function() {
    $('html, body').animate({
        scrollTop: $(".mz-accountaddressbook-form").offset().top
    }, 2000);
});
	$('.signup-link').click(function(){
		//triggerLogin();
		$('.trigger-signup').trigger('click'); 
		$("html, body").animate({ scrollTop: 0 }, "slow");
		}); 
	$('.footer-binding-link-login').click(function(){
		triggerLogin();
		$("html, body").animate({ scrollTop: 0 }, "slow");
	});
	var triggerLogin = function(){
        $('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
        $('#mz-quick-view-container').fadeOut(350);
        $('#mz-quick-view-container').empty();
    };

      
       	$('.guided-popup').on("click",function(){
       		$('#guided-overlay').show();
       	});
       	$('#guided-close').on("click",function(){
       		$('#guided-overlay').hide();
       	});
       	$('.guided-btn').on("click",function(){
       		var guidedcat = $(".event-theme").val();
       		setCookie("guidedcategory",guidedcat,1);
       		window.location.href="/guided-search";  
       	}); 
		     
         $(document).on("click","#det-btn",function(){           	
        	$('#tab1').prop('checked', true); 
        	$('html, body').animate({
                    scrollTop: $("#mz-drop-zone-why-shop-wdgt").offset().top
                }, 1000);        	
        });       
          $(document).on("click","#shp-btn",function(){              	
        	$('#tab4').prop('checked', true);
        	$('html, body').animate({
                    scrollTop: $("#mz-drop-zone-why-shop-wdgt").offset().top
                }, 1000);   
        });
         $(document).on("click","#qa-btn",function(){        
        	// $('#tab3').prop('checked', true);
        	$('html, body').animate({
                    scrollTop: $("#tab-content3").offset().top-135
                }, 1000);   
        });
        $(document).on("click","#rev-btn",function(){        	
        	// $('#tab4').prop('checked', true);
        	$('html, body').animate({
                    scrollTop: $("#tab-content2").offset().top-135
                }, 1000);   
        });


 $(document).ready(function(){
 	
 	  $(".button-slider-loop").show();

 	$(".echi-shi-bundle-products-slider").show();
 	$(".echi-shi-superpage-slider").show();
 	$(".echi-shi-superpage-theme-slider").show();		
   
 	$(document).on('change','.custom-qty .qty',function(){
 		var qunty=$(this).val();
 		$('.custom-qty .qty').val(qunty);  				
 	});
 		
		$(document).on('click','button.accordion1,button.accordion',function(){
		 	$(this).toggleClass('active');
			$(this).next().toggleClass('show');
		 });

 		$('.mz-productdetail-qty').on('change keyup', function() { 			
			  var sanitized = $(this).val().replace(/[^0-9]/g, '');
			  $(this).val(sanitized);
			});
 		$('.pwd-link').click(function(){ 		
		    $("html, body").animate({ scrollTop: 0 }, 600);
		    return false;
		 });

 		$(document).on("focus","[data-mz-login-email],[data-mz-login-password],[data-mz-signup-firstname],[data-mz-signup-lastname],[data-mz-signup-emailaddress],[data-mz-signup-password],[data-mz-signup-confirmpassword]", function(){
 			$(this).css('background-color', 'white');
 			$(this).removeAttr('placeholder'); 
 		});  
 		$(document).on("blur","[data-mz-signup-firstname]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');		
 			$(this).attr('placeholder','First Name'); 
 		}); 
 		$(document).on("blur","[data-mz-signup-lastname]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');		
 			$(this).attr('placeholder','Last Name'); 
 		});  
 		$(document).on("blur","[data-mz-signup-emailaddress]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');		
 			$(this).attr('placeholder','Email Address'); 
 		}); 
 		$(document).on("blur","[data-mz-signup-password]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');		
 			$(this).attr('placeholder','Password'); 
 		}); 
 		$(document).on("blur","[data-mz-signup-confirmpassword]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');		
 			$(this).attr('placeholder','Confirm Password'); 
 		}); 
 		$(document).on("blur","[data-mz-login-email]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');		
 			$(this).attr('placeholder','Email Address'); 
 		});
 		$(document).on("blur","[data-mz-login-password]", function(){ 	
 			$(this).css('background-color', '#f7f7f7');			
 			$(this).attr('placeholder','Password'); 
 		});  
 	 				$('body').show();	
			    $('.owl-carousel').show();			
 				$('.mz-pagingcontrols-pagesize-dropdown, .mz-pagingcontrols-pagesort-dropdown').selectric({
                    maxHeight: 200,
                    responsive:true,   
                    disableOnMobile:true   
                });  
                /*$(".product-video > *").click(function(){
                    $(".product-image > img").hide();
                    if($(".product-image > iframe").attr('src') === undefined) {
                        $(".product-image > iframe").attr('src', 'http://www.youtube.com/embed/' + $(this).parent().attr("video-data")).show();
                    }else {
                        $(".product-image > iframe").show();
                    }
                }); 
                $("#video-frame").hide();
                $('.item > img').click(function(){
                        $(".product-image > img").show();
                        $(".product-image > img").attr('src', $(this).attr('src'));
                        $("#video-frame").hide();
                 });*/
/*** OwlCarousel Apply **/
		OwlCarouselSlider();

 				
$( ".menu-sec-2 div:first-child" ).addClass("current");
	$(".menu-first").on('mouseover', function() {
			var link = $(this).attr('id');  
	//		alert($("."+link+" div:first-child").get());
			$(".adSlideBox.current").removeClass("current");
	 	 	$("."+link+" div:first-child").addClass("current");

	 	 	$(this).parent().find('.link-active').first().children('a').attr('id', 'active');
	});
	$(".adSlideBox").on('mouseover', function() {
			var link = $(this).attr('id');  
			//alert(link);
			$('.link-active a').removeAttr('id');
			$('.link-active .'+link).attr('id', 'active');
	});

	$(".adSlideBox").on('mouseout', function() {
		$('.link-active a').removeAttr('id');	
	});

$(".menu-sec-1 li a").on('mouseover', function() {
 		var link = $(this).attr('class');  
 		//alert(link);   
 	//	alert($(".loop-"+link).get());
 		  $(".adSlideBox.current").removeClass("current");
           	$(".loop-"+link).addClass("current");
        //   alert(".menu-sec-2.adSlideBox.loop [class="+link+"]");
		});
$(".menu-sec-1 li a").on('mouseout', function() {
		
		});


     $('.header').click(function(){
	    $(this).closest('.container-des').toggleClass('collapsed');
	  		});


     $('.header-rev').click(function(){
	    $(this).closest('.container-des-rev').toggleClass('collapsed');
	  		});

     $(document).on("click",".bundle-page-qty .qtyplus",function(e){
                e.preventDefault();
                var plusVal = parseInt($(this).parent().find('input[data-mz-value="quantity"]').val(),10);
                if(plusVal >= 1){
                	$(this).parent().find('input[data-mz-value="quantity"]').val(plusVal+1);
                }else if(plusVal<=0){
                	$(this).parent().find('input[data-mz-value="quantity"]').val(1);
                }
                $('.bundle-page-qty input[data-mz-value="quantity"]').trigger('change');
            }); 
            $(document).on("click",".bundle-page-qty .qtyminus",function(e){ 	 
                e.preventDefault();
                var qntyVal = $('.mz-productdetail-conversion-controls input[data-mz-value="quantity"]').val();
                var currentVal = parseInt($(this).parent().find('input[data-mz-value="quantity"]').val(),10);
                if (!isNaN(currentVal) && currentVal > 1) {
                    $(this).parent().find('input[data-mz-value="quantity"]').val(currentVal - 1);
                } else if(currentVal<=0){
                    $(this).parent().find('input[data-mz-value="quantity"]').val(1);
                }
                $('.bundle-page-qty input[data-mz-value="quantity"]').trigger('change');
            });
     
	});
	
});

				