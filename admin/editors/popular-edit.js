Ext.widget({
	xtype:"mz-form-widget",
  itemId:"popular_cat",
  listeners:{
    afterlayout:function(){
    var ar=document.getElementsByTagName("iframe");
    var extid=ar[0].getAttribute("id");
    var max_arr=[];
    var els=document.getElementById(extid).contentWindow.document.body.getElementsByClassName("ech-shi-popular-cat-widget");
    if(els.length ==0){
        max_arr.push(0);
    }
    for(var i=0;i<els.length;i++){
        max_arr.push(els[i].getAttribute("cus-id"));
    }
    var max_id=Math.max.apply(null,max_arr);
    if(Ext.getCmp("noWid").getValue()==""){
        max_id++;
       Ext.getCmp("noWid").setValue(max_id);
      }
    }
 },
  items:[
	{
	  "fieldLabel": "Pupular Categories",
	  "name": "popular-categories",
	  "xtype": "boxselect",
	  "width": 500,
	  "displayField": "name",
	  "valueField": "id",
	  "queryMode": "local",
	  "store": {
	    "type": "Taco.store.Categories"
	  }
	},{
		"fieldLabel":"no of id",
		"xtype":"textfield",
		"itemId":"noWid",
		"id":"noWid",
    "hidden":true
	}
]
});