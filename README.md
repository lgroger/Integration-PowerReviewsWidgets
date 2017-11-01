# Theme Widget for the Power Reviews Application by Kibo

This repository contains files for the theme widget that accompanies the [Power reviews Application by Kibo](https://developer.mozu.com/docs/guides/mozu-apps/powerreviews-app-by-mozu.htm). You can add this widget to the checkout page of your Mozu site(s) to enable reviews for products, on PDP or category pages and capture order details.


##Widget Files

This widget adds the following files:
* `templates/Widgets/PowerReivews/pr-product-reviews.hypr`
* `templates/Widgets/PowerReivews/pr-product-snippets.hypr`
* `templates/Widgets/PowerReivews/pr-roi-beacon.hypr`
* `scripts/widgets/powerreviews.js`
* `resources/admin/widgets/icon-powerreview-beacone.png`
* `resources/admin/widgets/power_review_icon.png`
* `resources/admin/widgets/power_review_icon.png`
* `stylesheets/widgets/powerreview.css`

And updates the following file:
* `templates/modules/product/product-listing.hypr.live` - add the following code to the a section where the reviews should be displayed
 ```
    <div id="PRInlineRating-{{model.productCode}}" class="pr-inline-rating" data-mz-product-code="{{ model.productCode }}">
        <div id="pr-snippet-{{model.productCode}}" ></div>
    </div>
 ```

* `theme.json`

    Add the following to settings section
    ```
    "settings": {
        "powerReviewsSettingsList": "mozu-powerreviews2-sitesettings@mzint",
        ...
    }
    ```
    
    Add the following under widgets section
    ```
     {
        "category": "catalog",
        "id": "pr_product_review_snippets",
        "displayName": "PowerReviews Snippets",
        "displayTemplate": "PowerReviews/pr-product-snippets",
        "editViewFields": [
          {
            "name": "widgetType",
            "fieldLabel": "Widget Type",
            "xtype": "combo",
            "store": [
              [
                "reviewSnippet",
                "Review Snippet"
              ],
              [
                "socialAnswerSnippet",
                "Q&A Snippet"
              ]
            ]
          }
        ],
        "icon": "/resources/admin/widgets/power_review_icon.png",
        "validPageTypes": [
          "product"
        ]
      },
    {
	      "category": "catalog",
	      "id": "pr_product_review",
	      "displayName": "PowerReviews Display",
	      "displayTemplate": "PowerReviews/pr-product-reviews",
	      "editViewFields": [
	        {
	          "name": "widgetType",
	          "fieldLabel": "Widget Type",
	          "xtype": "combo",
	          "store": [
	            [
	              "reviewDisplay",
	              "Review display"
	            ],
	            [
	              "socialAnswerDisplay",
	              "Q&A display"
	            ],
              [
                "whydYouBuyDisplay",
                "Why Did you buy display"
              ]
	          ]
	        },
          {
	          "name": "displayType",
	          "fieldLabel": "Display Type",
	          "xtype": "combo",
	          "store": [
	            [
	              "simple",
	              "Simple Snapshot"
	            ],
	            [
	              "paging",
	              "Paging"
	            ],
              [
                "list",
                "List"
              ]
	          ]
	        }
	      ],
	      "icon": "/resources/admin/widgets/power_review_icon.png",
	      "validPageTypes": [
	        "product"
	      ]
	    },
	    {
	      "category": "catalog",
	      "id": "pr_roibeacon",
	      "displayName": "PowerReviews ROI Beacon",
	      "displayTemplate": "PowerReviews/pr-roi-beacon",
	      "icon": "/resources/admin/widgets/icon-powerreview-beacone.png",
        "editViewFields": [
	        {
	          "name": "includeWhyDidYouBuy",
	          "fieldLabel": "Include Why Did you buy",
	          "xtype": "mz-input-checkbox"
	        },
          {
	          "name": "includeSellerRatings",
	          "fieldLabel": "Include Seller Ratings",
	          "xtype": "mz-input-checkbox"
	        },
          {
	          "name": "sellerRatingsPageId",
	          "fieldLabel": "Seller Ratings PageId",
	          "xtype": "mz-input-text"
	        }

	      ],
	      "validPageTypes": [
	        "order"
	      ]
	    }
    ```

##Update Your Theme

1.	Clone or download this repository.
2.	Add or merge the files listed above. 
3.	Run Grunt to build the theme.
4.	Upload the resulting ZIP file to Mozu Dev Center.
5.	Install the updated theme to the sandbox you’re working in.
6.	In Mozu Admin, go to **SiteBuilder** > **Themes**, right-click the new theme, and click **Apply**.


##Add the Review Widget to product page

1.	In Mozu Admin, go to **SiteBuilder** > **Editor**.
2.	In the **Site tree**, navigate to **Templates** > **Product**.
3.	Click the **Widgets** button at the top of the editor.
4.	Drag the **Power review** widget to any dropzone the page. Configure the widget and save.
