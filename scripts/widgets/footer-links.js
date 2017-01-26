define(['modules/jquery-mozu'],function($){
	$(function(){     
		//Login-link  
		if(!require.mozuData('user').isAnonymous){
			$('.footer-binding-link-login a').text('Log Out')
				.prop('href','/logout');
		}
		$('.footer-binding-link-login a').on('click',function(){
			if(require.mozuData('user').isAnonymous)
			{ //not logged in				
				triggerLoginPop();			
				if($( window ).width() <=1024 ){
				$("html, body").animate({ scrollTop: 0 }, "slow");
				}
			}
			else
			{	//logged-in
				$(this).text('Log Out')
				.prop('href','/logout');
			}
		});   
		//My-wishlist link
		$('.footer-binding-link-wishlist a').on('click',function(){
			if(require.mozuData('user').isAnonymous)
			{ //not logged in				
				triggerLoginPop();
			}
			else
			{
				// $(this).prop('href','/myaccount#wishlist');
				window.location='/myaccount#wishlist';
			}
		});

	});
	function triggerLoginPop(){
		$('.trigger-login').trigger('click');
        $('#cboxOverlay').show();
	}
});