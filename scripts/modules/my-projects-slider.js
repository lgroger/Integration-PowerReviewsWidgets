define(['modules/jquery-mozu', "modules/mc-cookie"],function($,McCookie){ 

    var projectsCallback = function(res){
        var $projects = $("#mcProjects");
		var $noprojects = $("#mcProjects-none");
        
		if(res && res.projects){
			if(res.projects.length){
                var $projectsOuter = $("<div />").attr("class","pdp-related-products");
                var $projectHolder = $("<div />").attr("class","echi-shi-related-products-slider");
                var $projectCarousel = $("<div />");
                for(var i=0;i<res.projects.length;i++){
                    var p = res.projects[i];
                    var $project,$projectOuter,date = new Date(p.createdDateUtc);
                    $projectOuter = $("<div />").attr("class","mz-productlist-item");
                    $project = $("<div />").attr("class","mz-productlist-item-inner").attr("data-mc-project",p.id);

                    var $projectInner = $("<div />").attr("class","mz-productlisting mz-productlist-tiled");
                    $project.append($projectInner);
                    var $productImage = $("<a />").attr("href","/p/"+p.entityContainer.item.productCode).append($('<img src="'+p.urlThumb+'" />').attr("title",p.id));
                    $projectInner.append($("<div />").attr("class","mz-productlisting-image").append($productImage));
                    var $productInfo = $("<div />").attr("class","mz-productlisting-info");
                    $projectInner.append($productInfo);
                    $productInfo.append($('<div />').text(date.toDateString()+' '+date.toLocaleTimeString()).attr("class","mc-create-date"));

                    if(p.entityContainer){
                        $productInfo.append($('<a href="/p/'+p.entityContainer.item.productCode+'">View Product Information</a>').attr("class","mc-product-link"));
                    }
                    
                    $productInfo.append($('<button class="mc-project-atc">Edit<span> / Add to Cart</span></button>'));
                    $productInfo.append($('<button class="delete-mc-project">Delete</button>'));
                    $productInfo.append($('<button class="copy-mc-project">Copy</button>'));
                    $projectOuter.append($project);
                    $projectCarousel.append($projectOuter);
                }
                $projects.append($("<h2>My Projects</h2>"));
                $projectsOuter.append($('<div class="clear" />'));
                $projectHolder.append($projectCarousel);
                $projectsOuter.append($projectHolder);
                $projects.append($projectsOuter);

                $projectCarousel.owlCarousel({
                    loop:true, margin:10, nav:true, responsive:{0:{items:2}, 600:{items:2}, 1000:{items:4}}
                });
			}
		}
	};

    $(document).ready(function () {
        McCookie.getProjects(projectsCallback);
    });
});
