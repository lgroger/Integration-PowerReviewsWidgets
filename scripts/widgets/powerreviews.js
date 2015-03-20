require(['modules/jquery-mozu', 'hyprlive',"modules/backbone-mozu",  "modules/models-product", "modules/api"],
    function ($, Hypr, Backbone, ProductModels, Api) {
  
    $(document).ready(function () {
       var res=Api.get('entity',{listName: 'mozu-powerreviews-settings@a0842dd', id: Api.context.site });
       res.then(function(r) { 
             var data = r.data;
             var isWidget = $("#prProductDetail").val() == 1;
             var isReviewSnippet = $("#productReviewSnippet").val() == 1;
             var isSocialAnswerSnippet = $("#productSocialAnswerSnippet").val() == 1;
             var isReviewDisplay = $("#productReviewDisplay").val() == 1;
             var isSocialAnswerDisplay = $("#productSocialAnswerDisplay").val() == 1;
             var isTabEnabled = $("#reviewSocialAnswerTab").val() == 1;
             var locale=data.locale;
             var merchantGroupId=data.merchantGroupId;
             var merchantId=data.merchantId;
             var siteId='';
             if(data.merchantSiteId!==null){
                siteId=data.merchantSiteId;
             }
             var zip_location;
             if(merchantId!=='' && merchantId!==null){
                 zip_location="/staticContent/pwr/"+merchantGroupId+"/"+merchantId+"/";
             }else{
                 zip_location="/staticContent/pwr/"+merchantGroupId+"/"+siteId+"/";
             }
            
             var prScript = zip_location+"pwr/engine/js/full.js";
             var prStylesReview = zip_location+"pwr/engine/pr_styles_review.css";
             var prMerchantStyles2 = zip_location+"pwr/engine/merchant_styles2.css";
          
             
             $.getScript(prScript).done(function( script, textStatus ) {
                 var currentProduct = ProductModels.Product.fromCurrent();
               if (isWidget) {
                   
                        $('head').append('<link rel="stylesheet" href=\"'+prStylesReview+'\" type="text/css" id="prBaseStylesheet">');
                       $('<script>')
                        .attr('type', 'text/javascript')
                        .text( 'var pr_locale=\"'+locale+'\";var pr_zip_location=\"'+zip_location+'\"')
                        .appendTo('head');
                       
                        
                         // POWERREVIEWS.display.snippet({ write : function(content) {
                           //     $("#reviewSnippetProduct").append(content); } },
                             //       { pr_page_id : currentProduct.id,pr_read_review : '#ReviewHeader',pr_write_review : '/resources/write-a-review.html'});
                        if(isReviewSnippet)   {
                                if(isTabEnabled){
                                      POWERREVIEWS.display.snippet({ write : function(content) {
                                              $("#reviewSnippetProduct").append(content); } },
                                              { pr_page_id : currentProduct.id,
                                              pr_read_review : 'javascript:activateTab(\'reviews\');',
                                              pr_write_review : '/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location});
                                }else{
                                     POWERREVIEWS.display.snippet({ write : function(content) {
                                              $("#reviewSnippetProduct").append(content); } },
                                              { pr_page_id : currentProduct.id,pr_read_review : '#ReviewHeader',
                                              pr_write_review : '/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location});
                                }
                        } 
                        if(isSocialAnswerSnippet)   {
                                 if(isTabEnabled){
                                      
                                        POWERREVIEWS.display.productAnswersSnippet({ write : function(content) {
                                        $("#socialAnswerSnippet").append(content); } }, { 
                                        pr_page_id : currentProduct.id,
                                        pr_ask_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location+'&appName=askQuestion',
                                        pr_answer_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location+'&appName=answerQuestion&questionId=@@@QUESTION_ID@@@',
                                        pr_read_qa : 'javascript:activateTab(\'socialAnswer\');'});
                                 }else{
                                      POWERREVIEWS.display.productAnswersSnippet({ write : function(content) {
                                                    $("#socialAnswerSnippet").append(content); } }, { 
                                                    pr_page_id : currentProduct.id,
                                                    pr_ask_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location+'&appName=askQuestion',
                                                    pr_answer_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location+'&appName=answerQuestion&questionId=@@@QUESTION_ID@@@',
                                                    pr_read_qa : '#QAHeader'});
                                 }
                                         
                         }  
                         if(isReviewDisplay || isTabEnabled)   {
                                    POWERREVIEWS.display.engine({ write : function(content) {
                                                        $("#reviewDisplayProduct").append(content); } }, {pr_page_id : currentProduct.id,
                                                        pr_write_review : '/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location});
                           }
                         if(isSocialAnswerDisplay || isTabEnabled)   {
                                    POWERREVIEWS.display.productAnswers({ write : function(content) {
                                                $("#socialAnswerDisplay").append(content); } }, { 
                                    pr_page_id : currentProduct.id,
                                    pr_ask_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location+'&appName=askQuestion',
                                    pr_answer_question :'/write-a-review?pageId='+currentProduct.id+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location+'&appName=answerQuestion&questionId=@@@QUESTION_ID@@@',
                                    pr_read_qa : '#QAHeader'});
                             }
                   }else{
                       
                       $('.mz-productlist').append('<link rel="stylesheet" href=\"'+prStylesReview+'\" type="text/css" id="prBaseStylesheet">');
                       $('.mz-productlist').append('<link rel="stylesheet" href=\"'+prMerchantStyles2+'\" type="text/css" id="prMerchantOverrideStylesheet">');
                       $('.pr-inline-rating').each(function() {
                            var $this = $(this);
                            var productCode = $this.data('mzProductCode');
                            var res=Api.get('entity',{listName: 'mozu-powerreviews-ratings@a0842dd', id: productCode });
                            res.then(function(r) { 
                                var data = r.data;
                                var fullReviewCount=data.fullReviews;
                                var fullReviewCountText;
                                if(data.fullReviews>1){
                                    fullReviewCountText="(" +data.fullReviews+"reviews)";
                                }else if(data.fullReviews==1){ 
                                    fullReviewCountText="(" +data.fullReviews+"review)";
                                }
                                if(data.averageDecimalRating>0){
                                      $("#PRInlineRating-"+productCode).find(".pr-snippet-write-review").find("a.pr-snippet-link").attr("href", '/write-a-review?pageId='+productCode+'&merchantGroupId='+merchantGroupId+'&merchantId='+merchantId+'&siteId='+siteId+'&zipLocation='+zip_location);
                                      $("#PRInlineRating-"+productCode).find(".pr-snippet-read-reviews").find("a.pr-snippet-link").find("#pr-snippet-read-review-count").text(fullReviewCount);
                                      $("#PRInlineRating-"+productCode).find("#pr-snippet-rating-decimal").text(data.averageDecimalRating);
                                      $("#PRInlineRating-"+productCode).find("#pr-snippet-review-count").text(fullReviewCountText);
                                      $("#PRInlineRating-"+productCode).find("#pr-snippet-star-image").addClass("pr-stars").addClass("pr-stars-small").addClass("pr-stars-"+data.averageOverallRating+"-sm");
                                    
                                }else{
                                      $( "#PRInlineRating-"+productCode).hide();
                                }
                           },function(error) {
                                $( "#PRInlineRating-"+productCode).hide();
                                  
                    });
                       
                   });
                      
                    }
                  })
                  .fail(function( jqxhr, settings, exception ) {
                      alert("Failed");
                    console.log(jqxhr);
                });
    });
      });
       

      
});







































































































































