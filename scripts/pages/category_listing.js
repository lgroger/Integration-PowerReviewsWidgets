define(['modules/jquery-mozu'], function($) {
	$(function(){
		$('#btn_show_all').click(function(){
        	$('.more_catgories').css('display','inline-block');
        	$(this).hide();

        }); 
	});
});