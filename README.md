node-trpl
=========

Sets up a node server that stores page data as json and uses trpl templates to process them.  There is almost no configuration needed and all the development and authoring can be done in a browser.

##Authoring Interface
- visit the site using this path /i/ to see the authoring interface

####Templates : used to render a page
- Click the label or [+] to show all templates.
- Enter text into the text field at the bottom of the list and click the link next to it to create a new one.
- Click name of template to edit the default mockup data for that template.
- Click 'code' next to name to edit the code.
- Click [+] next to name to exand and show the child mockup data.
- To delete a template, click the [+] button next to it and click the 'delete' link.  This option is not available when the template contains child mockup data.

####Components : can be added to templates
- Work the same as templates except the data you author for each component can be used on actual pages later on

####Pages : what eventually gets seen on the site
- If no root page has been created, click on the 'create' link to do so.
- To create child pages, enter text into the text field at the bottom of the list and click the link next to it.
- Choose a template and click save to create the page.
- Click the name of the page to edit the data for that page.
- Click the gray text next to the name to change the template.  Some data loss may occur when saving a page that has changed templates.
- To delete a page, click the [+] button next to it and click the 'delete' link.  This option is not available if the page contains child pages.

####Images and Files
- Click the label or [+] to expand the list of resources.
- Enter text into the first text box and click 'create' to create a new folder.
- Enter text into the second text box and click 'upload' to upload a new image or file.  Leave out the file extension, this will be added automatically based on the type of image you choose.
- Click the name of an existing folder or click [+] to expand it.
- Click the name of an existing image or file to view the uploaded image or choose a new image or file.
- To delete and image or file, click the down arrow next to the name to expand the options and choose 'delete'.

####Style Sheets and JavaScript
- Work like images and files except doesn't allow you to create folders and coding is done in the browser instead of uploading a local file.

##Additional Information

Click the view button in the upper right to view the page on the site.  The page will open in a new tab.

Click the save button in the upper right or ctrl + s to save the current tab.

Components can be added to template code by using [id] to tell it to process the 'id' component using the data that was authored for this page.
- This can be used to format page data in a common way like for slideshows and feeds.

Components can also be added to template code by using [id|source] to tell it to process the 'id' component using data that was saved separate from the page data.
- This can be used to create common site elements like headers and footers.
- If 'source' is a url, it will use the json it finds at that url.
- If 'source' is blank, it will use the default data for the component.
- otherwise, it will use the 'source' version of the component data.

The form that is used for editing the page, component, and mockup data is built using the same template that is used to create the page.  This structure of the fields in the authoring form is built automatically.
- Adding components to a template using [id] will automatically add the fields that are needed for that component to the form when editing the page.
- The 'source' for [id|source] can be specific for each page if you wrap it in {} in the template (e.g. [id|{version}], or [id|http://www.source.com/?q={value}&count={count}])
