Ext.define('Ext.form.faqForm',{
	extend: 'Ext.form.Panel',
	alias: 'widget.faqForm',
	defaults: { anchor: '100%'},
	layout: 'anchor',
	items:[
		{
	        xtype:"textfield",
	        id:"FQuestion",
	        autoWidth:true,
	        allowBlank:false,
	        fieldLabel:"Question"
	     },{
	        xtype:"taco-htmleditor",
	        autoWidth:true,
	        id:"FAnswer",
	        allowBlank:false,
	        height:250,
	        enableFont: false,
	        fieldLabel:"Answer "

	    }
	]
});
Ext.define('mmodel', {
    extend: 'Ext.data.Model',
    fields: [
      {name:'ques',type: 'string'},
      {name:'ans',type: 'string',defaultValue:""}
    ]
});
Ext.define('testApp.store.Objects', {
    extend: 'Ext.data.Store',
    model : 'mmodel'
});
Ext.widget({
	xtype   : 'mz-form-widget',
	itemId: 'faqWid',
	id:"faqWid",
	defaults: { anchor: '100%'},
	width:"100%",
	selrow:0,
	items:[{
      	xtype:"button",
      	text:"Add New",
      	handler:function(){
      			Ext.create('Ext.window.Window', {
                title: 'Add New Entry',
                id:"QAAddentry",
                columnWidth: 0.5,
                bodyPadding:10,
                layout: 'anchor',
                modal:true,
                width:700,
                minHeight:450,
                closable:true,
               	items:[{
               		xtype:"faqForm",
               		title:"",
               		layout: 'anchor',
               		buttons: [
               		{
               	        text: "<div style='color:#000;width:150px;padding:10px;'>Submit</div>",
				        formBind: true, //only enabled once the form is valid
				        disabled: true,
				        margin:"5",
				        anchor: '100%',
				        handler: function(){
							var arrayData = Ext.getCmp('QAData');
							if(arrayData.getValue().length > 0){
							var arr = arrayData.getValue();
							arr.push({"ques":Ext.getCmp("FQuestion").getValue(),"ans":Ext.getCmp("FAnswer").getValue()});
							arrayData.setValue(arr);
							}else{
							var fir={"ques":Ext.getCmp("FQuestion").getValue(),"ans":Ext.getCmp("FAnswer").getValue()};
							arrayData.setValue(fir);
							}
							Ext.getCmp("faqWid").addtoView(Ext.getCmp("FQuestion").getValue());
							Ext.getCmp("QAAddentry").destroy();
				        }
               		},{
				        text: "<div style='color:#000;width:150px;padding:10px'>Reset</div>",
				        margin:"5",
				       	anchor: '100%',
				        handler: function() {
				            this.up('form').getForm().reset();
				        }
				    },
               	]
               }]

        }).show();
      	}
      },{
		xtype:"grid",
		id:"gridview",
        store: Ext.create("testApp.store.Objects",{
        		id:"storeel"
        }),columns: [
		    {header:'Question',dataIndex:'ques',flex:2},
		    {
	            xtype:'actioncolumn',
	            width:60,flex:1,
	            items: [{
	              icon: '/resources/images/edit-btn-icon.png',
	                tooltip: 'edit-menu Question',
	                margin:"10",
	                handler: function(grid, rowIndex, colIndex) {
	               		Ext.getCmp("faqWid").showUpdate(rowIndex);
	             	}
	           },{
	              icon: '/resources/images/del-icon.png',
	                tooltip: 'Delete Question',
	                margin:"10",
	                handler: function(grid, rowIndex, colIndex) {
	                    //alert("Edit " +rowIndex);
                     Ext.Msg.confirm("Warning","Are you sure you want to delete this question",function(btn){
                    	if(btn=="yes"){
                    		 Ext.getCmp("faqWid").delItem(rowIndex);
                    	}
                    });
	             }
	           }]
	        }
		],listeners : {
		    afterrender:function(){
		    	console.log("loaded..!");
		    	Ext.getCmp("gridview").getStore().loadData(Ext.getCmp("QAData").getValue());
		    }
		}
	},{
        xtype       : "taco-arrayField",
        name        : "data",
        itemId      : "QAData",
        id          : "QAData",
        width       : '0%',
        Model       :'mmodel',
        hidden      : true
      }
    ],addtoView:function(ques){
    	Ext.getCmp("gridview").getStore().add({"ques":ques});
    },delItem:function(idx){
    	var arrayData = Ext.getCmp('QAData');
        var arr = arrayData.getValue();
        arr.splice(idx,1);
        arrayData.setValue(arr);
        Ext.getCmp("gridview").getStore().removeAt(idx);
    },showUpdate:function(idx){
		Ext.create('Ext.window.Window', {
            title: 'Update Question',
            id:"QAUpdateentry",
            columnWidth: 0.5,
            bodyPadding:10,
            layout: 'anchor',
            modal:true,
            ridx:idx,
            width:700,
            minHeight:450,
            closable:true,
           	items:[{
           		xtype:"faqForm",
           		title:"",
           		layout: 'anchor',
           		buttons: [
           		{
           	        text: "<div style='color:#000;width:150px;padding:10px;'>Submit</div>",
			        formBind: true, //only enabled once the form is valid
			        disabled: true,
			        margin:"5",
			        anchor: '100%',
			        handler: function(){
						var arrayData = Ext.getCmp('QAData');
						var arr = arrayData.getValue();
						arr[Ext.getCmp("QAUpdateentry").ridx].ques=Ext.getCmp("FQuestion").getValue();
						arr[Ext.getCmp("QAUpdateentry").ridx].ans=Ext.getCmp("FAnswer").getValue();
						arrayData.setValue(arr);
						 var models=Ext.getCmp("gridview").getStore().getRange();
						  models[Ext.getCmp("QAUpdateentry").ridx].set("ques",Ext.getCmp("FQuestion").getValue());
						//Ext.getCmp("faqWid").addtoView(Ext.getCmp("FQuestion").getValue());
						Ext.getCmp("QAUpdateentry").destroy();			        
           			}
           		},{
           			  text: "<div style='color:#000;width:150px;padding:10px;'>Close</div>", margin:"5",
			        anchor: '100%',
			        handler: function(){
			        	Ext.getCmp("QAUpdateentry").destroy();	
			        }

           		}
           	]
           }],listeners:{
           	afterrender:function(){
				var arrayData = Ext.getCmp('QAData');
				var arr = arrayData.getValue();
           		Ext.getCmp("FQuestion").setValue(arr[Ext.getCmp("QAUpdateentry").ridx].ques);
           		Ext.getCmp("FAnswer").setValue(arr[Ext.getCmp("QAUpdateentry").ridx].ans);
           	}
           }

    }).show();
    }
});