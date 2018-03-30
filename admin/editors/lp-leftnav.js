Ext.define('Ext.form.newsForm',{
    extend: 'Ext.form.Panel',
    alias: 'widget.menuform',
    defaults: { anchor: '100%'},
    layout: 'anchor'
});
 
Ext.define('mmodel', {
    extend: 'Ext.data.Model',
    fields: [
              {name:'mcap',type: 'string'},
              {name:'mlink',type: 'string',defaultValue:""},
              {name:'ntab',type: 'boolean',defaultValue:false},
              {name:'ndisp',type: 'boolean',defaultValue:true},
              {name:'showmore',type: 'string'}
            ]
});
Ext.define('mmodelnew', {
    extend: 'Ext.data.Model',
    fields: [
              {name:'mcap',type: 'string'},
              {name:'mlink',type: 'string',defaultValue:""}
            ]
});
Ext.define('mmodelimg', {
    extend: 'Ext.data.Model',
    fields: [
              {name:'mcap',type: 'string'},
              {name:'mlink',type: 'string',defaultValue:""},
              {name:'mcol',type: 'boolean',defaultValue:false}
            ]
});
Ext.define('testAppimg.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodelimg'
});
Ext.define('testApp.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodel'
});
Ext.define('testAppnew.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodelnew'
});

Ext.define('Ext.window.menuWin', {
    extend: 'Ext.window.Window',
    alias: 'menuWin',
    title: 'Create New Menu Item In',
    columnWidth: 0.5,
    bodyPadding:10,
    layout: 'anchor',
    modal:true,
    width:700,
    minHeight:450,
    closable:true
});
Ext.define('Ext.panel.gridNav', {
    extend: 'Ext.grid.Panel',
    alias:"widget.gridNav",
    title: '',
    defaults: { anchor: '100%'},
    width:"90%",
    height:"500",
    enableCtxMenu: false,
    overflowY: 'auto',
    selModel: {
    mode: 'rowmodel'
    }
});
  var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToMoveEditor: 1,
        autoCancel: false
    });
    var rowEditinglv1 = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToMoveEditor: 1,
        autoCancel: false
    });
    var rowEditinglv3 = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToMoveEditor: 1,
        autoCancel: false
    });
    var rowEditinglv4 = Ext.create('Ext.grid.plugin.RowEditing', {
        clicksToMoveEditor: 1,
        autoCancel: false
    });
Ext.widget({
    xtype:'mz-form-widget',
    title:"",
    itemId: 'menuWidget', 
    id:"menuWidget",
    layout:"anchor",
    items:[
        {
            xtype:"button",
            text:"<div style='color:#000;'>Add New Menu Item</div>",
            margin: "0 0 20 0",
            handler:function(){
                Ext.getCmp("gridview").getStore().add({ 'mcap':'Category Name','mlink': '','ntab':false});
                //alert(Ext.getCmp("gridview").getStore().getCount());
                rowEditing.cancelEdit();
                rowEditing.startEdit((Ext.getCmp("gridview").getStore().getCount()-1), 0);
            }
         },
         {
            xtype:"mz-input-checkbox",
            fieldLabel:"",
            name: "check-uncheck",
            id: "check-uncheck",
            style: {
                float: "right",
                position: "absolute",
                top: "20px",
                right: "65px",
                display: "inline-block",
                width: "20px",
                height: "20px",
                margin: 0
            },
            listeners : {
                change : function(field, newValue,o ,e) {
                    if(newValue == true){
                        for(i=0;i<Ext.getCmp("menuData").value.length;i++){
                            Ext.getCmp("menuData").value[i].ndisp = true;
                        }
                        Ext.getCmp("gridview").store.loadData(Ext.getCmp("menuData").getValue());
                    }
                    else{
                        for(i=0;i<Ext.getCmp("menuData").value.length;i++){
                            Ext.getCmp("menuData").value[i].ndisp = false;
                        }
                        Ext.getCmp("gridview").store.loadData(Ext.getCmp("menuData").getValue())
                    }   
                }
            }
         }, 
        {
            xtype       : "taco-arrayField",
            name        : "data",
            itemId      : "menuData",
            id          : "menuData",
            width       : '1%',
            model:'mmodel',
            hidden      : true
        },{
            xtype       : "taco-arrayField",
            name        : "datatmp",
            itemId      : "menuDatatmp",
            id          : "menuDatatmp",
            width       : '1%',
            hidden      : true
        },{
            xtype:"gridNav",
            id:"gridview",
            title:"",
            width: "100%",
            maxHeight: 310,
            store: Ext.create("testApp.store.Objects",{
                id:"storeel",
                listeners:{
                    add:function( store, records, index, opts ){
                        console.log(records[0].data);
                        Ext.getCmp("menuWidget").addMenuData(records[0].data);
                    },update:function( store, record, operation, eOpts ){
                        Ext.getCmp("menuWidget").updateMenuData(record.data,store.indexOf(record));
                    }
                }
            }),plugins:[rowEditing],
        columns : [{
            text : 'Category Name',
            dataIndex : 'mcap',editor: {xtype:'textfield',allowBlank:false},flex:2,menuDisabled:true,sortable:false
        },{
            text : 'Link',
            dataIndex : 'mlink',editor: 'textfield',flex:2,menuDisabled:true,sortable:false
        },{
            text : 'Sub Categories',
            editor: {
                xtype: 'checkbox',
                listeners : {
                    change : function(field, newValue,o ,e) {
                        console.log(field);
                        console.log(e);
                        if(newValue == true){
                            // for(i=0;i<Ext.getCmp("menuData").value.length;i++){
                            //     Ext.getCmp("menuData").value[i].ndisp = true;
                            // }
                            // Ext.getCmp("gridview").store.loadData(Ext.getCmp("menuData").getValue());
                        }
                        else{
                            // for(i=0;i<Ext.getCmp("menuData").value.length;i++){
                            //     Ext.getCmp("menuData").value[i].ndisp = false;
                            // }
                            // Ext.getCmp("gridview").store.loadData(Ext.getCmp("menuData").getValue())
                        }    
                    }
                }
            },
            dataIndex : 'ntab',
            flex:1,
            menuDisabled:false,
            sortable:false 
        },{
            xtype:'actioncolumn',
            width:60,
            flex:1,
            menuDisabled:true,
            sortable:false,
            dataIndex: 'action',
            id: 'action',
            items: [{
              icon: '/resources/images/add-menu.png',
                tooltip: 'Add/Edit Sub Cat',
                margin: "0 10 0 0",
                name: "editbtn",
                id: "editbtn",
                disabledCls: 'mydisabled',
                handler: function(grid, rowIndex, colIndex) {
                    Ext.getCmp("menuWidget").showEditChild(rowIndex);
                },
                getClass: function(v, meta, rec,rowIndex, colIndex, store) {          
                  if(rec.data.ntab == false){
                    return 'x-hide-display';
                  }
                }   
            },{

            },{
                icon: '/resources/images/del-icon.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                    // alert("Edit " +rowIndex);
                      Ext.Msg.confirm("Menu Editor","Are you Sure you want to delete this Category and Sub Categories?",function(btn){
                        if(btn=="yes"){
                            var arr=Ext.getCmp("menuData").getValue();
                            arr.splice(rowIndex,1);
                            Ext.getCmp("menuData").setValue(arr);
                            //Ext.getCmp("addMenuWin").flag=true;
                            Ext.getCmp("gridview").getStore().removeAt(rowIndex);                                                           
                        }
                     })
                }
            }
            ] 
        },{
            text : 'Display',
            editor: {
                xtype: 'checkbox',
                listeners : {
                    change : function(field, newValue,o ,e) {
                        console.log(field);
                        console.log(e);
                        var j = 0;

                        // to get row index in gridview
                        var pGrid = Ext.ComponentMgr.get('gridview');
                        var selectedRecord = pGrid.getSelectionModel().getSelection()[0];
                        var row = pGrid.store.indexOf(selectedRecord);
                        Ext.getCmp("menuData").value[row].ndisp = newValue;
                        // to get row index in gridview

                        for(i=0;i<Ext.getCmp("menuData").value.length;i++){
                            if(Ext.getCmp("menuData").value[i].ndisp == true)
                            {
                                j = j+1;
                            }
                        }
                        Ext.getCmp("check-uncheck").suspendEvents(false);

                        if(j == Ext.getCmp("menuData").value.length){
                            Ext.getCmp("check-uncheck").setValue(true);
                        }  
                        else{
                            Ext.getCmp("check-uncheck").setValue(false);
                        } 

                        Ext.getCmp("check-uncheck").resumeEvents();
                    }
                }
            },
            dataIndex : 'ndisp',
            flex:1,
            menuDisabled:true,
            sortable:false
        }],   
            listeners : {
                afterrender:function(){
                    console.log("loading");
                    console.log(Ext.getCmp("menuData").getValue());
                    if (this.store.getCount() == 0) {
                        console.log('store not loaded yet');
                        this.store.loadData(Ext.getCmp("menuData").getValue());
                        this.store.on('load', function() {
                            console.log('load after render');
                        }, this, {
                            single: true
                        });
                    } else {
                        this.store.loadData(Ext.getCmp("menuData").getValue());
                        console.log('store already loaded');
                    }
                }
            }
        },
        {
            xtype: 'textfield',
            name: 'showmore',
            id: 'showmore',
            fieldLabel: 'Show More Link Name',
            margin: "20 0 0 0"
        }
    ],addMenuData:function(new_data,arr){
        var arrayData = Ext.getCmp('menuData');
         if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            arr.push({"mcap":new_data.mcap,"mlink":new_data.mlink,"ntab":new_data.ntab,"ndisp":new_data.ndisp,"showmore":new_data.showmore,"items":[]});
            arrayData.setValue(arr);

         }else{
             var fir={"mcap":new_data.mcap,"mlink":new_data.mlink,"ntab":new_data.ntab,"ndisp":new_data.ndisp,"showmore":new_data.showmore,"items":[]};
             arrayData.setValue(fir);
         }
        // Ext.getCmp("menuWidget").addMenuView(mcap,mlink);
         console.log("Item Added to array");
    },updateMenuData:function(new_data,idx){
        var arrayData = Ext.getCmp('menuData');
        var arr = arrayData.getValue();
        arr[idx].mcap=new_data.mcap;
        arr[idx].mlink=new_data.mlink;
        arr[idx].ntab=new_data.ntab;
        arr[idx].ndisp=new_data.ndisp;
        arr[idx].showmore=new_data.showmore;
        arrayData.setValue(arr);
        //Ext.example.msg("Updated ", mcap);
    }
    ,addMenuView:function(item_name,items_link){
        console.log("added view");
            //Ext.getCmp("gridview").getStore().add({ 'mcap':item_name,'mlink': items_link,'level':"mainnav"});
    },showEditChild:function(idx){
        Ext.create('menuWin',{
                    title:"Add/Edit Sub-Categories for "+Ext.getCmp("menuData").getValue()[idx].mcap,
                    id:"addMenuWin",
                    idx:idx,
                    selrow:0,
                    flag:false,
                    items:[{
                        xtype:"menuform",
                        id:"addMenuform",
                        buttons:[
                        {
                            text: "<div style='color:#000;width:150px;padding:10px;'>Submit</div>",
                            formBind: true, //only enabled once the form is valid
                            disabled: true,
                            margin:"5",
                            anchor: '100%',
                            handler: function(){
                                //Ext.getCmp("menuWidget").addMenuData(Ext.getCmp("menuCap").getValue(),Ext.getCmp("menuLink").getValue(),Ext.getCmp("linkTab").getValue());
                                /*console.log("to dips");
                                var jsonds = Ext.encode(Ext.pluck(Ext.getCmp('gridviewlv1').getStore().data.items, 'data'));
                                console.log(jsonds);*/
                                //console.log(Ext.getCmp('gridviewlv1').getStore().getRange());
                            /*  var arrdr=Ext.getCmp("menuDatadrag").getValue();
                                if(arrdr.length>0){
                                    for (var i = 1; i < arrdr.length; i++) {
                                        Ext.getCmp("menuWidget").entryMoveLv2(arrdr[i].f,arrdr[i].t);
                                    }
                                }
*/                              var arrayData = Ext.getCmp('menuData');
                                var arr = arrayData.getValue();
                                arr[Ext.getCmp("addMenuWin").idx].items=Ext.getCmp("menuDatatmp").getValue();
                                arrayData.setValue(arr);

                                //Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWin").idx].items.push(Ext.getCmp('gridviewlv1').getStore().getRange());
                                Ext.getCmp("addMenuWin").destroy();
                            }
                        },{
                            text: "<div style='color:#000;width:150px;padding:10px'>Close</div>",
                            margin:"5",
                            anchor: '100%',
                            handler: function() {
                               Ext.getCmp("addMenuWin").destroy();
                            }
                        }],items:[
                                {
                                xtype:"button",
                                margin:"10",
                                text:"<div style='color:#000;'>Add New Sub Category</div>",
                                width:"250",
                                handler:function(){
                                    Ext.getCmp("gridviewlv1").getStore().add({ 'mcap':'Sub-Category','mlink': '','mcol':false,'ntab':false});
                                    //alert(Ext.getCmp("gridview").getStore().getCount());
                                    //console.log("addddedd");
                                    rowEditinglv1.cancelEdit();
                                    rowEditinglv1.startEdit((Ext.getCmp("gridviewlv1").getStore().getCount()-1), 0);
                                }
                            },{         xtype:"gridNav",
                                        id:"gridviewlv1",
                                        title:"",
                                       defaults: { anchor: '100%'},
                                        width:550,
                                        height:250,
                                        overflowY: 'auto',
                                        store: Ext.create("testAppimg.store.Objects",{
                                            id:"storelv1",
                                            listeners:{
                                                add:function( store, records, index, opts ){
                                                    var arrtmp=Ext.getCmp("menuDatatmp").getValue();
                                                    arrtmp.push({"mcap":records[0].data.mcap,"mlink":records[0].data.mlink,"mcol":records[0].data.mcol,"items":[]});
                                                    Ext.getCmp("menuDatatmp").setValue(arrtmp);
                                                    Ext.getCmp("addMenuWin").flag=true;
                                                },update:function( store, record, operation, eOpts ){
                                                    var arrtmp = Ext.getCmp('menuDatatmp').getValue();
                                                    arrtmp[store.indexOf(record)].mcap=record.data.mcap;
                                                    arrtmp[store.indexOf(record)].mlink=record.data.mlink;
                                                    arrtmp[store.indexOf(record)].mcol=record.data.mcol;
                                                    Ext.getCmp("menuDatatmp").setValue(arrtmp);
                                                    Ext.getCmp("addMenuWin").flag=true;
                                                },remove:function( store, record, index, eOpts ){
                                                    var arrtmp=Ext.getCmp("menuDatatmp").getValue();
                                                    arrtmp.splice(index,1);
                                                    Ext.getCmp("menuDatatmp").setValue(arrtmp);
                                                    Ext.getCmp("addMenuWin").flag=true;
                                                }
                                            }
                                        }), selModel: {
                        mode: 'rowmodel'
                    },plugins:[rowEditinglv1],                                 
                                        columns : [{
                                            text : 'Sub-Category Name',
                                            dataIndex : 'mcap',editor: {xtype:'textfield',allowBlank:false},flex:2,menuDisabled:true,sortable:false
                                        },{
                                            text : 'Link',
                                            dataIndex : 'mlink',editor: 'textfield',flex:1,menuDisabled:true,sortable:false
                                        },{
                                            text:'Sub-Categories',
                                            dataIndex : 'mcol',editor: 'checkbox',flex:1,menuDisabled:true,sortable:false
                                        },{
                                            xtype:'actioncolumn',menuDisabled:true,sortable:false,
                                           flex:2,
                                            items: [{
                                              icon: '/resources/images/add-menu.png',
                                                tooltip: 'Add/Edit Sub-sub-Categories',
                                                margin:"10",
                                                handler: function(grid, rowIndex, colIndex) {
                                                    if(Ext.getCmp("addMenuWin").flag){
                                                        Ext.MessageBox.show({
                                                            title:'Menu Editor',
                                                            msg: 'Changes are not saved are you sure you want to continue?',
                                                            buttonText: {yes: "Save and Continue",no: "Discard",cancel: "Cancel"},
                                                            fn: function(btn){
                                                                if(btn=="yes"){
                                                                    var arrayData = Ext.getCmp('menuData');
                                                                    var arr = arrayData.getValue();
                                                                    arr[Ext.getCmp("addMenuWin").idx].items=[];
                                                                    var records = Ext.getCmp('gridviewlv1').getStore().getRange();
                                                                     for (var i = 0; i < records.length; i++) {
                                                                        console.log(records[i].data);
                                                                        records[i].data.items=[];
                                                                        arr[Ext.getCmp("addMenuWin").idx].items.push(records[i].data);
                                                                     }
                                                                     var arrayData = Ext.getCmp('menuData');
                                                                    var arr = arrayData.getValue();
                                                                    arr[Ext.getCmp("addMenuWin").idx].items=Ext.getCmp("menuDatatmp").getValue();
                                                                    arrayData.setValue(arr);
                                                                    var ids=Ext.getCmp("addMenuWin").idx;
                                                                    Ext.getCmp("addMenuWin").destroy();
                                                                    Ext.getCmp("menuWidget").showEditChildlv3(ids,rowIndex);
                                                                }else if(btn=="no"){
                                                                    var ids=Ext.getCmp("addMenuWin").idx;
                                                                    Ext.getCmp("addMenuWin").destroy();
                                                                    Ext.getCmp("menuWidget").showEditChildlv3(ids,rowIndex);
                                                                }else{

                                                                }
                                                                console.debug('you clicked: ',btn); //you clicked:  yes
                                                            }
                                                        });
                                                    }else{
                                                        var ids=Ext.getCmp("addMenuWin").idx;
                                                        Ext.getCmp("addMenuWin").destroy();
                                                        Ext.getCmp("menuWidget").showEditChildlv3(ids,rowIndex);
                                                    }
                                                },
                                                getClass: function(v, meta, rec,rowIndex, colIndex, store) {          
                                                  console.log(rec);
                                                  if(rec.data.mcol == false){
                                                    return 'x-item-disabled';
                                                  }
                                                }
                                            },
                                            {
                                            },{
                                                icon: '/resources/images/del-icon.png',
                                                tooltip: 'Delete',
                                                handler: function(grid, rowIndex, colIndex) {
                                                     //alert("Edit " +rowIndex);
                                                     Ext.Msg.confirm("Menu Editor","Are you Sure you want to delete this Category and Sub-Categories?",function(btn){
                                                        if(btn=="yes"){
                                                            Ext.getCmp("gridviewlv1").getStore().removeAt(rowIndex);                                                            
                                                        }
                                                     })
                                                }
                                            },
                                            {
                                            },{
                                                icon: '/resources/images/icon-down.png',
                                                tooltip: 'Move Down',
                                                handler: function(grid, rowIndex, colIndex) {
                                                     //alert("Edit " +rowIndex);
                                                     Ext.getCmp("menuWidget").moveDownrow(rowIndex,"gridviewlv1");
                                                     console.log("ridx "+rowIndex);
                                                }
                                            },
                                            {
                                            },{
                                                icon: '/resources/images/icon-up.png',
                                                tooltip: 'Move Up',
                                                handler: function(grid, rowIndex, colIndex) {
                                                     //alert("Edit " +rowIndex);
                                                     Ext.getCmp("menuWidget").moveUprow(rowIndex,"gridviewlv1");
                                                     console.log("ridx "+rowIndex);
                                                }
                                            }]
                                        }],listeners : {
                                            afterrender:function(){
                                                console.log("loading");
                                                if (this.store.getCount() == 0) {
                                                console.log('store not loaded yet');
                                                this.store.loadData(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWin").idx].items);
                                                Ext.getCmp("menuDatatmp").setValue(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWin").idx].items);
                                               // Ext.getCmp("menuDatadrag").setValue({});
                                                this.store.on('load', function() {
                                                    console.log('load after render');
                                                }, this, {
                                                    single: true
                                                });
                                            } else {
                                                this.store.loadData(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWin").idx].items);
                                                Ext.getCmp("menuDatatmp").setValue(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWin").idx].items);
                                                //Ext.getCmp("menuDatadrag").setValue({});
                                                console.log('store already loaded');
                                            }
                                            }
                                        }
                                    }
                                    ]
                                }
                            ]
                    }).show();
    },showEditChildlv3:function(topidx,paridx){
        console.log(topidx+"- "+paridx);
            Ext.create('menuWin',{
                    title:"Add/Edit Sub-Categories for "+Ext.getCmp("menuData").getValue()[topidx].mcap+" --> "+Ext.getCmp("menuData").getValue()[topidx].items[paridx].mcap,
                    id:"addMenuWinlv3",
                    topidx:topidx,
                    idx:paridx,
                    flag:false,
                    items:[{
                        xtype:"menuform",
                        id:"addMenuformlv3",
                        buttons:[
                        {
                            text: "<div style='color:#000;width:150px;padding:10px;'>Submit</div>",
                            formBind: true, //only enabled once the form is valid
                            disabled: true,
                            margin:"5",
                            anchor: '100%',
                            handler: function(){
                                //Ext.getCmp("menuWidget").addMenuData(Ext.getCmp("menuCap").getValue(),Ext.getCmp("menuLink").getValue(),Ext.getCmp("linkTab").getValue());
                                /*console.log("to dips");
                                var jsonds = Ext.encode(Ext.pluck(Ext.getCmp('gridviewlv1').getStore().data.items, 'data'));
                                console.log(jsonds);*/
                                /*var arrayData = Ext.getCmp('menuData');
                                var arr = arrayData.getValue();
                                arr[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items=[];
                                var records = Ext.getCmp('gridviewlv3').getStore().getRange();
                                 for (var i = 0; i < records.length; i++) {
                                    console.log(records[i].data);
                                    records[i].data.items=[];
                                    arr[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items.push(records[i].data);
                                 }*/
                                 var arrayData = Ext.getCmp('menuData');
                                var arr = arrayData.getValue();
                                arr[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items=Ext.getCmp("menuDatatmp").getValue();
                                arrayData.setValue(arr);
                                //Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWin").idx].items.push(Ext.getCmp('gridviewlv1').getStore().getRange());
                                Ext.getCmp("addMenuWinlv3").destroy();
                            }
                        },{
                            text: "<div style='color:#000;width:150px;padding:10px'>Close</div>",
                            margin:"5",
                            anchor: '100%',
                            handler: function() {
                               Ext.getCmp("addMenuWinlv3").destroy();
                            }
                        }],items:[
                                {
                                xtype:"button",
                                margin:"10",
                                text:"<div style='color:#000;'>Add New Sub-Sub Category</div>",
                                width:"250",
                                handler:function(){
                                    Ext.getCmp("gridviewlv3").getStore().add({ 'mcap':'Sub-Sub-Category','mlink': '','mcol':false,'ntab':false});
                                    //alert(Ext.getCmp("gridview").getStore().getCount());
                                    //console.log("addddedd");
                                    rowEditinglv3.cancelEdit();
                                    rowEditinglv3.startEdit((Ext.getCmp("gridviewlv3").getStore().getCount()-1), 0);
                                }
                            },{         xtype:"gridNav",
                                        id:"gridviewlv3",
                                        title:"",
                                        width:"100%",
                                        height:250,
                                        store: Ext.create("testAppnew.store.Objects",{
                                            id:"storelv3",
                                            listeners:{
                                                add:function( store, records, index, opts ){
                                                    var arrtmp=Ext.getCmp("menuDatatmp").getValue();
                                                    arrtmp.push({"mcap":records[0].data.mcap,"mlink":records[0].data.mlink,"items":[]});
                                                    Ext.getCmp("menuDatatmp").setValue(arrtmp);
                                                    Ext.getCmp("addMenuWinlv3").flag=true;
                                                },update:function( store, record, operation, eOpts ){
                                                    var arrtmp = Ext.getCmp('menuDatatmp').getValue();
                                                    arrtmp[store.indexOf(record)].mcap=record.data.mcap;
                                                    arrtmp[store.indexOf(record)].mlink=record.data.mlink;
                                                    Ext.getCmp("menuDatatmp").setValue(arrtmp);
                                                    Ext.getCmp("addMenuWinlv3").flag=true;
                                                },remove:function( store, record, index, eOpts ){
                                                    var arrtmp=Ext.getCmp("menuDatatmp").getValue();
                                                    arrtmp.splice(index,1);
                                                    Ext.getCmp("menuDatatmp").setValue(arrtmp);
                                                    Ext.getCmp("addMenuWinlv3").flag=true;
                                                }
                                            }
                                        }),plugins:[rowEditinglv3],
                                        columns : [{
                                            text : 'Sub-Sub-Category Name',
                                            dataIndex : 'mcap',editor: 'textfield',flex:2,menuDisabled:true,sortable:false
                                        },{
                                            text : 'Link',
                                            dataIndex : 'mlink',editor: 'textfield',flex:2,menuDisabled:true,sortable:false
                                        },{
                                            xtype:'actioncolumn',
                                            width:60,flex:1,menuDisabled:true,sortable:false,
                                            items: [{
                                                icon: '/resources/images/del-icon.png',
                                                tooltip: 'Delete',
                                                handler: function(grid, rowIndex, colIndex) {
                                                      Ext.Msg.confirm("Menu Editor","Are you Sure you want to delete this menu and child items?",function(btn){
                                                        if(btn=="yes"){
                                                            Ext.getCmp("gridviewlv3").getStore().removeAt(rowIndex);                                                            
                                                        }
                                                     });
                                                }
                                            },
                                            {
                                            },{
                                                icon: '/resources/images/icon-down.png',
                                                tooltip: 'Move Down',
                                                handler: function(grid, rowIndex, colIndex) {
                                                     //alert("Edit " +rowIndex);
                                                     Ext.getCmp("menuWidget").moveDownrow(rowIndex,"gridviewlv3");
                                                     console.log("ridx "+rowIndex);
                                                }
                                            },
                                            {
                                            },{
                                                icon: '/resources/images/icon-up.png',
                                                tooltip: 'Move Up',
                                                handler: function(grid, rowIndex, colIndex) {
                                                     //alert("Edit " +rowIndex);
                                                     Ext.getCmp("menuWidget").moveUprow(rowIndex,"gridviewlv3");
                                                     console.log("ridx "+rowIndex);
                                                }
                                            }]
                                        }],listeners : {
                                                afterrender:function(){
                                                    console.log("loading");
                                                    if (this.store.getCount() == 0) {
                                                    console.log('store not loaded yet');
                                                    this.store.loadData(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items);
                                                     Ext.getCmp("menuDatatmp").setValue(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items);
                                                    this.store.on('load', function() {
                                                        console.log('load after render');
                                                    }, this, {
                                                        single: true
                                                    });
                                                } else {
                                                     this.store.loadData(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items);
                                                      Ext.getCmp("menuDatatmp").setValue(Ext.getCmp("menuData").getValue()[Ext.getCmp("addMenuWinlv3").topidx].items[Ext.getCmp("addMenuWinlv3").idx].items);
                                                    console.log('store already loaded');
                                                }
                                                }
                                            }
                                    }
                                    ]
                                }
                            ]
                    }).show();
    },moveDownrow:function(ridx,viewcmp){
        var arrtmp = Ext.getCmp("menuDatatmp").getValue();
        if(arrtmp.length-1!=ridx){
            var fidx=ridx;
            var toIndex=ridx+1;
            var element = arrtmp[fidx];
        console.log("ele g move");
        //console.log(element);
        arrtmp.splice(fidx, 1);
        arrtmp.splice(toIndex, 0, element);
        Ext.getCmp("menuDatatmp").setValue(arrtmp);
        console.log("moved "+ fidx+" TO "+toIndex);
        //console.log(arrtmp);
        //console.log(Ext.getCmp("menuDatatmp").getValue());
        Ext.getCmp(viewcmp).getStore().loadData(Ext.getCmp("menuDatatmp").getValue());
        Ext.getCmp(view).getSelectionModel().deselectAll();
        }
        
    },moveUprow:function(ridx,viewcmp){
        var arrtmp = Ext.getCmp("menuDatatmp").getValue();
        if(ridx!=0 && arrtmp.length!=1){
            var fidx=ridx;
            var toIndex=ridx-1;
            var element = arrtmp[fidx];
        console.log("ele g move");
        //console.log(element);
        arrtmp.splice(fidx, 1);
        arrtmp.splice(toIndex, 0, element);
        Ext.getCmp("menuDatatmp").setValue(arrtmp);
        console.log("moved "+ fidx+" TO "+toIndex);
        //console.log(arrtmp);
        //console.log(Ext.getCmp("menuDatatmp").getValue());
        Ext.getCmp(viewcmp).getStore().loadData(Ext.getCmp("menuDatatmp").getValue());
        Ext.getCmp(view).getSelectionModel().deselectAll();
        }
    }
});
