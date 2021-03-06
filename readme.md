# Faker jQuery Plugin

## IMPORTANT CHANGES
* v2.0 has changes HTML structure. Element .drop-value gets ```<span>``` inside (needed for searchable faker)
* v3.13 changed search in searchable faker. From now on, by default, it works only from start
* v3.32 added class .drop-selection-item
* v4.00 animation of dropdown moved to css, only height calculation left in js (removed properties anim_progress_class & animation_speed & nv_helper_class)
```
aria support proper build
braille_support default value changed to true
key_events default value changed to true
searchable default value changed to false
allow_form_reload option added. And changed it's default value to false
added multiple aria options (label_id, listbox_label, filtered_listbox_label, is_required)
```
* v4.2.2 removed beforeChange function becuase it's incompatible with search

## DEPENDENCIES
* jQuery <i>(Tested on 2.2.4 and 3.3)</i>

## NOTES

* Customizable with options:

```javascript
{
    object_selector: ".faker", //element(s) - works only if called through `specto_faker.init()`, if called as `$([object_selector]).specto_faker()` elements are defined in `$([object_selector])`
    
    /* CLASSES */
    open_class: "open", //class for opened faker
    init_class: "faker-init", //class for initiated faker
    anim_class: "faker-animated", //class for animated faker
    focused_class: "faker-focused", //class for focused faker
    key_events_class: "faker-keyevent", //class for faker with key events
    searchable_class: "faker-search", //class for searchable faker
    searchable_from_start_class: "faker-search-start", //class for searchable faker to search from beginning
    select_single: "faker-sel-single", //class for searchable faker to auto select single filtered option
    braille_class: "faker-braille", //class for faker that supports non-visual (braille) speach
    /* options classes */
    selected_val_class: "active", //class of selected option - default css has display:none
    disabled_val_class: "rel-disabled", //class of disabled option - default css has opacity:0.5 and cursor:not-allowed
    search_hidden: "rel-search", //class for hidden options - hidden by search
    
    /* ANIMATION */
    animated: false, //is faker animated
    count_selected: false, //valid only for animated faker, are selected_val_class counted for animation
    count_disables: true, //valid only for animated faker, are disabled_val_class counted for animation
    count_manual_val: 0, //valid only for animated faker, animate to specific number of elements
    
    /* KEY EVENTS & SEARCHING & SORTING */
    key_events: true, //do you want keyEvents to work - braille_support = true will set this to true regardless
    searchable: false, //open faker gets input to search for values - valid only if key_events are initiated
    search_single: true, //if faker is searchable, after filtering, do check if there is only one valid option and if yes, select it
    search_only_from_start: false, //if faker is searchable, do you want to search only values that start with searched value? - braille_support ignores this option and consideres it set to true
    sortable: false, //do you want on init to be sorted
    sort_ascending: true,
    set_on_start: true, //should script set first value on initialization
    search_debouce: 350, //input keyup delay in miliseconds
    
    /* METHODS - CALLBACKS */
    on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){}
    on_init: null, //callback when faker(s) is(are) initiated //e.g. function(fakers){ }
    
    /* NON-VISUAL (BRAILLE) SUPPORT */
    braille_support: true, //does faker support braille speach - tested with NVDA - if set to true, key_events will be automatically turned on -->> example: https://a11y.nicolas-hoffmann.net/autocomplete-list/
    allow_form_reload: false, //do we allow parent form to reload on faker init. this is for plain forms firefox workaround (reset form for proper detection of required fields when ```<select>``` is moved)
    label_id: "", //id of label, to connect to aria controls
    listbox_label: "Custom label for listbox", //default value of listbox label, if label_id is not given
    is_required: false, //if select is not present, this will be used to know if faker is required. if select is present, this option will be taken from select's required atribute
}
```

* Automaticaly builds html wrapper for ```<select>``` <i>(original element is deleted, but copied)</i>
* Closes every opened faker, if clicked outside of it.
* Overrides click events, so you can reinit them without problems.
* All classes and counters are customizable only on the first init
* Hide selected option from dropdown - customizable class with "selected_val_class"
* If builded from select, it's "placeholder" is set as initial value <i>(if not present, first option is selected)</i>. But if any option is selected, placeholder is ignored and selected value is set
* If builded from select, all events binded to select will be preserved (<i>(This feature depends on browser support for changing and triggering change() on ```<select>``` )</i>)
* Prevents clicks for disabled options, example: ```<div rel='rel-disabled' class='' disabled='disabled'>placeholder</div>```
* Adds focused class on select focus <i>(for swithing with tab)</i>
* Can add keyevents to simulate select
* Can allow searching for entered text
* Can be ordered on init
* If builded from select, be aware that every further reference to faker <i>(fakr, faker_elm, object_selector, ...)</i> doesn't mean original select, but it's faker <i>(more in examples - Build from select and update options)</i>
* non-visual support
* added search hints (+auto selected first value)
* recommended that you don't get select value by ```$("select").val()```, but with ```specto_faker.getFakerValue(faker)```. E.g. oninit if select has placeholder and wasn't changed, it'll have value of first option (more in index.html)
* in custom callbacks before_change and on_change make sure that you don't focus another element and then focus back (e.g. alert() focuses on window). this will not close faker (it will be closed and reopened again on focus)
* before change function and keyed/searchable faker are not compatible (key stroke cannot be canceled, or gets stuck on specific value)
* if drop-selection-items are updated without faker refresh (angular requirement), make sure that you update memory with saved values. Call ```specto_faker.rebuildMemory(faker)```
* searchable faker has new option for keyup delay ```search_debouce```

## EXAMPLE USAGE

### Html

```html
<select id="test" name="test" class="faker">
	<option value="a">Šport</option>
	<option value="b">Zabava</option>
	<option value="c">Delo</option>
</select>
	
```

OR plain version

```html
<div id="servis" class="faker">
	<div class="drop-value">
		<span></span>
	</div>
	<div class="drop-handle">&nbsp;</div>
	<div class="drop-selection">
		<div class='drop-selection-item' rel="a">Šport</div>
		<div class='drop-selection-item' rel="b">Zabava</div>
		<div class='drop-selection-item' rel="c">Delo</div>
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

```javascript
$(document).ready(function(){
	specto_faker.init(); 
	//or 
	//$(".faker").specto_faker();
});

```

## INSTALLATION

### Manual

```html
<script src="https://code.jquery.com/jquery-2.2.4.js" integrity="sha256-iT6Q9iMJYuQiMWNd9lDyBUStIq/8PuOW33aOqmvFpqI=" crossorigin="anonymous"></script>
<link href="specto_faker.css" rel="stylesheet" type="text/css">
<script src="specto_faker.js" type="text/javascript"></script>

```
### NPM
Run command `npm install git+ssh://git@code.specto.si:22015/bower/specto-faker.git#master`

### Bower

```javascript
"dependencies": {
	"specto_faker": "https://code.specto.si/bower/specto-faker.git",
	//or with version
	// "specto_faker": "https://code.specto.si/bower/specto-faker.git#v1.05",
}

```


## CUSTOM USE 

###	Scss variables (colors, handle icon, height)

```scss
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

```javascript
specto_faker.init({animated: true, object_selector: "#testId"});
//$("#testId").specto_faker({animated: true});

```

### Custom callbacks

```javascript
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

```javascript
$("select").change(function(newVal, jsEvent){ console.log("changed into"+ newVal); }); 

specto_faker.init({ object_selector: "select"});
//$("select").specto_faker();

```

### After changed content, rebuild selection clicks

```javascript
specto_faker.fakerSelection("#dropdown");

//specto_faker.fakerSelection("#dropdown", after_change_function, before_change_function);

```

or just reinit

```javascript
specto_faker.init({object_selector: "#dropdown"});
//$("#dropdown").specto_faker();

```

### Get value

If there is ```<select>```, you can use js or jQuery to get current value. 
<i>(As mentioned above, this feature depends on browser support for changing and triggering change() on ```<select>``` )</i>

But you can also use <i>(single element)</i>

```javascript
var faker_value = specto_faker.getFakerValue("#fakerId");

```

### Multiple fakers, some custom

Init multiple fakers and for specific fakers, set custom onchange function

```javascript
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

### Update faker options and reinit faker (placeholder is fetched in data, or copied from original select)


```javascript
//init
specto_faker.init({
	animated: true,
	object_selector: "#faker_elm"
});

//update -> function(fakr, new_options, [rel_name = "rel", name_name = "name", settings = null])
specto_faker.updateOptions("#faker_elm", [{
	code: "", //ignored
	name: "Izberite",
	is_placeholder: true,
},{
	code: "value1",
	name: "Prikaz1",
	is_default: true,
},{
	code: "value2",
	name: "Prikaz2"
},{
	code: "value3",
	name: "Prikaz3"
}], "code", "name", {animated: true});

```

### Build from select and update options (placeholder is copied from original select)


```javascript
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

### Update value programatically on existing faker

```javascript
//update value programatically
specto_faker.updateFakerValue(faker, to_change_value);

```


## TO DO

* add function to open/close faker
* nvda support with select (and test all non-searchable variants)
* check select on focus if still working
* form value workaround?