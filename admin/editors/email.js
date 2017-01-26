Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Email',
    items: [
        {
            fieldLabel: 'Email Subject',
            xtype: 'textfield',
            name: 'subject'
        },
        {
            fieldLabel: 'Header html 1',
            xtype: 'taco-htmleditor',
            name: 'html_1',
            enableFont: false
        },
        {
            fieldLabel: 'Header html 2',
            xtype: 'taco-htmleditor',
            name: 'html_2',
            enableFont: false
        },
        {
            fieldLabel: 'Message',
            name: 'html_3',
            xtype: 'taco-htmleditor',
            enableFont: false
        },
        {
            fieldLabel: 'Additional Message',
            name: 'html_4',
            xtype: 'taco-htmleditor',
            enableFont: false
        }
    ]
});