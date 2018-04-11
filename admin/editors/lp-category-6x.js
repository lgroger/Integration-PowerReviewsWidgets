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
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category", 
                name: "lgcatselectA", 
                id: "lgcatselectA",
                margin: "0 40 20 0",
                fieldLabel: "Category *",
                width: 220,
                allowBlank: false
            },  
            {
                xtype: "mz-input-checkbox",
                name: "lgoverrideA",
                id: "lgoverrideA",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "lgimageurlA",
                id: "lgimageurlA",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "lgoverrideA"
            }]
        },
        {
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [{
                xtype: 'label',
                forId: 'smallimageb',
                text: 'SMALL IMAGE B',
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
                margin: "0 40 20 0",
                fieldLabel: "Category *",
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
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category",
                name: "smcatselectC",
                margin: "0 20 20 0",
                fieldLabel: "Category *",
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
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category", 
                name: "smcatselectD", 
                id: "smcatselectD",
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
        },
        {
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [{
                xtype: 'label',
                forId: 'smallimagee',
                text: 'SMALL IMAGE E',
                margin: "0 40 10 0"
            },
            {
                xtype: "mz-input-text",
                name: "smcatnameE",
                id: "smcatnameE",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category",
                name: "smcatselectE",
                margin: "0 40 20 0",
                fieldLabel: "Category *",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "smoverrideE",
                id: "smoverrideE",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "smimageurlE",
                id: "smimageurlE",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "smoverrideE"
            }]
        },
        {
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [{
                xtype: 'label',
                forId: 'lgimagef',
                text: 'LARGE IMAGE F',
                margin: "0 40 10 0"
            },
            {
                xtype: "mz-input-text",
                name: "lgcatnameF",
                id: "lgcatnameF",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category",
                name: "lgcatselectF",
                margin: "0 20 20 0",
                fieldLabel: "Category *",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "lgoverrideF",
                id: "lgoverrideF",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            }, 
            {
                xtype: "mz-input-text",
                name: "lgimageurlF",
                id: "lgimageurlF",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "lgoverrideF"
            }]
        }],
        listeners:{
            afterrender: function(){
                Ext.getCmp("designid").setValue("6X");
            }
        }
    }]
});