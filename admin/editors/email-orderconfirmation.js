Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Order Email',
    items: [
        {
            fieldLabel: 'Email Subject',
            xtype: 'textfield',
            name: 'subject',
            enableFont: false
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
            xtype: 'taco-htmleditor',
            name: 'html_3',
            enableFont: false

        },
        {
            fieldLabel: 'Additional Message',
            name: 'html_4',
            xtype: 'taco-htmleditor',
            enableFont: false
        },
        {
            fieldLabel: 'Quote Order Message',
            xtype: 'taco-htmleditor',
            name: 'html_5',
            enableFont: false

        },
        {
            fieldLabel: 'Quote Order Additional Message',
            name: 'html_6',
            xtype: 'taco-htmleditor',
            enableFont: false
        }
    ]
});