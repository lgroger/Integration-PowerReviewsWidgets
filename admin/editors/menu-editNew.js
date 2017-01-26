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
              {name:'ntab',type: 'boolean',defaultValue:false}
            ]
});
Ext.define('mmodelnew', {
    extend: 'Ext.data.Model',
    fields: [
              {name:'mcap',type: 'string'},
              {name:'mlink',type: 'string',defaultValue:""},
              {name:'mcol',type: 'boolean',defaultValue:false},
              {name:'ntab',type: 'boolean',defaultValue:false}
            ]
});
Ext.define('mmodelimg', {
    extend: 'Ext.data.Model',
    fields: [
              {name:'mcap',type: 'string'},
              {name:'mlink',type: 'string',defaultValue:""},
              {name:'ntab',type: 'boolean',defaultValue:false},
              {name:'mcol',type: 'boolean',defaultValue:false},
              {name:'mimg',type: 'string',defaultValue:""}
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
			text:"<div style='color:#000;'>Add New Main Menu Item</div>",
			handler:function(){
				Ext.getCmp("gridview").getStore().add({ 'mcap':'Menu Caption','mlink': '','ntab':false});
				//alert(Ext.getCmp("gridview").getStore().getCount());
				rowEditing.cancelEdit();
				rowEditing.startEdit((Ext.getCmp("gridview").getStore().getCount()-1), 0);
			}
		},{
			xtype:"button",
			text:"<div style='color:#000;'>CTA text on mobile view</div>",
			margin:"10",
			handler:function(){
				Ext.create('Ext.window.Window', {
                    title: 'Add/Update CTA Text',
                    id:"ctaEditor",
                    modal:true,
                    autoWidth:true,
                    bodyPadding:5,
                    minWidth:500,
                    minHeight:500,
                    defaults: { anchor: '100%'},
                    layout: 'anchor',
                    items:[
                        {
                            xtype:"htmleditor",
                            width:500,
                            fieldLabel: "CTA Text on mobile menu",
                            height:300,
                            id:"cnttext"
                        },{
                        	xtype:"button",
                        	text:"<div style='color: black'>Save</div>",
                            width:"100%",
                            handler:function(){
                            	//alert("saas");
                            	var arrData=Ext.getCmp("menuData");
                            	var arr = arrData.getValue(); 
                            	if(arr.length>0){
		        					arr[0].cta=Ext.getCmp("cnttext").getValue();
		        					arrData.setValue(arr);
                            	}    
		        				Ext.getCmp("ctaEditor").destroy();
		        				console.log(Ext.getCmp("menuData").getValue());
		        				console.log("-- "+arrData.getValue().length);
		        				 //console.log(Ext.getCmp("menuData").getValue());
		        				console.log("done");
                           }
                        }
	                ],listeners:{
                        afterlayout:function(){
                        	var arrayData = Ext.getCmp('menuData');
                            var arr = arrayData.getValue();
                            if(arr.length<=0){
                           		Ext.Msg.alert("Error","Please add alteaset one Main menu item..! ");
                           		Ext.getCmp("ctaEditor").destroy();
	        					//arr.push({"cta":Ext.getCmp("ctaData").getValue()});
                        	}else{
                        		Ext.getCmp("cnttext").setValue(arr[0].cta);
                        	}
                            console.log(arr);
                        }
                    }
	               }).show();
			}
		},{
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
        	width:"100%",
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
            text : 'Menu Caption',
            dataIndex : 'mcap',editor: {xtype:'textfield',allowBlank:false},flex:2,menuDisabled:true,sortable:false
        },{
            text : 'Link',
            dataIndex : 'mlink',editor: 'textfield',flex:2,menuDisabled:true,sortable:false
        },{
            text : 'New Tab',editor: 'checkbox',
            dataIndex : 'ntab',flex:1,menuDisabled:true,sortable:false
        },{
            xtype:'actioncolumn',
            width:60,flex:1,menuDisabled:true,sortable:false,
            items: [{
              icon: '/resources/images/add-menu.png',
                tooltip: 'Add/Edit Child section',
                margin:"10",
                getClass: function(v, metadata, r, rowIndex, colIndex, store) {                                
                   metadata.attr = "style='margin-right: 18px;'";
                   /*console.log("meta");
                   console.log(metadata);*/
				},
                handler: function(grid, rowIndex, colIndex) {
                    //alert("Edit " +rowIndex);
                    Ext.getCmp("menuWidget").showEditChild(rowIndex);
                }
            },{
                icon: '/resources/images/del-icon.png',
                tooltip: 'Delete',
                handler: function(grid, rowIndex, colIndex) {
                    // alert("Edit " +rowIndex);
                      Ext.Msg.confirm("Menu Editor","Are you Sure you want to delete this menu and child items?",function(btn){
	                 	if(btn=="yes"){
	                 		var arr=Ext.getCmp("menuData").getValue();
	        				arr.splice(rowIndex,1);
	        				Ext.getCmp("menuData").setValue(arr);
	        				//Ext.getCmp("addMenuWin").flag=true;
	                 		Ext.getCmp("gridview").getStore().removeAt(rowIndex);									                 		
	                 	}
	                 })
                }
            },{
				icon: '/resources/images/icon-down.png',
				tooltip: 'Move Down',
				handler: function(grid, rowIndex, colIndex) {
				     //alert("Edit " +rowIndex);
					var arr=Ext.getCmp("menuData").getValue();
					console.log("ridx "+rowIndex);
					if(arr.length-1!=rowIndex){
					var fidx=rowIndex;
					var toIndex=rowIndex+1;
					var element = arr[fidx];
					arr.splice(fidx, 1);
					arr.splice(toIndex, 0, element);
					Ext.getCmp("menuData").setValue(arr);
					console.log("moved "+ fidx+" TO "+toIndex);
					Ext.getCmp("gridview").getStore().loadData(Ext.getCmp("menuData").getValue());
					Ext.getCmp("gridview").getSelectionModel().deselectAll();
				}
				}
			},{
				icon: '/resources/images/icon-up.png',
				tooltip: 'Move Up',
				handler: function(grid, rowIndex, colIndex) {
				     //alert("Edit " +rowIndex);
				    // Ext.getCmp("menuWidget").moveUprow(rowIndex,"gridviewlv3");
				     //console.log("ridx "+rowIndex);
					var arr = Ext.getCmp("menuData").getValue();
					if(rowIndex!=0 && arr.length!=1){
						var fidx=rowIndex;
						var toIndex=rowIndex-1;
						var element = arr[fidx];
						console.log("ele g move");
						//console.log(element);
						arr.splice(fidx, 1);
						arr.splice(toIndex, 0, element);
						Ext.getCmp("menuDatatmp").setValue(arr);
						console.log("moved "+ fidx+" TO "+toIndex);
						//console.log(arrtmp);
						//console.log(Ext.getCmp("menuDatatmp").getValue());
						Ext.getCmp("gridview").getStore().loadData(Ext.getCmp("menuData").getValue());
						Ext.getCmp("gridview").getSelectionModel().deselectAll();
					}
				}
			},{
				icon: '/resources/images/img-edit.png',
					tooltip: 'Add Promo image',
					handler: function(grid, rowIndex, colIndex) {
						Ext.create('menuWin',{
							title:"Select Promo Image",
							id:"promoimgselect",
							rid:rowIndex,
							items:[{
								xtype:"textfield",
								fieldLabel:"Page Link",
								id:"plink"
							},{
								xtype:"mz-input-imageurl",
								fieldLabel:"Select Image (preferred image size width: 980px and height: 120px)",
								id:"promoImg",value:""
							},{
				        	 xtype: 'numberfield',
				        	 fieldLabel : 'Image width in pixel',
				        	 value : '980',
				        	 id:"imWidth",
				        	 step:5
				        },{
				        	 xtype: 'numberfield',
				        	 fieldLabel : 'Image height in pixel',
				        	 value : '120',
				        	 id:"imHeight",
				        	 step:5
				        },{
								xtype:"button",
								margin:"10",
								text:"<div style='padding:10px;color:#000;'>Save</div>",
								handler:function(){
									if(Ext.isDefined(Ext.getCmp("promoImg").getValue()) && Ext.getCmp("promoImg").getValue().length >0){
										//alert(rowIndex);
										//alert(Ext.getCmp("promoImg").getValue());
										var arrtmp=Ext.getCmp("menuData").getValue();
										arrtmp[rowIndex].banner={"imgUrl":Ext.getCmp("promoImg").getValue(),"url":Ext.getCmp("plink").getValue(),"imgwid":Ext.getCmp("imWidth").getValue(),"imghei":Ext.getCmp("imHeight").getValue()};
										Ext.getCmp("menuData").setValue(arrtmp);
										Ext.getCmp("promoimgselect").destroy();
									}else{
										Ext.Msg.alert("Error","Please Select the image");
									}
								}
							},{
								xtype:"button",
								margin:"10",
								text:"<div style='padding:10px;color:#000;'>Delete</div>",
								handler:function(){
									 Ext.Msg.confirm("Menu Editor","Are you Sure you want to delete image for this section?",function(btn){
					                 	if(btn=="yes"){
											var arrtmp=Ext.getCmp("menuData").getValue();
											delete 	arrtmp[rowIndex].banner;
											Ext.getCmp("menuData").setValue(arrtmp);
											Ext.getCmp("promoimgselect").destroy();
					                 		//Ext.getCmp("gridviewlv1").getStore().removeAt(rowIndex);									                 		
					                 	}
					                 })
								}
							}
							],listeners:{
								afterrender:function(){
									var arrtmp=Ext.getCmp("menuData").getValue();
									if(Ext.isDefined(arrtmp[rowIndex].banner)){
										Ext.getCmp("plink").setValue(arrtmp[rowIndex].banner.url);
										Ext.getCmp("promoImg").setValue(arrtmp[rowIndex].banner.imgUrl);
										Ext.getCmp("imWidth").setValue(arrtmp[rowIndex].banner.imgwid);										
										Ext.getCmp("imHeight").setValue(arrtmp[rowIndex].banner.imghei);		
									}
									//alert(Ext.isDefined(arr[Ext.getCmp("promoimgselect").rid].banner));
									//Ext.getCmp("promoImg").setValue()
								}
							}
						}).show();
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
			arr.push({"mcap":new_data.mcap,"mlink":new_data.mlink,"ntab":new_data.ntab,"items":[]});
			arrayData.setValue(arr);

		 }else{
			 var fir={"mcap":new_data.mcap,"mlink":new_data.mlink,"ntab":new_data.ntab,"items":[]};
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
		arrayData.setValue(arr);
		//Ext.example.msg("Updated ", mcap);
	}
	,addMenuView:function(item_name,items_link){
		console.log("added view");
			//Ext.getCmp("gridview").getStore().add({ 'mcap':item_name,'mlink': items_link,'level':"mainnav"});
	},showEditChild:function(idx){
		Ext.create('menuWin',{
					title:"Create/Edit Child for "+Ext.getCmp("menuData").getValue()[idx].mcap,
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
					        /*	var arrdr=Ext.getCmp("menuDatadrag").getValue();
					        	if(arrdr.length>0){
					        		for (var i = 1; i < arrdr.length; i++) {
					        			Ext.getCmp("menuWidget").entryMoveLv2(arrdr[i].f,arrdr[i].t);
					        		}
					        	}
*/					        	var arrayData = Ext.getCmp('menuData');
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
					        	text:"<div style='color:#000;'>Add New Child</div>",
					        	width:"250",
					        	handler:function(){
					        		Ext.getCmp("gridviewlv1").getStore().add({ 'mcap':'Menu Caption','mlink': '','mcol':false,'ntab':false});
									//alert(Ext.getCmp("gridview").getStore().getCount());
									//console.log("addddedd");
									rowEditinglv1.cancelEdit();
									rowEditinglv1.startEdit((Ext.getCmp("gridviewlv1").getStore().getCount()-1), 0);
					        	}
					        },{			xtype:"gridNav",
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
							        				arrtmp.push({"mcap":records[0].data.mcap,"mlink":records[0].data.mlink,"mcol":records[0].data.mcol,"ntab":records[0].data.ntab,"mimg":records[0].data.mimg,"items":[]});
							        				Ext.getCmp("menuDatatmp").setValue(arrtmp);
							        				Ext.getCmp("addMenuWin").flag=true;
							        			},update:function( store, record, operation, eOpts ){
													var arrtmp = Ext.getCmp('menuDatatmp').getValue();
													arrtmp[store.indexOf(record)].mcap=record.data.mcap;
													arrtmp[store.indexOf(record)].mlink=record.data.mlink;
													arrtmp[store.indexOf(record)].mcol=record.data.mcol;
													arrtmp[store.indexOf(record)].ntab=record.data.ntab;
													arrtmp[store.indexOf(record)].mimg=record.data.mimg;
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
									        text : 'Menu Caption',
									        dataIndex : 'mcap',editor: {xtype:'textfield',allowBlank:false},flex:2,menuDisabled:true,sortable:false
									    },{
									        text : 'Link',
									        dataIndex : 'mlink',editor: 'textfield',flex:1,menuDisabled:true,sortable:false
									    },{
									    	text:'Next column',
									    	dataIndex : 'mcol',editor: 'checkbox',flex:1,menuDisabled:true,sortable:false
									    },{
									        text : 'New Tab',editor: 'checkbox',
									        dataIndex : 'ntab',flex:1,menuDisabled:true,sortable:false
									    },{
									        text : 'Banner Image url',editor: 'textfield',
									        dataIndex : 'mimg',flex:1,hidden:true,menuDisabled:true,sortable:false
									    },{
									        xtype:'actioncolumn',menuDisabled:true,sortable:false,
									       flex:2,
									        items: [{
									          icon: '/resources/images/add-menu.png',
									            tooltip: 'Add/Edit Child section',
									            margin:"10",
									            handler: function(grid, rowIndex, colIndex) {
									                if(Ext.getCmp("addMenuWin").flag){
										                Ext.MessageBox.show({
														    title:'Menu Editor',
														    msg: 'Changes are not saved are you sure you want to continue?',
														    buttonText: {yes: "Save and Continue",no: "Discard",cancel: "Cancel"},
														    fn: function(btn){
														    	if(btn=="yes"){
														    		/*var arrayData = Ext.getCmp('menuData');
																	var arr = arrayData.getValue();
														        	arr[Ext.getCmp("addMenuWin").idx].items=[];
														        	var records = Ext.getCmp('gridviewlv1').getStore().getRange();
														        	 for (var i = 0; i < records.length; i++) {
														        	 	console.log(records[i].data);
														        	 	records[i].data.items=[];
														        	 	arr[Ext.getCmp("addMenuWin").idx].items.push(records[i].data);
														        	 }*/
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
									            }
									        },{
									            icon: '/resources/images/del-icon.png',
									            tooltip: 'Delete',
									            handler: function(grid, rowIndex, colIndex) {
									                 //alert("Edit " +rowIndex);
									                 Ext.Msg.confirm("Menu Editor","Are you Sure you want to delete this menu and child items?",function(btn){
									                 	if(btn=="yes"){
									                 		Ext.getCmp("gridviewlv1").getStore().removeAt(rowIndex);									                 		
									                 	}
									                 })
									            }
									        },{
									            icon: '/resources/images/icon-down.png',
									            tooltip: 'Move Down',
									            handler: function(grid, rowIndex, colIndex) {
									                 //alert("Edit " +rowIndex);
									                 Ext.getCmp("menuWidget").moveDownrow(rowIndex,"gridviewlv1");
									                 console.log("ridx "+rowIndex);
									            }
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
					title:"Create/Edit Child for "+Ext.getCmp("menuData").getValue()[topidx].mcap+" -> "+Ext.getCmp("menuData").getValue()[topidx].items[paridx].mcap,
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
					        	text:"<div style='color:#000;'>Add New Child</div>",
					        	width:"250",
					        	handler:function(){
					        		Ext.getCmp("gridviewlv3").getStore().add({ 'mcap':'Menu Caption','mlink': '','mcol':false,'ntab':false});
									//alert(Ext.getCmp("gridview").getStore().getCount());
									//console.log("addddedd");
									rowEditinglv3.cancelEdit();
									rowEditinglv3.startEdit((Ext.getCmp("gridviewlv3").getStore().getCount()-1), 0);
					        	}
					        },{			xtype:"gridNav",
										id:"gridviewlv3",
										title:"",
										width:"100%",
										height:250,
										store: Ext.create("testAppnew.store.Objects",{
											id:"storelv3",
							        		listeners:{
							        			add:function( store, records, index, opts ){
							        				var arrtmp=Ext.getCmp("menuDatatmp").getValue();
							        				arrtmp.push({"mcap":records[0].data.mcap,"mlink":records[0].data.mlink,"mcol":records[0].data.mcol,"ntab":records[0].data.ntab,"items":[]});
							        				Ext.getCmp("menuDatatmp").setValue(arrtmp);
							        				Ext.getCmp("addMenuWinlv3").flag=true;
							        			},update:function( store, record, operation, eOpts ){
													var arrtmp = Ext.getCmp('menuDatatmp').getValue();
													arrtmp[store.indexOf(record)].mcap=record.data.mcap;
													arrtmp[store.indexOf(record)].mlink=record.data.mlink;
													arrtmp[store.indexOf(record)].mcol=record.data.mcol;
													arrtmp[store.indexOf(record)].ntab=record.data.ntab;
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
									        text : 'Group Header',
									        dataIndex : 'mcap',editor: 'textfield',flex:2,menuDisabled:true,sortable:false
									    },{
									        text : 'Link',
									        dataIndex : 'mlink',editor: 'textfield',flex:2,menuDisabled:true,sortable:false
									    },{
									        text : 'New column',editor: 'checkbox',
									        dataIndex : 'mcol',flex:1,menuDisabled:true,sortable:false
									    },{
									        text : 'Open in New Tab',editor: 'checkbox',
									        dataIndex : 'ntab',flex:1,menuDisabled:true,sortable:false
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
									        },{
									            icon: '/resources/images/icon-down.png',
									            tooltip: 'Move Down',
									            handler: function(grid, rowIndex, colIndex) {
									                 //alert("Edit " +rowIndex);
									                 Ext.getCmp("menuWidget").moveDownrow(rowIndex,"gridviewlv3");
									                 console.log("ridx "+rowIndex);
									            }
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