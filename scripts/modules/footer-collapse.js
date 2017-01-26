define(['modules/jquery-mozu', 'modules/api' , 'modules/jquery.slicknav', 'vendor/testimonial/jquery.flexslider-min','vendor/testimonial/masonry.pkgd.min'], function ($, api) {

	$(document).ready(function(){
	$('.ech-shi-footer-links ul li ul li:first-child').click(function(){
		$(this).css('color','#900');
		$(this).parent().children().not(':first').toggle();
		$(this).find('i').toggleClass('fa-caret-down fa-caret-up');
	});
});
	});