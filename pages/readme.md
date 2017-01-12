---
layout: page
author: Ran Aroussi
---

# ->Javascript Website Generator<-
->T e x t u a l . j s<-

![textual.js](assets/img/devices.png "Textual.js in action")

**Textual.js** is client-side *static website generator* written in Javascript that uses
Markdown files to generate a website in real-time, without the need of server-side support for
PHP, Ruby, Node.js, etc.

**Textual.js** was developed in the spirit of static website generators like [Jekyll](https://jekyllrb.com),
[Pelican](http://getpelican.com) and especially [CMS.js](http://cdmedia.github.io/cms.js/).
It uses [jQuery](https://jquery.com) and a slightly modified [Marked](https://github.com/chjj/marked)
for HTML rendering, and the default theme was inspired by the [Casper](https://github.com/TryGhost/Casper) theme.

---

-> >>> ** [Click Here for the Demo Site](./demo/) ** <<< <-

---

## Quick Start

1. Clone the repo `git clone https://github.com/ranaroussi/textual.js.git`
or download the [latest release](https://github.com/ranaroussi/textual.js/releases/latest).
2. Configure `aseets/js/config.js` with your site's information.
3. Visit your site!

---

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

