# jQuery LazyImage Plugin

A simple and lightweight plugin to lazily load images.

[View Demo](http://dnasir.com/github/jquery-lazyimage/demo.html)

## Usage

Include the plugin after the jQuery library.

```html
<script type="text/javascript" src="/path/to/jquery-lazyimage.js"></script>
```

Set up your images.

```html
<img class="lazy-image" data-src="/path/to/image" />
<img class="lazy-image" data-src="/path/to/image" />
<img class="lazy-image" data-src="/path/to/image" />
...
```

Initialise the plugin.

```javascript
$('.lazy-image').lazyImage();
```
