Ext.widget({
	"xtype":"mz-form-widget",
	"itemId":"video_promo_wdgt",
  	"items":[
  		{
            "xtype": "mz-input-text",
            "fieldLabel":"Video URL",
            "name":"vid_promo_url"
        },
        {
            "xtype": "htmleditor",
            "enableFont":false,
            "fieldLabel":"Enter Text To Dispaly",
            "name":"vid_desc",
            "emptyText":"Words",
            "width":"50%",
            "margin":"0 15 0 0",
            "height":300
        }
  	]
});

