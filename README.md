# nicemove
super smooth scrolling for touch devices

# Usage

```
var instance = new NiceMove(el, scrollHorizontal, scrollVertical, options);
```

`el` is dom object, `scrollHorizontal` and `scrollVertical` are boolean values, `options` is javascript object

`options` object:

```
{
	/*Number*/anchor: // pull to refresh effects, support foure directions
	{
		/*Number*/top,
		/*Number*/bottom,
		/*Number*/left,
		/*Number*/right
	},
	/*Number*/moveThresh, //minimum finger moves to activate the element move
	/*Bool*/isPagedX, //if the element should move by horizontal pages
	/*Bool*/isPagedY, //if the element should move by vertical pages
	/*function*/ onPageChanged( { target, index } ), // callback when page changed
	/*function*/ onFirstMove(),   // callback when the element was moved by the first time
}
```


# APIs

## slideTo(x,y[,milliseconds,easing])
move the element by script

