Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Shipping Reward Details',
    items: [
        {
        	fieldLabel	:	'created-data',
        	xtype	:	'textfield',
        	name	:	'created-data',
        	required	:	true
        },
        {
        	fieldLabel	:	'order-id',
        	xtype	:	'textfield',
        	name	:	'order-id',
        	required	:	true
        },
        {
        	fieldLabel	:	'order-total',
        	xtype	:	'textfield',
        	name	:	'order-total',
        	required	:	true
        },
        {
        	fieldLabel	:	'user-id',
        	xtype	:	'textfield',
        	name	:	'user-id',
        	required	:	true
        },
        {
        	fieldLabel	:	'user-name',
        	xtype	:	'textfield',
        	name	:	'user-name',
        	required	:	true
        },
        {
        	fieldLabel	:	'points-added',
        	xtype	:	'textfield',
        	name	:	'points-added',
        	required	:	true
        }
    ]
});
