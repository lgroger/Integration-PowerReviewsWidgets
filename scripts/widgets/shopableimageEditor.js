require([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    "modules/models-product",
    "modules/soft-cart"
    ], function ($, Hypr, Backbone, api,ProductModels,CartMonitor) {
    /**
     * Shoppable Image front end management.
     * Complete management it done with widget id values.
    **/

    $(document).ready(function(){

        console.log("Show a loader on the shoppable image.");
        console.log("shoppable-image-container js triggered.");
        // Variable to hold active hotspot model.
        var pmodel;
        // Varable to store the wodth height of popup and hotspot.
        // Update this values accordigily with respect to the design.
        var MODAL_POPUP_WIDTH = 270, MODAL_POPUP_HEIGHT = 231, HOTSPOT_WIDTH=40, HOTSPOT_HEIGHT=40;
        // Calculating function for +,and -
        var operators = {
            '+': function(a, b) { return Math.abs(a + b); },
            '-': function(a, b) { return Math.abs(a - b); }
        };

        // listening to the click event of the hotspot popup close.
        // close the hotspot popup wrt pcode and widget id
        $('[data-action="close_hotspot_popup"]').on('click',function(e){
            var data_id =  $(e.currentTarget).attr('data-id');
            var pcode =  $(e.currentTarget).attr('pcode');
            var modal = $('.shopable_image_hotspot_popup[hotspot-data-id="'+data_id+'"][pcode="'+pcode+'"]')[0];
            modal.style.display = 'none';
            $('[action="add-to-cart"][pcode="'+pcode+'"][data-id="'+data_id+'"]').removeClass('active');
        });

        // function to handle the add to cart event
       /* $('[action="add-to-cart"]').on('click',function(e){
            var pcode = $(e.currentTarget).attr('pcode');
            if(pmodel.get('productCode') == pcode){
                pmodel.addToCart();
                console.log(CartMonitor);
            }else{
                // TODO: In current archetecture this scenario will not occures,
                // with the changes if this is happening add code to updae the
                // pmodel value using the function  createProductModel
            }

        });*/

        // function to show the hotspot associated product details
        $('span[action="show-modal-popup"]').on('click',function(e){
            // Getting the widget id and product code
            var data_id = $(e.currentTarget).attr('data-id');
            var pcode = $(e.currentTarget).attr('pcode');
            // hiding active hotspot popup
            // and removing the active class from all the hotspots
            $('.shopable_image_hotspot_popup').each(function(){
                this.style.display = 'none';
                var p = $(this).attr('pcode'),
                    d = $(this).attr('hotspot-data-id');
                $('[action="add-to-cart"][pcode="'+p+'"][data-id="'+d+'"]').removeClass('active');
            });
            // adding active class to current hotspot
            $(e.target).addClass('active');

            if(pcode){
                // getting the modal window
                var modal = $('.shopable_image_hotspot_popup[hotspot-data-id="'+data_id+'"][pcode="'+pcode+'"]')[0];
                // Positioning the modal popup wrt the clicked hotspot.
                // 1. Get the main container width and height.(loaded shoppable image width & height)
                var main_container_width = $('.shoppable-image-container[data-id="'+data_id+'"]').width(),
                    main_container_height = $('.shoppable-image-container[data-id="'+data_id+'"]').height();
                // 2. Get the hotspot element left and top style css values (which is in percentage)
                var hotspot_left = parseFloat(e.currentTarget.style.left.split("%")[0]),
                    hotspot_top = parseFloat(e.currentTarget.style.top.split("%")[0]);
                // 3. Calculate the hotspot and modal width,height pecentage for modal window positioning
                var modal_width = MODAL_POPUP_WIDTH/main_container_width*100,
                    modal_height = MODAL_POPUP_HEIGHT/main_container_height*100;
                var spot_width = HOTSPOT_WIDTH/main_container_width*100,
                    spot_height = HOTSPOT_HEIGHT/main_container_height*100;
                // 4. Calculate which on which quarter of the hotspot we have to show the modal window.
                var left_operation = 50>hotspot_left?'+':'-',
                    top_operation = 50>hotspot_top?'+':'-';
                // 5. Calculate and apply the new position for the modal window.
                var left = operators[left_operation](hotspot_left, left_operation == '+'?spot_width:modal_width+spot_width),
                    top = operators[top_operation](hotspot_top, top_operation == '+'?spot_height:modal_height+spot_height);
                modal.style.left = left+"%";
                modal.style.top = top+"%";
                modal.style.display = "block";
                // initialize and fetch teh currentlty open product model.
                pmodel = createProductModel(data_id,pcode);
                console.log(pmodel);
                // adding  addedd to cart listeners
                pmodel.on('addedtocart', function (cartitem) {
                    if (cartitem && cartitem.prop('id')) {
                        CartMonitor.addToCount(1);
                        // TODO: call custom cartmonitor function to update monitor.
                    } else {
                        // TODO: Show error message in the popup window.
                    }
                });
            }
        });
    });

    // Function to create product model.
    // This function will fetch the preload json model of the widget with data_id
    // and find the product data from it usging the pcode value of productCode
    // and return an instance of Mozu Product Model.
    function createProductModel(data_id,pcode){
        var products = require.mozuData(data_id);
        for(var i=0; i<products.items.length; i++){
            if(products.items[i].productCode == pcode){
                return new ProductModels.Product(products.items[i]);
            }
        }
    }
});
