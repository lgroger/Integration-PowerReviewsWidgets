require(["modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu",   
    "modules/api"], function ($, Hypr, Backbone, api){   
    	$(document).ready(function(){	 
            $(document).on("click",".compare-error-container button",function () {
                $(".compare-full-error-container").remove();
                window.location.reload();
            }); 	
    		
    		$('#businessType').prop('type','password');
	    	$('#cUSTTYPE').prop('placeholder','Describe your Business');  
	    	$('fieldset legend').append('<div class="mktoAsterix1">*&nbsp;&nbsp;&nbsp;</div>'); 
			//$('#area').closest('.mktoFieldDescriptor.mktoFormCol').hide();
			$('<input id="custStateDupinput" name="custStateDup" maxlength="255" type="text" class="mktoField mktoTextField mktoHasWidth mktoRequired mktoValid" style="width: 150px;display:none;">').insertAfter("#custState");
			$('<input id="StateDupinput" name="StateDup" maxlength="255" type="text" class="mktoField mktoTextField mktoHasWidth mktoRequired mktoValid" style="width: 150px;display:none;">').insertAfter("#State");
			
			
			var country_list={AD:"Andorra",AE:"United Arab Emirates",AF:"Afghanistan",AG:"Antigua and Barbuda",AI:"Anguilla",AL:"Albania",AM:"Armenia",AO:"Angola",AQ:"Antarctica",AR:"Argentina",AS:"American Samoa",AT:"Austria",AU:"Australia",AW:"Aruba",AX:"Aland",AZ:"Azerbaijan",BA:"Bosnia and Herzegovina",BB:"Barbados",BD:"Bangladesh",BE:"Belgium",BF:"Burkina Faso",BG:"Bulgaria",BH:"Bahrain",BI:"Burundi",BJ:"Benin",BL:"Saint Barthelemy",BM:"Bermuda",BN:"Brunei Darussalam",BO:"Bolivia",BQ:"Bonaire",BR:"Brazil",BS:"Bahamas",BT:"Bhutan",BV:"Bouvet Island",BW:"Botswana",BY:"Belarus",BZ:"Belize",CA:"Canada",CC:"Cocos (Keeling) Islands",CD:"Democratic Republic of the Congo",CF:"Central African Republic",CG:"Republic of the Congo",CH:"Switzerland",CI:"Ivory Coast",CK:"Cook Islands",CL:"Chile",CM:"Cameroon",CN:"China",CO:"Colombia",CR:"Costa Rica",CU:"Cuba",CV:"Cape Verde",CW:"Curacao",CX:"Christmas Island",CY:"Cyprus",CZ:"Czech Republic",DE:"Germany",DJ:"Djibouti",DK:"Denmark",DM:"Dominica",DO:"Dominican Republic",DZ:"Algeria",EC:"Ecuador",EE:"Estonia",EG:"Egypt",EH:"Western Sahara",ER:"Eritrea",ES:"Spain",ET:"Ethiopia",FI:"Finland",FJ:"Fiji",FK:"Falkland Islands (Malvinas)",FM:"Micronesia",FO:"Faroe Islands",FR:"France",GA:"Gabon",GB:"United Kingdom",GD:"Grenada",GE:"Georgia",GF:"French Guiana",GG:"Guernsey",GH:"Ghana",GI:"Gibraltar",GL:"Greenland",GM:"Gambia",GN:"Guinea",GP:"Guadeloupe",GQ:"Equatorial Guinea",GR:"Greece",GS:"South Georgia and the South Sandwich Islands",GT:"Guatemala",GU:"Guam",GW:"Guinea-Bissau",GY:"Guyana",HK:"Hong Kong",HM:"Heard Island and McDonald Islands",HN:"Honduras",HR:"Croatia",HT:"Haiti",HU:"Hungary",ID:"Indonesia",IE:"Ireland",IL:"Israel",IM:"Isle of Man",IN:"India",IO:"British Indian Ocean Territory",IQ:"Iraq",IR:"Iran",IS:"Iceland",IT:"Italy",JE:"Jersey",JM:"Jamaica",JO:"Jordan",JP:"Japan",KE:"Kenya",KG:"Kyrgyzstan",KH:"Cambodia",KI:"Kiribati",KM:"Comoros",KN:"Saint Kitts and Nevis",KP:"Democratic People's Republic of Korea",KR:"Republic of Korea",KW:"Kuwait",KY:"Cayman Islands",KZ:"Kazakhstan",LA:"Lao People's Democratic Republic",LB:"Lebanon",LC:"Saint Lucia",LI:"iechtenstein",LK:"Sri Lanka",LR:"Liberia",LS:"Lesotho",LT:"Lithuania",LU:"Luxembourg",LV:"Latvia",LY:"Libya",MA:"Morocco",MC:"Monaco",MD:"Moldova",ME:"Montenegro",MF:"Saint Martin",MG:"Madagascar",MH:"Marshall Islands",MK:"Macedonia",ML:"Mali",MM:"Myanmar",MN:"Mongolia",MO:"Macao",MP:"Northern Mariana Islands",MQ:"Martinique",MR:"Mauritania",MS:"Montserrat",MT:"Malta",MU:"Mauritius",MV:"Maldives",MW:"Malawi",MX:"Mexico",MY:"Malaysia",MZ:"Mozambique",NA:"Namibia",NC:"New Caledonia",NE:"Niger",NF:"Norfolk Island",NG:"Nigeria",NI:"Nicaragua",NL:"Netherlands",NO:"Norway",NP:"Nepal",NR:"Nauru",NU:"Niue",NZ:"New Zealand",OM:"Oman",PA:"Panama",PE:"Peru",PF:"French Polynesia",PG:"Papua New Guinea",PH:"Philippines",PK:"Pakistan",PL:"Poland",PM:"Saint Pierre and Miquelon",PN:"Pitcairn",PR:"Puerto Rico",PS:"Palestine",PT:"Portugal",PW:"Palau",PY:"Paraguay",QA:"Qatar",RE:"RÃ©union",RO:"Romania",RS:"Serbia",RU:"Russian Federation",RW:"Rwanda",SA:"Saudi Arabia",SB:"Solomon Islands",SC:"Seychelles",SD:"Sudan",SE:"Sweden",SG:"Singapore",SH:"Ascension and Tristan da Cunha Saint Helena",SI:"Slovenia",SJ:"Svalbard and Jan Mayen",SK:"Slovakia",SL:"Sierra Leone",SM:"San Marino",SN:"Senegal",SO:"Somalia",SR:"Suriname",SS:"South Sudan",ST:"Sao Tome and Principe",SV:"El Salvador",SX:"Sint Maarten",SY:"Syrian Arab Republic",SZ:"Swaziland",TC:"Turks and Caicos Islands",TD:"Chad",TF:"French Southern Territories",TG:"Togo",TH:"Thailand",TJ:"Tajikistan",TK:"Tokelau",TL:"East Timor",TM:"Turkmenistan",TN:"Tunisia",TO:"Tonga",TR:"Turkey",TT:"Trinidad and Tobago",TV:"Tuvalu",TW:"Taiwan",TZ:"Tanzania",UA:"Ukraine",UG:"Uganda",UM:"United States Minor Outlying Islands",US:"United States",UY:"Uruguay",UZ:"Uzbekistan",VA:"Holy See (Vatican City State)",VC:"Saint Vincent and the Grenadines",VE:"Venezuela",VG:"British Virgin Islands",VI:"U.S. Virgin Islands",VN:"Vietnam",VU:"Vanuatu",WF:"Wallis and Futuna",WS:"Samoa",XK:"Kosovo",YE:"Yemen",YT:"Mayotte",ZA:"South Africa",ZM:"Zambia",ZW:"Zimbabwe"};
			
			var state_list={AL:"Alabama",AK:"Alaska",AS:"American Samoa",AZ:"Arizona",AR:"Arkansas",AA:"Armed Forces Americas",AE:"Armed Forces Europe",AP:"Armed Forces Pacific",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District Of Columbia",FM:"Federated States Of Micronesia",FL:"Florida",GA:"Georgia",GU:"Guam",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MH:"Marshall Islands",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",MP:"Northern Mariana Islands",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PW:"Palau",PA:"Pennsylvania",PR:"Puerto Rico",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VI:"Virgin Islands",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"};

			//for registered user, if user signed into the site load data onto the form
			//data loaded below - fN, lN, address, Email id.
			
			if(!require.mozuData('user').isAnonymous){ 
				
				//fetch account id of signed user, make a API call to fetch other info
	    		var accountId = require.mozuData('user').accountId;
	    		var url = '/api/commerce/customer/accounts/'+accountId;  
	    		$('#businessType').parent().parent().parent().hide();
	    		api.request('GET',url).then(function(resp){
	    			if(resp.contacts.length > 0){
	    				$('#FirstName').val(resp.contacts[0].firstName);
		    			$('#LastName').val(resp.contacts[0].lastNameOrSurname);
		    			$('#custEmailAddress').val(resp.contacts[0].email);
		    			$('#BillingStreet').val(resp.contacts[0].address.address1);
		    			$('#custAddrLine').val(resp.contacts[0].address.address2);
		    			$('#custCity').val(resp.contacts[0].address.cityOrTown);
		    			$('#Company').val(resp.contacts[0].companyOrOrganization);
		    			$('#custPostalCode').val(resp.contacts[0].address.postalOrZipCode);
		    			if(resp.contacts[0].phoneNumbers.home.length > 0){
		    				$('#daytimePhoneNumber').val(resp.contacts[0].phoneNumbers.home);
		    			}
		    			else{
		    				$('#daytimePhoneNumber').val(resp.contacts[0].phoneNumbers.mobile); 
		    			}
		    			
		    			var country = resp.contacts[0].address.countryCode;
		    			
		    			$('#custCountry').val(country_list[country]);
		    			
		    			var state = resp.contacts[0].address.stateOrProvince;
		    			
		    			if(country !== 'US'){
		    				//hide select list
		    				$('select#custState').attr('name','custStateDup');
		    				$('select#custState').attr('id','custStateDup');
		    				$('select#custStateDup').hide();
		    				
		    				//display text field to enter state
		    				$('input#custStateDupinput').attr('name','custState');
		    				$('input#custStateDupinput').attr('id','custState');
		    				$('input#custState').show();
		    			}
		    			if(state.length === 2){
		    				$('#custState').val(state_list[state]);
		    			}else{
		    				$('#custState').val(state);
		    			}
		    				    			
		    			
		    		}
	    			else{
	    				$('#FirstName').val(resp.firstName);
						$('#LastName').val(resp.lastName);
						('#custEmailAddress').val(resp.emailAddress);
	    			} 
	    		});
    		}
    		else{
    			$('#custCountry').val(country_list.US);
    		}
    		
    		$('#Country').val('USA');
    		
    		$(document).on('change','#custCountry',function(){
    			var selectedCountry = $('#custCountry option:selected').val();
                var selectedCountrytext = $('#custCountry option:selected').text();
    			if(selectedCountry !== 'US' && selectedCountrytext !== 'United States' ){
    				
    				//hide select list 
    				$('select#custState').attr('name','custStateDup');
    				$('select#custState').attr('id','custStateDup');
    				$('select#custStateDup').hide();
    				
    				//display text field to enter state
    				$('input#custStateDupinput').attr('name','custState');
    				$('input#custStateDupinput').attr('id','custState');
    				$('input#custState').show();
    			}
    			else if(selectedCountry === 'US' || selectedCountrytext === 'United States' ){
    				
    				//hide text text field
    				$('input#custState').attr('name','custStateDupinput');
    				$('input#custState').attr('id','custStateDupinput');
    				$('input#custStateDupinput').hide();
    				
    				//show dropdown list if country is USA
    				$('select#custStateDup').attr('name','custState');
    				$('select#custStateDup').attr('id','custState');
    				$('select#custState').show();
    				
    			}
    		});
    		
    		
    		$(document).on('change','#Country',function(){
    			var selectedCountry = $('#Country option:selected').val();
                var selectedCountrytext = $('#Country option:selected').text();
    			if(selectedCountry !== 'US' && selectedCountrytext !== 'USA'){
    				
    				//hide select list
    				$('select#State').attr('name','StateDup');
    				$('select#State').attr('id','StateDup');
    				$('select#StateDup').hide();
    				
    				//display text field to enter state
    				$('input#StateDupinput').attr('name','State');
    				$('input#StateDupinput').attr('id','State');
    				$('input#State').show();
    			}
    			else if(selectedCountry === 'US' || selectedCountrytext === 'USA' ){
    				
    				//hide text text field
    				$('input#State').attr('name','StateDupinput');
    				$('input#State').attr('id','StateDupinput');
    				$('input#StateDupinput').hide();
    				
    				//show dropdown list if country is USA
    				$('select#StateDup').attr('name','State');
    				$('select#StateDup').attr('id','State');
    				$('select#State').show();
    				
    			}
    		});
			
    		var x,y;
    		//form submit
	    	$('#mktoForm_1169 .mktoButton').click(function(){

                $(".checkbox-mandatory-message,.other-business-desc").remove();
	    		var email = $('#custEmailAddress').val();
	    		var firstName = $('#FirstName').val();
	    		var lastName = $('#LastName').val();
	    		var optMarketing = false;
	    		var password = $('#businessType').val();
	    		var respFields = { 
                    account: {
                        emailAddress: email,
                        userName: email,
                        firstName: firstName,
                        lastName: lastName,
                        acceptsMarketing:optMarketing,
                        contacts: [{
                            email: email,
                            firstName: firstName,
                            lastNameOrSurname: lastName
                        }]
                    },
                    password: password 
                };
                
                //check for the checked field, if other's option checked, 
                if($('fieldset input[type=checkbox]:checked').length > 0){
                	if($('#businessType4').is(':checked')){ //check for corresponding field filled or not
                		if($('#cUSTTYPE').val() !== ''){
                			x = 1;
                		}
                		else{
                			x = 0;
                			$('#cUSTTYPE').parent().append('<div class="other-business-desc" style="color:brown;font-weight:bold;">Please enter Business description.</div>');
                			$(document).scrollTop($('#custEmailAddress').offset().top);
                			//setTimeout(function(){$('.other-business-desc').remove();},10000);
                			window.formMrk.submittable(false);
                		}
                	}else{                		
                		x = 1;						
                	}
					
                }
                else{
                	x = 0; 
                    //document.documentElement.scrollTop =parseInt($('label[for="businessType1"]').offset().top-250,10);
                    $('body').scrollTop($('label[for="businessType1"]').offset().top-250);
                    $('.checkbox-mandatory-message').remove();
                	$('fieldset legend').append('<span class="checkbox-mandatory-message">&nbsp;&nbsp;&nbsp;Select atleast one option</span>');
                	window.formMrk.submittable(false);
                }
                
                if(x === 1 && require.mozuData('user').isAnonymous){
                	api.action('customer','createStorefront',respFields).then(function(resp){
						if(resp){
							window.formMrk.submittable(true);
                	
							if(window.formMrk.submittable()){
								window.formMrk.submit();
								window.formMrk.onSuccess(function(values, followUpUrl) {
				                    // Return false to prevent the submission handler continuing with its own processing
				                    if($('.compare-full-error-container').length === 0){
				                    	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Thank You.<br>Request Submitted Successfully.<button id='session-btn-rd'>OK</button></div></div>");
				                    }	                    
				                    return false;
								});
		                	}
						}
					}, 
					function(xhr){ 
						if(xhr){
							if(xhr.errorCode == "MISSING_OR_INVALID_PARAMETER" && xhr.message == "Missing or invalid parameter: EmailAddress EmailAddress already associated with a login"){
								$('.trigger-login').trigger('click');
								$('#cboxOverlay').show().css('height',$(document).height());
								$(document).scrollTop(0);
							}
						}      
					});
                	
                }else if(x === 1 && !require.mozuData('user').isAnonymous && require.mozuData('user').email === $('#custEmailAddress').val()){
                	// console.log($('select#custState').val());
                	var m;
                	if($('select#custCountry').val() !== 'US'){              	    

                	   $('select#custStateDup option').each(function(i,v){
                	       if(v.text === $('input#custState').val()){
                	           m = 1;
                	       }
                	       else{
                	           m = 0;
                	       }
                	   });
                	   
                	   if(m===0){
                	       $('select#custStateDup').append($("<option></option>").attr("value",$('input#custState').val()).text($('input#custState').val()));
                	   }
                	   $('select#custStateDup option:last').attr('selected','selected');
                		
                	 }
                	 
                	 if($('input#State').val() !== ''){
                	 	if($('select#custCountry').val() !== 'US'){              	    

	                	   $('select#StateDup option').each(function(i,v){
	                	       if(v.text === $('input#custState').val()){
	                	           m = 1;
	                	       }
	                	       else{
	                	           m = 0;
	                	       }
	                	   });
	                	   
	                	   if(m===0){
	                	       $('select#StateDup').append($("<option></option>").attr("value",$('input#State').val()).text($('input#State').val()));
	                	   }
	                	   $('select#StateDup option:last').attr('selected','selected');	                		
	                	 }
                	 }
                	
                	window.formMrk.submittable(true);
                	
					if(window.formMrk.submittable()){
						window.formMrk.submit();
						window.formMrk.onSuccess(function(values, followUpUrl) {
		                    // Return false to prevent the submission handler continuing with its own processing
		                    if($('.compare-full-error-container').length === 0){
		                    	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Thank You.<br>Request Submitted Successfully.<br><button id='session-btn-rd' >OK</button></div></div>");
		                    }	                    
		                    return false;
						});
                	}
                }else if(x == 1 && !require.mozuData('user').isAnonymous && require.mozuData('user').email !== $('#custEmailAddress').val()){
	                	
                    // Return false to prevent the submission handler continuing with its own processing
                    if($('.compare-full-error-container').length === 0){
                    	$(document.body).append("<div class='compare-full-error-container'><div class='compare-error-container'>Please provide registered email id, "+require.mozuData('user').email+"<br><button id='session-btn-rd'>OK</button></div></div>");
                    }
                    
                	
                }
                    if($(window).width()>780){
                    if($('.mktoError').length>0){
                    document.documentElement.scrollTop =$('#mktoForm_1169').offset().top-210;
                    }
                    }else{
                        if($('.mktoError').length>0){
                            $('body').scrollTop($('.mktoError').offset().top-150);
                      }
                    }
			});

    	}); //ready function end
});
