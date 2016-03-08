# Widgets for the PowerReviews Application by Mozu

This repository contains files for the theme widgets that accompany the [PowerReviews Application by Mozu](https://www.mozu.com/marketplace/powerreviews-integration), as well as a template for a Write a Review page customers use to review products on your Mozu site.

Merging this code makes the following widgets available in Site Builder:
* **PowerReviews Product Reviews** - Displays or process reviews and Q&A content, for use on Product pages. You can add tabs to this widget to display any or all of the following:
  * **Review Snippet**—Allows customers to enter reviews.
  * **Q&A Snippet**—Allows customers to ask questions.
  * **Review Display**—Displays reviews.
  * **Q&A Display**—Displays questions and answers.
* **PowerReviews ROI Beacon** - Measures how product reviews and Q&A affect sale conversions. For use on your Checkout page.

This repository is structured to mirror the file structure of the [Mozu Core Theme](https://github.com/Mozu/core-theme), but only the necessary files for the widgets and review page are included. These files are based off Mozu Core 9. If your theme is based on an earlier version of the Core Theme, the [core6](https://github.com/Mozu/Integration-PowerReviewsWidgets/tree/core6) branch of this repository contains files that you can integrate with Mozu Core Theme versions 6, 7, or 8. 

##Theme Files

This integration adds the following files to the Core theme:
* `resources/resize.html`
* `resources/admin/widgets/icon-powerreview-beacone.png`
* `resources/admin/widgets/power_review_icon.png`
* `scripts/widgets/powerreviews.js`
* `stylesheets/pages/pr_product.css`
* `stylesheets/widgets/pr_category.css`
* `templates/modules/product/pr-review-listing.hypr.live`
* `templates/pages/write-a-review.hypr`
* `templates/widgets/PowerReviews/pr-product-reviews.hypr`
* `templates/widgets/PowerReviews/pr-roi-beacon.hypr`
* `templates/widgets/PowerReviews/pr-seo-question-template.hypr`
* `templates/widgets/PowerReviews/pr-seo-rating-template.hypr`
* `templates/widgets/PowerReviews/pr-seo-template.hypr`
* `widgets/resize.js`


And updates the following files:
* `scripts/modules/views-collections.js`
* `templates/page.hypr`
* `templates/modules/product/product-images.hypr.live`
* `templates/modules/product/product-listing.hypr.live`
* `templates/pages/category.hypr`
* `theme.json`


This repository also includes three placeholder files that you use to customize the styles of your PowerReviews widgets and your Write a Review page:
* `stylesheets/widgets/pr_category_styles_review_override.css` - For widgets on your Category pages.
* `stylesheets/widgets/pr_product_styles_review_override.css` - For widgets on your Product pages.
* `stylesheets/widgets/pr_write_a_review_override.css` - For the Write a Review page.


##Update Your Theme

1.	Clone or download this repository.
2.	Add or merge the files listed above to your theme files. 
3.  In `theme.json`, find `powerReviewsFQNID` under `settings` and replace the value after the `@` symbol with your Dev Account namespace. The namespace is the first element of the Application Key for the theme in Mozu Dev Center. 
4.  Add any custom styling you want to implement to the `override.css` files.
5.	Run Grunt to build the theme.
6.	Upload the resulting ZIP file to Mozu Dev Center.
7.	Install the updated theme to the sandbox you’re working in.
8.	In Mozu Admin, go to **SiteBuilder** > **Themes**, click the three dots next to the new theme, and click **Apply**.

That's it! Your site is now ready for configuration in Site Builder. Refer to the [PowerReviews Application by Mozu Configuration Guide](https://www.mozu.com/docs/guides/mozu-apps/powerreviews-app-by-mozu.htm) for help configuring the app and adding the PowerReviews widgets to your site.
