define(['modules/jquery-mozu'], function ($) {
       

    $(function() { 
			 $('.twitter-typeahead').css('display','block');
	        $('.tt-dropdown-menu').css('top', '52px');
	        
			 $(window).scroll(function() {
			if ($(this).scrollTop() > 600){  
				$('.echi-shi-pro-desc-fix').addClass('display-fixed-mob');
				$('.fixed-mob-bottom').addClass('display-fixed-mob');			
				 } 
			  else{ 
				$('.echi-shi-pro-desc-fix').removeClass('display-fixed-mob');
				$('.fixed-mob-bottom').removeClass('display-fixed-mob'); 
	  }
	});
	$(window).scroll(function() {
		if ($(this).scrollTop() > 190){
			$('.header-float').addClass("sticky");
			$('.menu > ul > li > ul').css('margin-top','20px');
			$('.icon-image-sprite').addClass("sticky-icons");
			$('#searchbox').addClass("searchbox-float");
			$('.logo').addClass("logo-float");
			$('.floatheader').addClass("floatheader-float");
			$('.hide-float').css("display","none");
			$('.header-block').css("display","none");
			$('.float-nav').css("display","block");
			$('.soft-cart-wrap').css('top','60px');
			$('.pointer').css('right','8px');
		  }       
		  else{ 
			$('.header-float').removeClass("sticky");
			$('.menu > ul > li > ul').css('margin-top','0px');
			$('.icon-image-sprite').removeClass("sticky-icons");
			$('#searchbox').removeClass("searchbox-float");
			$('.logo').removeClass("logo-float");
			$('.floatheader').removeClass("floatheader-float");
			$('.hide-float').css("display","block");
			$('.header-block').css("display","block");
			$('.float-nav').css("display","none");
			$('.soft-cart-wrap').css('top','100px');
			$('.pointer').css('right','18px');
		}
	});


		/*
		Code from category-naigation.hypr 
		*/
	$('.menu-custom ul').prepend('<li class="appen-text" style="padding: 0% 0%;height: 40px;"><span class="back-button">&times;</span></li>');
    // <i class="fa fa-times" aria-hidden="true"></i>
   
   // $('.menu-toggle').on('click', function(){
   //    $('.menu-toggle').hide();
   // });
   $('.back-button').on('click', function(){
      $('.menu-toggle').trigger('click');
      // $('.menu-toggle-main').show();
       $('.menu-checkbox:checkbox').removeAttr('checked');
   });
   $('.first-level-back').on('click', function(){
        $(this).parent().parent().parent().parent().children('.menu-checkbox:checkbox').removeAttr('checked');
   });
   

    });

function DropDown(el) {
    this.dd = el;
    this.placeholder = this.dd.children('span');
    this.opts = this.dd.find('ul.dropdown > li');
    this.val = '';
    this.index = -1;
    this.initEvents();
}
DropDown.prototype = {
    initEvents : function() {
        var obj = this;

        obj.dd.on('click', function(event){
		
            $(this).toggleClass('active');
            return false;
        });

        obj.opts.on('click',function(){
		
            var opt = $(this);
            obj.val = opt.text();
            obj.index = opt.index();
            obj.placeholder.text(obj.val);
        });
    },
    getValue : function() {
        return this.val;
    },
    getIndex : function() {
        return this.index;
    }
	
};
	
function validateEmail(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}
	
    
$(document).ready(function() {
	var dd = new DropDown( $('#dd') );

		var logo_img_src = $('.mob-header-logo img').attr('src');
		$('.header-float-logo img').attr('src', logo_img_src);
	

        $('form[name=newsletter-form]').submit(function(){
        	var email = $(this).children("input").first().val();
        	var reg = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
        	if(email !== "" && validateEmail(email)) {
        		return true;
        	}else if(email === ""){
        		$(this).children("p").html("* Enter your email");
        		return false;
        	}else {
        		$(this).children("p").html("* Invalid email address");
        		return false;
        	}
        });
        $('.my-mob-menu-third').hide();
        $('.toggle-plus-icon').on('click',function(e){
			$(this).next().toggle(500);
			var signClass = $(this).children().prop('class');
			if(signClass == 'fa fa-plus'){
				$(this).html('<i class="fa fa-minus" aria-hidden="true"></i>');
			}
			else{
				$(this).html('<i class="fa fa-plus" aria-hidden="true"></i>');
			}
			// $('.my-mob-menu-third').toggle();
        });	
  
    });

});