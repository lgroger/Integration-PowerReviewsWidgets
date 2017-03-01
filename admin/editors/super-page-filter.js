Ext.define('mmodel', {
    extend: 'Ext.data.Model',
    fields: [
          {name:'textcaption',type: 'string'},
          {name:'attrValue',type:'string'}
        ]
});
Ext.define('testApp.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodel'
});

var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
    clicksToMoveEditor: 1,
    autoCancel: false
});


Ext.widget({
	xtype   : "mz-form-widget",
	itemId: "superpageWidget",
  name:"superpageWidget",
	id:"superpageWidget",
	items:[
		{
      title: 'Child Category filter',
            xtype: 'grid',
            anchor: '97%',
            height: 400,
            selrow:0,
            flag:false,
            dragpid:1,
            id:"gridpan",
            overflowY: 'auto',
            hideHeaders:true,
            selModel: {
             mode: 'rowmodel'
            },store:Ext.create("testApp.store.Objects",{
            id:"storeel"
        ,listeners:{
          add:function( store, records, index, opts ){
             Ext.getCmp("superpageWidget").addListItem(records[0].data);
          }
          ,update:function( store, record, operation, eOpts ){
                    Ext.getCmp("superpageWidget").updateListItem(record.data,store.indexOf(record));
                }
        }
      }),listeners : {
            afterrender:function(){
                if (this.store.getCount() == 0) {
                console.log('store not loaded yet');
                this.store.loadData(Ext.getCmp("gridData").getValue());
                this.store.on('load', function() {
                    console.log('load after render');
                }, this, {
                    single: true
                });
            } else {
                this.store.loadData(Ext.getCmp("gridData").getValue());
                console.log('store already loaded');
            }
            }
        },plugins:[rowEditing],dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                bodyPadding:10,
                items: [{
                    xtype: 'button',
                    text: '<div style="color:#4caf50;">Add New Item</div>',
                    handler:function(){
                        Ext.getCmp("gridpan").getStore().add({ 'textcaption':'','attrValue':''});
                        rowEditing.cancelEdit();
                        rowEditing.startEdit((Ext.getCmp("gridpan").getStore().getCount()-1), 0);
                    }
                }]
            }],columns : [{
            text : 'Available List',
            dataIndex : 'textcaption',editor: {xtype:'textfield'},flex:2,menuDisabled:true,sortable:false
        },{
            text : 'Available List',
            id:"att",
            dataIndex : 'attrValue',editor: {xtype:'combobox',store:[1,23,3]},flex:2,menuDisabled:true,sortable:false
        },{
            xtype:'actioncolumn',
            width:30,flex:1,menuDisabled:true,sortable:false,
            items: [{
                icon: '/resources/images/del-icon.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                       var arr=Ext.getCmp("gridData").getValue();
                        arr.splice(rowIndex,1);
                        Ext.getCmp("gridData").setValue(arr);
                        Ext.getCmp("gridpan").getStore().removeAt(rowIndex);   
                        Ext.Msg.alert('Status', 'Item has been deleted..!');                                                   
                    }
            },{
                icon: '/resources/images/icon-down.png',
                tooltip: 'Move Down',
                handler: function(grid, rowIndex, colIndex) {
                     //alert("Edit " +rowIndex);
                    var arr=Ext.getCmp("gridData").getValue();
                    console.log("ridx "+rowIndex);
                    if(arr.length-1!=rowIndex){
                    var fidx=rowIndex;
                    var toIndex=rowIndex+1;
                    var element = arr[fidx];
                    arr.splice(fidx, 1);
                    arr.splice(toIndex, 0, element);
                    Ext.getCmp("gridData").setValue(arr);
                    console.log("moved "+ fidx+" TO "+toIndex);
                    Ext.getCmp("gridpan").getStore().loadData(Ext.getCmp("gridData").getValue());
                    Ext.getCmp("gridpan").getSelectionModel().deselectAll();
                }
                }
            },{
                icon: '/resources/images/icon-up.png',
                tooltip: 'Move Up',
                handler: function(grid, rowIndex, colIndex) {
                     //alert("Edit " +rowIndex);
                    // Ext.getCmp("menuWidget").moveUprow(rowIndex,"gridviewlv3");
                     //console.log("ridx "+rowIndex);
                    var arr = Ext.getCmp("gridData").getValue();
                    if(rowIndex!=0 && arr.length!=1){
                        var fidx=rowIndex;
                        var toIndex=rowIndex-1;
                        var element = arr[fidx];
                        console.log("ele g move");
                        //console.log(element);
                        arr.splice(fidx, 1);
                        arr.splice(toIndex, 0, element);
                        Ext.getCmp("gridData").setValue(arr);
                        console.log("moved "+ fidx+" TO "+toIndex);
                        //console.log(arrtmp);
                        //console.log(Ext.getCmp("menuDatatmp").getValue());
                        Ext.getCmp("gridpan").getStore().loadData(Ext.getCmp("gridData").getValue());
                        Ext.getCmp("gridpan").getSelectionModel().deselectAll();
                    }
                }
            }

            ]
        }]
    },{
        	xtype:"mz-input-checkbox",
        	name:"enableSlider",
        	id:"enableSlider",
        	fieldLabel:"Enable Slider",
        	value:false,
            hidden:false
        },{
            xtype       : "taco-arrayField",
            name        : "data",
            itemId      : "gridData",
            id          : "gridData",
            width       : '1%',
            model:'mmodel',
            hidden      : true
        }
	],
	listeners: {
      afterrender: function (cmp) {
      	this.fetchValues();
      }
    },
	fetchValues:function(){
        /*var ar=document.getElementsByTagName("iframe");
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
                    final_val.push(el);
                });
  
                  
                  
            }
        }*/
        try{
            var pname=document.location.pathname;
            var cid=pname.substr(pname.lastIndexOf("/")+1,pname.length);
         var g = {
                url: "/admin/app/category/node/"+cid,
                method: "GET",
                success: function(respones) {
                    var data =  JSON.parse(respones.responseText);
                    console.log("data");
                    console.log(data);
                    var idsr=[];
                    data.items.children.forEach(function(el,i){
                        idsr.push({"cc":el.name,"na":el.name});
                    });
                    var states = Ext.create('Ext.data.Store', {
                        fields: ['cc', 'na'],
                        data:idsr
                    });
                    console.log("Pluck ");
                    console.log(idsr);
                    Ext.getCmp("gridpan").getView().getHeaderCt().child("#att").setEditor({
                    xtype:'combobox',store:states,displayField: 'na',
    valueField: 'cc'

                  });
                },
                failure: function(error) {
                    console.log(error);
                    //Ext.getCmp("superpageCat").unmask();
                    Ext.alert("error"+error.responseText.message);
                }
            };
            Ext.Ajax.request(g)
        }catch(error){
            console.log(error);
        }
    },addListItem:function(new_data,arr){
        var arrayData = Ext.getCmp('gridData');
         if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            arr.push({"textcaption":new_data.textcaption,"attrValue":new_data.attrValue});
            arrayData.setValue(arr);
         }else{
             var fir={"textcaption":new_data.textcaption,"attrValue":new_data.attrValue};
             arrayData.setValue(fir);
         }
    },updateListItem:function(new_data,idx){
        var arrayData = Ext.getCmp('gridData');
        var arr = arrayData.getValue();
        arr[idx].textcaption=new_data.textcaption;
        arr[idx].attrValue=new_data.attrValue;
        arrayData.setValue(arr);
    }
});