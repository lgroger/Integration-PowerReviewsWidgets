define(['modules/jquery-mozu'], function ($) {

	$(document).ready(function(){
	$('.ech-shi-footer-links ul li ul li:first-child').click(function(){
		$(this).css('color','#900');
		$(this).parent().children().not(':first').toggle();
		$(this).find('i').toggleClass('fa-caret-down fa-caret-up');
	});
});
	});