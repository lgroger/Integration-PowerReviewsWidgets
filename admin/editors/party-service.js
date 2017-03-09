Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Party Service',
    items: [
        {
        	fieldLabel	:'Service ID',
        	xtype	:	'textfield',
        	name	:	'service_id',
        	required	:	true
        },
        {
        	fieldLabel	:	'Service Name',
        	xtype	:	'textfield',
        	name	:	'service_name',
        	required	:	true
        }
    ]
});