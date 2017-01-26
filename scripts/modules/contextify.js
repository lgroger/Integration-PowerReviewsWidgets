define(['modules/jquery-mozu'], function ($) {
    //AB Html widget content based on shipping table reference  
      if(window.ShipTableReference && window.ShipTableReference!==""){
        $(".abtestcontent-"+window.ShipTableReference.toLowerCase()).show();
      }
    $(document).ready(function () {
        $('[data-mz-contextify]').each(function () {
            var $this = $(this),
                config = $this.data();
                
            $this.find(config.mzContextify).each(function () {
                var $item = $(this);
                if (config.mzContextifyAttr === "class") {
                    $item.addClass(config.mzContextifyVal);
                } else {
                    $item.prop(config.mzContextifyAttr, config.mzContextifyVal);
                }
            });
        });
    });
});