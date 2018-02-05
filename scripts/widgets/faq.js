define(['modules/jquery-mozu', 'vendor/jQuery.selectric'], function ($) {
	$(function(){
		$(".faq-main-wrap").parent().css("padding","0 10px");
		//console.log("init faq ");
		//console.log($(".faq-category-section .faq-list-item>h3"));
		$(".faq-category-section .faq-list-item>h3").click(function(){
			//console.log("click faq");
			if($(this).hasClass('show-faq')){
				$(this).removeClass('show-faq');
			}else{
				$(".faq-list-item>h3").removeClass('show-faq');
				$(this).addClass('show-faq');
				if($(window).scrollTop()>160){
					var offset = $(this).offset();
					$('html, body').animate({
					    scrollTop: offset.top- $(this).outerHeight()-8
					},'fast');
				}
			}
		});

		$(".faq-side-column>ul>li").click(function(){
			//console.log($(this).index());
			$(".faq-side-column>ul>li>span").removeClass("current");
			$(this).find(">span").addClass("current");
			$('.faq-category-section').removeClass("show-section");
			$(".faq-category-section:eq('"+$(this).index()+"')").addClass("show-section");
				if($(window).scrollTop()>160){
					var offset = $(".faq-page-title").offset();
					//console.log("animate");
					$('html, body').animate({
					    scrollTop: offset.top
					},'slow');
				}
			
		});
	});
});