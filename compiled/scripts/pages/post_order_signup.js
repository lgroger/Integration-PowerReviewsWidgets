define(["modules/jquery-mozu","modules/api","hyprlive","underscore"],function(t,e){function i(e,i){e?(t("[confirmation-signup-passwordmissmatch]").text(i),t("[confirmation-signup-passwordmissmatch]").fadeIn()):t("[confirmation-signup-passwordmissmatch]").fadeOut()}function a(t,a){var m=new Date,d=m.getMonth()+1+"/"+m.getDate()+"/"+m.getFullYear(),c={account:{attributes:[{attributeDefinitionId:34,attributeFQN:r,values:[!0]},{attributeDefinitionId:32,attributeFQN:u,values:[t.order_id]},{attributeDefinitionId:30,attributeFQN:o,values:[a]},{attributeDefinitionId:28,attributeFQN:s,values:[d]}],emailAddress:t.account.emailAddress,userName:t.account.emailAddress,firstName:t.account.firstName,lastName:t.account.lastName,contacts:[{email:t.account.emailAddress,firstName:t.account.firstName,lastNameOrSurname:t.account.lastName}]},password:t.password};e.action("customer","createStorefront",c).then(function(t){n(t)},function(t){console.log(t),i(!0,t.message)})}function n(t){console.log(t),window.location.reload()}window.themeSettings=require("hyprlivecontext").locals.themeSettings;var r=(window.themeSettings.shippingRewardConfigurationDocumentType,window.themeSettings.shippingRewardHistoryDocumentType,window.themeSettings.shippingRewardConfigurationDocumentList,window.themeSettings.shippingRewardHistoryDocumentList,window.themeSettings.namespace,window.themeSettings.isEnabledShippingRewardCustomerAttribute),o=window.themeSettings.customerRewardPointAttribute,s=window.themeSettings.rewardProgramEnrolledAttribute,u=window.themeSettings.postOrderSignupAttribute,m=require.mozuData("user");if(window.customer=null,m.isAuthenticated){var d="/api/commerce/customer/accounts/"+m.accountId;e.request("GET",d).then(function(e){window.customer=e;for(var i=!1,a=0;a<e.attributes.length;a++)e.attributes[a].fullyQualifiedName==r&&(i=!0,e.attributes[a].values[0]?t("[customer-shipping-reward-join]").hide():t("[customer-shipping-reward-join]").show());i||t("[customer-shipping-reward-join]").show()})}t("[customer-shipping-reward-join]").on("click",function(){for(var i=0;i<window.customer.attributes.length;i++)window.customer.attributes[i].fullyQualifiedName==r&&(window.customer.attributes[i].values=[!0]);var a=require.mozuData("order").total,n={listName:window.themeSettings.shippingRewardConfigurationDocumentList+"@shindigz",viewName:"shippingRewardView",filter:"properties.minimum-purchase-amount le "+a+" AND properties.maximum-purchase-amount ge "+a};e.get("documentView",n).then(function(i){var a=0;console.log(i),i.data.items.length>0&&(a=i.data.items[0].properties["shopping-reward-point"]);{var n=new Date,d=n.getMonth()+1+"/"+n.getDate()+"/"+n.getFullYear();t("[data-mz-post-order-signup]").val()}e.request("PUT","/api/commerce/customer/accounts/"+m.accountId,{"customer.id":m.accountId,attributes:[{attributeDefinitionId:34,fullyQualifiedName:r,values:[!0]},{attributeDefinitionId:30,attributeFQN:o,values:[a]},{attributeDefinitionId:28,attributeFQN:s,values:[d]},{attributeDefinitionId:32,attributeFQN:u,values:[require.mozuData("order").id]}],emailAddress:window.customer.emailAddress,firstName:window.customer.firstName,lastName:window.customer.lastName}).then(function(e){console.log(e),t("[customer-shipping-reward-join]").hide()})})}),t('[data-mz-action="order-confirmation-signup-submit"]').on("click",function(){var n=t("[data-mz-signup-emailaddress]").val(),r=t("[data-mz-signup-firstname]").val(),o=t("[data-mz-signup-lastname]").val(),s=t("[data-mz-signup-password]").val(),u=t("[data-mz-signup-confirmpassword]").val(),m=t("[data-mz-post-order-signup]").val();if(s!=u)i(!0,"Password mismatch.");else{i(!1);var d={account:{emailAddress:n,userName:n,firstName:r,lastName:o,contacts:[{email:n,firstName:r,lastNameOrSurname:o}]},password:s,order_id:m},c=require.mozuData("order").total,l={listName:window.themeSettings.shippingRewardConfigurationDocumentList+"@shindigz",viewName:"shippingRewardView",filter:"properties.minimum-purchase-amount le "+c+" AND properties.maximum-purchase-amount ge "+c};e.get("documentView",l).then(function(t){var e=0;console.log(t),t.data.items.length>0&&(e=t.data.items[0].properties["shopping-reward-point"]),a(d,e)})}})});