define(['modules/backbone-mozu','modules/jquery-mozu', 'modules/api'], function (Backbone,$, api) {

	$(document).ready(function() {
		/*$('.lp-customtext > a.readmore').on('click', function(e){
            e.preventDefault();
            if(!$(this).parent().hasClass("open")){
                $(this).parent().addClass("open");
                $(this).text($(this).attr("data-text-readless"));
            }   
            else{
                $(this).parent().removeClass("open");
                $(this).text($(this).attr("data-text-readmore"));
            }
        });*/


        $('.lp-customtext').each(function() {
            var showChar = $(this).find('.maxchardesktop').text();
            if($(window).width() > 767){
                showChar = $(this).find('.maxchardesktop').text();
            }
            else{
                showChar = $(this).find('.maxcharmobile').text();
            }
            var ellipsestext = "...";
            var moretext = $(this).find('.readmoretext').text();
            var lesstext = $(this).find('.readlesstext').text();
            if(moretext === ''){
                moretext = 'read more';
            }
            if(lesstext === ''){
                lesstext = 'hide';
            }
            $(this).find('.more').each(function() {
                var content = $(this).html();

                if(content.length > showChar) {

                    var c = content.substr(0, showChar);
                    var h = content.substr(showChar, content.length - showChar);

                    var html = c + '<span class="moreelipses">'+ellipsestext+'</span><span class="morecontent"><span>'+h+'</span>&nbsp;&nbsp;<a href="javascript:void(0);" class="morelink">'+moretext+'</a></span>';

                    $(this).html(html);
                }

            });
            $(this).find(".morelink").click(function(){
                if($(this).hasClass("less")) {
                    $(this).removeClass("less");
                    $(this).html(moretext);
                } else {
                    $(this).addClass("less");
                    $(this).html(lesstext);
                }
                $(this).parent().prev().toggle();
                $(this).prev().toggle();
                return false;
            });
        });

   });
});