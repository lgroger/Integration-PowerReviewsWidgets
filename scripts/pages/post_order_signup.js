define(
    ['modules/jquery-mozu','modules/api', 'hyprlive', 'underscore'],
    function($, api, Hypr, _) {
        // rewardHistoryList
        // rewardConfigurationList
        window.themeSettings = require('hyprlivecontext').locals.themeSettings;
        var shippingRewardConfigurationDocumentType = window.themeSettings.shippingRewardConfigurationDocumentType,
            shippingRewardHistoryDocumentType = window.themeSettings.shippingRewardHistoryDocumentType,
            shippingRewardConfigurationDocumentList = window.themeSettings.shippingRewardConfigurationDocumentList,
            shippingRewardHistoryDocumentList = window.themeSettings.shippingRewardHistoryDocumentList;


        var namespace = window.themeSettings.namespace;
        var isEnabledShippingRewardCustomerAttribute = window.themeSettings.isEnabledShippingRewardCustomerAttribute;
        var customerRewardPointAttribute = window.themeSettings.customerRewardPointAttribute;
        var rewardProgramEnrolledAttribute = window.themeSettings.rewardProgramEnrolledAttribute;
        var postOrderSignupAttribute = window.themeSettings.postOrderSignupAttribute;


        // Getting current user informations for show/hide shipping reward joing  button
        var user = require.mozuData("user");
        window.customer = null;
        // check if user is authenticated
        if(user.isAuthenticated){
            // getting user details by api call
            var url = '/api/commerce/customer/accounts/'+user.accountId;
            api.request('GET',url).then(function(account){
                window.customer = account;
                var isFound = false;
                for(var i=0; i<account.attributes.length; i++){
                    if(account.attributes[i].fullyQualifiedName == isEnabledShippingRewardCustomerAttribute){
                        isFound = true;
                        // if already enabled hide the join button
                        if(account.attributes[i].values[0]){
                            $('[customer-shipping-reward-join]').hide();
                        }else{
                            // show shipping reward joining button
                            $('[customer-shipping-reward-join]').show();
                        }
                    }
                }
                if(!isFound){
                    $('[customer-shipping-reward-join]').show();
                }
            });
        }

        // listening to the click event of the shipping reward joing button
        $('[customer-shipping-reward-join]').on('click',function(e){
            for(var i=0; i<window.customer.attributes.length; i++){
                if(window.customer.attributes[i].fullyQualifiedName == isEnabledShippingRewardCustomerAttribute){
                    // if already enabled hide the join button
                    window.customer.attributes[i].values = [true];
                }
            }
            var order_total = require.mozuData('order').total;
            var data = {
                listName: window.themeSettings.shippingRewardConfigurationDocumentList+'@shindigz',
                viewName: 'shippingRewardView',
                filter:  'properties.minimum-purchase-amount le '+order_total+' AND properties.maximum-purchase-amount ge '+order_total
            };
            api.get('documentView',data).then(function(documents) {
                var new_reward_point = 0;
                console.log(documents);
                if(documents.data.items.length > 0){
                    new_reward_point = documents.data.items[0].properties["shopping-reward-point"];
                }
                var date =  new Date();
                var rolledOn = (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
                var order_id = $('[data-mz-post-order-signup]').val();
                api.request('PUT', '/api/commerce/customer/accounts/'+user.accountId, {
                    'customer.id'           : user.accountId,
                    "attributes": [
                        {
                            "attributeDefinitionId": 34,
                            "fullyQualifiedName": isEnabledShippingRewardCustomerAttribute,
                            "values": [true]
                        },
                        {
                            "attributeDefinitionId":30,
                            "attributeFQN":customerRewardPointAttribute,
                            "values":[new_reward_point]
                        },
                        {
                            "attributeDefinitionId":28,
                            "attributeFQN":rewardProgramEnrolledAttribute,
                            "values":[rolledOn]
                        },
                        {
                            "attributeDefinitionId":32,
                            "attributeFQN":postOrderSignupAttribute,
                            "values":[require.mozuData('order').id]
                        }
                    ],
                    "emailAddress": window.customer.emailAddress,
                    "firstName": window.customer.firstName,
                    "lastName": window.customer.lastName
                }).then(function(res){
                    console.log(res);
                    $('[customer-shipping-reward-join]').hide();
                });
            });
        });

        // Listen to the click event of the sign up button to create new user,
        // and update the custom attribute field
        $('[data-mz-action="order-confirmation-signup-submit"]').on('click',function(e){
            // Read new customer informations
            var email = $('[data-mz-signup-emailaddress]').val(),
                firstName = $('[data-mz-signup-firstname]').val(),
                lastName = $('[data-mz-signup-lastname]').val(),
                password = $('[data-mz-signup-password]').val(),
                c_password = $('[data-mz-signup-confirmpassword]').val(),
                order_id = $('[data-mz-post-order-signup]').val();

            // Validate all data informations
            if(password != c_password){
                show_message(true,"Password mismatch.");
            }else{
                show_message(false);
                // Create Service payload data
                var payload = {
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: password,
                    order_id: order_id
                };

                // fetch DocumentResource
                var order_total = require.mozuData('order').total;
                var data = {
                    listName: window.themeSettings.shippingRewardConfigurationDocumentList+'@shindigz',
                    viewName: 'shippingRewardView',
                    filter:  'properties.minimum-purchase-amount le '+order_total+' AND properties.maximum-purchase-amount ge '+order_total
                };
                api.get('documentView',data).then(function(documents) {
                    var new_reward_point = 0;
                    console.log(documents);
                    if(documents.data.items.length > 0){
                        new_reward_point = documents.data.items[0].properties["shopping-reward-point"];
                    }
                    create_user(payload,new_reward_point);
                });

            }
        });

        // Show post order sign up error messages
        function show_message(isShow,message){
            if(isShow){
                $('[confirmation-signup-passwordmissmatch]').text(message);
                $('[confirmation-signup-passwordmissmatch]').fadeIn();
            }else{
                $('[confirmation-signup-passwordmissmatch]').fadeOut();
            }
        }

        // Create new user and update customer attribute
        // using api/commerce/customer/accounts/ api service to add customer with values particular attribute
        function create_user(payload,new_reward_point){
            var add_account_url = 'commerce/customer/accounts/';
            // TODO : please update the attribute defenition ID wrt the tenant
            var date =  new Date();
            var rolledOn = (date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear();
            var data = {
                "account":{
                    "attributes":[
                        {
                            "attributeDefinitionId":34,
                            "attributeFQN":isEnabledShippingRewardCustomerAttribute,
                            "values":[true]
                        },
                        {
                            "attributeDefinitionId":32,
                            "attributeFQN":postOrderSignupAttribute,
                            "values":[payload.order_id]
                        },
                        {
                            "attributeDefinitionId":30,
                            "attributeFQN":customerRewardPointAttribute,
                            "values":[new_reward_point]
                        },
                        {
                            "attributeDefinitionId":28,
                            "attributeFQN":rewardProgramEnrolledAttribute,
                            "values":[rolledOn]
                        }
                    ],
                    "emailAddress": payload.account.emailAddress,
                    "userName": payload.account.emailAddress,
                    "firstName": payload.account.firstName,
                    "lastName": payload.account.lastName,
                    "contacts":[
                        {
                            "email": payload.account.emailAddress,
                            "firstName": payload.account.firstName,
                            "lastNameOrSurname": payload.account.lastName
                        }
                    ]
                },
                "password": payload.password
            };
            api.action('customer','createStorefront',data).then(function(resp){
                signup_success(resp);
            },function(error){
                console.log(error);
                show_message(true,error.message);
            });
        }

        // signu sp success event
        function signup_success(payload){
            console.log(payload);
            window.location.reload();
        }

        // signup failure
        function signup_error(error){
            console.log(error);
        }

    }
);
