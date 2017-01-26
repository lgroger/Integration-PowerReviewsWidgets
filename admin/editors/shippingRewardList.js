Ext.widget({
    xtype: 'mz-form-entity',
    title: 'Shipping Reward Details',
    items: [
        {
            fieldLabel: 'Minimum Purchase Amount',
            xtype: 'mz-input-number',
            name: 'minimum-purchase-amount',
            required: true
        },
        {
            fieldLabel: 'Maximum Purchase Amount',
            xtype: 'mz-input-number',
            name: 'maximum-purchase-amount',
            required: true
        },
        {
            fieldLabel: 'Shopping Reward Point',
            xtype: 'mz-input-number',
            name: 'shopping-reward-point',
            required: true
        }
    ]
});
