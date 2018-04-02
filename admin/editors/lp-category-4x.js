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
        items: [{
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [
            {
                xtype: 'label',
                forId: 'smallimagea',
                text: 'IMAGE A',
                margin: "0 40 10 0"
            },
            {
                xtype: "mz-input-text",
                name: "smcatnameA",
                id: "smcatnameA",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            { 
                xtype: "mz-input-category", 
                name: "smcatselectA", 
                id: "smcatselectA",
                fieldLabel: "Category *",
                margin: "0 40 20 0",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "smoverrideA", 
                id: "smoverrideA",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "smimageurlA",
                id: "smimageurlA",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "smoverrideA"
            }]
        },
        {
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [{
                xtype: 'label',
                forId: 'smallimageb',
                text: 'IMAGE B',
                margin: "0 40 10 0"
            },
            {
                xtype: "mz-input-text",
                name: "smcatnameB",
                id: "smcatnameB",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category",
                name: "smcatselectB",
                fieldLabel: "Category *",
                margin: "0 40 20 0",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "smoverrideB",
                id: "smoverrideB",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "smimageurlB",
                id: "smimageurlB",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "smoverrideB"
            }]
        },
        {
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [
            {
                xtype: 'label',
                forId: 'smallimagec',
                text: 'IMAGE C',
                margin: "0 40 10 0"
            },
            {
                xtype: "mz-input-text",
                name: "smcatnameC",
                id: "smcatnameC",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category", 
                name: "smcatselectC", 
                id: "smcatselectC",
                fieldLabel: "Category *",
                margin: "0 40 20 0",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "smoverrideC",
                id: "smoverrideC",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "smimageurlC",
                id: "smimageurlC",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "smoverrideC"
            }]
        }]
    },
    {
        xtype: "panel",
        layout: 'hbox',
        anchor: '100%',
        items: [{
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [{
                xtype: 'label',
                forId: 'smallimaged',
                text: 'IMAGE D',
                margin: "0 40 10 0"
            },
            {
                xtype: "mz-input-text",
                name: "smcatnameD",
                id: "smcatnameD",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category",
                name: "smcatselectD",
                fieldLabel: "Category *",
                margin: "0 40 20 0",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "smoverrideD",
                id: "smoverrideD",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "smimageurlD",
                id: "smimageurlD",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "smoverrideD"
            }]
        }],
        listeners:{
            afterrender: function(){
                Ext.getCmp("designid").setValue("4X");
            }
        }
    }]
});