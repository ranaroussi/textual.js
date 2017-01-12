---
layout: page
title: Documentation
---

# Documentation

<a name="top"></a>

- [Server Configuration](#configure)
- [Migration from Jekyll](#jekyll)
- [Optional Headers](#headers)
- [Template Elements](#template)
- [Markdown Cheat Sheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)


---
<a name="configure"></a>
## Server Configuration

### Server Mode

For self hosting your website, make sure the server's directory indexing feature is enabled
(both [Apache](https://httpd.apache.org) and [NGINX](https://www.nginx.com) are supported).

* **Apache** - Make sure `htaccess` is enabled (your website should already be working if it is)
OR `Options Indexes` is set for your directory:
```
<Directory /var/www/yoursite.com/>
  Options Indexes
</Directory>
```

* **NGINX** - Make sure `autoindex on` is set for your directory:
```
server {
    location / {
        try_files $uri $uri/ /index.html;
        autoindex on;
    }
}
```

### GitHub Mode

1. Set `github_mode` in `assets/js/config.js` to `true`.
2. Specify the details of your GitHub account, repository and branch under in `github_mode` in `assets/js/config.js`.

```javascript
// use github
github_mode: true,

// github settings: user, repo, branch
github_settings: {
    host: 'https://api.github.com',
    username: 'your-github-username',
    repo: 'your-repository',
    branch: 'website-branch' // usually gh-pages
}
```

###### [return to top](#top)

---

<a name="jekyll"></a>
## Migration from Jekyll

Once **Textual.js** is installed and running, simply copy all of your posts from your Jekyll
project's `_post` folder to your designated **Textual.js** posts folder, and all of your Markdown pages
from Jekyll's projects root folder into your designated **Textual.js** pages folder.

###### [return to top](#top)

---

<a name="headers"></a>
## Optional Headers

You can add headers (wrapped in `---`) at the top of each page's or post's `.md` file, what will
add more data and layout options to your document.

Below are the supported headers. **All headers are OPTIONAL!**

```text
---
title:         title of Post/Page (if different from document's first H1 element)
author:        author name (if different than config's author_name)
author_bio:    author bio (if different than config's author_bio)
author_avatar: author avatar URL (if different than config's author_avatar)
tags:          tag1, tag2, ...
category:      category1, category2, ...
coverimage:    url or path to desired cover image
---
```

###### [return to top](#top)

---

<a name="template"></a>
## Template Elements

If you want to play with the template, here is the list of classes used by Textual.js...

### Global Classes

#### Header

Below items should reside within `<header class="master-header">`:

- `.master-header-title`
- `.master-header-tagline`
- `.topnav`
- `.topnav-drawer`

Outside of `<header class="master-header">`:

- `.cover-image`
- `main` (element, not class)

#### footer
Below items should reside within `<footer class="master-footer">`:

- `.master-footer-content`
- `.site-credit`

### Home + Archive Classes

Below items should reside within `<article class="post">`:

#### Post block

- `.post-title`
- `.post-content`
- `.post-meta`
- `.post-date`
- `.post-author`
- `.post-category`
- `.post-tags`

#### Pagination block

- `.pagination-older`
- `.pagination-newer`

### Archive Page Classes

Below items should reside within `<section class="page-header">`:

- `.author-page-title`
- `.author-page-bio`
- `.author-page-avatar`
- `.category-page-title`
- `.tag-page-title`

### Page Classes

Below items should reside within `<article class="page">`:

- `.page-title`
- `.page-content`

### Post Classes

Below items should reside within `<article class="post">`:

- `.post-title`
- `.post-meta`
- `.post-date`
- `.post-author`
- `.post-category`
- `.post-tags`
- `.post-content`
- `.post-comments`
- `.post-footer`
- `.post-author`
- `.post-avatar`
- `.post-author`
- `.post-bio`
- `.post-share`

### Error Page

Below items should reside within `<div class="error">`:

- `.error-title`
- `.error-text`

###### [return to top](#top)
