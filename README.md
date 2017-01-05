# Textual.js, Javascript Static Website Generator

**Textual.js** is client-side static website generator written in Javascript that uses
Markdown files to generate a website in real-time, without the need of server-side support for
PHP, Ruby, Node.js, etc.

**Textual.js** was developed in the spirit of static website generators like [Jekyll](https://jekyllrb.com),
[Pelican](http://getpelican.com) and especially [CMS.js](http://cdmedia.github.io/cms.js/).
It uses [jQuery](https://jquery.com) and a slightly modified [Marked](https://github.com/chjj/marked)
for HTML rendering, and the default theme was inspired by the [Casper](https://github.com/TryGhost/Casper) theme.

[Check out the demo site »](http://textualjs.com/demo/)

---

## Quick Start

1. Clone the repo `git clone https://github.com/ranaroussi/textual.js.git`
or download the [latest release](https://github.com/ranaroussi/textual.js/releases/latest).
2. Configure `aseets/js/config.js` with your site's information.
3. Visit your site!


## How it works

**Textual.js** can be configured to work with either a **Web Server** or a [**GitHub Repository**](https://pages.github.com).

### Server Mode

In Server mode (default mode), **Textual.js** uses the web server's `Directory Indexing`
feature to scan and index Markdown files. Then, it uses HTML, CSS and Javascript to
render your website as a single-page app.

### GitHub Mode

GitHub mode works essentially the same as Server mode, only instead of scanning your
server for Markdown files, it uses GitHub's API to access your repository
and index the relevant files.


## Configure

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


## Migration from Jekyll

Once **Textual.js** is installed and running, simply copy all of your posts from your Jekyll
project's `_post` folder to your designated **Textual.js** posts folder, and all of your Markdown pages
from Jekyll's projects root folder into your designated **Textual.js** pages folder.

