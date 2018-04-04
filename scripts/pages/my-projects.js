define(['modules/jquery-mozu', "modules/mc-cookie"],function($,McCookie){ 
    $(document).ready(function () {
        McCookie.getProjects();
    });
});
