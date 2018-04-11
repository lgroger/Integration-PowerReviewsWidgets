
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
              {name:'hdrname',type: 'string'}
            ]
});
Ext.define('testApp.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodel'
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
            handler:function(){
                Ext.getCmp("gridview").getStore().add({ 'mcap':'Category Name','mlink': ''});
                //alert(Ext.getCmp("gridview").getStore().getCount());
                rowEditing.cancelEdit();
                rowEditing.startEdit((Ext.getCmp("gridview").getStore().getCount()-1), 0);
            }
         },
        {
            xtype: 'textfield',
            name: 'hdrname',
            id: 'hdrname',
            fieldLabel: 'Header Name',
            margin: "0 0 20 40", 
            style:{
                display: "inline-block",
                top: "-20",
                position: "relative"
            },
            allowBlank: false
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
            xtype:"gridNav",
            id:"gridview",
            title:"",
            width:"100%",
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
            xtype:'actioncolumn',
            width:60,flex:1,menuDisabled:true,sortable:false,
            items: [{
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
        }],   
            listeners : {
                afterrender:function(){
                    console.log("loading");
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
        }
    ],addMenuData:function(new_data,arr){
        var arrayData = Ext.getCmp('menuData');
         if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            arr.push({"mcap":new_data.mcap,"mlink":new_data.mlink});
            arrayData.setValue(arr);

         }else{
             var fir={"mcap":new_data.mcap,"mlink":new_data.mlink};
             arrayData.setValue(fir);
         }
        // Ext.getCmp("menuWidget").addMenuView(mcap,mlink);
         console.log("Item Added to array");
    },updateMenuData:function(new_data,idx){
        var arrayData = Ext.getCmp('menuData');
        var arr = arrayData.getValue();
        arr[idx].mcap=new_data.mcap;
        arr[idx].mlink=new_data.mlink;
        arrayData.setValue(arr);
        //Ext.example.msg("Updated ", mcap);
    }
    ,addMenuView:function(item_name,items_link){
        console.log("added view");
            //Ext.getCmp("gridview").getStore().add({ 'mcap':item_name,'mlink': items_link,'level':"mainnav"});
    }
});
