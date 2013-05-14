/* 
 *   jQuery LazyImage Plugin 1.0.0
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

	function LazyImage(img) {
		var self = this;
		self.img = $(img),
		self.src = self.img.data('src'),
		self.loaded = false;

		self.loadImage = function() {
			$('<img />')
				.on('load', function() {
					self.img
						.hide()
						.attr('src', self.src)
						.fadeIn()
						.addClass('lazy-loaded');
					self.loaded = true;
					self.img.trigger('loaded');
				})
				.attr('src', self.src);
		};
	}
	
	$.fn.lazyImage = function() {
		var images = this.map(function() {
			return new LazyImage(this);
		});

		function update() {
			$.each(images, function() {
				if(isInViewport(this.img) && !this.loaded) {
					this.loadImage();
				}
			});

			if(!images.length) {
				win.off('load scroll resize', update);
			}
		}

		this.each(function(){
			$(this).on('loaded', function() {
				images = $.grep(images, function(img) {
					return !img.loaded;
				});
			});
		});

		win.on('load scroll resize', update);
	}

	$('img.lazy-load[data-src]').lazyImage();
})(jQuery, window);