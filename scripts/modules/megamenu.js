define(['modules/jquery-mozu', 'hyprlive'], function ($, Hypr) {
/*global $ */
"use strict";
var wi_width = window.innerWidth;
$(document).ready(function () {
    /* Code for floating header mega menu content */
    if($('.star-header').html())
    {
        var menu_fixed = $('ul.star-header').html();
        $('ul.floating-header-data').empty();
        var flag = $('ul.floating-header-data').append(menu_fixed);
        $('ul.floating-header-data>li').addClass('float-class');
    } 
    var megamenu_contents = $('#mz-drop-zone-megamenu .mz-cms-content').html();
    $('.float-mega-menu').append(megamenu_contents);

     /*$(".promo-add-div .close-promo").click(function(){
        $(this).parent().fadeOut(600);
    });*/
    //$('.main-drop-down').css('visibility','visible');
            var wi_width = window.innerWidth;
       if(wi_width < 961){
        $('.main-drop-down').css('overflow','hidden');
            $('.main-drop-down > ul > li > span').each(function(){
                if($(this).parent().find(".final_third_list").length>0){
                $(this).siblings("a").removeAttr("href");
                 $(this).html('&#10095;');
                }
            }); 
        }
        $(window).resize(function(){
             if(window.innerWidth < 961){
              $('.main-drop-down > ul > li > span').each(function(){
                if($(this).parent().find(".final_third_list").length>0){
                 $(this).siblings("a").removeAttr("href");
                 $(this).html('&#10095;');
                }
            });
          }
        });
   // $('.main-drop-down > ul > li > span').html('&#10095;');
  // $('.main-drop-down').hide(); 
  $('.megamu-wrapper').addClass('Menuloaded');
            window.currentFlag = '';
            if(wi_width > 959){
            $('.megamu-wrapper > ul > li').on('mouseover',function(){
                //$(this).children('.main-drop-down').show();
                $(this).children('.main-drop-down').find(".third-level-div").first().show();
                $('.megamenu_cat').css('visibility','visible');
                var clicked_content = $(this).children('a').text();
                $('.menu_category_heading').text(clicked_content);
            });
            if(('ontouchstart' in window &&  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) || (navigator.MaxTouchPoints > 0)|| (navigator.msMaxTouchPoints > 0)){
                //console.log("touch");
                 $('.megamu-wrapper > ul > li > a').each(function(){
                    $(this).attr('cus-link',$(this).attr('href'));
                    $(this).removeAttr('href');
                 });
            }
            $('.megamu-wrapper > ul > li').on('touchstart',function(){
                if($(this).children('.main-drop-down').css('visibility')=="visible"){
                   // alert("loaded "+$(this).parent().parent().attr('class'));
                    window.location=$(this).find(">a").attr('cus-link');
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
            $(".third-level-div .menu-last-item-block a").on('touchstart',function(e){
               // console.log("click last level ");
                e.stopPropagation();
                   if($(this).attr("href").indexOf("javascript")>-1){
                        return false;
                    }else{
                        window.location=$(this).attr("href");
                        return true;
                    }
            });
            $(".final_third_list .slideDownLastContent a").on('touchstart',function(e){
                //console.log("click third level ");
                e.stopPropagation();
                 if($(this).attr("href").indexOf("javascript")>-1){
                        return false;
                    }else{
                        window.location=$(this).attr("href");
                        return true;
                    }
            });
            $(".main-drop-down > ul > li > a").on('touchstart',function(e){
                //console.log("click level 2 ");
                e.stopPropagation();
            });
            /* $('.megamu-wrapper > ul > li > a').on('touchstart',function(){
                $(this).children('.main-drop-down').show();
                $(this).children('.main-drop-down').find(".third-level-div").first().show();
                $('.megamenu_cat').css('visibility','visible');
                var clicked_content = $(this).children('a').text();
                $('.menu_category_heading').text(clicked_content);
                console.log("tap"+$(this).children('.main-drop-down').css('display'));
            });*/

        }else{
             $('.megamu-wrapper > ul > li ').click(function(event){
                event.stopPropagation();
                if($(this).find(">span").text().length >0){
                    $(this).children('.main-drop-down').show();
                    $(this).children('.main-drop-down').css("visibility","visible");
                    $(this).children('.main-drop-down').find(".third-level-div").first().show();
                    $('.megamenu_cat').css('visibility','visible');
                    var clicked_content = $(this).children('a').text();
                    $('.menu_category_heading').text(clicked_content);
                    window.main_mob_nav=clicked_content;
                    return false;
                }else{
                    return true;
                }
            });
             $('.megamu-wrapper > ul > li > a').on("click touchstart touch",function(e){
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
            /*if(wi_width > 960){
                $('.megamu-wrapper > ul > li').on('mouseout',function(){
                    $(this).children('.main-drop-down').hide();
                });
            }else{
 
            } */
            $('.megamu-wrapper > ul > li > .main-drop-down > ul > li').on('mouseover',function(e){
                window.currentFlag = this;
                $(this).parent().parent().show();
                $('.third-level-div').hide();
               $(this).siblings().css({"background-color":'inherit',"border-left":"5px solid transparent","color":"#888"});
                $(this).siblings().find("a").css("color","rgb(13, 55, 98)");
                $(this).find("a").css("color","#00af9a");
                $(this).find("> div").show();
                $(this).css({"background-color":'#fff',"border-left":"5px solid #00af9a","color":"#00af9a"});
                $('.megamenu_cat').css('visibility','visible');
                event.stopPropagation();
            });
            $('.megamu-wrapper > ul > li > .main-drop-down > ul > li').on('touchstart',function(){
                if($(this).find("> div").css('display')=="block"){
                    //window.location= $(this).find(">a").attr("href");
                }else{
                    window.currentFlag = this;
                    $('.third-level-div').hide();
                    $(this).siblings().css({"background-color":'inherit',"border-left":"5px solid transparent","color":"#00af9a"});
                    $(this).siblings().find("a").css("color","#093663");
                    $(this).find("a").css("color","#00af9a");
                    $(this).find("> div").show();
                    // $(this).find("> div").css("left","0");
                    $(this).css({"background-color":'#fff',"border-left":"5px solid #00af9a","color":"#00af9a"});
                    $('.megamenu_cat').css('visibility','visible');
                    return false;
                }
            });
           
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
             // $('.main-drop-down > ul > li > .third-level-div > .third-level-wrap > .final_third_list > p > span').html('&#x2b;');

    window.main_mob_nav='';
    $('.menu > ul > li:has( > ul)').addClass('menu-dropdown-icon');
    //Checks if li has sub (ul) and adds class for toggle icon - just an UI

    $('.menu > ul > li > ul > li:has( > ul)').addClass('menu-dropdown-icon');

    $('.menu > ul > li > ul:not(:has(ul))').addClass('normal-sub');
    //Checks if drodown menu's li elements have anothere level (ul), if not the dropdown is shown as regular dropdown, not a mega menu (thanks Luka Kladaric)

    $(".menu > ul").before("<a href=\"#\" style=\"color:#fff;\" class=\"menu-mobile\">MENU</a>");
    //Adds menu-mobile class (for mobile toggle menu) before the normal menu
    //Mobile menu is hidden if width is more then 959px, but normal menu is displayed
    //Normal menu is hidden if width is below 959px, and jquery adds mobile menu
    //Done this way so it can be used with wordpress without any trouble

    
    $(".menu > ul > li").mouseover(function (e) {
        if ($(window).width() > 943) {
            $(this).children("ul").stop(true, false).slideDown(300);
            e.preventDefault();
        }
    });  
    $(".menu > ul > li").mouseleave(function (e) {
        if ($(window).width() > 943) {
            $(this).children("ul").stop(true, false).hide();
            e.preventDefault();
        }
    });  
    //If width is more than 943px dropdowns are displayed on hover

    $(".menu > ul > li").click(function (e) {
        if ($(window).width() <= 943) { 
            $(this).children("ul").fadeToggle(150);		
			$(this).toggleClass('menu-dropdown-icon1');	
		e.stopPropagation();
        }
    });
    //If width is less or equal to 943px dropdowns are displayed on click (thanks Aman Jain from stackoverflow)
	$(".menu > ul > li > ul > li").click(function (e) {
        if ($(window).width() <= 943) {
            $(this).children("ul").fadeToggle(150);	
			$(this).toggleClass('menu-dropdown-icon1');		
		e.stopPropagation();
        } 
    });

   /* 
        Session timeout error msg. Hided as per the client request.
   var currentUser = require.mozuData('user');
    if(!currentUser.isAnonymous && !currentUser.isAuthenticated){
        //alert('Login Session get Expired'); shruthi changes as per issure raised ()
        $(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>"+Hypr.getThemeSetting('loginSessionMessage')+"<button id='session-btn-rd'>OK</button></div></div>");
        // alert("Login session expired. Please login with your username and password again.");
    }    
    $("#session-btn-rd").click(function(){
         window.location.href="/logout"; 
    });*/
		 
	/////////////////////////////////
    $(".menu-mobile").click(function (e) {
        $(".menu > ul").toggleClass('show-on-mobile');
        e.preventDefault();
    });
	// $('#float-login').click(function(){
 //        $("html, body").animate({ scrollTop: 0 });
 //        return false;
 //    });   
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
    // My account accordion opens in mobile  
     var x = window.location.hash;
        if(x == '#wishlist'){
            if($('div#tab_5').siblings().find('.panel1').hasClass('show')){
                
                $('div#tab_5').siblings().find('.panel1').removeClass('show');
                $('div#tab_5').siblings().find('button.accordion1').removeClass('active');
                
                $('.my_account_right div#tab_5').css('display','block');
                $('.my_account_right div#tab_5 .panel1').addClass('show');
                $('.my_account_right div#tab_5 button.accordion1').addClass('active');
            }
        } 
        $('#tab_5').on('click', function(){
            $('.my_account_right #tab_5').css('display','block');
        });
/*
         */

            $('.megamu-wrapper > ul > li > ul > li').click(function(){
                var category_name2 = $(this).children('a').text();
            });
             
            if(wi_width < 960){
                 $('.main-drop-down > ul > li > a').on('click touchstart touch', function(event){
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
                 $(".megamu-wrapper .menu-last-item-block a").click(function(){
                    window.location=$(this).attr("href");
                });
                // $('.final_third_list > ul').addClass('mbl-menu-open');
                $('p.slideDownLastContent').on('click', function(event){
                     event.stopPropagation();
                    var me = this;
                    $('.final_third_list > ul').not($(this).parent().find('ul')).removeClass('mbl-menu-open');
                    //$(this).parent().parent().find('ul').toggle();
                    $(this).parent().find('ul').toggleClass('mbl-menu-open');
                    $('p.slideDownLastContent span').not($(this)).html('&#x2b;');
                    if($(this).parent().find('ul').hasClass('mbl-menu-open')) {
                        $(me).parent().find('span').html('&#x2212;');
                    }else {
                        $(me).parent().find('span').html('&#x2b;');
                        //$(me).html('&#x2b;'); 
                    }
                });
                 $('p.slideDownLastContent a').on('click touch', function(eve){
                     eve.stopPropagation();
                    var me = this;
                    $('.final_third_list > ul').not($(this).parent().parent().find('ul')).removeClass('mbl-menu-open');
                    //$(this).parent().parent().find('ul').toggle();
                    $(this).parent().parent().find('ul').toggleClass('mbl-menu-open');
                    $('p.slideDownLastContent span').not($(this)).html('&#x2b;');
                    if($(this).parent().parent().find('ul').hasClass('mbl-menu-open')) {
                        $(me).parent().parent().find('span').html('&#x2212;');
                    }else {
                        $(me).parent().parent().find('span').html('&#x2b;');
                        //$(me).html('&#x2b;'); 
                    }
                });
            }
            $('.menu-toggle').on('click',function(){
                $('.megamu-wrapper').css('display','block');
            });
            $('.megamenu-close-btn').on('click',function(){
                 $('.megamu-wrapper').css('display','none');
            });
            if(wi_width < 961){
                $('.megamu-wrapper > ul > li > span').each(function(){
                    if($(this).find("+div").length>0){

                     $(this).html('&#10095;');
                    $(this).siblings("a").removeAttr("href");
                    }
                });
                 $('p.slideDownLastContent span').each(function(){
                     if($(this).parent().parent().find('ul').length>0){
                        $(this).siblings("a").removeAttr("href");
                             $(this).html('&#x2b;');
                    }else{
                         $(this).css('display','none');
                    }
                 });
            }
            $(window).resize(function(){
                if(window.innerWidth < 961){
                    //$('.menu_category_heading').text('');
                    $('.megamu-wrapper > ul > li > span').each(function(){
                        if($(this).find("+div").length>0){
                            $(this).html('&#10095;');
                            $(this).siblings("a").removeAttr("href");
                            //console.log("removed for "+ $(this).siblings("a").text());
                        }
                    });
                     $('p.slideDownLastContent span').each(function(){
                         if($(this).parent().parent().find('ul').length>0){
                            if($(this).parent().parent().find('ul').hasClass("mbl-menu-open")){
                                $(this).html('&#x2212;');
                            }else{
                                 $(this).html('&#x2b;');
                            }
                        }else{
                             $(this).css('display','none');
                        }
                     });
                     $('p.slideDownLastContent span').on('click', function(){
                    var me = this;
                    $('.final_third_list > ul').not($(this).parent().parent().find('ul')).removeClass('mbl-menu-open');
                    $(this).parent().parent().find('ul').toggleClass('mbl-menu-open');
                    $('p.slideDownLastContent span').not($(this)).html('&#x2b;');
                    if($(this).parent().parent().find('ul').hasClass('mbl-menu-open')) {
                        $(me).html('&#x2212;');
                    }else {
                        $(me).html('&#x2b;');
                    }
                    /*$(this).parent().parent().find('ul').slideToggle(function(){
                     $('.final_third_list > ul').not($(this).parent().parent().find('ul')).css('display','none');
                    });*/
                });
                }
            });
            $('.mz-accountaddressbook-list.mz-l-tiles li').each(function(i, el){
                $(this).find('h3 span').text(i+1);
            });
    });   
    //when clicked on mobile-menu, normal menu is shown as a list, classic rwd menu story (thanks mwl from stackoverflow)



});
