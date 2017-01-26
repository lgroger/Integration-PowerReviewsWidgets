Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Shipping More then',
    items: [
        {
        	fieldLabel	:'Country Code',
        	xtype	:	'textfield',
        	name	:	'country_code',
        	required	:	true
        },
        {
        	fieldLabel	:	'shipping_code',
        	xtype	:	'textfield',
        	name	:	'shipping_code',
        	required	:	true
        },
        {
        	fieldLabel	:	'order equal to or more then',
        	xtype	:	'textfield',
        	name	:	'more_then',
        	required	:	true
        },
         {
        	fieldLabel	:	'For each',
        	xtype	:	'textfield',
        	name	:	'for_each',
        	required	:	true
        },
        {
        	fieldLabel	:	'Flat value',
        	xtype	:	'textfield',
        	name	:	'base_value',
        	required	:	true
        },{
            fieldLabel  :   'Amount to be added ',
            xtype   :   'textfield',
            name    :   'amount_to_be_added',
            required    :   true
        }
    ]
});