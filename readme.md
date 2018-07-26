# Faker jQuery Plugin

## IMPORTANT CHANGES
* v2.0 .drop-value gets <span> inside (needed for searchable faker)

## Demo & Examples
index.html

## Example Usage

### HTML

```
	<select id="test" name="test" class="faker">
		<option value="a">Šport</option>
		<option value="b">Zabava</option>
		<option value="c">Delo</option>
	</select>
	
```

OR plain version

```
<div id="servis" class="faker">
	<div class="drop-value">
		<span></span>
	</div>
	<div class="drop-handle">&nbsp;</div>
	<div class="drop-selection">
		<div rel="a">Šport</div>
		<div rel="b">Zabava</div>
		<div rel="c">Delo</div>
	</div>
	<!-- with or without -->
	<select name="servis">
		<option value="a">Šport</option>
		<option value="b">Zabava</option>
		<option value="c">Delo</option>
	</select>
	<!-- with or without end -->
</div>

```

### jQuery

Use the plugin as follows:

```
$(document).ready(function(){
	specto_faker.init(); 
	//or 
	//$(".faker").specto_faker();
});

```

## Installation

### Manual

```
<script src="https://code.jquery.com/jquery-2.2.4.js" integrity="sha256-iT6Q9iMJYuQiMWNd9lDyBUStIq/8PuOW33aOqmvFpqI=" crossorigin="anonymous"></script>
<link href="specto_faker.css" rel="stylesheet" type="text/css">
<script src="specto_faker.js" type="text/javascript"></script>

```

### Bower

```
"dependencies": {
	"specto_faker": "https://code.specto.si/bower/specto-faker.git",
	//or with version
	// "specto_faker": "https://code.specto.si/bower/specto-faker.git#v1.05",
}

```

## Notes

* Requires jQuery <i>(Tested on 2.2.4)</i>.
* Customizable with options:

```
    {
		object_selector: ".faker", //element(s) - works only if called through `specto_faker.init()`, if called as `$([object_selector]).specto_faker()` elements are defined in `$([object_selector])`
		
		/* CLASSES */
		open_class: "open", //class for opened faker
		init_class: "faker-init", //class for initiated faker
		anim_class: "faker-animated", //class for animated faker
		anim_progress_class: "faker-animating", //class while animation in progress
		focused_class: "faker-focused", //class for focused faker
		key_events_class: "faker-keyevent", //class for faker with key events
		searchable_class: "faker-search", //class for searchable faker
		select_single: "faker-sel-single", //class for searchable faker to auto select single filtered option
		/* options classes */
		selected_val_class: "active", //class of selected option - default css has display:none
		disabled_val_class: "rel-disabled", //class of disabled option - default css has opacity:0.5 and cursor:not-allowed
		search_hidden: "rel-search", //class for hidden options - hidden by search
		
		/* ANIMATION */
		animated: false, //is faker animated
		animation_speed: 400,
		count_selected: false, //valid only for animated faker, are selected_val_class counted for animation
		count_disables: true, //valid only for animated faker, are disabled_val_class counted for animation
		
		/* KEY EVENTS & SEARCHING & SORTING */
		key_events: false, //do you want keyEvents to work
		searchable: true, //open faker gets input to search for values - valid only if key_events are initiated
		search_single: true, //if faker is searchable, after filtering, do check if there is only one valid option and if yes, select it
		sortable: false, //do you want on init to be sorted
		sort_ascending: true,
		
		/* METHODS - CALLBACKS */
		/* if you use before_change function you must return a value which correlates to boolean 'true', otherwise change is prevented */
		before_change: function(newVal, jsEvent){ return newVal; }, //callback function before value has changed - by default it prevents clicks on elements without value or 0
		on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){}
		on_init: null, //callback when faker(s) is(are) initiated //e.g. function(fakers){ }
		
	}
```

* Automaticaly builds html wrapper for ```<select>``` <i>(original element is deleted, but copied)</i>
* Closes every opened faker, if clicked outside of it.
* Overrides click events, so you can reinit them without problems.
* All classes and counters are customizable only on the first init
* Hide selected option from dropdown - customizable class with "selected_val_class"
* If builded from select, it's "placeholder" is set as initial value <i>(if not present, first option is selected)</i>. But if any option is selected, placeholder is ignored and selected value is set
* Prevents clicks for disabled options, example: ```<div rel='rel-disabled' class='' disabled='disabled'>placeholder</div>```
* Adds focused class on select focus <i>(for swithing with tab)</i>
* Can add keyevents to simulate select
* Can allow searching for entered text
* Can be ordered on init
* If builded from select, be aware that every further reference to faker <i>(fakr, faker_elm, object_selector, ...)</i> doesn't mean original select, but it's faker <i>(more in examples - Build from select and update options)</i>

## CUSTOM USE 

###	SCSS VARIABLES (colors, handle icon, height)

```
$faker_handle_icon: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTQiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDE0IDgiPjxkZWZzPjxwYXRoIGlkPSJmd2Y4YSIgZD0iTTYyMDcuNTIgMzU2MS40NGMwLS4xLS4wNS0uMjMtLjEzLS4zbC0uNjctLjY4YS40Ni40NiAwIDAgMC0uMy0uMTNjLS4xMSAwLS4yNC4wNS0uMzIuMTNsLTUuMjYgNS4yNy01LjI3LTUuMjdhLjQ2LjQ2IDAgMCAwLS4zLS4xMy40NC40NCAwIDAgMC0uMzEuMTNsLS42Ny42N2EuNDYuNDYgMCAwIDAtLjE0LjMxYzAgLjEuMDYuMjMuMTQuMzFsNi4yNCA2LjI0Yy4wOC4wOC4yLjE0LjMuMTQuMTIgMCAuMjQtLjA2LjMyLS4xNGw2LjI0LTYuMjRjLjA4LS4wOC4xMy0uMi4xMy0uM3oiLz48L2RlZnM+PGc+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTYxOTQgLTM1NjApIj48dXNlIHhsaW5rOmhyZWY9IiNmd2Y4YSIvPjwvZz48L2c+PC9zdmc+";


$drop_value_color: #949698;
$drop_value_bg_color: #FFFFFF;
$drop_value_border: #e6e7e8;

$faker_opened_value_color: #959698;

$drop_selection_bg_color: #FFFFFF;
$drop_selection_border: #e7e7e7;

$drop_selection_div_active_color: #FFFFFF;
$drop_selection_div_active_bg_color: #959698;

$faker_focused_value_border_shadow: #66afe9;
$faker_focused_value_shadow_startcolor: #000000;


$faker_height: 53px;
```

### Custom element with animation

```
specto_faker.init({animated: true, object_selector: "#testId"});
//$("#testId").specto_faker({animated: true});

```

### Custom callbacks

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
/*
$(".faker").specto_faker({
	on_change: function(newVal, jsEvent){
		console.log("new value: "+ newVal);
	},
	before_change: function(newVal, jsEvent){
		if(newVal && newVal !== "disabled") return true;
		else return false;
	},
});
*/

```

### Build from select (with onchange function already attached)

```
$("select").change(function(newVal, jsEvent){ console.log("changed into"+ newVal); }); 

specto_faker.init({ object_selector: "select"});
//$("select").specto_faker();

```

### After changed content, rebuild selection clicks

```
specto_faker.fakerSelection("#dropdown");

//specto_faker.fakerSelection("#dropdown", after_change_function, before_change_function);

```

or just reinit

```
specto_faker.init({object_selector: "#dropdown"});
//$("#dropdown").specto_faker();

```

### Get value

If there is ```<select>```, you can use js or jQuery to get current value. 
<i>(This feature depends on browser support for changing and triggering change() on ```<select>``` )</i>

But you can also use <i>(single element)</i>

```
var faker_value = specto_faker.getFakerValue("#fakerId");

```

### Multiple fakers, some custom

Init multiple fakers and for specific fakers, set custom onchange function

```
//init all
specto_faker.init({
	animated: true
});
//custom faker special handling for postal number
specto_faker.init({
	animated: true,
	object_selector: "#postal_nr, #postal_nr2",
	on_change: function(newVal, e){
		$(e.target).parentsUntil(".card-form-wrap").last().find("input[name='city']").val($(e.target).parent().next().find("option").filter(function(){ return $(this).text() === newVal; }).attr("name"));
	},
});

```

### Update faker options and reinit faker


```
//init
specto_faker.init({
	animated: true,
	object_selector: "#faker_elm"
});

//update -> function(fakr, new_options, [rel_name = "rel", name_name = "name", settings = null])
specto_faker.updateOptions("#faker_elm", [{
	code: "value1",
	name: "Prikaz1"
},{
	code: "value2",
	name: "Prikaz2"
},{
	code: "value3",
	name: "Prikaz3"
}], "code", "name", {animated: true});

```

### Build from select and update options


```
//init and save reference to faker
var initiated_fakers = specto_faker.init({
	object_selector: "select#test"
});

var first_faker = initiated_fakers[0];
//or first parent of original select
// var first_faker = $("select#test").parent();

//update -> function(fakr, new_options, [rel_name = "rel", name_name = "name", settings = null])
specto_faker.updateOptions(first_faker, [{
	rel: "value1",
	name: "Prikaz1"
},{
	code: "value2",
	name: "Prikaz2"
},{
	code: "value3",
	name: "Prikaz3"
}]);

```


## TO DO

* index.html - more examples