Ext.define('Ext.form.newsForm',{
	extend: 'Ext.form.Panel',
	alias: 'widget.newsForm',
	defaults: { anchor: '100%'},
	layout: 'anchor',
	items:[
		{
			xtype:'textfield',
			fieldLabel:'News Head Line',
			allowBlank:false,
			id:"newsHeadText",
			layout:"anchor"
		},{
			xtype:'textfield',
			fieldLabel:'Media Source',
			id:'newsSrc'
		},{
			xtype: 'datefield',
			fieldLabel:"Date",
			id:'newsDate',
			format:"m/d/Y",
			value:new Date
		 },{
			xtype:'textfield',
			fieldLabel:"News post page link",
			id:"newsLink",
			allowBlank:false,
			vtype:'url'
		}
	]
});
Ext.widget({
    xtype:'mz-form-widget',
    title:"",
    itemId: 'pressWidget',
	id:"pressWidget",
	layout:"anchor",
	 listeners:{
        'render':function(){
        	//Ext.Msg.alert("Done");
        	Ext.getCmp("pressWidget").add(Ext.widget({
			        title: 'Press Page Entry List',
			        xtype: 'grid',
			        defaults: { anchor: '100%'},
			        width:"90%",
			        selrow:0,
			        flag:false,
			        dragpid:1,
			        //autoScroll: true,
			        height:450,
			        id:"gridpan",
			        overflowY: 'auto',
			        selModel: {
			            mode: 'rowmodel'
			        },
			        viewConfig: {
			            plugins: {
			                ptype: 'gridviewdragdrop'
			            },
			            listeners: {
			            	
			                beforedrop: function(node, data, dropRec, dropPosition) {
			                	var record = data.records[0],
								index = Ext.getCmp("gridpan").getView().indexOf(record);
								Ext.getCmp("pressWidget").dragpid=Ext.getCmp("gridpan").getStore().getAt(index).get("pid");
								Ext.getCmp("pressWidget").selrow=index;
								Ext.getCmp("pressWidget").flag=true;
			                	//console.log("Start  "+ index+" pos "+dropPosition);
			                },
			                drop:function(node, data, dropRec, dropPosition){
			                	var record = data.records[0],
								index = Ext.getCmp("gridpan").getView().indexOf(record);
								console.log("Start  "+ index+" pos "+dropPosition);
			                	console.log("node "+ index+" pos "+dropPosition);
			                	Ext.getCmp("pressWidget").entryMove(Ext.getCmp("pressWidget").dragpid,index);
			                }
			            }
			        },
			        store: {
			            fields: ['pid','date', 'headline']
			        },
			        columns: [
			            {header:'pid',hidden:true,dataIndex:'pid'},
			            { header: 'Date', dataIndex: 'date' },
			            { header: 'Head Line', dataIndex: 'headline',width:'50%' },
			            {
		                header: '',
		                renderer: function (v, m, r) {
		                    var id = Ext.id();
		                    Ext.defer(function () {
		                        Ext.widget('button', {
		                            renderTo: id,
		                            text: 'Edit',
		                            width: 75,
		                            pressid:r.get('pid'),
		                            handler: function () {
		                            	Ext.getCmp("pressWidget").showUpdateWindow(r.get('pid'));
		                             //Ext.Msg.alert('Info', r.get('headline'))
		                         }
		                        });
		                    }, 50);
		                    return Ext.String.format('<div id="{0}"></div>', id);
		                }
					},
					 {
		                header: '',
		                renderer: function (v, m, r,ridx) {
		                    var id = Ext.id();
		                    Ext.defer(function () {
		                        Ext.widget('button', {
		                            renderTo: id,
		                            text: 'Delete',
		                            width: 75,
		                            pressid:r.get('pid'),
		                            handler: function () {
		                            Ext.Msg.confirm("Warning","Are you sure you want to delete this entry",function(btn){
		                            	if(btn=="yes"){
		                            		Ext.getCmp("pressWidget").delItem(r.get('pid'),ridx);
		                            	}
		                            });
		                             //Ext.Msg.alert('Info', r.get('headline'))
		                         }
		                        });
		                    }, 50);
		                    return Ext.String.format('<div id="{0}"></div>', id);
		                }
					}
			        ],height: 400
			    }));  	
			     console.log("load final");
           // console.log("loadadaa "+Ext.getCmp('pressData').getValue()[0].newsEntry.length);
           if(Ext.getCmp('pressData').getValue().length>0){
             for(var i=0;i<Ext.getCmp('pressData').getValue()[0].newsEntry.length;i++){
                // Ext.getCmp('pressData').addItemCategory(Ext.getCmp('categoryData').getValue()[i].Category);
                Ext.getCmp("pressWidget").addNewItemGrid(Ext.getCmp('pressData').getValue()[0].newsEntry[i].pid,Ext.getCmp('pressData').getValue()[0].newsEntry[i].date,Ext.getCmp('pressData').getValue()[0].newsEntry[i].head);
                console.log("text " +Ext.getCmp('pressData').getValue()[0].newsEntry[i].head);
             }	
           }
				//Ext.getCmp("pressWidget").addNewItemGrid();
        }
    },
	items:[{
		xtype:"button",
		text:"<div style=color:#000;>Add New Entry</div>",
		layout:"anchor",
		margin:"10",
		handler:function(){
			Ext.getCmp('pressWidget').showAddWin();
		}
	},{
            xtype       : "taco-arrayField",
            name        : "data",
            itemId      : "pressData",
            id          : "pressData",
            width       : '1%',
            hidden      : true
        }

	],showAddWin:function(){
		Ext.create('Ext.window.Window', {
                title: 'Add New Entry',
                id:"pressAddEntry",
                columnWidth: 0.5,
                bodyPadding:10,
                layout: 'anchor',
                modal:true,
                width:700,
                minHeight:450,
                closable:true,
               	items:[{
               		xtype:"newsForm",
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
				        	Ext.getCmp("pressWidget").addNewItem(Ext.getCmp("newsHeadText").getValue(),Ext.getCmp("newsSrc").getValue(),Ext.getCmp("newsDate").getValue(),Ext.getCmp("newsLink").getValue());
				        	//Ext.Msg.alert("",this.ownerCt.getXType());
				        	Ext.getCmp("pressAddEntry").destroy();
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
	},addNewItem:function(nhead,nres,ndate,nlink){
		var arrayData = Ext.getCmp('pressData');
		var pid=1;
        if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            pid=arr[0].idCounter+1;
            arr[0].newsEntry.push({"pid":pid,"head":nhead,"res":nres,"date":Ext.Date.format(ndate, 'm/d/Y'),"link":nlink});
            arr[0].idCounter= pid;
            arrayData.setValue(arr);
        }else{
            var fir={"idCounter":1,"newsEntry":[{"pid":1,"head":nhead,"res":nres,"date":Ext.Date.format(ndate, 'm/d/Y'),"link":nlink}]};
            arrayData.setValue(fir);
        }
        Ext.getCmp('pressWidget').addNewItemGrid(pid,Ext.Date.format(ndate, 'm/d/Y'),nhead);
	},delItem:function(pid,ridx){
		//alert(Ext.getCmp("pressWidget").getIndexinArray(pid));
		var arrayData = Ext.getCmp('pressData');
        var arr = arrayData.getValue();
        var didx=Ext.getCmp("pressWidget").getIndexinArray(pid);
        arr[0].newsEntry.splice(didx,1);
        arrayData.setValue(arr);
         Ext.getCmp("gridpan").getStore().removeAt(didx);
	},addNewItemGrid:function(pid,ndate,nhead){
		Ext.getCmp("gridpan").getStore().add( { 'pid':pid,'date': ndate, 'headline': nhead });
		console.log("added..!");
	},showUpdateWindow:function(pid){
		//Ext.Msg.alert("Pid "+pid);
		Ext.create('Ext.window.Window', {
                title: 'Update Entry',
                id:"pressUpdateEntry",
                columnWidth: 0.5,
                bodyPadding:10,
                layout: 'anchor',
                modal:true,
                width:700,
                pressidx:pid,
                minHeight:450,
                closable:true,
               	items:[{
               		xtype:"newsForm",
               		title:"",
               		layout: 'anchor',
               		buttons: [
               		{
               	        text: "<div style='color:#000;width:150px;padding:10px;'>Update</div>",
				        formBind: true, //only enabled once the form is valid
				        disabled: true,
				        margin:"5",
				        anchor: '100%',
				        handler: function(){
				        	//Ext.getCmp("pressWidget").addNewItem(Ext.getCmp("newsHeadText").getValue(),Ext.getCmp("newsSrc").getValue(),Ext.getCmp("newsDate").getValue(),Ext.getCmp("newsLink").getValue());
				        	//Ext.Msg.alert("",this.ownerCt.getXType());
				        var idx=Ext.getCmp("pressWidget").getIndexinArray(Ext.getCmp("pressUpdateEntry").pressidx);
               			var arrayData = Ext.getCmp('pressData');
              			var arr = arrayData.getValue();
              			arr[0].newsEntry[idx].head=Ext.getCmp("newsHeadText").getValue();
              			arr[0].newsEntry[idx].res=Ext.getCmp("newsSrc").getValue();
              			arr[0].newsEntry[idx].date=Ext.Date.format(Ext.getCmp("newsDate").getValue(), 'm/d/Y');
              			arr[0].newsEntry[idx].link=Ext.getCmp("newsLink").getValue();
              			 arrayData.setValue(arr);
              			 var models=Ext.getCmp("gridpan").getStore().getRange();
              			 models[idx].set("date",Ext.Date.format(Ext.getCmp("newsDate").getValue(), 'm/d/Y'));
              			 models[idx].set("headline", Ext.getCmp("newsHeadText").getValue());

				        	Ext.getCmp("pressUpdateEntry").destroy();
				        }
               		}
               	],listeners:{
               		afterlayout:function(){
               			var idx=Ext.getCmp("pressWidget").getIndexinArray(pid);
               			var arrayData = Ext.getCmp('pressData');
              			var arr = arrayData.getValue();
              			//console.log("type "+Ext.getCmp("newsHeadText").getXType());
              			Ext.getCmp("newsHeadText").setValue(arr[0].newsEntry[idx].head);
              			Ext.getCmp("newsSrc").setValue(arr[0].newsEntry[idx].res);
              			Ext.getCmp("newsDate").setValue(arr[0].newsEntry[idx].date);
              			Ext.getCmp("newsLink").setValue(arr[0].newsEntry[idx].link);
               		}
               	}
               }]

        }).show();

	},getIndexinArray:function(pid){
		var arrayData = Ext.getCmp('pressData');
        var arr = arrayData.getValue();
        console.log("len "+arr[0].newsEntry.length);
		for (var i=0; i<arr[0].newsEntry.length; i++) {
		    if (arr[0].newsEntry[i].pid == pid) {
		    	console.log("com "+arr[0].newsEntry[i].pid);
		    	return i;
		    }
		}
		return -1;
	},entryMove:function(pid,toIndex){
		var fromIndex=Ext.getCmp("pressWidget").getIndexinArray(pid);
		var arrayData = Ext.getCmp('pressData');
        var arr = arrayData.getValue();
		var element = arr[0].newsEntry[fromIndex];
		arr[0].newsEntry.splice(fromIndex, 1);
		arr[0].newsEntry.splice(toIndex, 0, element);
		arrayData.setValue(arr);
		console.log("moved "+ fromIndex+" TO "+toIndex);
	}
});