require(["modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu",   
    "modules/api"], function ($, Hypr, Backbone, api){
        $(function(){
            var ship_location = 'usa'; 
            $(".shipping-info-display tbody").html("<h3>Loading..</h3>");
            $(document).on('change','.shipping-location',function(){
                var ship_location = $(this).find(':selected').val();
                $(".shipping-info-display tbody").html("<h3>Loading..</h3>");
                countryList(ship_location);
            });
            countryList(ship_location); 
        });
        function countryList(ship_location){
            var arr=[];
            console.log(ship_location);
            api.request("GET","/api/content/documentlists/shippingList@shindigz/views/shippingView/documents?pageSize=100&filter=properties.country_code eq "+ship_location+" and (properties.shipping_code eq 1 or properties.shipping_code eq 4 or properties.shipping_code eq 6 or properties.shipping_code eq 7 or properties.shipping_code eq 8 or properties.shipping_code eq 9)").then(function(resp){
                for(var i=0;i<resp.items.length;i++){
                    arr.push({"min_amount":resp.items[i].properties.min_amount,"max_amount":resp.items[i].properties.max_amount,"std":resp.items[i].properties.shipping_charges});
                }
                console.log("Array ");
                get2ndshippingMethod(arr,ship_location);
            },function(err){
                console.log(err);
            });
    	}
        function get2ndshippingMethod(arr,ship_location){
              api.request("GET","/api/content/documentlists/shippingList@shindigz/views/shippingView/documents?pageSize=100&filter=properties.country_code eq "+ship_location+" and (properties.shipping_code eq 2 or properties.shipping_code eq 5)").then(function(resp){
                console.log("2nd day");
               //console.log(resp);
                for(var i=0;i<resp.items.length;i++){
                    for (var j = 0; j < arr.length; j++) {
                        if(arr[j].min_amount ==resp.items[i].properties.min_amount){
                            arr[j].days2=resp.items[i].properties.shipping_charges;
                        }
                    }
                    //arr_add(arr,resp.items[i].properties.min_amount,resp.items[i].properties.max_amount,resp.items[i].properties.shipping_charges);
                }
                getNextDayshippingMethod(arr,ship_location);
            },function(err){
                console.log(err);
            });
        }
        function getNextDayshippingMethod(arr,ship_location){
            api.request("GET","/api/content/documentlists/shippingList@shindigz/views/shippingView/documents?pageSize=100&filter=properties.country_code eq "+ship_location+" and (properties.shipping_code eq 3)").then(function(resp){
                console.log("next day");
                //console.log(resp);
                for(var i=0;i<resp.items.length;i++){
                    for (var j = 0; j < arr.length; j++) {
                        if(arr[j].min_amount ==resp.items[i].properties.min_amount){
                            arr[j].nextday=resp.items[i].properties.shipping_charges;
                        }
                    }
                }
                console.log("Array final "+ arr.length);
               getHTMLViewShipping(arr,ship_location);
            },function(err){
                console.log("error ");
                console.log(err);
            });
        }
        function getHTMLViewShipping(arr,ship_location){
            var table_data="";
            var days2flag=false;
            var nextdayflag=false;

             console.log(arr);
             arr.sort(function(a,b){
                  return parseFloat(a.min_amount) - parseFloat(b.min_amount);
             });
                for(var k=0;k<arr.length;k++){
                    table_data+="<tr>";
                    table_data+="<td>$"+arr[k].min_amount +" - $"+arr[k].max_amount+"</td>";
                    table_data+="<td>$"+arr[k].std+"</td>";

                    if(arr[k].days2 === undefined){
                        table_data+="<td>  </td>";
                    }else{
                         table_data+="<td>$"+arr[k].days2+"</td>";
                         days2flag=true;
                         //console.log(" tr 2days " +table_data);
                    }if(arr[k].nextday === undefined){
                        table_data+="<td>  </td>";
                    }else{
                         table_data+="<td>$"+arr[k].nextday+"</td>";
                         nextdayflag=true;
                    }
                    table_data+="</tr>";
                }
                //above_std=getMoreStd(ship_location);
                table_data+="<tr><td></td><td></td><td></td><td></td></tr>";
                getMoreStd(ship_location,days2flag,nextdayflag);                
                console.log("Table Data in html");
                console.log(table_data);
                $(".shipping-info-display tbody").html(table_data);
        }
        function getMoreStd(ship_location,days2,nextday){
            var above_days2="";
            var above_std="";
            var above_std_price="";
            var above_next="";
             api.request("GET","/api/content/documentlists/shippingMoreThenList@shindigz/views/shippingMoreThenView/documents?pageSize=100&filter=properties.country_code eq "+ship_location+" and (properties.shipping_code eq 1 or properties.shipping_code eq 4 or properties.shipping_code eq 6 or properties.shipping_code eq 7 or properties.shipping_code eq 8 or properties.shipping_code eq 9)").then(function(res){
                for (var j = 0; j < res.items.length; j++) {
                    above_std+="$"+res.items[j].properties.more_then+" and above each $"+Math.ceil(res.items[j].properties.for_each)+" add";
                   if( res.items[j].properties.shipping_code== 1 || res.items[j].properties.shipping_code== 4 || res.items[j].properties.shipping_code ==6 || res.items[j].properties.shipping_code== 7 || res.items[j].properties.shipping_code== 8 || res.items[j].properties.shipping_code== 9){
                        above_std_price="$"+res.items[j].properties.amount_to_be_added;
                    }
                }
                 $(".shipping-info-display tbody tr:last-child td:nth-child(1)").text(above_std);
                $(".shipping-info-display tbody tr:last-child td:nth-child(2)").text(above_std_price);
            },function(err){
                console.log(err);
            });
             if(days2){
              api.request("GET","/api/content/documentlists/shippingMoreThenList@shindigz/views/shippingMoreThenView/documents?pageSize=100&filter=properties.country_code eq "+ship_location+" and (properties.shipping_code eq 2 or properties.shipping_code eq 5)").then(function(res){
                        for (var j = 0; j < res.items.length; j++) {
                           if( res.items[j].properties.shipping_code== 2 || res.items[j].properties.shipping_code== 5){
                                above_days2+="$"+res.items[j].properties.amount_to_be_added;
                            }
                        }
                        $(".shipping-info-display tbody tr:last-child td:nth-child(3)").text(above_days2);
                    },function(err){
                    console.log(err);
                });
             }
             if(nextday){
                console.log("sss");
                  api.request("GET","/api/content/documentlists/shippingMoreThenList@shindigz/views/shippingMoreThenView/documents?pageSize=100&filter=properties.country_code eq "+ship_location+" and (properties.shipping_code eq 3)").then(function(res){
                        for (var j = 0; j < res.items.length; j++) {
                           if( res.items[j].properties.shipping_code==3){
                                above_next+="$"+res.items[j].properties.amount_to_be_added;
                            }
                            
                        }
                        console.log("fina "+above_next);
                        $(".shipping-info-display tbody tr:last-child td:nth-child(4)").text(above_next);
                    },function(err){
                    console.log("error on last"+err);
                });
             }
            
        }
});