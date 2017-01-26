Ext.widget({
    xtype   : 'mz-form-widget',
    itemId  : 'shopableImage',
    id      : 'shopableImage',
    anchor  : "100%",
    draggingHotspot : null,
    max_width       : 700,
    max_height      : 380,
    preview_w       : null,
    preview_h       : null,
    // Default listeners
    defaults: {
        xtype       : 'textfield',
        listeners   : {
            controller  : '',
            change      : function (cmp) {
                controller = cmp;
            },
            filechange  : function(filelist){
                cmp = controller.up('#shopableImage');
                cmp.onUploadFile(filelist,cmp);
            }
        }
    },
    // ExtJS major element items in the widget:
    items: [
        // File upload button.
        {
            xtype   : "tacofilefield",
            itemId  : "imageUploadButton",
            text    : "Upload Image"
        },
        // progressbar to show the progress of file upload.
        {
            xtype   : 'progressbar',
            text    : 'Upload status',
            id      : 'progressbar',
            itemId  : 'progressbar'
        },
        // preview container
        {
            xtype   : 'panel',
            name    : 'hotspot-positions',
            itemId  : 'container',
            id      : 'container',
            cls     : 'x-dd-drop-ok',
            html    : '<div id="shopableimage-container" style="display: inline-flex;height: 390px;position:relative;"></div>'
        },
        // data field
        {
            xtype   : "taco-arrayField",
            name    : "data",
            itemId  : "arraydata",
            id      : "arraydata",
            width   : '97%',
            hidden  : true
        },
        {
            xtype   : "taco-arrayField",
            name    : "pcodes",
            itemId  : "pcodes",
            id      : "pcodes",
            width   : '97%',
            hidden  : true
        }
    ],
    listeners: {
        afterrender: function (cmp) {
            console.log("shoppableimage widget rendering complete.");
            this.updatePreview();
        }
    },
    // Visualy update preview
    updatePreview: function(){
        var meThis = this;
        if(Ext.getCmp('arraydata').getValue().length > 0){
            var data = Ext.getCmp('arraydata').getValue()[0];
            meThis.preview_w = data.preview_w;
            meThis.preview_h = data.preview_h;
            var container = document.getElementById('shopableimage-container');
            if(container){
                container.style.width = data.preview_w+"px";
                container.style.height = data.preview_h+"px";
                var img = document.createElement('img');
                img.src=data.url;
                img.style.width = "100%";
                for(var i = 0; i<container.children.length; i++){
                    if(container.children[i].nodeName == 'IMG'){
                        container.children[i].remove();
                    }
                }
                container.appendChild(img);
                meThis.addHotspotsPreview(data);
                meThis.bindClickDropEventListener(img);
            }
        }
    },

    // loop through hotspots and add hotspot elements
    addHotspotsPreview: function(data){
        var container = document.getElementById('shopableimage-container');
        var meThis = this;
        // clear all hotspots
        for(var i = 0; i<container.children.length; i++){
            if(container.children[i].nodeName != 'IMG'){
                container.children[i].remove();
            }
        }

        // add new hotspots
        for(var i = 0; i<data.hotspots.length; i++){
            var hotspot = meThis.getHotspotElement(data.hotspots[i].id,data.hotspots[i].x,data.hotspots[i].y,data.hotspots[i].pcode);
            container.appendChild(hotspot);
        }
    },

    // remove and bind event listeners
    bindClickDropEventListener: function(el){
        var meThis = this;
        if(!meThis.ContainerListening){
            meThis.ContainerListening = true;
            el.addEventListener('click',function(e){
                meThis.onContainerClik(e);
            });
            el.addEventListener('drop',function(e){
                meThis.onContainerDrop(e);
            });
        }
    },

    // This is the xy position on the image where user added the hotspot
    getHotspotElement: function(id,x,y,pcode){
        var meThis = this;
        var span = document.createElement('span');
        span.style.width = '20px';
        span.style.height = '20px';
        span.style.padding = '5px 6px';
        span.style.background = 'rgba(86, 202, 244, 0.64)';
        span.style.display = 'inline-block';
        span.style.position = 'absolute';
        span.style.left = (x)+'%';
        span.style.top = (y)+'%';
        span.style.borderRadius = '50%';
        span.style.borderRadius = '50%';
        span.draggable = true;
        span.id = id;
        span.textContent = "+"
        span.setAttribute('pcode',pcode?pcode:"");
        span.addEventListener('drag',function(e){
            meThis.draggingHotspot = e.currentTarget;
        });
        span.addEventListener('click',function(e){
            meThis.draggingHotspot = e.currentTarget;
            meThis.editHotspot();
        });
        return span;
    },
    onContainerClik: function(e){
        if(e.target.nodeName != 'SPAN'){
            e.preventDefault();
            var meThis = this;
            meThis.draggingHotspot = null;
            var boundingClientRect = e.currentTarget.getBoundingClientRect();
            var x_temp = e.clientX - boundingClientRect.left-10,
                y_temp = e.clientY - boundingClientRect.top-10;

            meThis.draggingHotspot = meThis.getHotspotElement(null,0,0,null);
            var container = document.getElementById('shopableimage-container');
            container.appendChild(meThis.draggingHotspot);
            meThis.calculate_and_place_element_postion(x_temp,y_temp);
        }
    },
    onContainerDrop: function(e){
        e.preventDefault();
        var meThis = this;
        var boundingClientRect = e.currentTarget.getBoundingClientRect();
        var x_temp = e.clientX - boundingClientRect.left-10,
            y_temp = e.clientY - boundingClientRect.top-10;
        var pcode = meThis.draggingHotspot.getAttribute('pcode');
        meThis.calculate_and_place_element_postion(x_temp,y_temp);
    },

    calculate_and_place_element_postion: function(x,y){
        var meThis = this;
        meThis.draggingHotspot.style.left = (x/meThis.preview_w*100)+"%";
        meThis.draggingHotspot.style.top = (y/meThis.preview_h*100)+"%";
        var pcode = meThis.draggingHotspot.getAttribute('pcode');
        meThis.addOrUpdateHotspotProperty(meThis.draggingHotspot.id,x/meThis.preview_w*100,y/meThis.preview_h*100,pcode)
    },

    // functoin to update hotspot property
    addOrUpdateHotspotProperty: function(id,x,y,pcode){
        var meThis = this;
        if(Ext.getCmp('arraydata').getValue().length > 0){
            var data = Ext.getCmp('arraydata').getValue()[0];
            if(id && id != 'null'){
                for(var i = 0; i<data.hotspots.length; i++){
                    if(data.hotspots[i].id == id){
                        if(x){
                            data.hotspots[i].x      = x;
                        }
                        if(y){
                            data.hotspots[i].y      = y;
                        }
                        if(pcode){
                            data.hotspots[i].pcode  = pcode;
                        }
                    }
                }
            }else{
                meThis.draggingHotspot.id = 'hotspotid_'+data.hotspots.length
                data.hotspots.push({
                    id      : 'hotspotid_'+data.hotspots.length,
                    x       : x,
                    y       : y,
                    pcode   : null
                });
            }
            meThis.updateArrayDataComponentValue(data);
        }
    },
    removeHotSpot: function(){
        var meThis = this;
        var data = Ext.getCmp('arraydata').getValue()[0];
        for(var i = 0; i<data.hotspots.length; i++){
            if(data.hotspots[i].id == meThis.draggingHotspot.id){
                data.hotspots.splice(i,1);
            }
        }
        meThis.updateArrayDataComponentValue(data);
        meThis.draggingHotspot.remove();
    },

    editHotspot: function(){
        var meThis = this;
        var action = function(action_value){
            switch(action_value) {
                case "SAVE":
                    var pcode = editorWindow.down('#products').getValue();
                    if(pcode && pcode.length>0){
                        meThis.draggingHotspot.setAttribute('pcode',pcode[0]);
                        var x = parseFloat(meThis.draggingHotspot.style.left.split('%')[0]);
                        var y = parseFloat(meThis.draggingHotspot.style.top.split('%')[0]);
                        meThis.addOrUpdateHotspotProperty(meThis.draggingHotspot.id,x,y,pcode[0]);
                    }
                    break;
                case "DELETE":
                    meThis.removeHotSpot();
                    break;
            }
            editorWindow.close();
        };
        var pcode = meThis.draggingHotspot.getAttribute('pcode');
        var editorWindow = meThis.getHotspotEditingWindow(action,pcode,meThis.draggingHotspot.id);
        editorWindow.show();
    },
    // hotspot editing widow creator:
    getHotspotEditingWindow: function(action,pcode,id){
        return Ext.create("Ext.Window",{
            title : 'Hotspot Detail Window',
            closable : true,
            modal : true,
            width : 540,
            height: 400,
            style : {
                padding : '0px 0px 0px 10px',
                "border-radius": "0px",
            },
            items:[
                {
                    xtype: "taco-productfield",
                    name: "products",
                    itemId : 'products',
                    id: 'products',
                    fieldLabel: "Products to be listed",
                    width: 500,
                    maxSelections : 1,
                    value : pcode?pcode:[],
                    listeners : {
                        controller: '',
                        beforeselect : function(combo,record,index,opts) {
                            if (combo.getValue().length == combo.maxSelections) {
                                return false;
                            }
                        }
                    },
                    validator : function(obj) {
                        if (this.getValue().length > this.maxSelections) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                },
                {
                   xtype:'button',
                   text:'Save',
                   style: {
                       padding             : "10px 5px 5px",
                       "text-decoration"   : "none",
                       "text-transform"    : "uppercase",
                       "letter-spacing"    : "1px",
                       margin              : "15px"
                    },
                   handler:function(){
                       action("SAVE");
                   }
                },
                {
                    xtype:'button',
                    text:'Delete Hotspot',
                    style: {
                        padding             : "10px 5px 5px",
                        "text-decoration"   : "none",
                        "text-transform"    : "uppercase",
                        "letter-spacing"    : "1px",
                        margin              : "15px"
                    },
                    handler:function()
                    {
                       action("DELETE");
                    }
                },
                {
                    xtype:'button',
                    text:'Cancel',
                    style: {
                        padding             : "10px 5px 5px",
                        "text-decoration"   : "none",
                        "text-transform"    : "uppercase",
                        "letter-spacing"    : "1px",
                        margin              : "15px"
                    },
                    handler:function(){
                       action("CANCEL");
                    }
                },
            ]
        });
    },
    // update arraydata field
    updateArrayDataComponentValue: function(data){
        Ext.getCmp('arraydata').setValue([data]);
        var pcode = [];
        for(var i=0; i<data.hotspots.length; i++){
            if(data.hotspots[i].pcode && data.hotspots[i].pcode.length>0){
                pcode.push(data.hotspots[i].pcode);
            }
        }
        Ext.getCmp('pcodes').setValue(pcode);
        console.log(Ext.getCmp('arraydata').getValue());
    },

    // File uploading, onUploading and onComplete functions:
    onUploading: function(progress){
        Ext.getCmp('progressbar').updateProgress(progress, (progress*100) +'%', true );
        console.log("Uploading...");
    },
    onComplete: function(data){
        var meThis = this;
        Ext.getCmp('progressbar').updateProgress(0, 'Uploading status', true );
        // calculate width and height of preview element
        if(data.width < meThis.max_width && data.height < meThis.max_height){
            data.preview_h = data.height;
        	data.preview_w = data.width;
        }else{
            data.preview_h = data.height;
        	data.preview_w = data.width;
            // Check if width is greater than the max_width, then set it to max_width
            // And reduce the height proportionaly
            if(data.preview_w>meThis.max_width){
                data.preview_w = meThis.max_width;
                data.preview_h = data.height/data.width*data.preview_w;
            }
            // check if heigth is greater than max_height, then set it to max_height
            // And reduce the width proportionaly
            if(data.preview_h>meThis.max_height){
                data.preview_h = meThis.max_height;
                data.preview_w = data.width/data.height*data.preview_h;
            }
        }
        meThis.preview_w = data.preview_w;
        meThis.preview_h = data.preview_h;
        data.hotspots = [];
        this.updateArrayDataComponentValue(data);
        this.updatePreview();
    },

    /**
     * Uploading file to filemanager
     **/
    onUploadFile: function(a, cmp){
        var g = this,
            k = /image.*/,
            b = false,
            h = [],
            d = [],
            kkk = 0;
        Ext.each(a, function(e) {
            d.push(e)
        });
        Ext.each(d, function(o) {
            var e, p, n;
            e = new FileReader();
            p = Ext.create("Taco.shared.model.File", {
                name: o.name,
                fileType: o.type,
                isUploaded: false,
                file: o
            });
            var x = Taco.core.util.UploadManager.events.complete.listeners[0]
            x.fireFn = function(h){
                cmp.onComplete({
                    url     : h.document.data.url,
                    width   : h.document.data.width,
                    height  : h.document.data.height
                });
            }
            var y = Taco.core.util.UploadManager.events.uploaderror.listeners[0];
            y.fireFn = function(h){
                Ext.Msg.alert('ERROR!!!', 'Error in uploading file, please try again.');
            }
            var z = Taco.core.util.UploadManager.events.progress.listeners[1];
            z.fireFn = function(h){
                    cmp.onUploading(h.percentUploaded);
            }
            e.onload = function(r) {
                var q;
                if (o.type.match(k)) {
                    p.set("fileType", "image");
                    p.set("localthumbnail", r.target.result);
                    q = new Image();
                    q.onload = function() {
                        p.set("width", q.width);
                        p.set("height", q.height);
                        n.execute();
                    };
                    q.src = r.target.result
                } else {
                    n.execute();
                }
            };
            e.readAsDataURL(o);
            n = Taco.core.util.UploadManager.requestUpload({
                document: p,
                file: o,
                url: "/admin/app/fileManagement/file/upload/{docid}"
            });
            h.push(p)
        });
    }
});
