Ext.widget({
	xtype   : 'mz-form-widget',
	itemId: 'superpageWidget',
	id:"superpageWidget",
	items:[
		{
			"xtype": "mz-input-selectmulti",
			"name": "superpageCat",
			"id":"superpageCat",
			"fieldLabel": "Super Page Category",
			"displayField":'value',
			"valueField":"value",
			"width":600,
			listeners:{
				select: function(ele, rec, idx) {
				 	ele.lastSelectEvent = ele.value; console.log(ele.value); 
				 	Ext.getCmp("supercatData").setValue(ele.value);
				}
			}
		},{
			"xtype": "mz-input-selectmulti",
			"name": "productType",
			"id":"productType",
			"fieldLabel": "Product Type",
			"displayField":'value',
			"valueField":"value",
			"width":600,
			listeners:{
				select: function(ele, rec, idx) {
				 	ele.lastSelectEvent = ele.value; console.log(ele.value); 
				 	Ext.getCmp("productTypedata").setValue(ele.value);
				}
			}
		},{
            xtype       : "taco-arrayField",
            name        : "data",
            itemId      : "supercatData",
            id          : "supercatData",
            width       : '1%',
            hidden      : true
        },{
            xtype       : "taco-arrayField",
            name        : "productTypedata",
            itemId      : "productTypedata",
            id          : "productTypedata",
            width       : '1%',
            hidden      : true
        },{
        	xtype:"mz-input-checkbox",
        	name:"enableSlider",
        	id:"enableSlider",
        	fieldLabel:"Enable Slider",
        	value:false
        }
	],
	listeners: {
      afterrender: function (cmp) {
      	Ext.getCmp("superpageCat").mask('Loading..!');
      	Ext.getCmp("productType").mask('Loading..!');
      	this.fetchValues();
      }
    },
	fetchValues:function(){
        var ar=document.getElementsByTagName("iframe");
        var extid=ar[0].getAttribute("id");
        if(ar[0].baseURI===location.href){
            var facet_html=document.getElementById(extid).contentWindow.document.getElementById('data-mz-preload-facets').innerHTML;
            var facet_array=JSON.parse(facet_html);
           var prod_type=Ext.Array.filter(facet_array, function(item) {
                return item.field==="tenant~product-type";
            });
           var cat_type=Ext.Array.filter(facet_array, function(item) {
                return item.field==="tenant~super-page-product-type";
            });
            if(prod_type.length<1||cat_type.length<1){
                Ext.alert("","No Factes are found Please config facets");
            }else{
                //Load product type value combo
                var values=Ext.pluck(prod_type, 'values');
                var tmp_arr=Ext.pluck(values[0],'value');
                var final_val=[];
                tmp_arr.forEach(function(el,i){
                    final_val.push({value:el})
                });
                var store = Ext.create('Ext.data.Store', {
                    fields: ['value'],
                    data : final_val
                });
                
                  Ext.getCmp('productType').bindStore(store);
                  if(Ext.getCmp("productTypedata").getValue().length>0){
                    Ext.getCmp("productType").setValue(Ext.getCmp("productTypedata").getValue());
                  }else{
                    Ext.getCmp('productType').select(Ext.getCmp('productType').getStore().collect(Ext.getCmp('productType').valueField));
                  }
                  Ext.getCmp("productType").unmask();
                  //Super page Catagory 
                  
                   var super_values=Ext.pluck(cat_type, 'values');
                var super_arr=Ext.pluck(super_values[0],'value');
                var super_final_val=[];
                super_arr.forEach(function(el,i){
                    super_final_val.push({value:el})
                });
                var super_store = Ext.create('Ext.data.Store', {
                    fields: ['value'],
                    data : super_final_val
                });
                
                  Ext.getCmp('superpageCat').bindStore(super_store);
                  if(Ext.getCmp("supercatData").getValue().length>0){
                    Ext.getCmp("superpageCat").setValue(Ext.getCmp("supercatData").getValue());
                  }else{
                    Ext.getCmp('superpageCat').select(Ext.getCmp('superpageCat').getStore().collect(Ext.getCmp('productType').valueField));
                  }
                  Ext.getCmp("superpageCat").unmask();
                    console.log(cat_type);
                    console.log(prod_type);
            }
        }
    }
});