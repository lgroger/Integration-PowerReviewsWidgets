Ext.define('mmodel', {
    extend: 'Ext.data.Model',
    fields: [
          {name:'bcap',type: 'string'}
        ]
});
Ext.define('testApp.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodel'
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
    xtype: "mz-form-widget",
    itemId: "CatEditor",
    id:"CatEditor",
    bodyPadding:"10",
    layout: 'anchor',
    items:[{
            xtype       : "taco-arrayField",
            name        : "data",
            itemId      : "ulData",
            id          : "ulData",
            width       : '1%',
            model:'mmodel',
            hidden      : true
        },{
        xtype:"taco-htmleditor",
        fieldLabel: "Title",
        anchor: '97%',
        height: 140,
        name:"titleHtml",
        enableFont: false,
        id:"titleHtml",
        listeners:{
            afterrender:function(){
                Ext.getCmp("titleHtml").toggleSourceEdit(true);
            }
        }
    },{
    	xtype:"taco-htmleditor",
	    fieldLabel: "Content",
        anchor: '97%',
        height: 200,
		name:"moreContent",
	    enableFont: false,
	    id:"moreContent",
        listeners:{
            afterrender:function(){
                Ext.getCmp("moreContent").toggleSourceEdit(true);
            }
        }
    },{
            title: 'Bulletted List',
            xtype: 'grid',
            anchor: '97%',
            height: 200,
            selrow:0,
            flag:false,
            dragpid:1,
            id:"gridpan",
            overflowY: 'auto',
            hideHeaders:true,
            selModel: {
             mode: 'rowmodel'
            },dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                bodyPadding:10,
                items: [{
                    xtype: 'button',
                    text: '<div style="color:#4caf50;">Add New Item</div>',
                    handler:function(){
                        Ext.getCmp("gridpan").getStore().add({ 'bcap':''});
                        rowEditing.cancelEdit();
                        rowEditing.startEdit((Ext.getCmp("gridpan").getStore().getCount()-1), 0);
                    }
                }]
            }],
        store:Ext.create("testApp.store.Objects",{
            id:"storeel",
            listeners:{
                add:function( store, records, index, opts ){
                     //console.log(records[0].data);
                     console.log("here");
                     console.log(index);
                    Ext.getCmp("CatEditor").addListItem(records[0].data);
                },update:function( store, record, operation, eOpts ){
                    Ext.getCmp("CatEditor").updateListItem(record.data,store.indexOf(record));
                }
            }
        }),plugins:[rowEditing],columns : [{
            text : 'Available List',
            dataIndex : 'bcap',editor: {xtype:'textfield'},flex:2,menuDisabled:true,sortable:false
        },{
            xtype:'actioncolumn',
            width:30,flex:1,menuDisabled:true,sortable:false,
            items: [{
                icon: '/resources/images/del-icon.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                       var arr=Ext.getCmp("ulData").getValue();
                        arr.splice(rowIndex,1);
                        Ext.getCmp("ulData").setValue(arr);
                        Ext.getCmp("gridpan").getStore().removeAt(rowIndex);   
                        Ext.Msg.alert('Status', 'Item has been deleted');                                                   
                    }
            }]
        }],listeners : {
            afterrender:function(){
                if (this.store.getCount() == 0) {
                console.log('store not loaded yet');
                this.store.loadData(Ext.getCmp("ulData").getValue());
                this.store.on('load', function() {
                    console.log('load after render');
                }, this, {
                    single: true
                });
            } else {
                this.store.loadData(Ext.getCmp("ulData").getValue());
                console.log('store already loaded');
            }
            }
        }
    },{
        xtype: 'container',
        layout:{
            type: 'hbox',
            pack: 'start',
            align: 'stretch'
        },
        items:[
                {
                xtype:"textfield",
                fieldLabel:"Read More text",
                name:"readmore",
                id:"readmore",
                flex:1,
                margin: '15px 15px 0 15px',
                value:"read more"
            },{
                xtype:"textfield",
                fieldLabel:"Read less text",
                name:"readless",
                flex:1,
                margin: '15px 15px 0 15px',
                id:"readless",
                value:"read less"
            }
        ]
    }
    ],addListItem:function(new_data,arr){
        var arrayData = Ext.getCmp('ulData');
         if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            arr.push({"bcap":new_data.bcap});
            arrayData.setValue(arr);
         }else{
             var fir={"bcap":new_data.bcap};
             arrayData.setValue(fir);
         }
    },updateListItem:function(new_data,idx){
        var arrayData = Ext.getCmp('ulData');
        var arr = arrayData.getValue();
        arr[idx].bcap=new_data.bcap;
        arrayData.setValue(arr);
    }
});