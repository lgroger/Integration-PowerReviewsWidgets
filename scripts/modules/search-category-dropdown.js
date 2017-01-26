require(["modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api){

        function getContextifyWorkDone() {
            var sel = $('a[data-mz-contextify]').attr('data-mz-contextify');
            var catVal = $('a' + sel).html();
            // catVal = $.trim(catVal).substring(0, 5);
            $('.sel_category').html(catVal + "<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
            // $('.sel_category').html(catVal + "<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
        }
        function selectCategoryTitle(obj) {
                if(obj!==undefined){  
                    $('input[name=categoryId]').each(function(){
                        $(this).val($(obj).attr('search-data'));  
                    });
                    var sel_val = $(obj).html();
                    if(sel_val.length >= 10){
                         // sel_val = $.trim(sel_val).substring(0, 10).split(" ").slice(0, -1).join(" ") + "..."; 
                         // sel_val = $.trim(sel_val).substring(0, 5);
                    }
                    $('.sel_category').html(sel_val + "<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
                    $("#search-categories").removeClass('visible');
                    $("#search-categories_1").removeClass('visible');
                    $("#search-categories_2").removeClass('visible'); 
                    // $('#s_cat_1').html(sel_val + "<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
                    // $("#search-categories_1").css('visibility', 'hidden');
                } 

            }
    	$(function(){
            $("#s_cat,#s_cat_1,#s_cat_2").click(function(e) {
                var target = null;
                if($(e.target).hasClass("sel_category")) {
                    target = e.target;
                }else {
                    target = $(e.target).parents(".sel_category");
                }
                $(target).siblings("ul.subnav").toggleClass('visible');
                $(target).find('span>i').toggleClass('fa-caret-up').toggleClass('fa-caret-down');
            });
            /*
            $("#s_cat,#s_cat_1,#s_cat_2").click(function(e) {
                $(e.target).siblings("ul.subnav").toggleClass('visible');
                $(e.target).find('span>i').toggleClass('fa-caret-up').toggleClass('fa-caret-down');
            });
            */
    		var cat_list = Hypr.getThemeSetting('categoryForSearchDropdown');
    		var args_str = '(';
            if(cat_list && cat_list.length > 0){
        		for(var i=0;i<cat_list.length;i++)
        		{
        			args_str += 'categoryId eq '+cat_list[i];
        			if(i != cat_list.length-1 )
        			{
        				args_str += ' or';
        			}
        			else
        			{
        				args_str += ')'; 
        			}
        		}
        		var li_str = '';
                try{
                        var allProductsCategoryCode = Hypr.getThemeSetting('allProductsCategoryCode');
                		var url = '/api/commerce/catalog/storefront/categories/?filter='+args_str;
                		api.request('GET',url).then(function(dt){
                			if(dt.items.length > 0)
                			{
            					$(dt.items).each(function(i){
            						if(i === 0 )
            						{
            							li_str = '<li><a value="'+allProductsCategoryCode+'" search-data="'+allProductsCategoryCode+'" title="All Categories">All</a></li>';			
            						}
            						else{
            							li_str += '<li><a value="'+dt.items[i].categoryId+'" search-data="'+dt.items[i].categoryId+'" title="'+dt.items[i].content.name+'">'+dt.items[i].content.name+'</a></li>';
            						}
            	    			});
                				$("#search-categories").append(li_str);
                                $("#search-categories_1").append(li_str);
                                $("#search-categories_2").append(li_str);
                			}
                           /* if(require.mozuData('pagecontext').pageType == 'search')
                            {
                                getContextifyWorkDone();
                            }*/
                            var defaultSelect= $("#search-categories > li > a[value=" + require.mozuData('pagecontext').categoryId + "]").get();
                           if(require.mozuData('pagecontext').categoryId!==undefined && defaultSelect.length>0){
                             selectCategoryTitle($("#search-categories > li > a[value=" + require.mozuData('pagecontext').categoryId + "]").get());
                            }
                		});
                }catch(err){
                    console.log('Error occured. : '+err);
                }
            }
    		$(document).on('click','#search-categories a,#search-categories_1 a,#search-categories_2 a', function(){
	            selectCategoryTitle(this);
	        });
            //To close dropdown on click of document.
            $(document).on('click touchstart',function(e){ 
                if($(e.target).closest('li#options').length < 1){ 
                    $('#s_cat > span.caret-all').remove();
                    $('#s_cat').append("<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
                    $("#search-categories").removeClass('visible');


                    $('#s_cat_1 > span.caret-all').remove();
                    $('#s_cat_1').append("<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
                    $('#search-categories_1').removeClass('visible'); 


                    $('#s_cat_2 > span.caret-all').remove();
                    $('#s_cat_2').append("<span class='caret-all'><i class='fa fa-caret-down'></i></span>");
                    $('#search-categories_2').removeClass('visible'); 
                }
            }); 

	        var res_title_str = '';
	        res_title_str += '<div class="search-dropdown-container">';
	        // res_title_str += '<h3 style="font-size: inherit;    color: #093863;">Search Suggestions</h3><a href="javascript:void(0);">HollyWood themes</a><br/><a href="javascript:void(0);">HollyWood prom themes</a><br/><a href="javascript:void(0);">HollyWood backdrops</a>';
	        res_title_str += '<h3 style="font-size: inherit;color: #093863;">Products</h3></div>';
	        $('.tt-dropdown-menu').prepend(res_title_str);
    	});
    });   