define(['modules/jquery-mozu'], function ($) {
	function equalHeight(group) {
	   var tallest = 0;
	   group.each(function() {
	     var thisHeight = $(this).height();
	    /* if(thisHeight===0){
	      $(this).remove();
	     }*/
	      if(thisHeight > tallest) {
	         tallest = thisHeight;
	      }
	   });
	   if(tallest > 0){
	    group.height(tallest);   
	   }
	}
	equalHeight($('.zone-recent-post .recent-post li a'));
	if(window.innerWidth < 830){
		$(".post-img-section").each(function(){
			if($(this).find('.blog-post-summary').length>0){
				$(this).insertAfter($(this).parent().find('.blog-content-section-right'));
			}
		});
	}
});