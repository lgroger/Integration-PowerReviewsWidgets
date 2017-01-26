require(["modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api){
        function getContextifyWorkDone() {
            var sel = $('a[data-mz-contextify]').attr('data-mz-contextify'); 
            var catVal = $('a' + sel).html();
            catVal = $.trim(catVal).substring(0, 5);
            $('#s_cat_1').html(catVal + "<span class='caret-all'>▾</span>");
        }

    	$(function(){

    
            function selectCategoryTitle1(obj) {
                // $('input[name=categoryId]').val($(this).attr('search-data'));
                $('input[name=categoryId]').each(function(){
                    $(this).val($(obj).attr('search-data'));  
                });
                var sel_val = $(obj).html();  
                if(sel_val.length >= 10){
                    /* sel_val = $.trim(sel_val).substring(0, 10).split(" ").slice(0, -1).join(" ") + "..."; */
                    sel_val = $.trim(sel_val).substring(0, 5);
                }
                $('#s_cat_1').html(sel_val + "<span class='caret-all'>▾</span>");
                $("#search-categories_1").css('visibility', 'hidden');
            }
    		$(document).on('click','#search-categories_1 a', function(){
	            selectCategoryTitle1(this);  
	        });
            //To close dropdown on click of document.
            $(document).on('click',function(e){  
                if($(e.target).closest('li#options').length < 1){ 
                    $('#s_cat_1 > span.caret-all').remove();
                    $('#s_cat_1').append("<span class='caret-all'>▾</span>");
                    $("#search-categories_1").css('visibility', 'hidden'); 
                }
            });
    	});
    });  