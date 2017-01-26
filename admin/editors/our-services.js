Ext.widget({
    xtype:"mz-form-widget",
  itemId:"our-services-widget",
  items:
    [
        {
            "fieldLabel":"Enter icon to display",
            "name":"our_serv_icon",
            "xtype":"mz-input-image",
            "width":"500"

        },
        {
            "fieldLabel":"Title and Description",
            "name":"our_serv_text",
            "xtype":"htmleditor",
            "enableFont":false,
            "emptyText":"Words",
            "margin":"0 15 0 0",
            "height":"200",
            "width":"500"
        }
    ]
});