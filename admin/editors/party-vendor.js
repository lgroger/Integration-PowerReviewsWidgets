Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Party Vendor',
    items: [
        {
        	fieldLabel	:'Vendor ID',
        	xtype	:	'textfield',
        	name	:	'vendor_id',
        	required	:	true
        },{
        	fieldLabel	:	'Vendor Name',
        	xtype	:	'textfield',
        	name	:	'vendor_name',
        	required	:	true
        },{
            fieldLabel  :   'Vendor Name',
            xtype   :   'textfield',
            name    :   'vendor_name',
            required    :   true
        },{
            fieldLabel  :   'address',
            xtype   :   'textfield',
            name    :   'address',
            required    :   true
        },{
            fieldLabel  :   'city',
            xtype   :   'textfield',
            name    :   'city',
            required    :   true
        },{
            fieldLabel  :   'state',
            xtype   :   'textfield',
            name    :   'state',
            required    :   true
        },{
            fieldLabel  :   'ph',
            xtype   :   'textfield',
            name    :   'ph',
            required    :   true
        },{
            fieldLabel  :   'web',
            xtype   :   'textfield',
            name    :   'web',
            required    :   true
        },{
            fieldLabel  :   'service id',
            xtype   :   'textfield',
            name    :   'service_id',
            required    :   true
        }
    ]
});