node-trpl
=========

Sets up a node server that stores page data as json and uses trpl templates to process them.

####Templates : used to render a page
- /o/t/ = view all the templates and the options for each
- /m/t/id/ = modify the template named 'id'
- /e/t/id/ = modify the mockup json for the template
- /d/t/id/ = delete the template named 'id'
- /t/id/ = view the template output using its own mockup data

####Components : can be added to templates
- /o/t/ = view all the components and the options for each
- /m/c/id/ = modify the component named 'id'
- /e/c/id/ = modify the default json for the component
- /e/c/id/name/ = modify a separate version of the json for the component
- /d/t/id/ = delete the component named 'id'
- /c/id/ = view the component output using its own mockup data

####Pages : what eventually gets seen on the site
- /o/path/ = view all the pages below the page found at /path/ and the options for each
- /m/path/ = modify which template to use for the page found at /path/
  - if page does not exist but parent folder does exist, it will be created
- /e/path/ = modify the json for the page found at /path/
- /d/path/ = delete the page found at /path/
  - only works if the page has no child pages
- /path/ = view the page found at /path/

####Additional Information

Components can be added to template code by using [id] to tell it to process the 'id' component using the data that was authored for this page.
- this can be used to format page data in a common way like for slideshows and feeds

Components can also be added to template code by using [id|source] to tell it to process the 'id' component using data that was saved separate from the page data.
- this can be used to create common site elements like headers and footers
- if 'source' is a url, it will use the json it finds at that url
- if 'source' is blank, it will use the default data for the component
- otherwise, it will use the alternate version of the component data that was saved using /e/c/id/source

Editing the json for a template, component, or page is done using a form that is returned to you when you use the /e/ prefix.  This form is built by looking at the template to determine which fields are needed and how they are structured.
- adding components to a template using [id] will automatically add the fields that are needed for that component to the form when editing the page
- the 'source' for [id|source] can be specific for each page if you wrap it in {} in the template (e.g. [id|{version}], or [id|http://www.source.com/?q={value}&count={count}])
