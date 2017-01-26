Ext.widget({
	xtype:"mz-form-widget",
  itemId:"offer_promo_wdgt",
  items:[
      {
        xtype:"htmleditor",
        enableFont:false,
        fieldLabel:"Enter Title and Description",
        name: "offer_title",
        emptyText:"Words",
        width:"50%",
        margin:"0 15 0 0",
        height:200
    },
    {
        xtype: 'htmleditor',
        enableFont:false,
        fieldLabel:"Enter short description",
        name:"offer_short_desc",
        emptyText:"Words",
        width:"50%",
        margin:"0 15 0 0",
        height:200
    },
    {
        xtype: 'mz-input-text',//'textfield',
        fieldLabel:"Enter Button Title",
        name:"offer_btn_title"
    },
    {
        xtype: "mz-input-textarea",//textarea,
        name:"btn_css",
        fieldLabel:"Enter CSS Style for Button"
    },
    {
        xtype: 'mz-input-text',//'textfield',
        fieldLabel:"Enter Url of the target page",
        name:"offer_url"
    },
    {
        xtype:"mz-input-image",//"mz-form-imagewidget",
        name:'background_image',
        // height: 400,
        // imageHeight: 400,
        // heightResizable: false,
        linkSource: "externalUrl"
    },
    {
        xtype: 'numberfield',
        name:"image_size",
        fieldLabel:"Enter Image Size",
        step:5
    }
  ]
});