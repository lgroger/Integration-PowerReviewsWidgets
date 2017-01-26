
Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'faq',    
    items: [
            {
                    xtype: 'textfield',
                    fieldLabel: 'Question',
                    width: 700,
                    allowBlank: false,
                    name: 'question'
            },
            {
                    xtype: 'htmleditor',
                    fieldLabel: 'Answer',
                    width: 700,
                    allowBlank: false,
                    name: 'answer'
            }
            
    ]
});



