var specto_faker = {
	initiated: false,
	config: {
		object_selector: ".faker", //element(s) - works only if called through "specto_faker.init()"
		open_class: "open", //class for opened faker
		init_class: "faker-init", //class for initiated faker
		anim_class: "faker-animated", //class for animated faker
		focused_class: "faker-focused", //class for focused faker
		anim_progress_class: "faker-animating", //class while animation in progress
		selected_val_class: "active", //class of selected option - default css has display:none
		disabled_val_class: "rel-disabled", //class of disabled option - default css has opacity:0.5 and cursor:not-allowed
		animated: false, //is faker animated
		animation_speed: 400,
		count_selected: false, //valid only for animated faker, are selected_val_class counted for animation
		count_disables: true, //valid only for animated faker, are disabled_val_class counted for animation
		on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){}
		/* if you use before_change function you must return a value which correlates to boolean 'true', otherwise change is prevented */
		before_change: function(newVal, jsEvent){ return newVal; }, //callback function before value has changed - by default it prevents clicks on elements without value or 0
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
			specto_faker.config.focused_class = fakr_settings.focused_class; 
			specto_faker.config.anim_progress_class = fakr_settings.anim_progress_class; 
			specto_faker.config.selected_val_class = fakr_settings.selected_val_class; 
			specto_faker.config.disabled_val_class = fakr_settings.disabled_val_class; 
			specto_faker.config.count_selected = fakr_settings.count_selected; 
			specto_faker.config.count_disables = fakr_settings.count_disables; 
		}
		
		//add clicks
		$(fakr_settings.object_selector).each(function(){
			//if this is select tag, build proper html
			var fakr_elm = specto_faker.getTargetelement(this);
			faker_elms.push(fakr_elm);
			
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
						$(this).parent().addClass(specto_faker.config.focused_class);
					}).blur(function(){
						$(this).parent().removeClass(specto_faker.config.focused_class);
					});
				});
			}
			//key events
			//specto_faker.keyEvents(fakr_elm);
			//faker settings
			if(fakr_settings.animated) $(fakr_elm).addClass(specto_faker.config.anim_class);
			$(fakr_elm).addClass(specto_faker.config.init_class);
		});
		
		//document clicks - outside of opened fakers, close those fakers
		if(!specto_faker.initiated) $(document).mouseup(function (e){
			$('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.open_class).each(function(){
				if (!$(this).is(e.target) && $(this).has(e.target).length === 0) { 
					specto_faker.animateFaker(this);
				}
			});
		});
		
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
		var v = $(rel).parent().prevAll(".drop-value").text($(rel).text()).attr("rel", $(rel).attr("rel")); 
		if(!dimm_click) v.trigger("click");
	},
	getFakerValue: function(fakr){ return $(fakr).find(".drop-value").attr("rel"); },
	getSelectionValue: function(sel_item){ return $(sel_item).attr("rel"); },
	isFakerOpen: function(fakr){ return $(fakr).hasClass(specto_faker.config.open_class); },
	isFakerAnimated: function(fakr){ return $(fakr).hasClass(specto_faker.config.anim_class); },
	animateFaker: function(fakr, openme){
		//animated
		if(specto_faker.isFakerAnimated(fakr)){ 
			if($(fakr).hasClass(specto_faker.config.anim_progress_class)) return;
			else $(fakr).addClass(specto_faker.config.anim_progress_class);
		
			if(openme){
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
			if(openme) $(fakr).addClass(specto_faker.config.open_class);
			else $(fakr).removeClass(specto_faker.config.open_class);
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
	keyEvents: function(fakr){
		
		$(fakr).each(function(){
			$(this).on("keyup", function(event){
				if(!specto_faker.isFakerOpen(this)) return; //prevent if faker is closed
				var key = event.keyCode || event.which;
				console.log(key);
				switch(key){
					case 13: //enter
						$(this).find(".drop-value").trigger("click");
						break;
					case 40: //down
						specto_faker.selection.next(this);
						break;
					case 38: //up
						specto_faker.selection.previous(this);
						break;
					default: 
						var ch = String.fromCharCode(key);
						if(ch.search(/[a-zA-Z0-9\.\-]/) > -1){
							specto_faker.selection.tochar(this, ch);
						}
						break;
				}
				
			});
		});
	},
	unbindKeyEvents: function(fakr){
		$(fakr).each(function(){
			$(this).off("keyup");
		});
	},
	selection: {
		filter_fn: function(){ return !$(this).hasClass(specto_faker.config.disabled_val_class); },
		next: function(fakr){ //move to next option
			$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
				if($(this).nextAll().filter(specto_faker.selection.filter_fn).length > 0) specto_faker.updateValue($(this).nextAll().filter(specto_faker.selection.filter_fn).first(), "noclick");
				else {
					var prevs = $(this).prevAll().filter(specto_faker.selection.filter_fn);
					if(prevs.length > 0) specto_faker.updateValue(prevs.last(), "noclick");
				}
			});
		},
		previous: function(fakr){ //move to prevoiu option
			$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
				if($(this).prevAll().filter(specto_faker.selection.filter_fn).length > 0) specto_faker.updateValue($(this).prevAll().filter(specto_faker.selection.filter_fn).first(), "noclick");
				else {
					var nexts = $(this).nextAll().filter(specto_faker.selection.filter_fn);
					if(nexts.length > 0) specto_faker.updateValue(nexts.last(), "noclick");
				}
			});
		},
		tochar: function(fakr, ch){ //move to char
			var is_already = false;
			$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
				if($(this).text().slice(0,1) == ch) is_already = true;
			});
			
			if(is_already){ //not first time
				$(fakr).find(".drop-selection div."+ specto_faker.config.selected_val_class).first().each(function(){
					var start_proper = $(this).nextAll().filter(function(){ return $(this).text() == ch; });
					if(start_proper.length < 1) is_already = false;
					else specto_faker.updateValue(start_proper.first(), "noclick");
				});
			}
			
			if(!is_already) { //first time
				$(fakr).find(".drop-selection div").filter(function(){ return $(this).text() == ch; }).first().each(function(){
					specto_faker.updateValue(this, "noclick");
				});
			}
		},
	},
};

//jquery wrapper
(function( $ ){
	$.fn.specto_faker = function(settings) {
		return specto_faker.init($.extend(settings, {object_selector: this}));
	}; 
})( jQuery );