define(['modules/jquery-mozu',"modules/login-links"],function($,LoginLinks){
	$(function(){
		//Login-link  
		if(!require.mozuData('user').isAnonymous){
			// already logged in
			$('.footer-binding-link-login a').text('Log Out')
				.prop('href','/logout').attr('data-mz-action',"logout");
		}
		else{
			$('.footer-binding-link-login a').on('click',function(e){
				//console.log('isAnonymous click');
				e.preventDefault();
				LoginLinks.triggerLogin();			
				if($( window ).width() <=1024 ){
					$("html, body").animate({ scrollTop: 0 }, "slow");
				}
			});
		}
		//My-wishlist link
		$('.footer-binding-link-wishlist a').on('click',function(e){
			if(require.mozuData('user').isAnonymous)
			{ //not logged in
				e.preventDefault();			
				LoginLinks.triggerLogin();
			}
			else
			{
				// $(this).prop('href','/myaccount#wishlist');
				window.location='/myaccount#wishlist';
			}
		});

	});
});