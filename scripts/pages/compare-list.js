define(['modules/jquery-mozu', 'modules/api'], function($, Api){
    function getErrorTemplate(){
        var template = "<div class='compare-full-error-container'>";
        template += "<div class='compare-error-container'>";
        template += "<p>Only 3 products can be compared at once.</p>";
        template += "<p>You already have 3 products in Compare</p>";
        template += "<button>OK</button>";
        template += "<a href='javascript:void(0)' class='close-btn'>x</a>";
        template += "</div>";
        template += "</div>";
        return $(template);
    }
	function setCookie(cname, cvalue, exdays) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + "; path=/;" + expires;
	}

	function getCookie(cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i = 0; i < ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) === 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}

    function enableDisableCompareBtn(compareProduct) {
        var compareProductTemp = compareProduct.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        if(compareProduct !== "") {
            var productCodeArray = compareProductTemp.split(',');
            if(productCodeArray.length > 1) {
                /* Enable Btn */
                $('button.compare-btn').removeClass("disabled");
            }else {
                /* Disabled Btn */
                $('button.compare-btn').addClass("disabled");
            }
        }else {
            /* Disabled Btn */
            $('button.compare-btn').addClass("disabled");
        }
    }

	function removeProduct(productCode) {
		var compareProduct = getCookie('compareProduct');
		compareProduct = compareProduct.replace(productCode, '');
		compareProduct = compareProduct.replace(',,', ',');
        enableDisableCompareBtn(compareProduct);
		setCookie('compareProduct', compareProduct);
		initCompare();
        //$('.compare-btn > a').removeClass("disable").html("ADD TO COMPARE");
	}

	function removeAllProduct() {
		setCookie('compareProduct', false);
		initCompare();
        //$('.compare-btn > a').removeClass("disable").html("ADD TO COMPARE");
	}

    $(document).on('click', '.compare-btn > a', function(){
    	var productCode = $(this).attr('data-pro-id');
    	var compareProduct = getCookie('compareProduct');
    	var compareProductTemp = compareProduct.replace(/(^[,\s]+)|([,\s]+$)/g, '');
    	if(compareProduct !== "") {
    		var productCodeArray = compareProductTemp.split(',');
    		if(compareProduct.search(productCode) === -1 && productCodeArray.length < 3) {
	    		compareProduct += (productCode + ",");
	    		setCookie('compareProduct', compareProduct);
                initCompare();
	    	}else {
                if(productCodeArray.length === 3) {
                    var template = getErrorTemplate();
                    $(document.body).append(template);
                }else{
                    $('body').append('<div class="compare-full-error-container"><div class="compare-error-container"><p> This item is already available in comparison slot..!</p><button>OK</button><a href="javascript:void(0)" class="close-btn">x</a></div></div>');
                }
                     $(".compare-full-error-container").find(".close-btn").click(function() {
                        $(".compare-full-error-container").remove();
                    });
                    $(document.body).find(".compare-full-error-container").click(function(e) {
                        if(e.target !== e.currentTarget) return;
                        $(".compare-full-error-container").find(".close-btn").trigger('click');
                    });
                    $('.compare-full-error-container').find(".compare-error-container > button").click(function(){
                        $('.compare-full-error-container').find(".close-btn").trigger('click');
                    });

            }
    	}else {
    		compareProduct += (productCode + ",");
	    	setCookie('compareProduct', compareProduct);
            initCompare();
    	}
    });

    function addProductDetailsToCompareSlot(i, data) {
    	$('.compare-product-container').show();
    	Api.get('product', data).then(function(res){
    		var imagePath = "";
    		$('#mz-cp-0' + (i + 1)).empty();
    		if(res.data.content.productImages.length > 0) {
    			imagePath = res.data.content.productImages[0].imageUrl;
    			$('<img/>').attr('src', imagePath).appendTo('#mz-cp-0' + (i + 1));
    		}else {
    			$('<span/>').addClass('no-image').appendTo('#mz-cp-0' + (i + 1));
    		}
	    	$('<a/>').data('prodID', data).addClass('mz-cp-close').html("✖").appendTo('#mz-cp-0' + (i + 1));
    	});
    }

    function initCompare(){
    	var compareProduct = getCookie('compareProduct');
    	$('#mz-cp-01,#mz-cp-02,#mz-cp-03').empty();
    	compareProduct = compareProduct.replace(/(^[,\s]+)|([,\s]+$)/g, '');
        enableDisableCompareBtn(compareProduct);
    	if(compareProduct !== "") {
    		var productCodeArray = compareProduct.split(',');
            if(productCodeArray.length > 0) {
                for(var i = 0; i < productCodeArray.length; i++) {
                    addProductDetailsToCompareSlot(i, productCodeArray[i]);
                }
                /*
                if(productCodeArray.length === 3) {
                    /* Disable add to compare button from PLP 
                    $('.compare-btn > a').addClass("disable").html("COMPARE SLOT FULL");
                }
                */
            } else {
                $('.compare-product-container').hide();
                $(".mz-filters-bar .filter-compare-btn").find('i').toggleClass('fa-caret-down fa-caret-up');
            }
    	}else {
    		$('.compare-product-container').hide();
            $(".mz-filters-bar .filter-compare-btn").find('i').toggleClass('fa-caret-down fa-caret-up');
    	}
    }

    $(document).ready(function(){
    	initCompare();
    	$(document).on('click', 'a.mz-cp-close', function(){
    		removeProduct($(this).data('prodID'));
    	});
        $(document).on('click', '.filter-compare-btn > button', function(){
            $('.compare-product-container').slideToggle();
            $(this).find('i').toggleClass('fa-caret-down fa-caret-up');
        });
    	$(document).on('click', '#mz-cmp-btn', function() {
    		var productCode = $(this).attr('data-pro-id');
	    	var compareProduct = getCookie('compareProduct');
            enableDisableCompareBtn(compareProduct);
	    	var compareProductTemp = compareProduct.replace(/(^[,\s]+)|([,\s]+$)/g, '');
	    	if(compareProduct !== "") {
	    		var productCodeArray = compareProductTemp.split(',');
	    		if(productCodeArray.length > 1) {
                    window.open('/compare', '_parent');
	    			/* window.location.href = "/compare"; */
	    		}
	    	}
    	});
    });
});