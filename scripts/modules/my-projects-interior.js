define(['modules/jquery-mozu', "modules/mc-cookie"],function($,McCookie){

    var projectsCallback = function(res){
		var $projects = $("#mcProjects");
		var $noprojects = $("#mcProjects-none");
        
		if(res && res.projects){
			if(res.projects.length){
                var $projectHolder = $("<div />").attr("class","mc-projects-list");
                for(var i=0;i<res.projects.length;i++){
					var p = res.projects[i];
					var $project,date = new Date(p.createdDateUtc);
                    $project = $("<div />").attr("class","mc-projects-item").attr("data-mc-project",p.id).append($('<img src="'+p.urlThumb+'" />').attr("title",p.id));
                    $project.append($('<div />').text(date.toDateString()+' '+date.toLocaleTimeString()).attr("class","mc-create-date"));

                    if(p.entityContainer){
                        $project.append($('<a href="/p/'+p.entityContainer.item.productCode+'">View Product Information</a>').attr("class","mc-product-link"));
                    }
                    
                    $project.append($('<button class="mc-project-atc">Edit<span> &amp; Add to Cart</span></button>'));
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
	};

    $(document).ready(function () {
        McCookie.getProjects(projectsCallback);
    });
});
