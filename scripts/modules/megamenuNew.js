define(['modules/jquery-mozu', 'hyprlive','underscore'], function ($, Hypr,_) {
/*global $ */
"use strict";
var wi_width = window.innerWidth;
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
$(document).ready(function () {
/* it looks like this was used for NextTag checkout conversion which is now disabled
    var pagecontext = [];

     if($.cookie('pageurlclick') !== undefined){
            var recent= $.cookie('pageurlclick');  
            pagecontext = recent.split(","); 
            
            
                pagecontext.push(require.mozuData('pagecontext').url);
                $.cookie('pageurlclick',pagecontext,{path: '/', expires: 1 }); 
        }
        else{ 
            pagecontext.push(require.mozuData('pagecontext').url);
            $.cookie('pageurlclick',pagecontext,{path: '/', expires: 1 });
        }

*/
        

    /* Code for floating header mega menu content */
    $(".menu-cols-count").each(function(){
    $(this).parent().parent().addClass($(this).attr("data-len"));
    });
    var megamenu_contents = $('#mz-drop-zone-megamenu .mz-cms-content').html();
    $('.float-mega-menu').append(megamenu_contents);
    if($('.star-header').html())
    {
        var menu_fixed = $('ul.star-header').html();
        $('ul.floating-header-data').empty();
        var flag = $('ul.floating-header-data').append(menu_fixed);
        $('ul.floating-header-data>li').addClass('float-class');
    } 

            var wi_width = window.innerWidth;
  
        if(wi_width>1024){
          $("#mz-drop-zone-megamenu .mega-menu-container").each(function(){
                equalHeight($(this).find(".menu-column-block"));            
                $(this).find(".menu-column-block:last").addClass("last-child");
            });
          $("body").on("mouseover",".float-mega-menu .megamenu-wrapper-new.Menuloaded>ul>li",function(){
            $(this).find(".mega-menu-container").each(function(){
                    equalHeight($(this).find(".menu-column-block"));            
                    $(this).find(".menu-column-block:last").addClass("last-child");
                });
          });
        }

  /* */
  $('.megamu-wrapper').addClass('Menuloaded');
            window.currentFlag = '';
            if(wi_width > 1024){
           
            if(('ontouchstart' in window &&  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) || (navigator.MaxTouchPoints > 0)|| (navigator.msMaxTouchPoints > 0)){
                //console.log("touch");
                 $('.megamu-wrapper > ul > li > a').each(function(){
                    $(this).attr('cus-link',$(this).attr('href'));
                    $(this).removeAttr('href');
                 });
            }
            $('.megamu-wrapper > ul > li').on('touchstart click',function(){
                if($(this).children('.main-drop-down').css('visibility')=="visible"){
                   if($(this).find(">a").attr('cus-link')){
                    window.location=$(this).find(">a").attr('cus-link');
                   }
                    
                }else{
                    $('.main-drop-down').not($(this)).css('visibility','hidden');
                    $(this).children('.main-drop-down').css("visibility","visible");
                    $(this).children('.main-drop-down').css("max-height","600px");
                    $(this).children('.main-drop-down').find(".third-level-div").first().show();
                    $('.megamenu_cat').css('visibility','visible');
                    var clicked_content = $(this).children('a').text();
                    $('.menu_category_heading').text(clicked_content);
                    console.log("tap ");
                    console.log("tap"+$(this).children('.main-drop-down').css('display'));
                }

            });
        }else{
             $('.megamu-wrapper > ul > li ').click(function(event){
                event.stopPropagation();
                if($(this).find(">span").text().length >0){
                    $(this).children('.main-drop-down').show();
                    $(this).children('.main-drop-down').css("visibility","visible");
                    $(this).children('.main-drop-down').find(".third-level-div").first().show();
                    $('.megamenu_cat').css('visibility','visible');
                    var clicked_content = $(this).children('a').text();
                    if(clicked_content.length === 0){
                        clicked_content= $(this).children('h2').text();
                    }
                    $('.menu_category_heading').text(clicked_content);
                    window.main_mob_nav=clicked_content;
                    return false;
                }else{
                    return true;
                }
            });
             $('.megamu-wrapper > ul > li > a','.megamu-wrapper > ul > li > h2 > a').on("click touchstart touch",function(e){
                e.stopPropagation();
                 e.preventDefault();
                if($(this).parent().find(">span").text().length >0){
                    $(this).parent().children('.main-drop-down').show();
                     $(this).parent().children('.main-drop-down').css("visibility","visible");
                    $(this).parent().children('.main-drop-down').find(".third-level-div").first().show();
                    $('.megamenu_cat').css('visibility','visible');
                    var clicked_content = $(this).text();
                    $('.menu_category_heading').text(clicked_content);
                    window.main_mob_nav=clicked_content;
                    return false;
                }else{
                    if($(this).attr("href").indexOf("javascript")>-1){
                        return false;
                    }else{
                        window.location=$(this).attr("href");
                        return true;
                    }
                }
            });

        }
            if(('ontouchstart' in window)){

                $('.megamu-wrapper .menu-column-block > h3 ').on('touchstart',function(){
                    //console.log("checked");
                    if($(this).find("+ul li").length>0){
                        $(this).not($(this).parent().parent().find('ul')).removeClass('show-menu-sub');
                        $(this).find("+ul").toggleClass('show-menu-sub');
                        if($(this).find("+ul+h3").length ===0){
                            $(this).parent().find("+div ul").each(function(){
                                if(!$(this).prev().is("h3")){
                                     $(this).toggleClass('show-menu-sub');
                                }
                            });
                        }
                        if($(this).find("+ul").hasClass('show-menu-sub')){
                            $(this).find("span").addClass("arrow-rotate");
                        }else{
                            $(this).find("span").removeClass("arrow-rotate");
                        }
                    }else if($(this).find(">a").attr("href").indexOf("javascript")===-1){
                        window.location=$(this).find(">a").attr("href");
                    }
                });
            }else{
                  if($(window).width()<1200){
                   $('.megamu-wrapper .menu-column-block > h3 ').on('click',function(){
                    //console.log("checked");
                    if($(this).find("+ul li").length>0){
                        $(this).not($(this).parent().parent().find('ul')).removeClass('show-menu-sub');
                        $(this).find("+ul").toggleClass('show-menu-sub');
                        if($(this).find("+ul+h3").length ===0){
                            $(this).parent().find("+div ul").each(function(){
                                if(!$(this).prev().is("h3")){
                                     $(this).toggleClass('show-menu-sub');
                                }
                            });
                        }
                        if($(this).find("+ul").hasClass('show-menu-sub')){
                            $(this).find("span").addClass("arrow-rotate");
                        }else{
                            $(this).find("span").removeClass("arrow-rotate");
                        }
                    }else if($(this).find(">a").attr("href").indexOf("javascript")===-1){
                        window.location=$(this).find(">a").attr("href");
                    }
                });
                }
            }
           
            $('.main-drop-down > ul > li ').on('click', function(event){
                event.stopPropagation();
                //console.log("clicked level 2");
                if($(this).find(">span").text().length>0){
                    $(this).children('.third-level-div').css('left','0px');
                    var clicked_content = $(this).children('a').text();
                    $('.menu_category_heading').text(clicked_content);
                    return false;
                }else{
                    return true;
                }
            });

            $('.back-to-main-cat').click(function(){
                if($(window.currentFlag).children('.third-level-div').css('left') === '0px') {
                    $(window.currentFlag).children('.third-level-div').css("left",'100%');
                    $('.menu_category_heading').text(window.main_mob_nav);
                }else {
                    $('.main-drop-down').hide();
                    $('.megamenu_cat').css('visibility','hidden');

                }
            });

    window.main_mob_nav='';
    

 
    $(".menu-mobile").click(function (e) {
        $(".menu > ul").toggleClass('show-on-mobile');
        e.preventDefault();
    });
  
    $(document).on('click','.mz-creditcard-cancel, .back-to-top-pdp, .selected-filter  a',function(){
        $(document).scrollTop(0); 
    }); 

    $('.prof-cancel').on('click', function(){
        $('#other-relation').attr('checked', false);
        $('.other-relation').css('display','none');
    }); 
     
    $(".header-search-icon").on('click',function(){
        $('body').addClass('seach_overflow');  
        $('.search-overlay').show();
        return false;
    });
    $(document).on('click', '.close', function(){
        $('body').removeClass('seach_overflow');
        $('.search-overlay').hide();
    });

            $('.megamu-wrapper > ul > li > ul > li').click(function(){
                var category_name2 = $(this).children('a').text();
            });
             
            if(wi_width < 1025){
                 $('.main-drop-down > ul > li  a').on('click touchstart touch', function(event){
                    event.stopPropagation();
                     event.preventDefault();
                //console.log("clicked level 2");
                if($(this).parent().find(">span").text().length>0){
                    $(this).parent().children('.third-level-div').css("left","0px");
                    $(this).parent().children('.third-level-div').css("display","block");
                    var clicked_content = $(this).text();
                    $('.menu_category_heading').text(clicked_content);
                    return false;
                }else{
                     if($(this).attr("href").indexOf("javascript")===-1){
                        window.location=$(this).attr("href");
                    }else{
                        return false;
                    }
                }
            });
                 $(".menu-column-block > ul > li > a").click(function(){
                    window.location=$(this).attr("href");
                });
            }
            $('.menu-toggle').on('click',function(){
                $('.megamu-wrapper').css('display','block');
            });
            $('.megamenu-close-btn').on('click',function(){
                 $('.megamu-wrapper').css('display','none');
            });
            if(wi_width < 1025){
                $('.megamu-wrapper > ul > li > span').each(function(){
                    if($(this).find("+div").length>0){

                     $(this).html('&#10095;');
                    $(this).siblings("a").removeAttr("href");
                    }
                });
                $(".megamu-wrapper .mega-menu-container .menu-column-block h3").each(function(){
                    if($(this).find("+ul li").length >0 ){
                        $(this).find("span").html("&#10095;");
                    }
                });
            }
             $(window).resize( _.debounce(function() {
                 if(window.innerWidth < 1025){
                    //$('.menu_category_heading').text('');
                    $('.megamu-wrapper > ul > li > span').each(function(){
                        if($(this).find("+div").length>0){
                            $(this).html('&#10095;');
                            $(this).siblings("a").removeAttr("href");
                            //console.log("removed for "+ $(this).siblings("a").text());
                        }
                    });
                    
                }else{
                    //$(".megamenu-wrapper-new").css("display","block");
                    $("#mz-drop-zone-megamenu .mega-menu-container").each(function(){
                        equalHeight($(this).find(".menu-column-block"));            
                        $(this).find(".menu-column-block:last").addClass("last-child");
                    });
                    $(".main-drop-down").removeAttr("style");
                    $(this).find(".mega-menu-container").each(function(){
                    equalHeight($(this).find(".menu-column-block"));            
                    $(this).find(".menu-column-block:last").addClass("last-child");
                    });
                }   


                $("body").on("mouseover",".float-mega-menu .megamenu-wrapper-new.Menuloaded>ul>li",function(){
          });
            }, 300));

            $('.mz-accountaddressbook-list.mz-l-tiles li').each(function(i, el){
                $(this).find('h3 span').text(i+1);
            });
    });   
    //when clicked on mobile-menu, normal menu is shown as a list, classic rwd menu story (thanks mwl from stackoverflow)


});


