Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Shipping Days Calculator',
    items: [
        {
        	fieldLabel	:'Shipping Code',
        	xtype	:	'textfield',
        	name	:	'ship_code',
        	required	:	true
        },
        {
            fieldLabel  :'No. of days',
            xtype   :   'textfield',
            name    :   'no_business_day',
            required    :   true
        }
    ]
}); 