require(["modules/jquery-mozu","modules/backbone-mozu","modules/editable-view","modules/eventbus","underscore","modules/amazonPay","modules/models-amazoncheckout"],function(e,o,n,t,i,a,d){var r=n.extend({templateName:"modules/checkout/amazon-shipping-billing",initialize:function(){t.on("aws-referenceOrder-created",this.setawsOrderData),t.on("aws-card-selected",function(){e("#continue").show()}),this.listenTo(this.model,"awscheckoutcomplete",function(e){window.location="/checkout/"+e})},render:function(){},setawsOrderData:function(o){var n={awsReferenceId:o.orderReferenceId,addressAuthorizationToken:e.deparam().access_token},t=window.order.get("fulfillmentInfo");t.data=n,window.order.set("fulfillmentInfo",t)},redirectToCart:function(){window.amazon.Login.logout(),window.location=document.referrer},submit:function(){this.model.submit()}});e(document).ready(function(){a.init(!1);var o=require.mozuData("checkout"),n=window.order=new d.AwsCheckoutPage(o);window.checkoutView=new r({el:e("#shippingBillingTbl"),model:n,messagesEl:e("[data-mz-message-bar]")}),a.addAddressWidget(),a.addWalletWidget(),window.removePageLoader()})});