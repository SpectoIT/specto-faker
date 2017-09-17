# Faker jQuery Plugin

## Demo & Examples
index.html

## Example Usage

### HTML

```

	<select id="test" name="test">
		<option value="a">Šport</option>
		<option value="b">Zabava</option>
		<option value="c">Delo</option>
	</select>
	
```

OR plain version

```

<div id="servis" class="faker">
	<div class="drop-value"></div>
	<div class="drop-handle">&nbsp;</div>
	<div class="drop-selection">
		<div rel="0">0</div>
		<div rel="1">1</div>
		<div rel="2">2</div>
	</div>
	<!-- with or without -->
	<select name="servis">
		<option value="0">0</option>
		<option value="1">1</option>
		<option value="2">2</option>
	</select>
	<!-- with or without end -->
</div>

```

### jQuery

Use the plugin as follows:

```

$(document).ready(function(){
	specto_faker.init();
});

```

## Installation

```
<script src="https://code.jquery.com/jquery-2.2.4.js" integrity="sha256-iT6Q9iMJYuQiMWNd9lDyBUStIq/8PuOW33aOqmvFpqI=" crossorigin="anonymous"></script>

<link href="specto_faker.css" rel="stylesheet" type="text/css">

<script src="specto_faker.js" type="text/javascript"></script>

```


## Notes

* Requires jQuery (Tested on 2.2.4).
* Customizable, with this options:

```
    {
		object_selector: ".faker", //element(s)
		
		open_class: "open", //class for opened faker
		
		init_class: "faker-init", //class for initiated faker
		
		anim_class: "faker-animated", //class for animated faker
		
		anim_progress_class: "faker-animating", //class while animation in progress
		
		animated: false, //is faker animated
		
		animation_speed: 400,
		
		on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){},
		
		/* if you use before_change function you must return a value which correlates to boolean 'true', otherwise change is prevented */
		
		before_change: null, //callback function before value has changed //e.g. function(newVal, jsEvent){ return newVal; },
	}
```

* Automaticaly builds html wrapper for select tag (original tag is deleted, so make sure that it has all events before plugin is initialized. Or use custom callbacks)

* Close opened fakers, if clicked outside.

* Overrides click events, so you can reinit them without problems.


## CUSTOM USE 


### CUSTOM ELEMENT WITH ANIMATION

```

specto_faker.init({animated: true, object_selector: "#test"});

```

### CUSTOM CALLBACKS

```

specto_faker.init({

	on_change: function(newVal, jsEvent){
	
		console.log("new value: "+ newVal);
		
	},
	
	before_change: function(newVal, jsEvent){
	
		if(newVal && newVal !== "disabled") return true;
		
		else return false;
		
	},
	
});

```

### SELECT

```

$("select").change(function(){ console.log("changed"); }); //add on-change event before

specto_faker.init({

	object_selector: "select",
	
});

```

### AFTER CHANGED CONTENT, REBUILD CLICKS

```

specto_faker.fakerSelection("#dropdown");

specto_faker.fakerSelection("#dropdown", after_change_function, before_change_function);

```

## TODO

* index.html

* Function to change content based on array of objects and make clicks