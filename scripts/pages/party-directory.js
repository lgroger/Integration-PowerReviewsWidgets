define(['modules/jquery-mozu', 'modules/api', 'vendor/jQuery.selectric'], function ($, api) {
	load_service_party();
	$(".map-area map area").click(function(){
		$("#party-state").val($(this).attr("acode"));
		load_city_party($(this).attr("acode"));	
		$('#party-state').removeClass('ani-select').width();
		$('#party-state').addClass('ani-select');
	});
		
	$("#party-state").bind("change",function(){
		var optionSelected = $(this).find("option:selected");
		var valueSelected  = optionSelected.val();
		console.log(valueSelected);
		load_city_party(valueSelected);		
	});
	$("#map-city").change(function(){
		var optionSelected = $(this).find("option:selected");
		var valueSelected  = optionSelected.val();
		load_store_list(valueSelected,$("#party-state").val(),$("#map-service").val());		
		//console.log(valueSelected);
		/*if($("#map-service").val()!=="default"){
		}else{
			load_service_party(valueSelected,$("#party-state").val());					
		}*/
	});
	$("#map-service").change(function(){
		var optionSelected = $(this).find("option:selected");
		var valueSelected  = optionSelected.val();
		console.log("service changed "+valueSelected);
		load_store_list($("#map-city").val(),$("#party-state").val(),valueSelected);		
	});
	function load_city_party(state_code){
		api.request('GET','api/platform/entitylists/partyvendorlist@shindigz/entities?pageSize=20&startIndex=0&filter=state eq '+state_code).then(function(res){ 
			var uniqueValues= [];
			var count_shop=[];
			var opt_city='<option value="default">Select City</option>';
			$.each(res.items, function(i, el){
			    if($.inArray(el.city, uniqueValues) === -1) {
			    	uniqueValues.push(el.city);
			    	count_shop.push(1);
			    }else{
			    	count_shop[$.inArray(el.city, uniqueValues)]=count_shop[$.inArray(el.city, uniqueValues)]+1;
			    }
			});		
			$.each(uniqueValues, function(i, el){
				opt_city+='<option value="'+el+'">'+el+' ('+count_shop[i]+')</option>';
			});
			$('#map-city').html(opt_city);
			//console.log(opt_city);
		},function(err){
			console.log("Error on load city");
			console.log(err);
		});
		console.log("Request Started..!");
	}
	function load_service_party(){
		//console.log("City "+ city+"  state "+state_code);
		api.request('GET','api/platform/entitylists/partyservicelist@shindigz/entities?pageSize=20').then(function(res){ 
			var opt_service='<option value="default">Select Service</option>';
			console.log("Len "+res.items.length);
			$.each(res.items, function(i, el){
			    	opt_service+='<option value="'+el.service_id+'">'+el.service_name+'</option>';
			});		
			//console.log(opt_service);
			$('#map-service').html(opt_service);
		},function(err){
			console.log("Error on load service");
			console.log(err);
		});
	}
	function load_store_list(city,state_code,service){
		console.log("Loading storelist"+ city +" - "+service);
		if(service!=="default" && city !=="default" && state_code !=="default"){
			api.request('GET','api/platform/entitylists/partyvendorlist@shindigz/entities?pageSize=200&startIndex=0&filter=state eq '+state_code+' and city eq "'+city+'" and service_id eq '+service).then(function(res){ 
				var store_item="";
				if(res.items.length>0){
					$.each(res.items, function(i, el){
						if((i+1)%4===0){
							store_item+="<div class='store-item row-store-end'>";
						}
						else{
							store_item+="<div class='store-item'>";
						}
						if (el.web.length!==0) {
							store_item+="<a href='"+el.web+"' target='_blank'>"+el.vendor_name+"</a>";
						}else{
							store_item+="<a href='javascript:void(0)' target='_blank'>"+el.vendor_name+"</a>";
						}
						store_item+="<br />"+el.address+"<br />"+el.city+", "+el.state+"<br />"+el.ph;
						store_item+="</div>";
					});
				}else{
					 store_item="<p>There are currently no "+$("#map-service option:selected").text()+" in "+$("#map-city").val()+"</p>";
				}
				$(".party-result-title h3 strong:first").text($("#map-service option:selected").text());
				$(".party-result-title p strong:first").text($("#map-city").val());
				$(".party-result-title p strong:last").text($("#map-service option:selected").text());
				$(".party-result-title h3 strong:last").text($("#map-city").val()+", "+$("#party-state option:selected").text());
				$(".party-search-results #mz-drop-zone-party-dir-bottom").css("display","block");
				$(".party-search-results .store-list").html(store_item);
			},function(err){
				console.log("Error");
				console.log(err);
			});
		}
	}

	function escapeRegExp(str) {
	  var tmp= str.replace(/[.*+?^${}()'|[\]\\]/g, "^$&");
	  tmp.replace(/,/g , "%2C");
	  return tmp;
	}
});