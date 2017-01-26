Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Shipping Details',
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
        	fieldLabel	:	'min_amount',
        	xtype	:	'textfield',
        	name	:	'min_amount',
        	required	:	true
        },
         {
        	fieldLabel	:	'max_amount',
        	xtype	:	'textfield',
        	name	:	'max_amount',
        	required	:	true
        },
        {
        	fieldLabel	:	'shipping_charges',
        	xtype	:	'textfield',
        	name	:	'shipping_charges',
        	required	:	true
        }
    ]
});