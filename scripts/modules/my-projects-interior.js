define(['modules/jquery-mozu', "modules/mc-cookie"],function($,McCookie){

    var projectsCallback = function(res){
		var $projects = $("#mcProjects");
		var $noprojects = $("#mcProjects-none");
        
		if(res && res.projects){
			if(res.projects.length){
                var $projectHolder = $("<div />").attr("class","pdp-related-products");
                for(var i=0;i<res.projects.length;i++){
					var p = res.projects[i];
					var $project,date = new Date(p.createdDateUtc);
                    $project = $("<div />").attr("class","mz-productlist-item").attr("data-mc-project",p.id).append($('<img src="'+p.urlThumb+'" />').attr("title",p.id));
                    $project.append($('<div />').text(date.toDateString()+' '+date.toLocaleTimeString()).attr("class","mc-create-date"));

                    if(p.entityContainer){
                        $project.append($('<a href="/p/'+p.entityContainer.item.productCode+'">View Product Information</a>').attr("class","mc-product-link"));
                    }
                    
                    $project.append($('<button class="mc-project-atc">Edit / Add to Cart</button>'));
                    $project.append($('<button class="delete-mc-project">Delete</button>'));
                    $project.append($('<button class="copy-mc-project">Copy</button>'));
                    $projectHolder.append($project);
				}
				$projects.empty(); // will have contents that says it's loading by default, need to remove it
                $projects.append($("<h2>My Projects</h2>"));
				$projects.append($projectHolder);
			}
			else{
				$projects.hide();
				$noprojects.show();
			}
		}

		/*
        var loopRecords = function(arr,html,label){
            if(arr.length){
                var $projectHolder = $("<div />");
                if(label){
                    $projectHolder.append($("<h1>"+label+"</h1>"));
                }
                for(var i=0;i<arr.length;i++){
                    var p = arr[i];
                    var $project = $("<div />").attr("data-mc-project",p.id).attr("class","mc-saved-project").append("<div>"+p.id+"</div>").css({"float":"left","width":"350px","height":"75px"});
					$project.append($('<a href="/p/'+p.item.productCode+'">View Product Information</a>').attr("class","mc-product-link"));
                    
                    if(html){
                        $project.append($(html).clone());
                    }
                    $projectHolder.append($project);
                }
                $projectHolder.append($('<div style="clear:both" />'));
				$projects.append($projectHolder);
            }
        };
        
        if(res && res.inCart && res.inCart.length){
            loopArray(res.inCart, $('<button class="delete-mc-project">Delete</button>'),"In Cart/Orders");
        }
        if(res && res.mcOnly && res.mcOnly.length){
            loopArray(res.mcOnly, $('<button class="delete-mc-project">Delete</button>'),"Not in Entity List");
        }
        if(res && res.mzdbOnly && res.mzdbOnly.length){
            loopRecords(res.mzdbOnly, $('<button class="ondelete-mc-project">Delete Entity</button>'),"Not in Meidaclip");
        } 
        $(document).on('click','.ondelete-mc-project',function(e){
            var projectId = $(this).parents("[data-mc-project]").attr("data-mc-project");
            console.log(this);
            console.log(projectId);

            var self = this;
            // call on delete endpoint
            var mcCallback = function(storeUserToken){
                $.post({
                    url: "/on-mc-project-delete",
                    dataType:"json",
                    data:{"projectId":projectId} // mimic what mediaclip passes to us
                }).done(function(data){
                    if(data.projectId){
                        console.log(data);
                        // successful
                        $(self).parents("[data-mc-project='"+data.projectId+"']").remove();
                    }
                });
            };

            getToken(mcCallback);
        });*/
	};

    $(document).ready(function () {
        McCookie.getProjects(projectsCallback);
    });
});
