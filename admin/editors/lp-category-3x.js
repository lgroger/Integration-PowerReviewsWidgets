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
        xtype: 'radiogroup',
        fieldLabel: '',
        vertical: true,
        items: [
            { boxLabel: 'Large Image on Left', name: 'layout', inputValue: 'Left', checked: true},
            { boxLabel: 'Large Image on Right', name: 'layout', inputValue: 'Right'}
        ],
        margin: "0 0 20 0",
        width: 500
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
                forId: 'largeimage',
                text: 'LARGE IMAGE',
                margin: "0 40 10 0"
            }, 
            {
                xtype: "mz-input-text",
                name: "lgcatname",
                id: "lgcatname",
                fieldLabel: "Category Name",
                margin: '0 40 20 0',
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-category", 
                name: "lgcatselect", 
                id: "lgcatselect",
                fieldLabel: "Category *",
                margin: "0 40 20 0",
                width: 220,
                allowBlank: false
            },
            {
                xtype: "mz-input-checkbox",
                name: "lgoverride",
                id: "lgoverride",
                fieldLabel: "Override Image",
                margin: "0 40 20 0"
            },
            {
                xtype: "mz-input-text",
                name: "lgimageurl",
                id: "lgimageurl",
                fieldLabel: "Image URL",
                margin: "0 40 40 0",
                width: 220,
                disabled: true,
                enableIf: "lgoverride"
            }]
        },
        {
            xtype: "panel",
            layout: 'vbox',
            anchor: '100%',
            items: [{
                xtype: 'label',
                forId: 'smallimagea',
                text: 'SMALL IMAGE A',
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
                margin: "0 40 20 0",
                fieldLabel: "Category *",
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
                fieldLabel: "Category *",
                margin: "0 20 20 0",
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
        }],
        listeners:{
            afterrender: function(){
                Ext.getCmp("designid").setValue("3XL");
            }
        }
    }]
});