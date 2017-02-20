jQuery.fn.outerHTML = function(s) {
    return (s) ? this.before(s).remove() : jQuery("<span>").append(this.eq(0).clone()).html();
}
String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};
Object.keys = Object.keys || function(o) {
    var keysArray = [];
    for (var name in o) {
        if (o.hasOwnProperty(name)) {
            keysArray.push(name);
        }
    }
    return keysArray;
};
String.prototype.trim = String.prototype.trim || function(o) {
    return o.replace(/^\s+|\s+$/gm, '');
}

;(function($tjs, window, document, undefined) {

    // callbacks
    $tjs.onAppLoadCallback = function(){}
    $tjs.onPageLoadCallback = function(){}

    $tjs.posts = {};
    $tjs.pages = {};
    $tjs.authors = {};
    $tjs.posts_by_author = {};
    $tjs.posts_by_tag = {};
    $tjs.posts_by_category = {};

    var coverimage;
    var lastURL, lastPagination;

    var dateParser = /\d{4}-\d{2}(?:-\d{2})?/; // can parse both 2016-01 and 2016-01-01

    // date formatter
    function formatDate(date, format) {
        format = format || 'pretty';

        // var date = new Date();
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        if (format == 'datetime') {
            return year + '-' + date.getMonth() + '-' + day;
        }
        return day + ' ' + $tjs.config.month_names[monthIndex] + ' ' + year;
    }

    // make plural words singular
    function singularize_dir(str) {
        if (str.lastIndexOf("ies") === str.length-3) {
            return str.substring(0, str.lastIndexOf("ies")) + "y";
        }
        if (str.lastIndexOf("s") === str.length-1) {
            return str.substring(0, str.lastIndexOf("s"));
        }
        if (str.lastIndexOf("ii") === str.length-2) {
            return str.substring(0, str.lastIndexOf("ii")) + "us";
        }
        return str;
    }

    // build the link slug
    function slug(file_url) {
        var dir = "", parts = file_url.split('/');
        if (parts.length > 1) {
            dir = singularize_dir(parts[0]) + "/"; // make single
            delete parts[0];
        }

        var file = parts[parts.length - 1];
        file = file.replace(/\d{4}-\d{2}(?:-\d{2})?/, '').toLowerCase();
        file = file.replace(/^-+|-+$/g, '').replace(/^_+|_+$/g, '');

        if (file.lastIndexOf(".md") !== -1) {
            file = file.substring(0, file.lastIndexOf(".md"));
        }

        return dir + file.replace(/ /g, '-');
    }


    function genGitHubURL(folder) {
        var gh_url  = $tjs.config.github_settings.host +'/repos/';
            gh_url += $tjs.config.github_settings.username +'/';
            gh_url += $tjs.config.github_settings.repo +'/contents/'+ folder;
            gh_url += '?ref='+ $tjs.config.github_settings.branch;
        return gh_url;
    }

    // get all files from github
    function getGitHubFiles(folder) {
        var collector = {};

        $.ajax({
            async: false,
            url: genGitHubURL(folder),
            success: function(data) {
                var files = {};

                for (var i = 0; i < data.length; i++) {
                    var file = data[i];
                    if (file.name.lastIndexOf(".md") !== -1) {
                        var file_index = (folder == $tjs.config.postsdir) ? dateParser.exec(file.name)[0]+i : i
                        files[i] = file.download_url;
                    }
                }
                var keys = Object.keys(files).reverse();
                for (var i = 0; i < keys.length; i++) {
                    var filename = (folder == $tjs.config.pagesdir) ? 'pages/' : 'post/';
                        filename += files[keys[i]].split('/').pop();
                    collector[slug(filename)] = files[keys[i]];
                }
            }
        });
        return collector;
    };

    // get all files (local server)
    function getLocalFiles(folder) {

        var collector = {};

        $.ajax({
            async: false,
            url: folder,
            success: function(data) {
                var files = {};
                var linkFiles = $(data).find('a');

                $(linkFiles).each(function(index) {
                    filename = $(this).attr('href');
                    if (filename.lastIndexOf(".md") !== -1) {
                        var file_index = (folder == $tjs.config.postsdir) ? dateParser.exec(filename)[0]+index : index;
                        files[file_index] = folder + '/' + filename;
                    }
                });

                var keys = Object.keys(files);
                if (folder == $tjs.config.postsdir) {
                    keys.reverse();
                }
                for (var i = 0; i < keys.length; i++) {
                    var filename = (folder == $tjs.config.pagesdir) ? 'pages/' : 'post/';
                        filename += files[keys[i]].split('/').pop();
                    collector[slug(filename)] = files[keys[i]];
                }
            }
        });
        return collector;
    };

    // get all files
    function getFiles(folder) {
        if ($tjs.config.github_mode) {
            return getGitHubFiles(folder);
        }
        return getLocalFiles(folder);
    };

    function getFileContent(loc) {
        var folder = loc.split('/')[0];
        var use = (folder == "page") ? $tjs.pages : $tjs.posts;
        var file_url = use[loc];

        var file = {
            link: file_url,
            slug: loc,
            meta: {
                date: "",
                layout: "post",
                coverimage: "",
                tags: [],
                categories: [],
                author: {}
            }
        };

        try{ file.meta.date = new Date(dateParser.exec(file_url)[0]); } catch(err){}

        $.ajax({
            async: false,
            // dataType: "text",
            url: file_url,
            error: function(xhr, ajaxOptions, thrownError) {
                if (xhr.status == 404) {
                    file.title = thrownError;
                    file.lead = "";
                    file.excerpt = "Cannot retrieve this content at this time.";
                    file.body = file.excerpt;
                    file.date = "";
                }
            },
            success: function(o) {
                o = o.trim();
                var meta = "";
                if (o.indexOf('---') === 0) {
                    var parts = o.split("---");
                    if (parts.length > 2) {
                        meta = "---"+ parts[1] +"---";
                    }
                }
                var text = o.replace(meta, '').trim();

                try {
                    try {
                        file.title = meta.split("title:")[1].split("\n")[0].trim();
                    } catch (err2) {
                        // file.title = text.split("#")[1].split("\n")[0].replace(/^#+/g, '').trim();
                        if (text[0] == "#") {
                            file.title = text.split("#")[1].split("\n")[0].replace(/^#+/g, '').trim();
                        } else {
                            var lines = text.split('\n');
                            if (lines[1] == lines[1].replace(/[^=]/g, "")) {
                                file.title = lines[0];
                            }
                        }

                    }
                } catch (err) {
                    file.title = "Untitled";
                }

                try {
                    file.lead = marked(meta.split("lead:")[1].split("\n")[0].trim());
                } catch (err) {
                    file.lead = "";
                }

                try{ file.meta.layout = meta.split("layout:")[1].split("\n")[0].trim(); }catch(err){}
                try{ file.meta.coverimage = meta.split("coverimage:")[1].split("\n")[0].trim(); }catch(err){}

                try{
                    var author = meta.split("author:")[1].split("\n")[0].trim();
                    file.meta.author = {"name":author, "link":"author/"+slug(author), "avatar":"", "bio":""};
                    try{
                        file.meta.author.avatar = meta.split("author_avatar:")[1].split("\n")[0].trim();
                    }catch(err){}
                    try{
                        file.meta.author.bio = meta.split("author_bio:")[1].split("\n")[0].trim();
                    }catch(err){}
                }catch(err){}

                try{
                    var categories = meta.split("category:")[1].split("\n")[0].trim()
                    categories = categories.replace(/[\[\]']+/g,'').replace(',', ' ').replace(/ +(?= )/g,'').split(' ');
                    for (var i = 0; i < categories.length; i++) {
                        file.meta.categories.push({"name":categories[i], "link":"category/"+slug(categories[i])})
                    }
                }catch(err){
                    if ($tjs.config.site_default_category) {
                        file.meta.categories.push({"name":$tjs.config.site_default_category, "link":"category/"+$tjs.config.site_default_category});
                    }
                }

                try{
                    var tags = meta.split("tags:")[1].split("\n")[0].trim()
                    tags = tags.replace(/[\[\]']+/g,'').replace(',', ' ').replace(/ +(?= )/g,'').split(' ')
                    for (var i = 0; i < tags.length; i++) {
                        file.meta.tags.push({"name":tags[i], "link":"tag/"+slug(tags[i])})
                    }
                }catch(err){}

                // get clean body (w/o h1)
                var body = text.trim();
                body = text.replace("# " + file.title, "").replace("#" + file.title, "").trim();
                var lines = text.split('\n');
                if (lines[1] == lines[1].replace(/[^=]/g, "")) {
                    body = text.replace(lines[0] +"\n"+ lines[1], "").trim();
                }
                file.body = body;
                file.excerpt = marked(body.split("\n")[0].trim());
            },
        });
        return file;

    }

    function renderTemplate(content, kind) {

        var html = $($("#" + kind + "-template").html());

        if (kind != "" && kind != "page") { kind = "post"; }

        html.find("." + kind + '-title').html('<a href="#' + content.slug + '">' + marked(content.title) + '</a>');

        try {
            html.find("." + kind + '-date').html(formatDate(content.meta.date));
            html.find("." + kind + '-date').attr('datetime', formatDate(content.meta.date, 'datetime'));
        }catch(err){}

        if (Object.keys(content.meta.author).length > 0) {
            var author_name = content.meta.author.name;
            var author_link = content.meta.author.link;

            var author_bio = content.meta.author.bio || $(marked($tjs.config.author_bio)).html() || "";
            var author_avatar = content.meta.author.avatar || $tjs.config.author_avatar || "";

            try {
                html.find("." + kind + '-author').html('<a href="#'+author_link+'">'+author_name+'</a>');
                html.find('.post-author').html('<a href="#'+author_link+'">'+author_name+'</a>');

                if (author_bio != "") {
                    html.find('.post-bio').html(author_bio);
                }
                if (author_avatar != "") {
                    html.find('.post-avatar').html('<a href="#'+author_link+'"><img src="'+ author_avatar +'" alt="'+ author_name +'" title="'+ author_name +'"></a>');
                }
            }catch(err){
                var author_name = $(marked($tjs.config.author_name)).text()
                html.find('.post-author').html('<a href="#author/'+slug(author_name)+'">'+author_name+'</a>');
                html.find('.post-bio').html($(marked($tjs.config.author_bio)).text());
                if ($tjs.config.author_avatar != "") {
                    html.find('.post-avatar').html('<img src="'+ $tjs.config.author_avatar +'">');
                }
            }
        } else {
            var author_name = $(marked($tjs.config.author_name)).text()
            html.find('.post-author').html('<a href="#author/'+slug(author_name)+'">'+author_name+'</a>');
            html.find('.post-bio').html($(marked($tjs.config.author_bio)).html());
            if ($tjs.config.author_avatar != "") {
                html.find('.post-avatar').html('<img src="'+ $tjs.config.author_avatar +'">');
            }
        }

        try {
            var list = $('<ul>');
            for (var i = 0; i < content.meta.categories.length; i++) {
                list.append('<li><a href="#'+content.meta.categories[i].link+'">'+content.meta.categories[i].name+'</a></li>');
            }
            if (i > 0) { html.find("." + kind + '-category').html(list.outerHTML()); }
        }catch(err){}

        try {
            var list = $('<ul>');
            for (var i = 0; i < content.meta.tags.length; i++) {
                list.append('<li><a href="#'+content.meta.tags[i].link+'">'+content.meta.tags[i].name+'</a></li>');
            }
            if (i > 0) { html.find("." + kind + '-tags').html(list.outerHTML()); }
        }catch(err){}

        html.find("." + kind + '-lead').html(content.lead);
        html.find("." + kind + '-content').html(content.content);
        // html.find('.site-author').html($(marked($tjs.config.author_name)).html());
        // html.find('.site-bio').html($(marked($tjs.config.author_bio)).html());

        return html;
    }


    function renderSingle(loc) {
        var html = "", folder = loc.split('/')[0];

        var item = getFileContent(loc);

        document.title = $(marked(item.title)).text() +" | "+ $tjs.config.site_title;
        if (item.title == "") {
            document.title = $tjs.config.site_title; // +" - "+  $(marked($tjs.config.site_tagline)).text();
        }


        // set open graph description
        var og_desc = $(marked(item.excerpt)).text();
        set_open_graph("og:description", og_desc);
        set_open_graph("twitter:description", og_desc);

        item.content = marked(item.body);
        html = renderTemplate(item, folder);

        // cover image
        if (item.meta.coverimage !== "") {
            coverimage = item.meta.coverimage;
        }

        // share item
        var text = encodeURIComponent(item.title);
        var link = encodeURIComponent(window.location.href);
        html.find(".post-footer .share-icon.icon-twitter").attr("href", "https://twitter.com/share?text="+text+"&url="+link);
        html.find(".post-footer .share-icon.icon-facebook").attr("href", buildFacebookShareLink(item));
        html.find(".post-footer .share-icon.icon-gplus").attr("href", "https://plus.google.com/share?url="+link);
        return html;
    }

    function buildFacebookShareLink(item) {
        // https://apps.lazza.dk/facebook/
        var picture = coverimage || $(".post-content img").attr('src') || $(".page-content img").attr('src');
        if (picture) {
            picture = encodeURIComponent(get_full_image_url(picture));
        }
        var params = {
            "u": encodeURIComponent(window.location.href),
            "picture": picture,
            "title": encodeURIComponent(item.title),
            "caption": $tjs.config.site_name,
            "description": $(marked(item.excerpt)).text(),
            "quote": "",
        }
        return "https://www.facebook.com/sharer/sharer.php?"+$.param(params).replace(/%20/g, "+");
    }

    function scrollToAnchor(anchor) {
        // scroll to sub-anchor
        if (anchor == "") return;

        var scrollto = $('#'+anchor);
        if (scrollto.length == 0) {
            scrollto = $('a[name='+anchor+']');
        }

        if (scrollto.length > 0) {
            $('html, body').animate({
                scrollTop: scrollto.offset().top
            }, 100);
        }
    }

    function buildAllCollections() {
        var all_posts = Object.keys($tjs.posts);

        // defaults
        var default_category = "category/" + ($tjs.config.site_default_category || "none");
        $tjs.posts_by_category[default_category] = {};
        $tjs.posts_by_tag["tag/none"] = {};


        // build
        for (var i = 0; i < all_posts.length; i++) {
            var post = getFileContent(all_posts[i]);

            // authors
            var author = post.meta.author.link || "author/"+slug($tjs.config.author_name) || "unknown";
            if ($tjs.posts_by_author[author] === undefined) {
                $tjs.posts_by_author[author] = {}
                $tjs.authors[author] = {"name":"", "bio":"", "avatar":""}
            }
            $tjs.posts_by_author[author][post.slug] = post.link;

            $tjs.authors[author]["name"] = $tjs.authors[author]["name"] || post.meta.author.name || $tjs.config.author_name || "Unknown";
            $tjs.authors[author]["bio"] = $tjs.authors[author]["bio"] || post.meta.author.bio || $(marked($tjs.config.author_bio)).html() || "";
            $tjs.authors[author]["avatar"] = $tjs.authors[author]["avatar"] || post.meta.author.avatar || $tjs.config.author_avatar || "";

            // categories
            if (post.meta.categories == 0) {
                $tjs.posts_by_category[default_category][post.slug] = post.link;
            } else {
                for (var x = 0; x < post.meta.categories.length; x++) {
                    var category = post.meta.categories[x];
                    if ($tjs.posts_by_category[category.link] === undefined) {
                        $tjs.posts_by_category[category.link] = {}
                    }
                    $tjs.posts_by_category[category.link][post.slug] = post.link;
                }
            }

            // tags
            if (post.meta.tags == 0) {
                $tjs.posts_by_tag["tag/none"][post.slug] = post.link;
            } else {
                for (var x = 0; x < post.meta.tags.length; x++) {
                    var category = post.meta.tags[x];
                    if ($tjs.posts_by_tag[category.link] === undefined) {
                        $tjs.posts_by_tag[category.link] = {}
                    }
                    $tjs.posts_by_tag[category.link][post.slug] = post.link;
                }
            }
        }
    }


    $tjs.renderURL = function() {
        var hash = window.location.hash.split("?page=")[0].replace(/^#+|#+$/g, '').split("#");
        var loc = hash[0]; var anchor = (hash.length > 1) ? hash[1] : "";
        var single = false, bodyclass = "", html = "", folder = loc.split('/')[0];


        var reqPagination = 1, reqPage = window.location.hash.split("?page=");
        if (reqPage.length > 1) {
            var reqPagination = parseInt(reqPage[1], 0);
            // folder = "!";
        }

        // same page?
        if (loc == lastURL && reqPagination == lastPagination) {
            scrollToAnchor(anchor);
            return;
        }
        lastURL = loc;
        lastPagination = reqPagination;

        // set open graph description
        set_open_graph("og:description", $tjs.config.site_tagline);
        set_open_graph("twitter:description", $tjs.config.site_tagline);

        // reset
        coverimage = "";
        $('a').blur();
        $("main #disqus_thread").remove();

        // sitemap
        if (loc == "sitemap") {
            bodyclass = "sitemap";

            html = '<h1>Sitemap</h1>'
            var list = $('<ul>');
            var pages = Object.keys($tjs.pages);
            for (var i = 0; i < pages.length; i++) {
                list.append('<li><a href="#'+ pages[i] +'">'+ decodeURIComponent(pages[i].split('/').pop().replace(/-/gi, ' ')).toTitleCase() +'</a>')
            }
            if (i > 0) {
                html += '<h3>'+ $tjs.config.pages_text +'</h3><ul class="sitemap">'+ list.html() +'</ul><hr>';
            }

            list = $('<ul class="sitemap">');
            var posts = Object.keys($tjs.posts);
            for (var i = 0; i < posts.length; i++) {
                list.append('<li><a href="#'+ posts[i] +'">'+ decodeURIComponent(posts[i].split('/').pop().replace(/-/gi, ' ')).toTitleCase() +'</a>')
            }
            if (i > 0) {
                html += '<h3>'+ $tjs.config.posts_text +'</h3><ul class="sitemap">'+ list.html() +'</ul>';
            }
        }


        // homepage / special page
        else if (loc == "" || folder == "author" || folder == "category" || folder == "tag") {
            bodyclass = 'home';

            if ( (loc == "") && ($tjs.config.homepage !== "") ) {
                loc = "page/"+$tjs.config.homepage;

                if ($tjs.pages[loc] === undefined) {
                    bodyclass = "error";
                    document.title = "404 | "+ $tjs.config.site_title;
                    html = $($('#error-template').html());
                    html.find('.error-text').html("The URL you requested cannot be found.")
                }
                else {
                    html = renderSingle(loc);
                }
            }

            else {

                document.title = $tjs.config.site_title;

                if ( (loc == "") && ($tjs.config.homepage_cover_image != "") ) {
                    coverimage = $tjs.config.homepage_cover_image;
                }

                var collection = $tjs.posts;

                // ----------------------------------
                if (folder == "author" || folder == "category" || folder == "tag") {
                    bodyclass = folder;

                    // build other collecion
                    buildAllCollections();

                    if (folder == "author") {
                        var author = $tjs.authors[loc];
                        var template = $($("#author-template").html());

                        template.find('.author-page-title').html(author['name']);
                        if (author['avatar']) {
                            template.find('.author-page-avatar').html('<img src="'+ author['avatar'] +'" alt="'+ author['name'] +'" title="'+ author['name'] +'">');
                        } else {
                            template.find('.author-page-avatar').remove();
                        }
                        if (author['bio']) {
                            template.find('.author-page-bio').html(author['bio']);
                        }
                        html += template.outerHTML();

                        document.title = author['name'] +" | "+ $tjs.config.site_title;
                        collection = $tjs.posts_by_author[loc];
                    }
                    else if (folder == "tag") {
                        var title = loc.replace(folder+"/", "");
                        var template = $($('#tag-template').html());
                        template.find('.tag-page-title').html(title);
                        html += template.outerHTML();

                        document.title = "#"+ title +" | "+ $tjs.config.site_title;
                        collection = $tjs.posts_by_tag[loc];
                    }
                    else if (folder == "category") {
                        var title = loc.replace(folder+"/", "").toTitleCase();
                        var template = $($("#category-template").html());
                        template.find('.category-page-title').html(title)
                        html += template.outerHTML();

                        document.title = title +" | "+ $tjs.config.site_title;
                        collection = $tjs.posts_by_category[loc];
                    }
                }

                // ----------------------------------

                // slide and dice here...
                var total_posts = Object.keys(collection);

                // var reqPagination = (parseInt(loc.split('/').pop(), 0) || 1);
                var total_pages = Math.ceil(total_posts.length / $tjs.config.site_max_posts_per_page);

                var nav_start = reqPagination;

                if (nav_start == 1) {
                    nav_start -= 1;
                } else {
                    nav_start *= $tjs.config.site_max_posts_per_page;
                    nav_start -= $tjs.config.site_max_posts_per_page;
                }
                var nav_end = nav_start + $tjs.config.site_max_posts_per_page;
                nav_end = (nav_end > total_posts.length) ? total_posts.length : nav_end;
                // console.log(nav_start, nav_end,  total_posts.length);

                for (var i = nav_start; i < nav_end; i++) {
                    var post = getFileContent(total_posts[i]);
                    post.content = post.lead || post.excerpt;
                    html += renderTemplate(post, "main").outerHTML();
                }

                var pagination = $($("#pagination-template").html());

                if (reqPagination < total_pages) {
                    pagination.find('.pagination-older').attr('href', "#"+loc+'?page='+ (reqPagination+1) );
                    pagination.find('.pagination-older').removeClass('hidden');
                    // console.log('older');
                }

                if (reqPagination > 1) {
                    pagination.find('.pagination-newer').attr('href', "#"+loc+'?page='+ (reqPagination-1) );
                    pagination.find('.pagination-newer').removeClass('hidden');
                    // console.log('newer');
                }
                if (reqPagination < total_pages || reqPagination > 1) {
                    html += pagination.outerHTML();
                }
            }
        }

        // single page
        else {
            var use = $tjs.posts;
            if (folder == "page") {
                use = $tjs.pages;
            }

            if (use[loc] === undefined) {
                bodyclass = "error";
                document.title = "404 | "+ $tjs.config.site_title;
                html = $($('#error-template').html());
                html.find('.error-text').html("The URL you requested cannot be found.")
            }
            else {
                bodyclass = folder;
                html = renderSingle(loc);
                single = true;
            }
        }

        // add rest of open graph tags
        var og_image = get_full_image_url(coverimage);
        set_open_graph("og:title", document.title.split(" | ")[0]);
        set_open_graph("twitter:title", document.title.split(" | ")[0]);
        set_open_graph("og:image", og_image);
        set_open_graph("twitter:image", og_image);
        set_open_graph("og:type", "article");
        set_open_graph("og:url", window.location.href.split("#")[0]);
        set_open_graph("og:site_name", $tjs.config.site_name);
        set_open_graph("fb:app_id", $tjs.config.facebook_app_id);
        set_open_graph("twitter:card", "summary_large_image");

        // add to page
        $(".home-only, .post-only, .page-only, .sitemap-only, .error-only, .author-only, .tag-only, .category-only").hide();
        $("main").fadeOut('fast', function() {

            $(".cover-image").first().hide().css('background-image', '');
            if (coverimage !== "") {
                $('.cover-image').first().css('background-image', 'url('+coverimage+')').fadeIn('fast');
            }

            $("body").removeClass('home')
                .removeClass('post')
                .removeClass('page')
                .removeClass('sitemap')
                .removeClass('error')
                .removeClass('author')
                .removeClass('category')
                .removeClass('tag')
                .addClass(bodyclass);

            $("main").html(html).fadeIn();
            $("."+bodyclass+"-only").fadeIn();

            localize();

            $('pre code').each(function(i, block) {
                hljs.highlightBlock(block);
            });

            // external links open in a new window
            $('a:not([target])').attr('target', function() {
                if (this.host == location.host) {
                    return '_self';
                } else {
                    return '_blank';
                }
            });


            if ($tjs.config.text_direction != "rtl") {
                $('.post-lead, .page-lead, .post-content, .page-content').each(function(){
                    // convert emails to links
                    // $(this).html($(this).html().replace(
                    //     /([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4})/ig,
                    //     "<a href='mailto:$1'>$1</a>"));

                    // replace quotes to curly quotes
                    var codes = $(this).find('code');
                    $(this).html($(this).html().replace(/>([^>]+)</g, function(r) {
                        return r.replace(/(>|\s)"/g, "$1“").replace(/"/g, "”")
                            .replace(/("|\s)'/g, "$1‘").replace(/'/g, "’");
                    }));
                    // un-curly quotes code blocks
                    $(this).find('code').each(function(index){
                        $(this).replaceWith(codes[index]);
                    })
                });

                $('h1, h2').each(function(){
                    $(this).html($(this).html().replace(/>([^>]+)</g, function(r) {
                        return r.replace(/(>|\s)"/g, "$1“").replace(/"/g, "”")
                            .replace(/("|\s)'/g, "$1‘").replace(/'/g, "’");
                    }));
                });
            }


            // oembeds
            if (folder != '' && folder != '!' && $.parse_oembeds) {
                $(this).parse_oembeds();
            }

            $(this).find("table").each(function(){
                var figure = $("<figure>");
                $(this).clone().appendTo(figure);
                $(this).replaceWith(figure);
            });

            $(this).find("p img").each(function(){
                // $(this).parent().replaceWith(function() {
                //     return $("<figure/>").append($(this).contents());
                // });

                html = $(this).parent().clone();
                html.find('img').remove();
                var text = html.text();
                if (text != "") {
                    text = '<figcaption>'+ html.html() +'</figcaption>';
                }
                var figure = $("<figure>");
                $(this).clone().appendTo(figure);
                $(text).appendTo(figure);
                $(this).parent().replaceWith(figure);
            });

            // mobile image zoom
            $('figure img').bind('click', function(){
                if ($(this).parent().is('figure')) {
                    $(this).parent().toggleClass("fullpage");
                }
            });

            $tjs.onPageLoadCallback();
        });


        // work with fake anchor links
        $(".post-content a[href^='#'], .page-content a[href^='#']").each(function(){
            if ($(this).attr('href') != "#" &&
                $(this).attr('href').indexOf('#post') < 0 &&
                $(this).attr('href').indexOf('#page') < 0 &&
                $(this).attr('href').indexOf('#author') < 0 &&
                $(this).attr('href').indexOf('#tag') < 0 &&
                $(this).attr('href').indexOf('#category') < 0) {
                $(this).attr('href', "#"+ loc + $(this).attr('href'))
            }
        });

        // add comments
        if (single) add_comments(1000);

        // google analytics
        ga_update_location();

        // scroll
        $('html, body').animate({ scrollTop: 0 }, 0);
        scrollToAnchor(anchor);
    }

    function ga_update_location() {
        try {
            ga('set', 'page', "/"+window.location.hash);
            ga('send', 'pageview');
        } catch(er){}
    }

    function add_comments(timeout) {
        // facebook comments
        if ($tjs.config.comments.provider.toLowerCase() == 'facebook') {
            setTimeout(function() {
                $("main .post-comments").html('<div class="fb-comments" data-width="100%" data-href="'+window.location.href+'" data-numposts="'+$tjs.config.comments.facebook_numposts+'"></div>');
                if (window.FB) {
                    FB.XFBML.parse();
                } else {
                    (function(d, s, id) {
                        var js, fjs = d.getElementsByTagName(s)[0];
                        if (d.getElementById(id)) return;
                        js = d.createElement(s); js.id = id;
                        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8";
                        fjs.parentNode.insertBefore(js, fjs);
                    }(document, 'script', 'facebook-jssdk'));
                }
            }, 500);
        }

        // disqus comments
        else if ($tjs.config.comments.provider.toLowerCase() == 'disqus' && $tjs.config.comments.disqus_shortname) {
            setTimeout(function(){
                $("main .post-comments").html('<div id="disqus_thread"></div>');
                if (window.DISQUS) {
                    DISQUS.reset({
                        reload: true,
                        config: function () {
                            this.page.url = window.location.href;
                            this.page.identifier = btoa(window.location.href);
                        }
                    });
                } else {
                    window.disqus_config = function() {
                        this.page.url = window.location.href;
                        this.page.identifier = btoa(window.location.href);
                    };
                    var d = document, s = d.createElement('script');
                    s.src = '//'+$tjs.config.comments.disqus_shortname+'.disqus.com/embed.js';
                    s.setAttribute('data-timestamp', +new Date());
                    (d.head || d.body).appendChild(s);

                    s = d.createElement('script');
                    s.src = '//'+$tjs.config.comments.disqus_shortname+'.disqus.com/count.js';
                    d.body.appendChild(s);
                }
            }, (timeout || 1000));
        }
    }

    function localize() {
        // localization
        $(".pagination-older").html($tjs.config.older_posts_text);
        $(".pagination-newer").html($tjs.config.newer_posts_text);
        $(".post-share-title").html($tjs.config.share_post_text);
        $(".error-title").html($tjs.config.error_page_title_text);
    }

    // --------------------
    // open graph methods
    function set_open_graph(name, value) {
        var tag = 'meta[name='+ name.replace(":", "\\:") +']';
        if (name.indexOf("twitter")) {
            tag = 'meta[property='+ name.replace(":", "\\:") +']';
        }
        $(tag).remove();
        if (value != "") {
            if ($(tag).length > 0) {
                $(tag).attr('content', value);
            }
            else {
                if (name.indexOf("twitter")) {
                    $('head').append('<meta name="'+name+'" content="'+ value +'">');
                } else {
                    $('head').append('<meta property="'+name+'" content="'+ value +'">');
                }
            }
        }
    }

    function get_full_image_url(image_url) {
        if (image_url == "") return "";
        var img = new Image();
        img.src =image_url;
        return img.src;
    }
    // --------------------

    $tjs.init = function() {

        $.getScript('./assets/js/config.js', function(){

            // prepare facebook
            window.fbAsyncInit = function() {
                var conf = {xfbml: true, version: 'v2.8' };
                if ($tjs.config.facebook_app_id) {
                    conf['appId'] = $tjs.config.facebook_app_id;
                }
                console.log(conf);
                FB.init(conf);
            };

            // localize
            localize();
            if ($tjs.config.text_direction == "rtl") {
                $('head').append('<link rel="stylesheet" href="./assets/css/rtl.css">');
            }

            // load highlight.js
            $tjs.config.highlightjs_theme = $tjs.config.highlightjs_theme || 'default';
            $('head').append('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.9.0/styles/'+
                $tjs.config.highlightjs_theme +'.min.css">');

            // support oembeds via php?
            if ($tjs.config.iframely_apikey) {
                $.getScript('./assets/js/iframely.js');
            }

            // google analytics
            if ($tjs.config.google_analytics_code != "" &&
                $tjs.config.google_analytics_code.indexOf("XXXX") === -1) {
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
                ga('create', $tjs.config.google_analytics_code, 'auto' );
            }

            // load site content
            $tjs.posts = getFiles($tjs.config.postsdir);
            $tjs.pages = getFiles($tjs.config.pagesdir);

            $.getScript('//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.9.0/highlight.min.js', function(){
            $.getScript('./assets/js/marked.js', function(){

                // document title
                document.title = $tjs.config.site_title;

                // meta tags
                if ($("meta[name='author']").attr("content") == "") {
                    $("meta[name='author']").attr("content", $(marked($tjs.config.site_name)).text());
                }
                if ($("meta[name='description']").attr("content") == "") {
                    $("meta[name='description']").attr("content", $(marked($tjs.config.site_name +' | '+ $tjs.config.site_tagline)).text());
                }

                // format header
                $("header.master-header a.master-header-title")[0].append($(marked($tjs.config.site_name)).html());
                $("header.master-header small.master-header-tagline")[0].append($(marked($tjs.config.site_tagline)).html());

                // format navigation
                var navigation = $('<ul>');
                for (var i = 0; i < $tjs.config.site_navigation.length; i++) {
                    var li = $("<li>")
                    var item = $tjs.config.site_navigation[i];
                    if (item.indexOf("]") !== -1) {
                        li.append($(marked(item)).find('a'));
                    } else {
                        li.append('<a href="#page/' + slug(item) + '">' + item + '</a>');
                    }
                    navigation.append(li);
                }
                $("header.master-header nav").append('<span class="topnav-drawer icon-menu"></span>'+navigation.outerHTML());
                if (i == 0) {
                    $("header.master-header nav").remove();
                }

                // format footer
                $(".master-footer-content").append($(marked($tjs.config.site_footer)).html());
                $(".site-credit").append(marked($tjs.config.app_credit));

                // mobile menu
                $(".master-header nav.topnav .topnav-drawer").bind('touchstart', function(){
                    $(".master-header nav.topnav ul").slideToggle();
                });

                // render content
                setTimeout($tjs.renderURL(), 100);
                $(window).on('hashchange', $tjs.renderURL);

                if ($('.master-header nav.topnav .topnav-drawer').css('display') == "block") {
                    $("a").click(function(){
                        $(".master-header nav.topnav ul").hide()
                    });
                }
            });
            });
        });

        $tjs.onAppLoadCallback();
    }

}(window.$tjs = window.$tjs || {}, window, document));

$(document).ready($tjs.init);
