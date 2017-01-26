Ext.define("Ext.panel.tabPan", {
    extend: "Ext.tab.Panel",
    alias:"widget.tabPanel",
    anchor:"100%",
    height: 500,
    activeTab: 0,
    bodyPadding: 10,
    tabPosition: "top"   
});

Ext.widget({
    xtype: "mz-form-widget",
    itemId: "Image Editor",
    items:[{
		xtype:"tabPanel",
        items:[
            {
                 title: "Select Image",
                defaults: { anchor: '100%'},
                layout: 'anchor',
                bodyPadding: "10",
                items: [{
                    xtype:"mz-input-image-nostyle",
                    defaults: { anchor: '100%'},
                    layout:"anchor",
                    name:"imageEditor",
                    id:"imageEditor"
                  },{
                    xtype:"numberfield",
                    fieldLabel:"Image Max width in pixel",
                    id:"imgMaxSize",
                    value:'1200',
                    name:"imgMaxSize",
                    layout: 'default',
                    step:5,
                    width:"115px"
                  }
                  ]
            },{
                title:"Style & Link",
                anchor:"100%",
                layout: 'anchor',
                items:[{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        pack: 'start',
                        align: 'stretch'
                    },
                    items:[
                        { 
                        xtype:"numberfield",
                        fieldLabel: 'Border width',
                        name: 'borderWidth',
                        value: '0',
                        flex:1,
                        margin: '15px 15px 0 15px'
                  },{
                        xtype:"mz-input-dropdown",
                        fieldLabel: 'Border Style',
                        store: ["none","solid","dashed","dotted"],
                        value:"none",
                        flex:1,
                        name:"borderStyle",
                        margin: '15px 15px 0 15px'
                     },{
                        xtype:"mz-input-color",
                        name:"borderColor",
                        flex:1,
                        fieldLabel:"Border Color"
                     }
                        ]
                    },{
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        pack: 'start',
                        align: 'stretch'
                    },items:[{ 
                        xtype:"mz-input-dropdown",
                        fieldLabel: 'Fill Style',
                        store: ["Aspect Ratio","Fill Area"],
                        value:"Aspect Ratio",
                        name:"fillStyle",
                        id:"fillStyle",
                        flex:1,
                        listeners:{
                            afterlayout:function(){
                                if(Ext.getCmp("fillStyle").getValue()==="Fill Area"){
                                    Ext.getCmp("BackgroundHPos").enable();
                                    Ext.getCmp("BackgroundVPos").enable();
                                }else{
                                    Ext.getCmp("BackgroundHPos").disable();
                                      Ext.getCmp("BackgroundVPos").disable();
                                }
                            },
                            change:function () {
                                if(Ext.getCmp("fillStyle").getValue()==="Fill Area"){
                                    Ext.getCmp("BackgroundHPos").enable();
                                    Ext.getCmp("BackgroundVPos").enable();
                                }else{
                                      Ext.getCmp("BackgroundHPos").disable();
                                      Ext.getCmp("BackgroundVPos").disable();
                                }
                            }
                        },
                        margin: '15px 15px 0 15px'
                      },{
                            xtype:"mz-input-dropdown",
                            fieldLabel: 'Background horizontal position',
                            name: 'BackgroundHPos',
                            id:"BackgroundHPos",
                            flex:1,
                            store: ["left","center","right"],
                            value:"center",
                            disabled: true,
                            margin: '15px 15px 0 15px'

                         },{
                            xtype:"mz-input-dropdown",
                            fieldLabel: 'Background vertical position',
                            name: 'BackgroundVPos',
                            id: 'BackgroundVPos',
                            flex:1,
                            store: ["top","center","bottom"],
                            value:"center",
                            disabled: true,
                            margin: '15px 15px 0 15px'
                         }
                            ]
                        },{
                             xtype: 'container',
                            layout: {
                                type: 'hbox',
                                pack: 'start',
                                align: 'stretch'
                            },items:[
                                {
                                     xtype:"textfield",
                                    name:"linkTo",
                                    flex:2,
                                    fieldLabel:"Link",
                                     margin: '15px 15px 0 15px'
                                },{
                                    xtype: "mz-input-checkbox",
                                    name: "newTab",
                                    flex:2,
                                    fieldLabel: "Open Link in new tab",
                                    margin: '30px 15px 0 15px'
                                }
                            ]
                        }
                   ]
            }
        ]
    }]
});