define(['modules/backbone-mozu','modules/jquery-mozu', 'modules/api'], function (Backbone,$, api) {
	

	$(document).ready(function(){
            $('.showmorelink').append('<span class="icon"></span>');
        $('.categories .parent').on('click', function(e){
            e.stopPropagation();
            if($(this).hasClass("mob-menu")){
                if(!$(this).hasClass("open")){
                    $(this).addClass("open");
                    $(this).parent().next().slideDown();
                }
                else{
                    $(this).removeClass("open");
                    $(this).parent().next().slideUp();
                }
            }   
            else{
                if(!$(this).hasClass("open")){
                    $(this).addClass("open");
                    $(this).next().slideDown();
                }
                else{
                    $(this).removeClass("open");
                    $(this).next().slideUp();
                }
            }
        });


        $('.showmorelink a').on('click', function(e){
            e.preventDefault();
            if(!$(this).hasClass("open")){
                $(this).addClass("open");
                $(this).closest('.showmorelink').addClass('open');
                $(this).parent().parent().find('.expandmore').show();
            }   
            else{
                $(this).removeClass("open"); 
                $(this).closest('.showmorelink').removeClass('open');
                $(this).parent().parent().find('.expandmore').hide();
            }
        });
        $('.showmorelink .icon').on('click', function(e){
            jQuery('.showmorelink a').trigger('click');
        });

    });
});