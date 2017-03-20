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
	
	$.fn.doubleTapToGo = function( params )
	{
		if( !( 'ontouchstart' in window ) &&
			!navigator.msMaxTouchPoints &&
			!navigator.userAgent.toLowerCase().match( /windows phone os 7/i ) ) return false;

		this.each( function()
		{
			var curItem = false;

			$( this ).on( 'click', function( e )
			{
				var item = $( this );
				if( item[ 0 ] != curItem[ 0 ] )
				{
					e.preventDefault();
					curItem = item;
				}
			});

			$( document ).on( 'click touchstart MSPointerDown', function( e )
			{
				var resetItem = true,
					parents	  = $( e.target ).parents();

				for( var i = 0; i < parents.length; i++ )
					if( parents[ i ] == curItem[ 0 ] )
						resetItem = false;

				if( resetItem )
					curItem = false;
			});
		});
		return this;
	};
	
	$( function(){
	    $( '#blog-nav li:has(ul)' ).doubleTapToGo();
	});
});