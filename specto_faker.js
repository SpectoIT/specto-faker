"use strict";
var specto_faker = {
	initiated: false,
	keys_initiated: false,
	config: {
		object_selector: ".faker", //element(s) - works only if called through `specto_faker.init()`, if called as `$([object_selector]).specto_faker()` elements are defined in `$([object_selector])`
		
		/* CLASSES */
		open_class: "open", //class for opened faker
		init_class: "faker-init", //class for initiated faker
		anim_class: "faker-animated", //class for animated faker
		anim_progress_class: "faker-animating", //class while animation in progress
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
		nv_helper_class: "non-visual-helper", //class of non-visual input helper
		
		/* ANIMATION */
		animated: false, //is faker animated
		animation_speed: 400, //updated on each init. (e.g. first init with speed 400, second with 600 -> result both will be animated with 600)
		count_selected: false, //valid only for animated faker, are selected_val_class counted for animation
		count_disables: true, //valid only for animated faker, are disabled_val_class counted for animation
		count_manual_val: 0, //valid only for animated faker, animate to specific number of elements
		
		/* KEY EVENTS & SEARCHING & SORTING */
		key_events: false, //do you want keyEvents to work
		searchable: true, //open faker gets input to search for values - valid only if key_events are initiated
		search_single: true, //if faker is searchable, after filtering, do check if there is only one valid option and if yes, select it
		search_only_from_start: false, //if faker is searchable, do you want to search only values that start with searched value? - braille_support ignores this options and consideres it set to true
		sortable: false, //do you want on init to be sorted
		sort_ascending: true,
		
		/* METHODS - CALLBACKS */
		/* if you use before_change function you must return a value which correlates to boolean 'true', otherwise change is prevented */
		before_change: function(newVal, jsEvent){ return newVal; }, //callback function before value has changed - by default it prevents clicks on elements without value or 0
		on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){}
		on_init: null, //callback when faker(s) is(are) initiated //e.g. function(fakers){ }
		
		/* NON-VISUAL (BRAILLE) SUPPORT */
		braille_support: false, //does faker support braille speach - tested with NVDA - if set to true, key_events will be automatically turned on -->> example: https://a11y.nicolas-hoffmann.net/autocomplete-list/
	},
	lastClosedFaker: null,
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
			specto_faker.config.searchable_from_start_class = fakr_settings.searchable_from_start_class; 
			specto_faker.config.select_single = fakr_settings.select_single; 
			specto_faker.config.braille_class = fakr_settings.braille_class;
			specto_faker.config.search_hidden = fakr_settings.search_hidden; 
			specto_faker.config.nv_helper_class = fakr_settings.nv_helper_class; 
			specto_faker.config.count_selected = fakr_settings.count_selected; 
			specto_faker.config.count_disables = fakr_settings.count_disables;
			specto_faker.config.count_manual_val = fakr_settings.count_manual_val;
		}
		
		//add clicks
		$(fakr_settings.object_selector).each(function(){
			//if this is select tag, build proper html
			var fakr_elm = specto_faker.getTargetelement(this);
			var has_select = false;
			faker_elms.push(fakr_elm);
			
			//sorting of values
			if(fakr_settings.sortable) specto_faker.sortValues(fakr_elm, fakr_settings.sort_ascending);
			
			//faker classes
			if(fakr_settings.animated) $(fakr_elm).addClass(specto_faker.config.anim_class); //animated
			else $(fakr_elm).removeClass(specto_faker.config.anim_class);
			if(fakr_settings.braille_support){
				$(fakr_elm).addClass(specto_faker.config.braille_class); //braille support
				fakr_settings.key_events = true;
			}
			else $(fakr_elm).removeClass(specto_faker.config.braille_class);
			if(fakr_settings.key_events) $(fakr_elm).addClass(specto_faker.config.key_events_class); //key events
			else $(fakr_elm).removeClass(specto_faker.config.key_events_class);
			if(fakr_settings.searchable && fakr_settings.key_events) {
				$(fakr_elm).addClass(specto_faker.config.searchable_class); //searchable - only with both keyevents and searchable
				if(fakr_settings.search_single) $(fakr_elm).addClass(specto_faker.config.select_single); //searchable single
				if(fakr_settings.search_only_from_start) $(fakr_elm).addClass(specto_faker.config.searchable_from_start_class); //searchable from start
			}
			else $(fakr_elm).removeClass(specto_faker.config.searchable_class);
			$(fakr_elm).addClass(specto_faker.config.init_class);
			
			//drop value & handle clicks
			$(fakr_elm).find(".drop-value, .drop-handle").each(function(){ 
				$(this).off("click").click(function(){
					
					var faker = $(this).parent();
					if(specto_faker.isFakerOpen(faker)) specto_faker.animateFaker(faker);
					else specto_faker.animateFaker(faker, "openme");
				});
			});
			//dropdown clicks
			specto_faker.fakerSelection(fakr_elm, fakr_settings.on_change, fakr_settings.before_change);
			//if empty, update first value
			if(!$(fakr_elm).find(".drop-value span").text()) {
				//has faker selected value?
				if($(fakr_elm).find(".drop-selection .drop-selection-item[selected]").length) specto_faker.updateValue($(fakr_elm).find(".drop-selection .drop-selection-item[selected]").first().addClass(specto_faker.config.selected_val_class), "noclick");
				else specto_faker.updateValue($(fakr_elm).find(".drop-selection .drop-selection-item").first(), "noclick");
			}
			
			//on focus select, add focused class to faker
			$(fakr_elm).find("select").each(function(){
				has_select = true;
				$(this).removeClass("faker").off("focus").focus(function(){ //remove faker class from select
					if(specto_faker.isFakerOpen(fakr_elm)) return;
					
					//close all opened fakers
					$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.open_class).each(function(){
						specto_faker.animateFaker(this, false, {dont_save_closed: true});
					});
					specto_faker.animateFaker($(this).parent(), "openme"); //open and add focused class
				});
				if(!(fakr_settings.searchable && fakr_settings.key_events)){ //searchable looses focus automatically
					$(this).off("blur").blur(function(){
						specto_faker.animateFaker($(this).parent());
					});
				}
			});
			if(!has_select && fakr_settings.braille_support){ //NON-VISUAL SUPPORT FOR FAKERS WITHOUT TAB FOCUS ELEMENTS
				if(!specto_faker.hasFakerNvHelperInput(fakr_elm)){ //only first time
					
					$(fakr_elm).prepend("<input class='"+ specto_faker.config.nv_helper_class +"' name='non-visual-helper' />")
					$(fakr_elm).find("."+ specto_faker.config.nv_helper_class).each(function(){ //add focusing by tab
						$(this).focus(function(event){
							
							if(!specto_faker.isFakerOpen($(this).parent())){ //if focus not redirected within opened faker
								//close all opened fakers
								$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.open_class).each(function(){
									specto_faker.animateFaker(this, false, {dont_save_closed: true});
								});
								specto_faker.animateFaker($(this).parent(), "openme"); //open and add focused class
							}
							specto_faker.brailleSpeach(fakr_elm, "selection");
						});
					});
					if(!fakr_settings.searchable || !fakr_settings.key_events) $(fakr_elm).off("click").click(function(){
						$(this).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).focus(); }); //force nv helper if not searchable
					});
				}
			}
			else $(fakr_elm).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).remove(); });
			
			
			//firefox workaround - reset form for proper detection of required fields
			if(has_select && $(fakr_elm).parents("form").length > 0){
				switch(document.readyState){
					case "complete":
						$(fakr_elm).parentsUntil("form").last().parent()[0].reset();
						break;
					default:
						$(window).on("load", function(){
							$(fakr_elm).parentsUntil("form").last().parent()[0].reset();
						});
				}
			}
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
		}
		if(!specto_faker.keys_initiated) {
			specto_faker.keys_initiated = true;
			$(document).on("keyup", function (event){ //key events
				var opened_was_found = false;
				$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.key_events_class +'.'+ specto_faker.config.open_class).each(function(){
					specto_faker.keyEvents(this, event);
					opened_was_found = true;
				});
				if(!opened_was_found){
					var key = event.keyCode || event.which;
					if(key === 13 && specto_faker.lastClosedFaker) specto_faker.animateFaker(specto_faker.lastClosedFaker, "openme");
				}
			});
			
		}
		
		specto_faker.config.animation_speed = fakr_settings.animation_speed; //update animation speed
		specto_faker.initiated = true;
		if(fakr_settings.on_init) fakr_settings.on_init(faker_elms); //init callback
		return faker_elms; //return all fakers
	},
	fakerSelection: function(fakr, after_change_fun, before_change_fun){ //dropdown clicks
		$(fakr).find(".drop-selection .drop-selection-item").each(function(){
			$(this).off().click(function(e){
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
				if(after_change_fun) after_change_fun(specto_faker.getSelectionValue(this), e); //change function
				
			});
		});
	},
	updateValue: function(rel, dimm_click, extra_settings){ //notice - this function doesn't call after change event
		extra_settings = extra_settings || {};
		
		if($(rel).length < 1) return; //prevent error
		$(rel).siblings().filter(function(){ return $(this).hasClass(specto_faker.config.selected_val_class); }).each(function(){ $(this).removeClass(specto_faker.config.selected_val_class); });
		$(rel).addClass(specto_faker.config.selected_val_class);
		var v = $(rel).parents(".drop-selection").first().prevAll(".drop-value").attr("rel", $(rel).attr("rel")).find("span").text($(rel).text()).parent(); 
		
		//if there is select present, update it's value. And trigger change event
		var selects = $(rel).parents(".drop-selection").first().prevAll("select");
		if(selects.length > 0) $(selects).val(specto_faker.getSelectionValue(rel)).change();
		
		var fakr_el = $(rel).parents("."+ specto_faker.config.init_class).first();
		if(!dimm_click) $(v).trigger("click");
		else if(extra_settings.manual_close) specto_faker.animateFaker(fakr_el, false, {dont_remove_focus: true});
		
		if(specto_faker.isFakerBrailleSupport(fakr_el)) {
			if(specto_faker.isFakerSearchable(fakr_el)){
				//$(fakr_el).find("."+ specto_faker.config.nv_helper_class).each(function(){ //focus helper - if moved from searchable with arrow keys
					
					if(extra_settings.focus_nv)/* $(this).removeAttr("title").focus();
					else  */
						$(fakr_el).find("input[name='faker-search']").each(function(){ //update search value

							$(this).val(specto_faker.getFakerUserValue(fakr_el)).attr("title", specto_faker.brailleListText(fakr_el));
							this.setSelectionRange(0, 200);
							$(this).focus();
						});
				//});
			}
			else specto_faker.brailleSpeach($(rel).parent().parent(), "selection"); //update braille speach
		}
	},
	getFakerValue: function(fakr){ return $(fakr).find(".drop-value").attr("rel"); },
	getFakerUserValue: function(fakr){ return $(fakr).find(".drop-value span").text().trim(); },
	//setFakerValue: function(fakr, val, prevent_opening){ specto_faker.updateValue($(fakr).find(".drop-selection .drop-selection-item[rel='"+ val +"']"), prevent_opening); },
	getSelectionValue: function(sel_item){ return $(sel_item).attr("rel"); },
	isFakerOpen: function(fakr){ return $(fakr).hasClass(specto_faker.config.open_class); },
	isFakerAnimated: function(fakr){ return $(fakr).hasClass(specto_faker.config.anim_class); },
	isFakerSearchable: function(fakr){ return $(fakr).hasClass(specto_faker.config.searchable_class); },
	isFakerSearchableFromStart: function(fakr){ return $(fakr).hasClass(specto_faker.config.searchable_from_start_class); },
	isFakerBrailleSupport: function(fakr){ return $(fakr).hasClass(specto_faker.config.braille_class); },
	hasFakerNvHelperInput: function(fakr){ return $(fakr).find("."+ specto_faker.config.nv_helper_class).length > 0; },
	animateFaker: function(fakr, openme, extra_settings){
		extra_settings = extra_settings || {};
		
		if(openme) $("."+ specto_faker.config.focused_class).each(function(){ $(this).removeClass(specto_faker.config.focused_class); });
		else specto_faker.lastClosedFaker = null;
		
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
				var nr_elements = parseInt(specto_faker.config.count_manual_val) > 0 ? parseInt(specto_faker.config.count_manual_val) : $(selection).find(finder_css).length;
				
				
				$(fakr).addClass(specto_faker.config.focused_class);
				$(selection).css({"height": "0px", visibility: "visible"}).animate({"height": $(selection).find("div").first().height() * nr_elements +"px"}, {
					duration: specto_faker.config.animation_speed,
					always: function(){
						$(selection).removeAttr("style");
						$(fakr).addClass(specto_faker.config.open_class);
						$(fakr).removeClass(specto_faker.config.anim_progress_class);
					}
				});
				//if searchable and with non-visual helper, enable shift-tab
				if(specto_faker.isFakerSearchable(fakr) && specto_faker.hasFakerNvHelperInput(fakr)) $(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).attr("tabindex", "-1"); });
			}
			else {
				specto_faker.removeFakerSearchable(fakr); //searchable faker
				var selection = $(fakr).find(".drop-selection");
				$(fakr).removeClass(specto_faker.config.open_class);
				
				$(selection).css({"height": $(selection).height() +"px"}).animate({"height": "0px"}, {
					duration: specto_faker.config.animation_speed,
					always: function(){
						$(selection).removeAttr("style");
						$(fakr).removeClass(specto_faker.config.anim_progress_class);
						if(!extra_settings.dont_remove_focus) $(fakr).removeClass(specto_faker.config.focused_class);
						if(!extra_settings.dont_save_closed) specto_faker.lastClosedFaker = fakr;
					}
				});
				//if searchable and with non-visual helper, return to default shift-tab
				if(specto_faker.isFakerSearchable(fakr) && specto_faker.hasFakerNvHelperInput(fakr)) 
					setTimeout(function(){ $(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).removeAttr("tabindex"); }); }, 20);
			}
		
		}
		else {
			if(openme) {
				$(fakr).addClass(specto_faker.config.open_class).addClass(specto_faker.config.focused_class);
				specto_faker.makeFakerSearchable(fakr); //searchable faker
				//if searchable and with non-visual helper, enable shift-tab
				if(specto_faker.isFakerSearchable(fakr) && specto_faker.hasFakerNvHelperInput(fakr)) $(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).attr("tabindex", "-1"); });
			}
			else {
				$(fakr).removeClass(specto_faker.config.open_class);
				if(!extra_settings.dont_remove_focus) $(fakr).removeClass(specto_faker.config.focused_class);
				specto_faker.removeFakerSearchable(fakr); //searchable faker
				if(!extra_settings.dont_save_closed) specto_faker.lastClosedFaker = fakr;
				//if searchable and with non-visual helper, return to default shift-tab
				if(specto_faker.isFakerSearchable(fakr) && specto_faker.hasFakerNvHelperInput(fakr)) 
					setTimeout(function(){ $(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).removeAttr("tabindex"); }); }, 20);
			}
		}
	},
	getTargetelement: function(that){ //if this is select tag, build proper html
		if($(that).prop("tagName") === "SELECT"){
			if($(that).parent().hasClass(specto_faker.config.init_class)) return $(that).parent(); //if select is already parsed, return faker elm
			
			var placeholder = $(that).attr("placeholder");
			var fakr_html = $("<div class='faker'><div class='drop-value'><span></span></div><div class='drop-handle'>&nbsp;</div><div class='drop-selection'></div></div>");
			//fill options
			$(that).find("option").each(function(){
				var display = $(this).text();
				var is_sel = typeof $(this).attr("selected") === "string";
				if(is_sel) placeholder = ""; //prevent placeholder if any option is selected
				$(fakr_html).find(".drop-selection").append("<div class='drop-selection-item' rel='"+ ($(this).attr("value") || display) +"'"+ (typeof $(this).attr("disabled") === "string" ? " disabled='disabled' class='"+ specto_faker.config.disabled_val_class +"'" : "") + (is_sel ? " selected='selected'" : "") +">"+display+"</div>");
			});
			$(fakr_html).prepend($(that).clone(true)); //append original select
			if(placeholder) {
				$(fakr_html).find(".drop-value span").text(placeholder);
				$(fakr_html).find(".drop-selection").prepend("<div rel='' disabled='disabled' class='drop-selection-item "+ specto_faker.config.disabled_val_class +"'>"+ placeholder +"</div>"); //placeholder - add disabled value
				if($(fakr_html).find("option[value='']").length < 1) $(fakr_html).find("select").prepend("<option value='' selected='selected' disabled='disabled'>placeholder</option>"); //also append option with empty value to select (FF requirement)
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
			$(this).find(".drop-value span").each(function(){ $(this).text(""); });
			$(this).find(".drop-selection").each(function(){ 
				$(this).empty(); 
				var ins = "";
				$.each(new_options, function(ind, item){
					ins += "<div class='drop-selection-item' rel='"+ item[rel_name || "rel"] +"' "+ (item.is_default ? "selected" : "") +">"+ item[name_name || "name"] +"</div>";
				});
				$(this).append(ins);
			});
			
			$(fakr).find("select").each(function(){ //fill also select, if present
				$(this).empty();
				var ins = "";
				$.each(new_options, function(ind, item){
					ins += "<option value='"+ item[rel_name || "rel"] +"'>"+ item[name_name || "name"] +"</option>";
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
			case 13: //enter - close faker
				$(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).focus(); });
				specto_faker.animateFaker(fakr, false, {dont_remove_focus: specto_faker.hasFakerNvHelperInput(fakr)});
				specto_faker.brailleClosedFakerButFocusedNvHelper(fakr);
				break;
			case 40: //down
				specto_faker.selection.next(fakr);
				break;
			case 38: //up
				specto_faker.selection.previous(fakr);
				break;
			case 9: //tab
			case 16: //shift
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
			$(fakr).find(".drop-selection .drop-selection-item."+ specto_faker.config.selected_val_class).first().each(function(){
				is_found = true;
				if($(this).nextAll().filter(specto_faker.selection.filter_fn).length > 0) specto_faker.updateValue($(this).nextAll().filter(specto_faker.selection.filter_fn).first(), "noclick", {focus_nv: true});
				else {
					var prevs = $(this).prevAll().filter(specto_faker.selection.filter_fn);
					if(prevs.length > 0) specto_faker.updateValue(prevs.last(), "noclick", {focus_nv: true});
				}
			});
			if(!is_found) specto_faker.updateValue($(fakr).find(".drop-selection .drop-selection-item").filter(specto_faker.selection.filter_fn).first(), "noclick", {focus_nv: true});
		},
		previous: function(fakr){ //move to prevoius option
			var is_found = false;
			$(fakr).find(".drop-selection .drop-selection-item."+ specto_faker.config.selected_val_class).first().each(function(){
				is_found = true;
				if($(this).prevAll().filter(specto_faker.selection.filter_fn).length > 0) specto_faker.updateValue($(this).prevAll().filter(specto_faker.selection.filter_fn).first(), "noclick", {focus_nv: true});
				else {
					var nexts = $(this).nextAll().filter(specto_faker.selection.filter_fn);
					if(nexts.length > 0) specto_faker.updateValue(nexts.last(), "noclick", {focus_nv: true});
				}
			});
			if(!is_found) specto_faker.updateValue($(fakr).find(".drop-selection .drop-selection-item").filter(specto_faker.selection.filter_fn).last(), "noclick", {focus_nv: true});
		},
		tochar: function(fakr, ch){ //move to char
			var is_already = false;
			$(fakr).find(".drop-selection .drop-selection-item."+ specto_faker.config.selected_val_class).first().each(function(){
				if($(this).text().slice(0,1).toLowerCase() == ch) is_already = true;
			});
			
			if(is_already){ //not first time
				$(fakr).find(".drop-selection .drop-selection-item."+ specto_faker.config.selected_val_class).first().each(function(){
					var start_proper = $(this).nextAll().filter(function(){ return $(this).text().slice(0,1).toLowerCase() == ch && !$(this).hasClass(specto_faker.config.search_hidden); });
					if(start_proper.length < 1) is_already = false;
					else specto_faker.updateValue(start_proper.first(), "noclick", {focus_nv: true});
				});
			}
			else { //first time
				$(fakr).find(".drop-selection .drop-selection-item").filter(function(){ return $(this).text().slice(0,1).toLowerCase() == ch && !$(this).hasClass(specto_faker.config.search_hidden); }).first().each(function(){
					specto_faker.updateValue(this, "noclick", {focus_nv: true});
				});
			}
		},
	},
	makeFakerSearchable: function(fakr){
		if(specto_faker.isFakerSearchable(fakr)){
			
			var label = $(fakr).parents("label").length > 0 ? $(fakr).parents("label").first().attr("title") : "";
			var title = specto_faker.isFakerBrailleSupport(fakr) ? label +" combobox "+ specto_faker.getFakerUserValue(fakr) +" expanded has autocomplete. This combobox can be searchable by input and by using arrow keys" : "";
			$(fakr).find(".drop-value").append("<input autocomplete='both' type='text' name='faker-search' class='form-control' tabindex='-1' title='"+ title +"' />"); //prevent autocomplete on input
			$(fakr).find("input[name='faker-search']").each(function(){ 
				$(this).click(function(event){
					event.preventDefault();
					event.stopPropagation();
				});
				$(this).on("keydown", function (event){ //key events
				
					var key = event.keyCode || event.which;
					switch(key){
						case 9: //on tab click, close faker
							specto_faker.animateFaker($(this).parent().parent(), false, {dont_save_closed: true});
							break;
						default: break;
					}
				});
				$(this).focus();
				$(this).val(specto_faker.getFakerUserValue(fakr) || "")[0].setSelectionRange(0, 200);
			});
		}
	},
	removeFakerSearchable: function(fakr){
		if(specto_faker.isFakerSearchable(fakr)){
			$(fakr).find("input[name='faker-search']").each(function(){ $(this).remove(); });
			$(fakr).find(".drop-selection .drop-selection-item."+ specto_faker.config.search_hidden).each(function(){ $(this).removeClass(specto_faker.config.search_hidden); }); //remove searchable classes
		}
		//if(specto_faker.isFakerBrailleSupport(fakr)) specto_faker.brailleSpeach(fakr, "close");
	},
	filterBySearchInput: function(fakr){
		var srch_val = $(fakr).find("input[name='faker-search']").val();
		if(srch_val) srch_val = srch_val.toLowerCase();
		else if(typeof srch_val !== "string") return; //prevent error
		
		var cnt = 0;
		var first_found = false;
		var from_start = specto_faker.isFakerBrailleSupport(fakr) || specto_faker.isFakerSearchableFromStart(fakr);
		$(fakr).find(".drop-selection .drop-selection-item").each(function(){
			var search_pos = $(this).text().toLowerCase().search(srch_val);
			if((from_start && search_pos === 0) || (!from_start && search_pos > -1)) { //diff search from start or contains
				$(this).removeClass(specto_faker.config.search_hidden);
				cnt++;
				if(!first_found){
					first_found = true;
					if(specto_faker.isFakerBrailleSupport(fakr)){ //make first hit already selected and set by search
						var vl = $(this).text();
						$(fakr).find("input[name='faker-search']").val(vl)[0].setSelectionRange(srch_val.length, vl.length + 1);
						specto_faker.updateValue(this, "noclick");
					}
				}
			}
			else $(this).addClass(specto_faker.config.search_hidden);
		});
		
		if(cnt === 1 && $(fakr).hasClass(specto_faker.config.select_single)){ //select single option that was left from filtering
			$(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){ $(this).focus(); }); //for nvda helper first focus it (so that it will double open -> therefore close)
			$(fakr).find(".drop-selection .drop-selection-item:not(."+ specto_faker.config.search_hidden +")").each(function(){ //prevent error - first()
				specto_faker.updateValue(this, "noclick", {manual_close: true});
				specto_faker.brailleClosedFakerButFocusedNvHelper(fakr);
			});
		}
	},
	sortValues: function(fakr, ascending){
		
		var all = [];
		$(fakr).find(".drop-selection .drop-selection-item:not(."+ specto_faker.config.disabled_val_class +")").each(function(i){
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
		$.each(all, function(ind, item){ $(fakr).find(".drop-selection").append( $(fakr).find(".drop-selection .drop-selection-item:not(."+ specto_faker.config.disabled_val_class +")").eq(item.i).clone().addClass("tmp") ); });
		//delete old values
		$.each(all, function(ind, item){ $(fakr).find(".drop-selection .drop-selection-item:not(."+ specto_faker.config.disabled_val_class +"):not(.tmp)").each(function(){ $(this).remove(); }); });
		$(fakr).find(".drop-selection .drop-selection-item.tmp").each(function(){ $(this).removeClass("tmp"); });
		
		return true;
	},
	brailleSpeach: function(fakr, type, adding){
		
		switch(type){
			case "selection":
				var nv_title = specto_faker.brailleListText(fakr);
				
				if(specto_faker.hasFakerNvHelperInput(fakr)) $(fakr).find("."+ specto_faker.config.nv_helper_class).val(nv_title); //faker without select
				else $(document.activeElement).attr("title", nv_title);
				break;
			/* case "close":
				//if($(document.activeElement).prop("tagName") === "BODY") $(fakr).focus(); //reset focus on faker if closed
				$(document.activeElement).attr("title", "combobox "+ specto_faker.getFakerUserValue(fakr) +" collapsed"); */
				break;
		}
		
	},
	brailleListText: function(fakr){
		return specto_faker.getFakerUserValue(fakr) +" "+
			($(fakr).find(".drop-selection .drop-selection-item."+ specto_faker.config.selected_val_class).prevAll().filter(specto_faker.selection.filter_fn).length + 1) +
			" of " +
			$(fakr).find(".drop-selection .drop-selection-item").filter(specto_faker.selection.filter_fn).length;
	},
	brailleClosedFakerButFocusedNvHelper: function(fakr){ //hach to allow tab switching, but resets on blur
		$(fakr).find("."+ specto_faker.config.nv_helper_class).each(function(){
			$(this).attr("tabindex", "-1").blur(function(){
				$(this).off("blur").removeAttr("tabindex");
				$(this).parent().removeClass(specto_faker.config.focused_class);
			});
		});
	},
};

//jquery wrapper
(function( $ ){
	$.fn.specto_faker = function(settings) {
		return specto_faker.init($.extend(settings, {object_selector: this}));
	}; 
})( jQuery );