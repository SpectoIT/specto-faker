var specto_faker = {
	initiated: false,
	config: {
		object_selector: ".faker", //element(s) - works only if called through ```specto_faker.init()```, if called as ```$().specto_faker()``` elements are defined in $()"
		
		/* CLASSES */
		open_class: "open", //class for opened faker
		init_class: "faker-init", //class for initiated faker
		anim_class: "faker-animated", //class for animated faker
		anim_progress_class: "faker-animating", //class while animation in progress
		focused_class: "faker-focused", //class for focused faker
		selected_val_class: "active", //class of selected option - default css has display:none
		disabled_val_class: "rel-disabled", //class of disabled option - default css has opacity:0.5 and cursor:not-allowed
		key_events_class: "faker-keyevent", //class for faker with key events
		searchable_class: "faker-search", //class for searchable faker
		search_hidden: "rel-search", //class for hidden options - hidden by search
		
		/* ANIMATION */
		animated: false, //is faker animated
		animation_speed: 400,
		count_selected: false, //valid only for animated faker, are selected_val_class counted for animation
		count_disables: true, //valid only for animated faker, are disabled_val_class counted for animation
		
		/* KEY EVENTS & SEARCHING & SORTING */
		key_events: false, //do you want keyEvents to work - Global setting which works only for the first specto_faker.init !
		searchable: true, //open faker gets input to search for values - valid only if key_events are initiated
		sortable: false, //do you want on init to be sorted
		sort_ascending: true,
		
		/* METHODS - CALLBACKS */
		/* if you use before_change function you must return a value which correlates to boolean 'true', otherwise change is prevented */
		before_change: function(newVal, jsEvent){ return newVal; }, //callback function before value has changed - by default it prevents clicks on elements without value or 0
		on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){}
		on_init: null, //callback when faker(s) is(are) initiated //e.g. function(fakers){ }
	},
	init: function(settings){
		//settings
		var fakr_settings = $.extend({}, specto_faker.config, (settings && typeof settings === "object" ? settings : {}));
		var faker_elms = [];
		if(!specto_faker.initiated) { //only first time update classes
			specto_faker.config.init_class = fakr_settings.init_class;
			specto_faker.config.open_class = fakr_settings.open_class; 
			specto_faker.config.anim_class = fakr_settings.anim_class; 
			specto_faker.config.anim_progress_class = fakr_settings.anim_progress_class; 
			specto_faker.config.focused_class = fakr_settings.focused_class; 
			specto_faker.config.selected_val_class = fakr_settings.selected_val_class; 
			specto_faker.config.disabled_val_class = fakr_settings.disabled_val_class; 
			specto_faker.config.key_events_class = fakr_settings.key_events_class; 
			specto_faker.config.searchable_class = fakr_settings.searchable_class; 
			specto_faker.config.search_hidden = fakr_settings.search_hidden; 
			specto_faker.config.count_selected = fakr_settings.count_selected; 
			specto_faker.config.count_disables = fakr_settings.count_disables; 
			specto_faker.config.key_events = fakr_settings.key_events; //save if faker has keyevents
		}
		
		//add clicks
		$(fakr_settings.object_selector).each(function(){
			//if this is select tag, build proper html
			var fakr_elm = specto_faker.getTargetelement(this);
			faker_elms.push(fakr_elm);
			
			//sorting of values
			if(fakr_settings.sortable) specto_faker.sortValues(fakr_elm, fakr_settings.sort_ascending);
			
			//drop value & handle clicks
			$(fakr_elm).find(".drop-value, .drop-handle").each(function(){ 
				$(this).unbind().click(function(){
					
					var faker = $(this).parent();
					if(specto_faker.isFakerOpen(faker)) specto_faker.animateFaker(faker);
					else specto_faker.animateFaker(faker, "openme");
				});
			});
			//dropdown clicks
			specto_faker.fakerSelection(fakr_elm, fakr_settings.on_change, fakr_settings.before_change);
			//if empty, update first value
			if(!$(fakr_elm).find(".drop-value").text()) {
				//has faker selected value?
				if($(fakr_elm).find(".drop-selection > div[selected]").length) specto_faker.updateValue($(fakr_elm).find(".drop-selection > div[selected]").first().addClass(specto_faker.config.selected_val_class), "noclick");
				else specto_faker.updateValue($(fakr_elm).find(".drop-selection > div").first(), "noclick");
			}
			
			//on focus select, add focused class to faker
			if($(fakr_elm).find("select").length > 0){
				$(fakr_elm).find("select").each(function(){
					$(this).focus(function(){
						//close all opened fakers
						$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.open_class).each(function(){
							specto_faker.animateFaker(this);
						});
						specto_faker.animateFaker($(this).parent().addClass(specto_faker.config.focused_class), "openme"); //open and add focused class
					}).blur(function(){
						$(this).parent().removeClass(specto_faker.config.focused_class);
					});
				});
			}
			
			//faker classes
			if(fakr_settings.animated) $(fakr_elm).addClass(specto_faker.config.anim_class); //animated
			else $(fakr_elm).removeClass(specto_faker.config.anim_class);
			if(fakr_settings.key_events) $(fakr_elm).addClass(specto_faker.config.key_events_class); //key events
			else $(fakr_elm).removeClass(specto_faker.config.key_events_class);
			if(fakr_settings.searchable) $(fakr_elm).addClass(specto_faker.config.searchable_class); //searchable
			else $(fakr_elm).removeClass(specto_faker.config.searchable_class);
			$(fakr_elm).addClass(specto_faker.config.init_class);
		});
		
		//document clicks - outside of opened fakers, close those fakers
		if(!specto_faker.initiated) {
			$(document).mouseup(function (event){
				$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.open_class).each(function(){
					if (!$(this).is(event.target) && $(this).has(event.target).length === 0) { 
						specto_faker.animateFaker(this);
					}
				});
			});
			$(document).on("keyup", function (event){ //key events
				$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.key_events_class +'.'+ specto_faker.config.open_class).each(function(){
					specto_faker.keyEvents(this, event);
				});
			});
			
		}
		
		specto_faker.config.animation_speed = fakr_settings.animation_speed; //update animation speed
		specto_faker.initiated = true;
		if(fakr_settings.on_init) fakr_settings.on_init(faker_elms); //init callback
		return faker_elms; //return all fakers
	},
	fakerSelection: function(fakr, after_change_fun, before_change_fun){ //dropdown clicks
		$(fakr).find(".drop-selection div").each(function(){
			$(this).unbind().click(function(e){
				if(typeof $(this).attr("disabled") === "string") return; //prevent disabled options
				
				if(before_change_fun){ //run before change function
					if(!before_change_fun(specto_faker.getSelectionValue(this), e)) { //prevent click
						e.preventDefault();
						e.stopPropagation();
						return;
					}
				}
				//find previous selected value
				$(this).siblings().filter(function(){ return $(this).hasClass(specto_faker.config.selected_val_class); }).each(function(){ $(this).removeClass(specto_faker.config.selected_val_class); });
				
				specto_faker.updateValue(this); //update faker value
				var self = this;
				setTimeout(function(){ $(self).addClass(specto_faker.config.selected_val_class); }, (specto_faker.isFakerAnimated(fakr) ? specto_faker.config.animation_speed : 0)); //add selected class
				//if there is select present, update it's value. And trigger change event
				var selects = $(this).parent().nextAll("select");
				if(selects.length > 0) $(selects).val(specto_faker.getSelectionValue(this)).change();
				if(after_change_fun) after_change_fun(specto_faker.getSelectionValue(this), e); //change function
				
			});
		});
	},
	updateValue: function(rel, dimm_click){ 
		if($(rel).length < 1) return; //prevent error
		$(rel).siblings().filter(function(){ return $(this).hasClass(specto_faker.config.selected_val_class); }).each(function(){ $(this).removeClass(specto_faker.config.selected_val_class); });
		$(rel).addClass(specto_faker.config.selected_val_class);
		var v = $(rel).parent().prevAll(".drop-value").text($(rel).text()).attr("rel", $(rel).attr("rel")); 
		if(!dimm_click) v.trigger("click");
	},
	getFakerValue: function(fakr){ return $(fakr).find(".drop-value").attr("rel"); },
	getSelectionValue: function(sel_item){ return $(sel_item).attr("rel"); },
	isFakerOpen: function(fakr){ return $(fakr).hasClass(specto_faker.config.open_class); },
	isFakerAnimated: function(fakr){ return $(fakr).hasClass(specto_faker.config.anim_class); },
	isFakerSearchable: function(fakr){ return $(fakr).hasClass(specto_faker.config.searchable_class); },
	animateFaker: function(fakr, openme){
		//animated
		if(specto_faker.isFakerAnimated(fakr)){ 
			if($(fakr).hasClass(specto_faker.config.anim_progress_class)) return;
			else $(fakr).addClass(specto_faker.config.anim_progress_class);
		
			if(openme){
				specto_faker.makeFakerSearchable(fakr); //searchable faker
				var selection = $(fakr).find(".drop-selection").css({visibility: "hidden", opacity: "1"});
				//final height 
				var finder_css = "div";
				if(specto_faker.config.count_selected) finder_css += ":not(."+ specto_faker.config.selected_val_class +")";
				if(specto_faker.config.count_disables) finder_css += ":not(."+ specto_faker.config.disabled_val_class +")";
				
				
				$(selection).css({"height": "0px", visibility: "visible"}).animate({"height": $(selection).find("div").first().height() * $(selection).find(finder_css).length +"px"}, {
					duration: specto_faker.config.animation_speed,
					always: function(){
						$(selection).removeAttr("style");
						$(fakr).addClass(specto_faker.config.open_class);
						$(fakr).removeClass(specto_faker.config.anim_progress_class);
					}
				});
			}
			else {
				specto_faker.removeFakerSearchable(fakr); //searchable faker
				var selection = $(fakr).find(".drop-selection");
				
				$(selection).css({"height": $(selection).height() +"px"}).animate({"height": "0px"}, {
					duration: specto_faker.config.animation_speed,
					always: function(){
						$(selection).removeAttr("style");
						$(fakr).removeClass(specto_faker.config.open_class).removeClass(specto_faker.config.anim_progress_class);
					}
				});
			}
		
		}
		else {
			if(openme) {
				$(fakr).addClass(specto_faker.config.open_class);
				specto_faker.makeFakerSearchable(fakr, "focus_me"); //searchable faker
			}
			else {
				$(fakr).removeClass(specto_faker.config.open_class);
				specto_faker.removeFakerSearchable(fakr); //searchable faker
			}
		}
	},
	getTargetelement: function(that){ //if this is select tag, build proper html
		if($(that).prop("tagName") === "SELECT"){
			if($(that).parent().hasClass(specto_faker.config.init_class)) return $(that).parent(); //if select is already parsed, return faker elm
			
			var placeholder = $(that).attr("placeholder");
			var fakr_html = $("<div class='faker'><div class='drop-value'></div><div class='drop-handle'>&nbsp;</div><div class='drop-selection'></div></div>");
			//fill options
			$(that).find("option").each(function(){
				var display = $(this).text();
				var is_sel = typeof $(this).attr("selected") === "string";
				if(is_sel) placeholder = ""; //prevent placeholder if any option is selected
				$(fakr_html).find(".drop-selection").append("<div rel='"+ ($(this).attr("value") || display) +"'"+ (typeof $(this).attr("disabled") === "string" ? " disabled='disabled' class='"+ specto_faker.config.disabled_val_class +"'" : "") + (is_sel ? " selected='selected'" : "") +">"+display+"</div>");
			});
			$(fakr_html).append($(that).clone(true)); //append original select
			if(placeholder) {
				$(fakr_html).find(".drop-value").text(placeholder);
				$(fakr_html).find(".drop-selection").prepend("<div rel='' disabled='disabled' class='"+ specto_faker.config.disabled_val_class +"'>"+ placeholder +"</div>"); //placeholder - add disabled value
			}
			$(that).after(fakr_html);
			var final_target = $(that).next();
			$(that).remove();
			return final_target;
		}
		else return that;
	},
	updateOptions: function(fakr, new_options, rel_name, name_name, settings){
		
		$(fakr).each(function(){
			$(this).find(".drop-value").each(function(){ $(this).text(""); });
			$(this).find(".drop-selection").each(function(){ 
				$(this).empty(); 
				var ins = "";
				$.each(new_options, function(ind, item){
					ins += "<div rel='"+ item[rel_name || "rel"] +"'>"+ item[name_name || "name"] +"</div>";
				});
				$(this).append(ins);
			});
			$(this).specto_faker(settings); //init 
		});
	},
	keyEvents: function(fakr, e){
		if(!specto_faker.isFakerOpen(fakr)) return; //prevent if faker is closed -dbl check
		
		var key = e.keyCode || e.which;
		switch(key){
			case 13: //enter
				$(fakr).find(".drop-value").trigger("click");
				break;
			case 40: //down
				specto_faker.selection.next(fakr);
				break;
			case 38: //up
				specto_faker.selection.previous(fakr);
				break;
			default: 
				if(!specto_faker.isFakerSearchable(fakr)){
					var ch = String.fromCharCode(key);
					if(ch.search(/[a-zA-Z0-9\.\-]/) > -1){ //alphanumeric
						specto_faker.selection.tochar(fakr, ch.toLowerCase());
					}
				}
				else specto_faker.filterBySearchInput(fakr);
				break;
		}
	},
	selection: {
		filter_fn: function(){ return !$(this).hasClass(specto_faker.config.disabled_val_class) && !$(this).hasClass(specto_faker.config.search_hidden); },
		next: function(fakr){ //move to next option
			var is_found = false;
			$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
				is_found = true;
				if($(this).nextAll().filter(specto_faker.selection.filter_fn).length > 0) specto_faker.updateValue($(this).nextAll().filter(specto_faker.selection.filter_fn).first(), "noclick");
				else {
					var prevs = $(this).prevAll().filter(specto_faker.selection.filter_fn);
					if(prevs.length > 0) specto_faker.updateValue(prevs.last(), "noclick");
				}
			});
			if(!is_found) specto_faker.updateValue($(fakr).find(".drop-selection div").filter(specto_faker.selection.filter_fn).first(), "noclick");
		},
		previous: function(fakr){ //move to prevoius option
			var is_found = false;
			$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
				is_found = true;
				if($(this).prevAll().filter(specto_faker.selection.filter_fn).length > 0) specto_faker.updateValue($(this).prevAll().filter(specto_faker.selection.filter_fn).first(), "noclick");
				else {
					var nexts = $(this).nextAll().filter(specto_faker.selection.filter_fn);
					if(nexts.length > 0) specto_faker.updateValue(nexts.last(), "noclick");
				}
			});
			if(!is_found) specto_faker.updateValue($(fakr).find(".drop-selection div").filter(specto_faker.selection.filter_fn).last(), "noclick");
		},
		tochar: function(fakr, ch){ //move to char
			var is_already = false;
			$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
				if($(this).text().slice(0,1).toLowerCase() == ch) is_already = true;
			});
			
			if(is_already){ //not first time
				$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
					var start_proper = $(this).nextAll().filter(function(){ return $(this).text().slice(0,1).toLowerCase() == ch && !$(this).hasClass(specto_faker.config.search_hidden); });
					if(start_proper.length < 1) is_already = false;
					else specto_faker.updateValue(start_proper.first(), "noclick");
				});
			}
			
			if(!is_already) { //first time
				$(fakr).find(".drop-selection div").filter(function(){ return $(this).text().slice(0,1).toLowerCase() == ch && !$(this).hasClass(specto_faker.config.search_hidden); }).first().each(function(){
					specto_faker.updateValue(this, "noclick");
				});
			}
		},
	},
	makeFakerSearchable: function(fakr, focus_me){
		if(specto_faker.isFakerSearchable(fakr)){
			$(fakr).find(".drop-value").append("<input type='text' name='faker-search' class='form-control' />");
			$(fakr).find("input[name='faker-search']").each(function(){ 
				$(this).click(function(event){
					event.preventDefault();
					event.stopPropagation();
				});
				$(this).focus(); 
			});
		}
	},
	removeFakerSearchable: function(fakr){
		if(specto_faker.isFakerSearchable(fakr)){
			$(fakr).find("input[name='faker-search']").each(function(){ $(this).remove(); });
			$(fakr).find(".drop-selection div."+ specto_faker.config.search_hidden).each(function(){ $(this).removeClass(specto_faker.config.search_hidden); }); //remove searchable classes
		}
	},
	filterBySearchInput: function(fakr){
		var srch_val = $(fakr).find("input[name='faker-search']").val().toLowerCase();
		$(fakr).find(".drop-selection div").each(function(){
			if($(this).text().toLowerCase().search(srch_val) > -1) $(this).removeClass(specto_faker.config.search_hidden);
			else $(this).addClass(specto_faker.config.search_hidden);
		});
	},
	sortValues: function(fakr, ascending){
		
		var all = [];
		$(fakr).find(".drop-selection div:not(."+ specto_faker.config.disabled_val_class +")").each(function(i){
			all.push({
				rel: $(this).attr("rel"),
				val: $(this).text(),
				i: i
			});
		});

		//sort
		all.sort(function(a,b){
			return a.val.localeCompare(b.val) * (ascending ? 1 : -1);
		});
		//create new html
		$.each(all, function(ind, item){ $(fakr).find(".drop-selection").append( $(fakr).find(".drop-selection div:not(."+ specto_faker.config.disabled_val_class +")").eq(item.i).clone().addClass("tmp") ); });
		//delete old values
		$.each(all, function(ind, item){ $(fakr).find(".drop-selection div:not(."+ specto_faker.config.disabled_val_class +"):not(.tmp)").each(function(){ $(this).remove(); }); });
		$(fakr).find(".drop-selection div.tmp").each(function(){ $(this).removeClass("tmp"); });
		
		return true;
	},
};

//jquery wrapper
(function( $ ){
	$.fn.specto_faker = function(settings) {
		return specto_faker.init($.extend(settings, {object_selector: this}));
	}; 
})( jQuery );