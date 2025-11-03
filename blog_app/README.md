<h1>Blog app</h1>
A dynamic web application for blog posting


<h2> ListView not rendering HTML tags</h2>
I used javascript innerHTML property so that users can have their post rendered the way it was formatted. That worked fine for the detailView but the tags were shown in ListView.

In other to resolve that, I had to <code>pip install django-bleach</code>.
<br></br>
This will ensure that django filter the tag to be used and not allow malicious scripts injected in the post.
I then specified BLEACH_ALLOWED_TAGS and BLEACH_ALLOWED_ATTRIBUTES in the settings. Then I included the safe pipeline in post-content in the HTML file.
