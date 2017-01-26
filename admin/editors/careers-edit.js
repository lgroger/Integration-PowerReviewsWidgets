Ext.define('Ext.form.ClosableFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.closablefieldset',
     listeners: {
        beforecollapse : function(p) {
        if (this.ownerCt) {
            if(confirm("Are You Sure do you want to delete this?")){
            if(Ext.getCmp("jobWidget").getIndex(this,this.ownerCt)>=0){
              // Ext.getCmp("jobWidget").delItemCategory(Ext.getCmp("jobWidget").getIndex(this,this.ownerCt)); 
             // alert();
               Ext.getCmp("jobWidget").delJobItem(Ext.getCmp("jobWidget").getIndex(this,this.ownerCt));
               this.ownerCt.remove(this, true);
            }
            }
           }
            return false;
        }
    }
});
Ext.define('Ext.window.jobDescWindow',{
    extend:'Ext.window.Window',
    alias: 'jobDescWindow',
    width:800,
    height:500,
    modal: true,
    autoScroll: true,
    newPos:true,
    closable:true
});

Ext.widget({
    xtype:'mz-form-widget',
    title:"Available Job Opening Positions List",
    itemId: 'jobWidget',
	id:"jobWidget",
	listeners:{
    'render':function(){
      console.log("loadadaa "+Ext.getCmp('jobData').getValue().length);
             for(var i=0;i<Ext.getCmp('jobData').getValue().length;i++){
              console.log(Ext.getCmp('jobData').getValue()[i].title);
              Ext.getCmp('jobWidget').addNewJobView(Ext.getCmp('jobData').getValue()[i].title);
                 //Ext.getCmp('jobData').addItemCategory(Ext.getCmp('categoryData').getValue()[i].Category);
             }
	  },'afterlayout':function(){
	  	var newStyles = {};
			newStyles['background']="url('/resources/images/close.png') #f12424";
			newStyles['background-size']="cover";
			var citems = Ext.query('.x-fieldset-header');
			Ext.each(citems, function (item) {
        		item = Ext.get(item);
        		item.applyStyles(newStyles);
        	});
			//Ext.get("jobWidget").query('x-fieldset-header') 
			console.log("applyed");
	  }
	},defaults: {
	        xtype: 'textfield',
	        listeners: {
	            controller: '',
            change: function (cmp) {       
            }
        }
    },items: [
    	{
    		xtype:"button",
    		id:"addJobBtn",
    		text:"<div style='color:black;'>Add New Opening Position</div>",
    		cls:'btn-cus',
    		margin: '10 0 10 0',
    		handler:function(){
    			 Ext.create('jobDescWindow', {
	                title: 'Add New Opening',
	                id:"addNewJob",
	                columnWidth: 0.5,
	                collapsible: false,
	                bodyPadding:10,
	                defaults: { anchor: '100%'},
	                layout: 'anchor',
	                modal:true,
	                autoWidth:true,
	                items:[{
				          "anchor": "100%",
				          "fieldLabel": "Job Title",
				          "id": "jobTitle",
				          "xtype": "mz-input-text",
				          "allowBlank":false
				        },{
				          "anchor": "100%",
				          "fieldLabel": "Department",
				          "id": "jobDepartment",
				          "xtype": "mz-input-text"
				        },{
				          "anchor": "100%",
				          "fieldLabel": "Primary Function",
				          "id": "jobFunction",
				          "xtype": "mz-input-richtext"
				        },{
				          "anchor": "100%",
				          "fieldLabel": "Education",
				          "id": "jobEducation",
				          "xtype": "mz-input-text"
				        },{
				          "anchor": "100%",
				          "fieldLabel": "Experience",
				          "id": "jobExperience",
				          "xtype": "mz-input-richtext"
				        },{
				          "anchor": "100%",
				          "fieldLabel": "Skills",
				          "id": "jobSkills",
				          "xtype": "mz-input-richtext"
				        },
				        {
				          "anchor": "100%",
				          "fieldLabel": "Job Posting page link*",
				          "id": "jobLink",
				          "xtype": "mz-input-text",
				           vtype:'url'
				        },{
				        	xtype:"button",
				        	text:"Save",
				        	margin:'10 0 10 0',
				        	maxWidth:200,
				        	maxHeight:120,
				        	handler:function(){
				        		if(Ext.getCmp('jobLink').getValue()!=""&&Ext.getCmp('jobTitle').getValue()!=""){
					        		Ext.getCmp("jobWidget").addNewJobItem(Ext.getCmp('jobTitle').getValue(),Ext.getCmp('jobDepartment').getValue(),Ext.getCmp("jobFunction").getValue(),
					        			Ext.getCmp("jobEducation").getValue(),Ext.getCmp("jobExperience").getValue(),Ext.getCmp("jobSkills").getValue(),Ext.getCmp("jobLink").getValue());
					        		this.ownerCt.destroy();
				        		}else{
				        			Ext.Msg.alert("Warning","Please fill the required field values");
				        		}
				        	}
				        }
	       			 ]
	            }).show();
    		}
    	},{
            xtype: 'form',
            itemId: 'jobListPreview',
            id:"jobListPreview",
			height: 300,
			autoWidth:true,
			autoScroll: true
    	},{
            xtype       : "taco-arrayField",
            name        : "jobData",
            itemId      : "jobData",
            id          : "jobData",
            width       : '0',
            hidden      : true
        }
    ],addNewJobItem:function(jtitle,jdept,jfunc,jedu,jexp,jskill,jlink){
      var arrayData = Ext.getCmp('jobData');
        if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            arr.push({"title":jtitle,"dept":jdept,"func":jfunc,"edu":jedu,"exp":jexp,"skill":jskill,"link":jlink});
            arrayData.setValue(arr);
        }else{
            var fir={"title":jtitle,"dept":jdept,"func":jfunc,"edu":jedu,"exp":jexp,"skill":jskill,"link":jlink};
            arrayData.setValue(fir);
            //alert("Done");
        }
     Ext.getCmp('jobWidget').addNewJobView(jtitle);
    },updateJobItem:function(jidx,jtitle,jdept,jfunc,jedu,jexp,jskill,jlink){
			var arrayData = Ext.getCmp('jobData');
			var arr = arrayData.getValue();
			arr[jidx].title=jtitle;
			arr[jidx].dept=jdept;
			arr[jidx].func=jfunc;
			arr[jidx].edu=jedu;
			arr[jidx].exp=jexp;
			arr[jidx].skill=jskill;
			arr[jidx].link=jlink;
			arrayData.setValue(arr);
    },delJobItem:function(jidx){
    	 var arrayData = Ext.getCmp('jobData');
         var arr = arrayData.getValue();
         arr.splice(jidx,1);
         arrayData.setValue(arr);
    },addNewJobView:function(jtitle){
    	   Ext.getCmp('jobListPreview').add(Ext.widget('closablefieldset',{
            columnWidth: 0.5,
            title: '',
            collapsible: true,
            defaults: { anchor: '100%'},
            layout: 'anchor',
            items: [
                {
                    xtype: 'textfield',
                    allowBlank: false,
                    value: jtitle,
                    maxWidth:'50%',
                   listeners: {
                       'render': function(cmp) { cmp.getEl().on('click', function(){
                       	Ext.getCmp("jobWidget").showEditJob(Ext.getCmp("jobWidget").getIndex(cmp.up("closablefieldset"),cmp.up("closablefieldset").ownerCt));
                    	//console.log("Ind "+;
                  	  });
                	}
                }
           	 }
            ]
        }));
    },showEditJob:function(jidx){
    	 Ext.create('jobDescWindow', {
            title: 'Edit Job Description',
            id:"EditJob",
            columnWidth: 0.5,
            collapsible: false,
            bodyPadding:10,
            defaults: { anchor: '100%'},
            layout: 'anchor',
            modal:true,
            jobindex:jidx,
            autoWidth:true,
            items:[{
		          "anchor": "100%",
		          "fieldLabel": "Job Title*",
		          "id": "jobTitle",
		          "xtype": "mz-input-text"
		        },{
		          "anchor": "100%",
		          "fieldLabel": "Department",
		          "id": "jobDepartment",
		          "xtype": "mz-input-text"
		        },{
		          "anchor": "100%",
		          "fieldLabel": "Primary Function",
		          "id": "jobFunction",
		          "xtype": "mz-input-richtext"
		        },{
		          "anchor": "100%",
		          "fieldLabel": "Education",
		          "id": "jobEducation",
		          "xtype": "mz-input-text"
		        },{
		          "anchor": "100%",
		          "fieldLabel": "Experience",
		          "id": "jobExperience",
		          "xtype": "mz-input-richtext"
		        },{
		          "anchor": "100%",
		          "fieldLabel": "Skills",
		          "id": "jobSkills",
		          "xtype": "mz-input-richtext"
		        },
		        {
		          "anchor": "100%",
		          "fieldLabel": "Job Posting page link*",
		          "id": "jobLink",
		          "xtype": "mz-input-text",
		          vtype:'url'
		        },{
		        	xtype:"button",
		        	text:"Update",
		        	margin:'10 0 10 0',
					autoWidth:true,
					layout:'anchor',
		        	handler:function(){
				        		if(Ext.getCmp('jobLink').getValue()!=""&&Ext.getCmp('jobTitle').getValue()!=""){
								    Ext.getCmp("jobWidget").updateJobItem(Ext.getCmp('EditJob').jobindex,Ext.getCmp('jobTitle').getValue(),Ext.getCmp('jobDepartment').getValue(),Ext.getCmp("jobFunction").getValue(),
					        		Ext.getCmp("jobEducation").getValue(),Ext.getCmp("jobExperience").getValue(),Ext.getCmp("jobSkills").getValue(),Ext.getCmp("jobLink").getValue());
					        		this.ownerCt.destroy();
				        		}else{
				        			Ext.Msg.alert("Warning","Please fill the required field values");
				        		}
		        	
		        	}
		        }
   			 ],listeners:{
	        	  afterlayout:function(){
	        	  	 var arrayData = Ext.getCmp('jobData');
        			 var arr = arrayData.getValue();
        			 Ext.getCmp("jobTitle").setValue(arr[jidx].title);

        			 Ext.getCmp("jobDepartment").setValue(arr[jidx].dept);
        			 Ext.getCmp("jobFunction").setValue(arr[jidx].func);
        			 Ext.getCmp("jobEducation").setValue(arr[jidx].edu);
        			 Ext.getCmp("jobExperience").setValue(arr[jidx].exp);
        			 Ext.getCmp("jobSkills").setValue(arr[jidx].skill);
        			 Ext.getCmp("jobLink").setValue(arr[jidx].link);
	        	  }
	        }
        }).show();

    },getIndex:function(element,owner){
      if( typeof(element.sourceIndex)!="undefined" )
       return element.sourceIndex;
      for (var i=0; i<owner.items.length; i++)
        if (element == owner.items.getAt(i))
          return i;
      return -1;
    }
});
