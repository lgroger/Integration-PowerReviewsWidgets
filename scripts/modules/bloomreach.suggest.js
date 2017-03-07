define(["jquery","jqueryui"], function ($) {
$(function(){
	$.widget( "custom.autoCompleteSearch", $.ui.autocomplete, {
		_create: function() {
			this._super();
			this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
		},
		_renderMenu: function( ul, items ) {
			var that = this,
			  currentCategory = "";
			$(ul).addClass("br-search-suggest");
			$.each( items, function( index, item ) {
			  var li;
			  if ( item.category != currentCategory ) {
				 if(item.type == "keyword" || item.type == "category")
					 ul.append( "<li class='ui-autocomplete-category br-suggest-left'>" + item.category + "</li>" );
				 else{
					 ul.append( "<li class='ui-autocomplete-category br-suggest-divider'></li>" ); // for vertical divider between left and right divs
					 ul.append( "<li class='ui-autocomplete-category br-suggest-right'>" + item.category + "</li>" );
				 }
				currentCategory = item.category;
			  }
			  li = that._renderItemData( ul, item );
			  if ( item.category ) {
				li.attr( "aria-label", item.category + " : " + item.label );
			  }
			});
			$(ul).unbind("mouseenter mouseleave");// remove need for two taps per li on mobile
		}, /* _renderItemData calls _renderItem */
		_renderItem: function(ul, item){
			if(item.type == "keyword"){
				return $( "<li>" ).addClass("br-suggest-left")
					.append($("<div>"+item.label+"</div>").addClass("ui-menu-item-wrapper"))
					.appendTo( ul );
			}
			else if(item.type == "product"){
				var uomdiv="";
				if(item.uom.length > 0)
					uomdiv=' <span>'+item.uom+'</span>';
				var pricediv='<div class="autocomplete-price">$' + item.price + uomdiv + '</div>';
				if(item.pricerange[0] != item.pricerange[1])
					pricediv='<div class="autocomplete-price-range">$' + item.pricerange[0] + ' to $' + item.pricerange[1] + uomdiv + '</div>';
				if(item.ptype =='THEMEPAGE'){
					item.classname+=' br-suggest-theme';
					pricediv='<a class="br-theme-page">Shop theme</a>';
				}
				var ratingdiv = "";
				if(item.rating){
					var ratenum = Math.round(parseFloat(item.rating)*2)/2;
					if(ratenum != Math.round(ratenum))
						ratingdiv = '<div class="mz-product-rating"><div class="pr-snippet-stars"><div class="pr-stars pr-stars-small pr-stars-'+Math.floor(ratenum)+'_5-sm">&nbsp;</div></div></div>';
					else
						ratingdiv = '<div class="mz-product-rating"><div class="pr-snippet-stars"><div class="pr-stars pr-stars-small pr-stars-'+ratenum+'-sm">&nbsp;</div></div></div>';
				}
				
				return $( "<li>" ).addClass("br-suggest-right").addClass(item.classname)
					.append('<div class="ui-menu-item-wrapper br-suggest-product"><div class="br-suggest-product-image"><img src="' + item.img + '" class="autocomplete-thumb" /></div><div class="autocomplete-title">' + item.label + '</div><div class="autocomplete-priceline">'+pricediv+'<div class="autocomplete-clear"></div>'+ratingdiv+'</div><div class="autocomplete-clear"></div></div>' )
					.appendTo( ul );
			}
			else if(item.type == "category"){
				return $( "<li>" ).addClass("br-suggest-left")
					.append($("<div>"+item.label+"</div>").addClass("ui-menu-item-wrapper"))
					.appendTo( ul );
			}
			else if(item.type == "cta"){
				return $( "<li>" ).addClass("br-suggest-cta")
					.append($("<div>"+item.label+"</div>").addClass("ui-menu-item-wrapper"))
					.appendTo( ul );
			}
			return(null);
		}
	});
	
	$("[id='search_text']").autoCompleteSearch({ // #search_text is on page twice, once for desktop, once for mobile
		delay: 0,
		source: function( req, add ) {
			var searchsuggestURL = "//brm-suggest-0.brsrvr.com/api/v1/suggest/?callback=?";	
			var randomID = function() {
				var chars = '0123456789'.split('');
				var str = '';
				for (var i = 0; i < 13; i++) {
					str += chars[Math.floor(Math.random() * chars.length)];
				}
				return str;
			};
			var getCookie = function(name) {
				var value = "; " + document.cookie;
				var parts = value.split("; " + name + "=");
				if (parts.length >= 2)
					return parts.pop().split(";").shift();
				return "";
			};
			$.getJSON(searchsuggestURL,{
					account_id:5354,
					auth_key:"",
					domain_key:"shindigz",
					q:req.term,
					request_type:"suggest",
					request_id: randomID(),
					url: window.location.href,
					ref_url: document.referrer,
					_br_uid_2: getCookie("_br_uid_2")
				},function(data){
					if(data.response){
						var arr2 = [];
						if(data.response.products){
							var catname = 'Top Product Suggestions';
							var pcnt =0;
							arr2 = $.map( data.response.products, function( item )
							{
								pcnt++;
								if(item.max_price){
									item.sale_price_range[1] = parseFloat(item.max_price);
								}
								if(pcnt <=6)
									return {
										type:'product',
										label: item.title,
										img: item.thumb_image+"?max=100",
										price: item.sale_price.toFixed(2).toString(),
										url: item.url,
										value: item.pid,
										category:catname,
										rating: item.rating,
										pricerange: item.sale_price_range,
										uom:(typeof item.unitofmeasure_attr == 'undefined'?'':item.unitofmeasure_attr),
										classname:"br-suggest-product-"+pcnt,
										ptype: item.mozuproducttype
									};
							});
						}
						
						var arr = [];
						if(data.response.suggestions){
							var keywordcnt = 0;
							arr = $.map( data.response.suggestions, function( item ){
								keywordcnt++;
								if(keywordcnt <=8)
									return {
										type:'keyword',
										label: item.dq,
										value: item.q,
										category:'Popular Searches'
									};
							});
						}
						var arr3 = [];
						if(data.response.suggestions && data.response.suggestions.length > 1 && data.response.suggestions[0].filters){
							arr3 = $.map( data.response.suggestions[0].filters, function( item ){
									var breadArr = item.value.split("/");
									var finalBread = breadArr[breadArr.length-1]; // get last node, will be in format: "cat123,my category"
									var breadvalue = finalBread.split(",")[0];
									var breadlabel = finalBread.split(",");
										breadlabel.shift();
										breadlabel.join("");// remove first element and join back into one string
									return {
										type:'category',
										label: breadlabel,
										value: breadvalue.substr(3,breadvalue.length-3), // will be in format cat123
										category:'Category Suggestions'
									};
							});
						}
						
						var cta = {
										type:'cta',
										label: 'View More Results',
										value: req.term,
										category:''
									};
						arr = arr.concat(arr3.concat(arr2));
						if(arr.length)
							arr.push(cta);
						add(arr); // keywords, categories, products, cta
					}
					else{
						add([]);
					}
			});
        },
		minLength: 2,
		select: function( event, ui ) {
			if(ui.item.type == "keyword" || ui.item.type == "cta"){ //search suggesstion
				this.value = ui.item.value;
				this.form.submit();
			}
			else if(ui.item.type == "product"){ // pdp
				window.location = ui.item.url;
			}
			else if(ui.item.type == "category"){ // category suggestion
				window.location = '/c/'+ui.item.value;
			}
			return false;
		}
	});
});

});