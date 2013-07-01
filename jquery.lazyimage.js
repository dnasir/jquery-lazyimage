/* 
 *   jQuery LazyImage Plugin 1.0.3
 *   https://github.com/dnasir/jquery-lazyimage
 *
 *   Copyright 2013, Dzulqarnain Nasir
 *   http://dnasir.com
 *
 *   Licensed under the MIT license:
 *   http://www.opensource.org/licenses/MIT
 */

(function ($, window) {
    var $window = $(window);

    // Helpers
    function isInViewport(el) {
        var viewport = {
            top: $window.scrollTop(),
            left: $window.scrollLeft()
        };
        viewport.right = viewport.left + $window.width();
        viewport.bottom = viewport.top + $window.height();

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

    // LazyImage constructor
    $.LazyImage = function(img) {
        this.$img = $(img);
        this.loading = false;
        this.originalSrc = this.$img.data('src');
        this.fadeIn = this.$img.data('fade-in');
        this.init();
    };

    // Public methods
    $.LazyImage.prototype = {
        init: function () {
            var self = this,
                fadeIn = this.fadeIn;

            self.$fakeImg = $('<img />')
                .on('load', function() {
                    self.$img
                        .removeAttr('style')
                        .css('opacity', 0)
                        .attr('src', $(this).attr('src'));

                    if (fadeIn) {
                        self.$img.animate({ opacity: 1 });
                    } else {
                        self.$img.css({ opacity: 1 });
                    }

                    self.$img.addClass('lazy-loaded');
                })
                .on('load error', function (e) {
                    self.loading = false;
                    self.$img.trigger('lazyLoaded', [self, e.type]);
                });
        },

        loadImage: function () {
            this.$fakeImg.attr('src', this.originalSrc);
        },

        destroy: function() {
            $(this).data('plugin_lazyImage', undefined);
            
        }
    };

    // jQuery interface
    $.fn.lazyImage = function () {
        // Build array of LazyImage objects
        var images = this.filter('img').map(function () {
                var image = new $.LazyImage(this);
                $(this).data('plugin_lazyImage', image);
                return image;
            });
        
        function update() {
            $.each(images, function () {
                // Load images when it's visible in the viewport
                if (isInViewport(this.$img) && !this.loading) {
                    this.loading = true;
                    this.loadImage();
                }
            });

            // Once all images have been processed, remove event handler
            if(images.length <= 0) {
                $window.off('load scroll resize', update);
            }
        }

        // Remove images that have been loaded from array
        $(this).on('lazyLoaded', function (e, image) {
            images = images.filter(function() {
                return this.originalSrc != image.originalSrc;
            });
        });

        // Set up event handler
        $window.on('load scroll resize', update);

        // Return original object to maintain chainability
        return this;
    };
})(jQuery, window);