define(['modules/jquery-mozu', 'modules/api', 'vendor/jQuery.selectric'], function ($, api) {
	$(function(){
			$(".careers-list-item h3").click(function(){
			if($(this).hasClass('show-careers')){
				$(this).removeClass('show-careers');
			}else{
				$(".careers-list-item h3").removeClass('show-careers');
				$(this).addClass('show-careers');
				// if($(window).scrollTop()>160){
				// 	var offset = $(this).offset();
				// 	$('html, body').animate({
				// 	    scrollTop: offset.top- $(this).outerHeight()-8,
				// 	    scrollLeft: offset.left
				// 	});
				// }
			}
		});
	});
});