;(function($tjs, window, document, undefined) {

    $tjs.config = {

        // site name (html/markdown allowed, for logo, etc)
        site_name: 'Textual.js',

        // site tagline (html/markdown allowed)
        site_tagline: 'Javascript static website generator',

        // site title (for header, no markdown)
        site_title: 'Textual.js',

        // default author (html/markdown allowed)
        author_name: 'Ran Aroussi',
        author_bio: 'Father. Husband, Entrepreneur. Technology Geek.',
        author_avatar: '',

        // site footer text (html/markdown allowed)
        site_footer: '&copy; ' + new Date().getFullYear() + ' All Rights Reserved. &nbsp; [Home](#) | [Sitemap](#sitemap)',

        // site navigation items (markdown allowed)
        site_navigation: [
            'Docs',
            '[Demo](./demo/)',
            '[Github](https://github.com/ranaroussi/textual.js)'
        ],

        // site pagination: max number of posts per page
        site_max_posts_per_page: 5,

        // default category (leave blank for none)
        site_default_category: '',

        // cover image on homepage - leave blank ('') for none
        homepage_cover_image: '',

        // page as homepage - leave blank ('') for blog style
        homepage: 'readme',

        // your google analytics code
        google_analytics_code: 'UA-89785231-1',

        // choose comment provider (leave blank for none)
        comments: {
            provider: '', // disqus | facebook
            disqus_shortname: '',
            facebook_app_id: '',
            facebook_numposts: 5
        },

        // syntax highlighter theme. see full list here:
        // https://github.com/isagalaev/highlight.js/tree/master/src/styles
        highlightjs_theme: 'atom-one-light',

        // ---------------------------------
        // site localization
        // ---------------------------------

        // text direction (if rtl, will load rtl.css)
        text_direction: 'ltr',

        // site name
        month_names: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],

        // misc texts
        pages_text: 'Pages',
        posts_text: 'Posts',
        older_posts_text: '&larr; Older Posts',
        newer_posts_text: 'Newer Posts &rarr;',
        share_post_text: 'Share this post',
        error_page_title_text: 'Something went wrong...',

        // ---------------------------------

        // posts directory name
        postsdir: 'posts',

        // pages directory name
        pagesdir: 'pages',

        // ---------------------------------
        // for parsing oembeds tags as inline social widgets
        iframely_apikey: '',

        // ---------------------------------
        // for github hosted (via github pages):
        // ---------------------------------

        // use github pages
        github_mode: true,

        // github pages settings: user, repo, branch
        github_settings: {
            host: 'https://api.github.com',
            username: 'ranaroussi',
            repo: 'textual.js',
            branch: 'gh-pages'
        },

        // site credit
        app_credit: 'Published using <strong><a href="http://textualjs.com">Textual.js</a></strong>'
    }

}(window.$tjs = window.$tjs || {}, window, document));