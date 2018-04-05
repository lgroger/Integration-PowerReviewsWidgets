Ext.widget({
    xtype   : 'mz-form-widget',
    itemId: 'LP-category',
    id:'lp-category',
    anchor: "100%",
    items: [{
            xtype: "mz-input-text",
            name: "designid",
            id: "designid",
            fieldLabel: "LP",
            hidden: true
        }, 
        {
            xtype: "panel",
            layout: 'hbox',
            anchor: '100%',
            items: [
                {
                    xtype: "panel",
                    layout: 'vbox',
                    anchor: '100%',
                    items: [{
                            xtype: 'label',
                            forId: 'largeimagea',
                            text: 'LARGE IMAGE A',
                            margin: "0 40 10 0"
                        },
                        {
                            xtype: "mz-input-text",
                            name: "lgcatnameA",
                            id: "lgcatnameA",
                            fieldLabel: "Name",
                            margin: '0 40 20 0',
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text", 
                            name: "lgcaturlA", 
                            id: "lgcaturlA",
                            margin: "0 40 20 0",
                            fieldLabel: "URL",
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "lgimageurlA",
                            id: "lgimageurlA",
                            fieldLabel: "Image URL",
                            margin: "0 40 40 0",
                            width: 220,
                            allowBlank: false
                        }]
                },
                {
                    xtype: "panel",
                    layout: 'vbox',
                    anchor: '100%',
                    items: [{
                            xtype: 'label',
                            forId: 'largeimageb',
                            text: 'large IMAGE B',
                            margin: "0 40 10 0"
                        },
                        {
                            xtype: "mz-input-text",
                            name: "lgcatnameB",
                            id: "lgcatnameB",
                            fieldLabel: "Name",
                            margin: '0 40 20 0',
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "lgcaturlB",
                            id: "lgcaturlB",
                            margin: "0 40 20 0",
                            fieldLabel: "URL",
                            width: 220,
                            allowBlank: false
                        },
                        
                        {
                            xtype: "mz-input-text",
                            name: "lgimageurlB",
                            id: "lgimageurlB",
                            fieldLabel: "Image URL",
                            margin: "0 40 40 0",
                            width: 220,
                            allowBlank: false
                        }]
                },{
                    xtype: "panel",
                    layout: 'vbox',
                    anchor: '100%',
                    items: [{
                            xtype: 'label',
                            forId: 'smallimagec',
                            text: 'SMALL IMAGE C',
                            margin: "0 40 10 0"
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcatnameC",
                            id: "smcatnameC",
                            fieldLabel: "Name",
                            margin: '0 40 20 0',
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcaturlC",
                            id: "smcaturlC",
                            margin: "0 20 20 0",
                            fieldLabel: "URL ",
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smimageurlC",
                            id: "smimageurlC",
                            fieldLabel: "Image URL",
                            margin: "0 40 40 0",
                            width: 220,
                            allowBlank: false
                        }]
                }
                ]
        },
        {
            xtype: "panel",
            layout: 'hbox',
            anchor: '100%',
            items: [
                
                {
                    xtype: "panel",
                    layout: 'vbox',
                    anchor: '100%',
                    items: [
                        {
                            xtype: 'label',
                            forId: 'smallimaged',
                            text: 'SMALL IMAGE D',
                            margin: "0 40 10 0"
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcatnameD",
                            id: "smcatnameD",
                            fieldLabel: "Name",
                            margin: '0 40 20 0',
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text", 
                            name: "smcaturlD", 
                            id: "smcaturlD",
                            fieldLabel: "URL *",
                            margin: "0 40 20 0",
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smimageurlD",
                            id: "smimageurlD",
                            fieldLabel: "Image URL",
                            margin: "0 40 40 0",
                            width: 220,
                            allowBlank: false

                        }]
                },
                {
                    xtype: "panel",
                    layout: 'vbox',
                    anchor: '100%',
                    items: [
                        {
                            xtype: 'label',
                            forId: 'smallimagee',
                            text: 'SMALL IMAGE E',
                            margin: "0 40 10 0"
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcatnameE",
                            id: "smcatnameE",
                            fieldLabel: "Name",
                            margin: '0 40 20 0',
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcaturlE",
                            id: "smcaturlE",
                            margin: "0 40 20 0",
                            fieldLabel: "URL",
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smimageurlE",
                            id: "smimageurlE",
                            fieldLabel: "Image URL",
                            margin: "0 40 40 0",
                            width: 220,
                            allowBlank: false

                        }]
                },
                {
                    xtype: "panel",
                    layout: 'vbox', 
                    anchor: '100%',
                    items: [{
                            xtype: 'label',
                            forId: 'smimagef',
                            text: 'Small IMAGE F',
                            margin: "0 40 10 0"
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcatnameF",
                            id: "smcatnameF",
                            fieldLabel: "Name",
                            margin: '0 40 20 0',
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smcaturlF",
                            id: "smcaturlF",
                            margin: "0 20 20 0",
                            fieldLabel: "URL",
                            width: 220,
                            allowBlank: false
                        },
                        {
                            xtype: "mz-input-text",
                            name: "smimageurlF",
                            id: "smimageurlF",
                            fieldLabel: "Image URL",
                            margin: "0 40 40 0",
                            width: 220,
                            allowBlank: false
                        }]
                }],
            listeners:{
                afterrender: function(){
                    Ext.getCmp("designid").setValue("PI");
                }
            }
        }]
});