Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'lp-category-html',  
    id:'lp-category-html',
    anchor: "100%",  
    items: [
        {
            xtype: "mz-input-text",
            name: "h2text",
            id: "h2text",
            fieldLabel: "Heading H2",
            margin: "0 0 20 0"
        },
        {
            xtype: "mz-input-text",
            name: "h3text",
            id: "h3text",
            fieldLabel: "Heading H3",
            margin: "0 0 20 0"
        },
        {
            xtype: "mz-input-text",
            name: "maxchardesktop",
            id: "maxchardesktop",
            fieldLabel: "Max Char to Display (Desktop)",
            margin: "0 0 20 0",
            allowBlank: false
        },
        {
            xtype: "mz-input-text",
            name: "maxcharmobile",
            id: "maxcharmobile",
            fieldLabel: "Max Char to Display (Mobile)",
            margin: "0 0 20 0",
            allowBlank: false 
        },
        {
            xtype: 'radiogroup',
            fieldLabel: '',
            vertical: true,
            items: [
                { boxLabel: 'Single Line', name: 'layout', inputValue: 'single', checked: true},
                { boxLabel: 'Multiple Line', name: 'layout', inputValue: 'multiple'}
            ],
            margin: "0 0 20 0",
            width: 500
        },
        {
            xtype: "mz-input-textarea",
            name: "ptext",
            id: "ptext",
            fieldLabel: "Paragraph Text",
            margin: "0 0 20 0",
            allowBlank: false
        },
        {
            xtype: "mz-input-text",
            name: "readmoretext",
            id: "readmoretext",
            fieldLabel: "Read More Text",
            margin: "0 0 20 0"
        },
        {
            xtype: "mz-input-text",
            name: "readlesstext",
            id: "readlesstext",
            fieldLabel: "Read Less Text",
            margin: "0 0 20 0"
        }        
    ]
});