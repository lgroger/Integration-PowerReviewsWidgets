define(["modules/jquery-mozu"], function($){
	$(document).ready(function(){
		var access_token = $("[instagram-data]").attr("instagram-data");
	    /* 3251805256.0645b57.e678902252824ae4aec55c770755e6e1 */
	    var sbi_page_url = "https://api.instagram.com/v1/users/3251805256/media/recent/?access_token=" + access_token;
		$.ajax({
	        method: "GET",
	        url: sbi_page_url,
	        dataType: "jsonp",
	        success: function(obj) {
	        	var item = null;
	        	var image = null;
	        	var imageCount = window.parseInt( $(".mz-instagram-slider[insta-count]").attr("insta-count") ); 
	        	if(obj.data){
		        	for(var i = 0; i < obj.data.length; i++) {
		        		item = $("<div/>").addClass("item").appendTo(".mz-instagram-slider > .owl-carousel").get();
		        		image = $("<img>").attr("src", obj.data[i].images.standard_resolution.url).get();
		        		$("<a/>").attr('target','_blank').attr("href", obj.data[i].link).append(image).appendTo(item);
		        	}
		        	$(".mz-instagram-slider > .owl-carousel").owlCarousel({dots:false,nav:true,loop:true,responsiveClass:true,responsive:{
				        0:{
				            items:2,
				            nav:true
				        },
				        600:{
				            items:3,
				            nav:false
				        },
				        1000:{
				            items:5,
				            nav:true,
				            loop:true
				        }
	    			}}).owlCarousel('refresh');
		        }
	    	}
		});
	});
});