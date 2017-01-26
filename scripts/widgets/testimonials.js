define(['modules/jquery-mozu', 'vendor/testimonial/jquery.flexslider-min'], function ($) {

$(document).ready(function() {
		try{
				/*Testimonial slider*/
			if($('.cd-testimonials-wrapper').length>0){   
				
				$('.cd-testimonials-wrapper').flexslider({
					selector: ".cd-testimonials > li",
					animation: "slide",
					controlNav: false,
					slideshow: false,
					smoothHeight: true,
					start: function(){
						$('.cd-testimonials').children('li').css({
							'opacity': 1,
							'position': 'relative'
						});
					}
				});
				$('.echi-shi-testimonials .flex-direction-nav li a').html('');
		   		$('.echi-shi-testimonials .flex-direction-nav li a').append('<span></span>');
			}
		}catch(e){
			console.log(e);
		}

		//open the testimonials modal page
		$('.cd-see-all').on('click', function(){
			$('.cd-testimonials-all').addClass('is-visible');
		});

		//close the testimonials modal page
		$('.cd-testimonials-all .close-btn').on('click', function(){
			$('.cd-testimonials-all').removeClass('is-visible');
		});
		$(document).keyup(function(event){
			//check if user has pressed 'Esc'
	    	if(event.which=='27'){
	    		$('.cd-testimonials-all').removeClass('is-visible');	
		    }
	    });
	}); //Ready end
});