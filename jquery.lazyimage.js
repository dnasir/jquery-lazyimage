/* 
 *   jQuery LazyImage Plugin for ImageResizer.NET 1.0.0
 *   https://github.com/dnasir/jquery-lazyimage
 *
 *   Copyright 2013, Dzulqarnain Nasir
 *   http://dnasir.com
 *
 *   Licensed under the MIT license:
 *   http://www.opensource.org/licenses/MIT
 */

(function($, window) {
    var win = $(window);

    // Helpers
    function isInViewport(el) {
        var viewport = {
            top : win.scrollTop(),
            left : win.scrollLeft()
        };
        viewport.right = viewport.left + win.width();
        viewport.bottom = viewport.top + win.height();

        var bounds = el[0].getBoundingClientRect();
        bounds.right = bounds.left + el.outerWidth();
        bounds.bottom = bounds.top + el.outerHeight();

        return (
            !(viewport.right < bounds.left 
                || viewport.left > bounds.right 
                || viewport.bottom < bounds.top 
                || viewport.top > bounds.bottom)
            && el.is(':visible')
            );
    }

    function sortAscending(a, b) {
        return a - b;
    }

    function replaceParam(url, param) {
        var newParam = param.key + '=' + param.value;
        return url.replace(new RegExp(param.key + '=', 'gi'), '$1', newParam);
    }

    function setGetParameter(url, paramName, paramValue) {
        if (url.indexOf(paramName + "=") >= 0) {
            var prefix = url.substring(0, url.indexOf(paramName));
            var suffix = url.substring(url.indexOf(paramName)).substring(url.indexOf("=") + 1);
            suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
            url = prefix + paramName + "=" + paramValue + suffix;
        }
        else {
            if (url.indexOf("?") < 0)
                url += "?" + paramName + "=" + paramValue;
            else
                url += "&" + paramName + "=" + paramValue;
        }
        return url;
    }

    // LazyImage constructor
    function LazyImage(img) {
        // Public properties
        var self = this;
        self.img = $(img);
        self.loaded = false;

        // Private properties
        var src = self.img.data('src'),
            useOriginalSize = self.img.data('use-original-size'),
            responsive = eval(self.img.data('responsive')),
            fadeIn = self.img.data('fade-in');

        self.img.css({
            width: self.img.attr('width'),
            height: self.img.attr('height')
        });

        // Public methods
        self.loadImage = function () {
            var temp = $('<img />')
                .on('load', function () {
                    self.img
                        .removeAttr('style')
                        .css('opacity', 0)
                        .attr('src', src);

                    if(useOriginalSize) {
                        self.img.attr({
                            width: this.width,
                            height: this.height
                        });
                    }

                    if (fadeIn) {
                        self.img.animate({ opacity: 1 });
                    } else {
                        self.img.css({ opacity: 1 })
                    }

                    self.loaded = true;
                    self.img.addClass('lazy-loaded').trigger('lazyLoaded');
                })
                .attr('src', src);

            if (responsive) {
                var currentWidth;
                var breakpoints = $.map(responsive, function (val) {
                    return val.step;
                });

                if(!breakpoints.length) {
                    return;
                }

                breakpoints.sort(sortAscending);

                var t;
                function resize() {
                    clearTimeout(t);
                    t = setTimeout(function () {
                        var width = win.width(),
                            _breakpoints = new Array();

                        if (win[0].scrollHeight > win.innerHeight()) {
                            width += 30;
                        }

                        _breakpoints = _breakpoints.concat(breakpoints);
                        _breakpoints.push(width);
                        _breakpoints.sort(sortAscending); // figure out where we fit in

                        var index = _breakpoints.indexOf(width) - 1;
                        index = index <= 0 ? 0 : (index >= (_breakpoints.length - 1) ? (breakpoints.length - 1) : index);

                        var step = $.grep(responsive, function (s) { return s.step === breakpoints[index]; })[0];
                        if (step && step.width != currentWidth) {
                            temp.attr('src', setGetParameter(src, 'width', step.width));
                            currentWidth = step.width;
                        }
                    }, 300);
                }

                win.on('resize', resize);
                self.img.one('lazyLoaded', resize);
            }
        };
    }

    // jQuery interface
    $.fn.lazyImage = function () {
        // Build array of LazyImage objects
        var images = this.map(function() {
            return new LazyImage(this);
        });

        function update() {
            $.each(images, function () {
                // Load images as it appears in the viewport
                if (isInViewport(this.img) && !this.loaded) {
                    this.loadImage();
                }
            });

            // Once all images have been processed, remove event handler
            if (!images.length) {
                win.off('load scroll resize', update);
            }
        }

        // Remove images that have been loaded from array
        this.each(function() {
            $(this).on('lazyLoaded', function() {
                images = $.grep(images, function(img) {
                    return !img.loaded;
                });
            });
        });

        // Set up event handler
        win.on('load scroll resize', update);
    };

    // Auto attach to matching elements
    $('img.lazy-image[data-src]').lazyImage();
})(jQuery, window);