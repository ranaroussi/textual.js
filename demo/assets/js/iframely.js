Array.prototype.delete || (Array.prototype.delete = function(item) {
    var index = this.indexOf(item);
    if (index > -1) this.splice(index, 1);
});

var __oembeds__ = {}, __fetching__ = [];

;(function($) {

    $.fn.extend({
        parse_oembeds: function(options,arg) {
            if (options && typeof(options) == 'object') {
                options = $.extend( {}, $.parse_oembeds.defaults, options );
            }
            this.each(function() {
                new $.parse_oembeds(this, options, arg );
            });
            return;
        }
    });


    $.parse_oembeds = function(elem, options, arg) {
        $(elem).find("oembed").each(function(index){

            $(this).addClass("_tmpoembed_"+index);
            var self = $(this);

            var src = $(this).attr('src');
            if (!__oembeds__.hasOwnProperty(src) && !__fetching__.hasOwnProperty(src)) {
                __fetching__.push(src);

                var api = "https://iframe.ly/api/oembed?api_key="+ $tjs.config.iframely_apikey +"&url="+encodeURIComponent(src);
                $.getJSON(api,function(o){
                    __oembeds__[src] = o.html;
                    __fetching__.delete(src)
                    self.replaceWith(__oembeds__[src]);
                });
            }
        });
    };

    $.parse_oembeds.defaults = {
        "saas": "./oembed/?url="
    };

    // start
    $(function() {
        var css  = '.oembed-wrapper { display:block; margin:20px 0; text-align:center; }';
            css += '.oembed-wrapper :first-child, .oembed-wrapper .fb_iframe_widget { margin-left:auto; margin-right:auto; max-width:100% !important; }';
            css += '.oembed-wrapper a.oembed-caption { font:11px/2 sans-serif; color:#999; text-decoration:none; }';
            css += '.oembed-wrapper a.oembed-caption:hover { color: #808080; text-decoration:none; }';
        $('<style type="text/css">'+ css +'</style>').appendTo("head");
    });

})(jQuery);