"use strict";
var specto_faker = {
    initiated: false,
    focus_click_exception: false,
    focus_click_exception_timeout: null,
    config: {
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
        search_debouce: 400, //input keyup delay in miliseconds
        
        /* METHODS - CALLBACKS */
        on_change: null, //callback function after value has changed //e.g. function(newVal, jsEvent){}
        on_init: null, //callback when faker(s) is(are) initiated //e.g. function(fakers){ }
        
        /* NON-VISUAL (BRAILLE) SUPPORT */
        braille_support: true, //does faker support braille speach - tested with NVDA - if set to true, key_events will be automatically turned on -->> example: https://a11y.nicolas-hoffmann.net/autocomplete-list/
        allow_form_reload: false, //do we allow parent form to reload on faker init. this is for plain forms firefox workaround (reset form for proper detection of required fields when ```<select>``` is moved)
        label_id: "", //id of label, to connect to aria controls
        listbox_label: "Custom label for listbox", //default value of listbox label, if label_id is not given
        is_required: false, //if select is not present, this will be used to know if faker is required. if select is present, this option will be taken from select's required atribute
    },
    memory: {},
    init: function(settings){
        //settings
        var fakr_settings = $.extend({}, specto_faker.config, (settings && typeof settings === "object" ? settings : {}));
        var faker_elms = [];
        if(!specto_faker.initiated) { //only first time update classes
            specto_faker.config.init_class = fakr_settings.init_class;
            specto_faker.config.open_class = fakr_settings.open_class; 
            specto_faker.config.anim_class = fakr_settings.anim_class; 
            specto_faker.config.focused_class = fakr_settings.focused_class; 
            specto_faker.config.selected_val_class = fakr_settings.selected_val_class; 
            specto_faker.config.disabled_val_class = fakr_settings.disabled_val_class; 
            specto_faker.config.key_events_class = fakr_settings.key_events_class; 
            specto_faker.config.searchable_class = fakr_settings.searchable_class; 
            specto_faker.config.searchable_from_start_class = fakr_settings.searchable_from_start_class; 
            specto_faker.config.select_single = fakr_settings.select_single; 
            specto_faker.config.braille_class = fakr_settings.braille_class;
            specto_faker.config.search_hidden = fakr_settings.search_hidden;
            specto_faker.config.count_selected = fakr_settings.count_selected; 
            specto_faker.config.count_disables = fakr_settings.count_disables;
            specto_faker.config.count_manual_val = fakr_settings.count_manual_val;
            specto_faker.config.search_debouce = fakr_settings.search_debouce;
        }
        //rewrites
        if(fakr_settings.braille_support) fakr_settings.key_events = true;

        
        //add clicks
        var any_select = false;
        var is_faker_selectable = fakr_settings.key_events;
        $(fakr_settings.object_selector).each(function(){
            //if this is select tag, build proper html
            var fakr_elm = specto_faker.getTargetelement(this);
            var has_select = false;
            var this_faker_required = fakr_settings.is_required;
            faker_elms.push(fakr_elm);
            
            //sorting of values
            if(fakr_settings.sortable) specto_faker.sortValues(fakr_elm, fakr_settings.sort_ascending);
            
            //faker classes
            if(fakr_settings.animated) fakr_elm.addClass(specto_faker.config.anim_class); //animated
            else fakr_elm.removeClass(specto_faker.config.anim_class);
            if(fakr_settings.braille_support) fakr_elm.addClass(specto_faker.config.braille_class); //braille support
            else fakr_elm.removeClass(specto_faker.config.braille_class);
            if(fakr_settings.key_events) fakr_elm.addClass(specto_faker.config.key_events_class); //key events
            else fakr_elm.removeClass(specto_faker.config.key_events_class);
            if(fakr_settings.searchable && fakr_settings.key_events) {
                fakr_elm.addClass(specto_faker.config.searchable_class); //searchable - only with both keyevents and searchable
                if(fakr_settings.search_single) fakr_elm.addClass(specto_faker.config.select_single); //searchable single
                if(fakr_settings.search_only_from_start) fakr_elm.addClass(specto_faker.config.searchable_from_start_class); //searchable from start
                specto_faker.init_functions.appendSearchInput(fakr_elm); //append search input
                specto_faker.makeTabIndex(fakr_elm[0], "-1");
                specto_faker.init_functions.makeFakerUnselectable(fakr_elm);
            }
            else {
                fakr_elm.removeClass(specto_faker.config.searchable_class);
                specto_faker.init_functions.removeSearchInput(fakr_elm); //remove search input if was searchable and isn't any more
                //drop value & handle clicks
                specto_faker.init_functions.dropValueClicks(fakr_elm);
                //selectable faker
                specto_faker.init_functions.makeFakerSelectable(fakr_elm);
                specto_faker.init_functions.removeSearchInput(fakr_elm);
            }
            fakr_elm.addClass(specto_faker.config.init_class);
            

            //dropdown clicks
            specto_faker.init_functions.fakerSelection(fakr_elm, fakr_settings.on_change);
            
            //parse select
            var parsed_select_elm = specto_faker.init_functions.parseSelect(fakr_elm, is_faker_selectable);
            any_select = parsed_select_elm.has_select || any_select;
            if(parsed_select_elm.has_select) this_faker_required = parsed_select_elm.is_required;
            
            //build aria
            if(fakr_settings.braille_support) specto_faker.buildAria(fakr_elm, fakr_settings, this_faker_required);
            
            //key events
            if(fakr_settings.key_events) fakr_elm.off("keyup").on("keyup", function (event){ specto_faker.keyEvents(this, event); });
            
            //if empty, update first value
            if(fakr_settings.set_on_start) specto_faker.init_functions.updateValueOnInit(fakr_elm);
            
        });
        //firefox workaround - reset form for proper detection of required fields
        if(fakr_settings.allow_form_reload && any_select) specto_faker.firefoxFormBugFox(fakr_elm);

        specto_faker.initiated = true;
        if(fakr_settings.on_init) fakr_settings.on_init(faker_elms); //init callback
        return faker_elms; //return all fakers
    },
    init_functions: {
        removeSearchInput: function(fakr){ specto_faker.getSearchInput(fakr).each(function(){ $(this).remove(); }); },
        appendSearchInput: function(fakr){
            specto_faker.init_functions.removeSearchInput(fakr); //remove old so that all settings and events are new
            
            var placeholder = "";
            $(fakr).find(".drop-selection-item[disabled]").first().each(function(){ placeholder = this.innerHTML; });
            $(fakr).find(".drop-value").append("<input autocomplete='off' type='text' name='faker-search' class='form-control' placeholder='"+ placeholder +"' />"); //prevent autocomplete on input
            specto_faker.getSearchInput(fakr).off("focus").on("focus", function(e){
                var fakr_js = specto_faker.returnFakerElementFromChild(this)[0];
                //specto_faker.makeTabIndex(fakr_js, "-1"); //enable shift+tab to go back
                if(!specto_faker.isFakerOpen(fakr_js)) specto_faker.animateFaker(fakr_js, "openme");
                $(this).off("blur").on("blur", function(){
                    var self = this;
                    setTimeout(function(){ //set timeout, so that document.activeElement updates properly (prevent bug if clicked on rel)
                        var fakr_js = specto_faker.returnFakerElementFromChild(self)[0];
                        //specto_faker.makeTabIndex(fakr_js); //restore original focusable element
                        if(document.activeElement !== fakr_js && !fakr_js.contains(document.activeElement)) specto_faker.closeFaker(fakr_js); //if blured outside of faker
                        $(self).off("blur");
                    }, 1);
                });
            }).on("click", function(e){
                setTimeout(function(){
                    if(document.activeElement === this){
                        var fakr_js = specto_faker.returnFakerElementFromChild(this)[0];
                        if(!specto_faker.isFakerOpen(fakr_js)) specto_faker.animateFaker(fakr_js, "openme");
                    }
                }, 1);
            });
        },
        removeSearchInput: function(fakr){ $(fakr).find(".drop-value input[name='faker-search']").each(function(){ $(this).remove(); }); },
        parseSelect: function(fakr, is_faker_selectable){
            var has_select = false;
            var is_required = false;
            fakr.find("select").each(function(){
                has_select = true;
                this.classList.remove("faker");
                if(is_faker_selectable) {
                    $(this).off("focus");
                    specto_faker.makeTabIndex(this, "-1"); //make unselectable
                }
                is_required = this.hasAttribute("required"); //rewrite settings for required
            });
            return {
                has_select: has_select,
                is_required: is_required,
            };
        },
        makeFakerSelectable: function(fakr){
            specto_faker.makeTabIndex(fakr[0]);
            fakr.off("focus").off("blur").on("focus", function(e){
                if(!specto_faker.isFakerOpen(this)) { //on focus only open closed fakers
                    specto_faker.preventFakerFocusClick();
                    specto_faker.animateFaker(this, "openme");
                }
            }).on("blur", function(){
                if(specto_faker.isFakerSearchable(this) && $(this).has(document.activeElement).length > 0) return; //exception
                specto_faker.closeFaker(this);
            });
        },
        makeFakerUnselectable: function(fakr){
            specto_faker.makeTabIndex(fakr[0], "-1");
            fakr.find(".drop-value, .drop-handle").each(function(){ 
                $(this).off("click").click(function(){
                    specto_faker.getSearchInput(this.parentNode).focus();
                });
            });
        },
        dropValueClicks: function(fakr){
            fakr.find(".drop-value, .drop-handle").each(function(){ 
                $(this).off("click").click(function(){
                    if(specto_faker.focus_click_exception) { //mousedown, focus, click: exception on first interaciton
                        specto_faker.focus_click_exception = false;
                        clearTimeout(specto_faker.focus_click_exception_timeout);
                        return;
                    }
                    specto_faker.toggleOpenState(specto_faker.returnFakerElementFromChild(this)[0]);
                });
            });
        },
        fakerSelection: function(fakr, after_change_fun){ //dropdown clicks
            fakr.find(".drop-selection").each(function(){
                $(this).off("click").on("click", ".drop-selection-item", function(e){
                    if(this.hasAttribute("disabled")) return; //prevent disabled options

                    specto_faker.updateValue(this, false, {return_focus: true}); //update faker value
                    if(after_change_fun) after_change_fun(specto_faker.getSelectionValue(this), e); //change function
                });
            });
            
            //register change functions
            if(after_change_fun) fakr.off("afterChange").on("afterChange", function(e){
                after_change_fun(specto_faker.getFakerValue(this), e);
            });
            else fakr.off("afterChange").on("afterChange", function(){});
        },
        updateValueOnInit: function(fakr){
            if(!fakr.find(".drop-value span").text()) { //has faker selected value?
                var selectedItem = fakr.find(".drop-selection-item[selected]");
                
                if(selectedItem.length) specto_faker.triggerChangeEventsAndUpdateValue(selectedItem.first(), "noclick");
                else specto_faker.triggerChangeEventsAndUpdateValue(fakr.find(".drop-selection-item").first(), "noclick");
            }
        },
    },
    triggerChangeEventsAndUpdateValue: function(rel_jquery, dimm_click, extra_settings){
        specto_faker.updateValue(rel_jquery, dimm_click, extra_settings);
        specto_faker.returnFakerElementFromChild(rel_jquery[0]).triggerHandler("afterChange");
        return true;
    },
    updateValue: function(rel, dimm_click, extra_settings){ //notice - this function doesn't call after change event
        var selectedItem = $(rel);
        if(selectedItem.length < 1) return; //prevent error
        extra_settings = extra_settings || {};
        var fakr_el = specto_faker.returnFakerElementFromChild(selectedItem[0]);
        var has_aria = specto_faker.isFakerBrailleSupport(fakr_el[0]);
        var is_searchable = specto_faker.isFakerSearchable(fakr_el[0]);
        
        if(extra_settings.return_focus) {
            if(is_searchable) specto_faker.getSearchInput(this.parentNode).focus();
            else fakr_el.focus();
        }
        //deselect currently selected value
        selectedItem.parent().find("."+ specto_faker.config.selected_val_class).each(function(){ 
            this.classList.remove(specto_faker.config.selected_val_class);
        });
        selectedItem.addClass(specto_faker.config.selected_val_class);
        //if(extra_settings.from_key) specto_faker.scrollIntoViewIfNeeded(selectedItem[0]); //scroll into view
        
        //update html value
        selectedItem.closest(".drop-selection").prevAll(".drop-value").attr("rel", selectedItem.attr("rel")).find("span").text(selectedItem.text()); 
        
        //aria
        if(has_aria) {
            var is_valid = selectedItem.attr("rel");
            if(is_searchable) {
                var selected_key = selectedItem.attr("rel");
                if(extra_settings.up_down) specto_faker.traverseFilteredSelection(fakr_el, selected_key);
                else specto_faker.removeActiveFilteredSelection(fakr_el);
                specto_faker.setFilteredActiveDescendant(fakr_el, selected_key);
                
                var searchInput = specto_faker.getSearchInput(fakr_el);
                if(searchInput.attr("aria-required") === "true") searchInput.attr("aria-invalid", is_valid ? "false" : "true");
            }
            else {
                fakr_el.attr("aria-activedescendant", selectedItem.attr("id"));
                if(fakr_el.attr("aria-required") === "true") fakr_el.attr("aria-invalid", is_valid ? "false" : "true");
            }
        }
        
        //if searchable, insert new value
        if(!extra_settings.leave_search_alone && is_searchable) {
            var val = specto_faker.getFakerUserValue(fakr_el);
            var can_be_selected =  specto_faker.isFakerOpen(fakr_el[0]) && dimm_click;
            specto_faker.searchInputSelectText(fakr_el, val, 0, !can_be_selected); //update value and select
        }
        
        //if there is select present, update it's value. And trigger change event
        var selects = selectedItem.closest(".drop-selection").prevAll("select");
        if(selects.length > 0) $(selects).val(specto_faker.getSelectionValue(selectedItem[0])).change();
        
        
        if(!dimm_click) specto_faker.toggleOpenState(fakr_el[0]);
        else if(extra_settings.manual_close) specto_faker.animateFaker(fakr_el[0], false, {dont_remove_focus: true});
    },
    setNoneValue: function(fakr_js){ //for now used only for aria searchable fakers
        var placeholder = fakr_js.querySelector(".drop-selection-item."+ specto_faker.config.disabled_val_class);
        if(placeholder) {
            specto_faker.triggerChangeEventsAndUpdateValue($(placeholder), "noclick");
            specto_faker.searchInputSelectText(fakr_js);
        }
        else {
            var selected = fakr_js.querySelector(".drop-selection-item."+ specto_faker.config.selected_val_class);
            if(selected) selected.classList.remove(specto_faker.config.selected_val_class);
        }
        
        fakr_js.querySelector(".drop-value").setAttribute("rel", "");
        var search_input = specto_faker.getSearchInput(fakr_js);
        search_input.attr("data-skip", "").attr("aria-activedescendant", "");
        if(search_input.attr("aria-required") === "true") search_input.attr("aria-invalid", "true");
        
        var selects = fakr_js.querySelector("select");
        if(selects) $(selects).val("").change();
    },
    firefoxFormBugFox: function(fakr){
        if(fakr.closest("form").length > 0){
            switch(document.readyState){
                case "complete":
                    fakr.closest("form")[0].reset();
                    break;
                default:
                    $(window).on("load", function(){ fakr.closest("form")[0].reset(); });
            }
        }
    },
    scrollIntoViewIfNeeded: function(target){
        /* var rect = target.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) target.scrollIntoView(false);
        if (rect.top < window.innerHeight) target.scrollIntoView(); */
        //todo buggy
    },
    getFakerValue: function(fakr){ return $(fakr).find(".drop-value").attr("rel"); }, //public function
    getFakerUserValue: function(fakr){ return $(fakr).find(".drop-value span").text().trim(); }, //public function
    updateFakerValue: function(fakr, val){ //public function
        var rel = $(fakr).find(".drop-selection .drop-selection-item[rel='"+ val +"']");
        if(rel.length < 1) return false; //not found
        specto_faker.triggerChangeEventsAndUpdateValue(rel, "dont open");
        return true;
    },
    getSelectionValue: function(sel_item){ return sel_item.getAttribute("rel"); },
    preventFakerFocusClick: function(){
        if(specto_faker.focus_click_exception) clearTimeout(specto_faker.focus_click_exception_timeout);
        specto_faker.focus_click_exception = true;
        specto_faker.focus_click_exception_timeout = setTimeout(function(){
            specto_faker.focus_click_exception = false;
        }, 200);
    },
    isFakerOpen: function(fakr_js){ return fakr_js.classList.contains(specto_faker.config.open_class); },
    isFakerAnimated: function(fakr_js){ return fakr_js.classList.contains(specto_faker.config.anim_class); },
    isFakerSearchable: function(fakr_js){ return fakr_js.classList.contains(specto_faker.config.searchable_class); },
    isFakerSearchableFromStart: function(fakr_js){ return fakr_js.classList.contains(specto_faker.config.searchable_from_start_class); },
    isFakerBrailleSupport: function(fakr_js){ return fakr_js.classList.contains(specto_faker.config.braille_class); },
    returnFakerElementFromChild: function(child_js){ return $(child_js.closest("."+ specto_faker.config.init_class)); },
    makeTabIndex: function(elm, index){ elm.setAttribute("tabindex", index || "0"); },
    removeTabIndex: function(elm){ elm.removeAttribute("tabindex"); }, //not used anywhere yet
    animateFaker: function(fakr_js, openme, extra_settings){
        extra_settings = extra_settings || {};
        
        var is_searchable = specto_faker.isFakerSearchable(fakr_js);
        if(openme) {
            if(fakr_js.classList.contains(specto_faker.config.open_class)) return;
            
            fakr_js.classList.add(specto_faker.config.open_class);
            fakr_js.classList.add(specto_faker.config.focused_class);
            if(specto_faker.isFakerAnimated(fakr_js)) specto_faker.calcDropSelectionHeight(fakr_js, openme);
            if(specto_faker.isFakerBrailleSupport(fakr_js)) {
                var current = fakr_js.querySelector(".drop-selection-item."+ specto_faker.config.selected_val_class);
                if(is_searchable) {
                    var filtered_list_id = specto_faker.getFilteredAriaListbox(fakr_js).attr("id");
                    specto_faker.getSearchInput(fakr_js).each(function(){
                        //this.setAttribute("aria-controls", specto_faker.getFilteredAriaListbox(fakr_js).attr("id"));
                        this.setAttribute("aria-expanded", "true");
                        var selected_option = specto_faker.getFilteredAriaListbox(fakr_js).find("[rel='"+ specto_faker.getFakerValue(fakr_js) +"']");
                        this.setAttribute("aria-activedescendant", selected_option ? selected_option.attr("id") : "");
                    });
                }
                else {
                    fakr_js.setAttribute("aria-controls", fakr_js.querySelector(".drop-selection").getAttribute("id"));
                    fakr_js.setAttribute("aria-expanded", "true");
                    var selected_option = fakr_js.querySelector("[rel='"+ specto_faker.getFakerValue(fakr_js) +"']");
                    fakr_js.setAttribute("aria-activedescendant", selected_option ? selected_option.getAttribute("id") : "");
                }
            }
            if(is_searchable) {
                if(!extra_settings.dont_select) specto_faker.searchInputSelectText(fakr_js); //searchable faker select inserted value
                specto_faker.getSearchInput(fakr_js).focus(); //focus search input
            }
        }
        else {
            if(!fakr_js.classList.contains(specto_faker.config.open_class)) return;
            
            if(is_searchable) specto_faker.removeFakerSearchable(fakr_js, extra_settings.dont_remove_focus); //searchable faker - first operation so that faker isn't yet closed
            fakr_js.classList.remove(specto_faker.config.open_class);
            if(specto_faker.isFakerAnimated(fakr_js)) specto_faker.calcDropSelectionHeight(fakr_js, openme);
            if(!extra_settings.dont_remove_focus) fakr_js.classList.remove(specto_faker.config.focused_class);
            if(specto_faker.isFakerBrailleSupport(fakr_js)) {
                if(is_searchable) {
                    specto_faker.getSearchInput(fakr_js).each(function(){
                        //this.setAttribute("aria-controls", "");
                        this.setAttribute("aria-expanded", "false");
                        this.setAttribute("aria-activedescendant", "");
                    });
                }
                else {
                    fakr_js.setAttribute("aria-controls", "");
                    fakr_js.setAttribute("aria-expanded", "false");
                    fakr_js.setAttribute("aria-activedescendant", "");
                }
            }
        }
    },
    toggleOpenState: function(fakr_js){
        if(specto_faker.isFakerOpen(fakr_js)) specto_faker.closeFaker(fakr_js);
        else specto_faker.animateFaker(fakr_js, "openme");
    },
    closeFaker: function(fakr_js){ specto_faker.animateFaker(fakr_js); },
    calcDropSelectionHeight: function(fakr_js, isOpening){
        if(isOpening) {
            var selection = fakr_js.querySelector(".drop-selection");
            //hide to calculate proper height + set initial height for animation
            selection.style.visibility = "hidden";
            selection.style.opacity = "1";
            selection.style.height = "0px";
            
            var finder_css = ".drop-selection-item" +
                (specto_faker.config.count_selected ? ":not(."+ specto_faker.config.selected_val_class +")" : "") +
                (specto_faker.config.count_disables ? ":not(."+ specto_faker.config.disabled_val_class +")" : "");
            var nr_elements = parseInt(specto_faker.config.count_manual_val) > 0 ?
                parseInt(specto_faker.config.count_manual_val) : selection.querySelectorAll(finder_css).length;
                
            selection.style.visibility = "visible";
            selection.style.height = ($(selection.querySelector(".drop-selection-item")).outerHeight() * nr_elements) +"px";
        }
        else fakr_js.querySelector(".drop-selection").style.height = "0px";
    },
    /* inacitveFakersRemoveFocus: function(){
        $('.'+ specto_faker.config.init_class +'.'+ specto_faker.config.focused_class +':not(.'+ specto_faker.config.open_class +')').each(function(){
            this.classList.remove(specto_faker.config.focused_class);
        });
    }, */
    getTargetelement: function(that){ //if this is select tag, build proper html
        var elem = $(that);
        if(elem.prop("tagName") === "SELECT"){
            if(elem.parent().hasClass(specto_faker.config.init_class)) return elem.parent(); //if select is already parsed, return faker elm
            
            var placeholder = elem.attr("placeholder");
            var fakr_html = $("<div class='faker'><div class='drop-value'><span></span></div><div class='drop-handle'>&nbsp;</div><div class='drop-selection'></div></div>");
            //fill options
            elem.find("option").each(function(){
                var display = $(this).text();
                var is_sel = typeof $(this).attr("selected") === "string";
                if(is_sel) placeholder = ""; //prevent placeholder if any option is selected
                $(fakr_html).find(".drop-selection").append("<div class='drop-selection-item "+ (typeof $(this).attr("disabled") === "string" ? specto_faker.config.disabled_val_class +"' disabled='disabled" : "") +"' rel='"+ ($(this).attr("value") || display) +"'"+ (is_sel ? " selected='selected'" : "") +">"+display+"</div>");
            });
            $(fakr_html).prepend(elem.clone(true)); //append original select
            if(placeholder) {
                $(fakr_html).find(".drop-value span").text(placeholder);
                $(fakr_html).find(".drop-selection").prepend(specto_faker.placeholderDivHtml(placeholder)); //placeholder - add disabled value
                if($(fakr_html).find("option[value='']").length < 1) $(fakr_html).find("select").prepend("<option value='' selected='selected' disabled='disabled'>placeholder</option>"); //also append option with empty value to select (FF requirement)
            }
            elem.after(fakr_html);
            var final_target = elem.next();
            elem.remove();
            return final_target;
        }
        else return elem;
    },
    placeholderDivHtml: function(val){ return "<div rel='' disabled='disabled' class='drop-selection-item "+ specto_faker.config.disabled_val_class +"'>"+ val +"</div>"; },
    updateOptions: function(fakr, new_options, rel_name, name_name, settings){
        
        $(fakr).each(function(){
            var element = $(this);
            element.find(".drop-value span").each(function(){ this.innerHTML = ""; });
            
            var select_placeholder = "";
            
            element.find("select").each(function(){ //fill select, if present (and retreive placeholder)
                select_placeholder = this.getAttribute("placeholder") || "";
                $(this).empty();
                var ins = "";
                $.each(new_options, function(ind, item){
                    ins += "<option value='"+ item[rel_name || "rel"] +"'>"+ item[name_name || "name"] +"</option>";
                });
                $(this).html(ins);
            });
            
            element.find(".drop-selection").each(function(){ 
                this.innerHTML = "";
                var ins = $("<div></div>");
                var placeholder_in_data = {};
                $.each(new_options, function(ind, item){
                    if(item.is_placeholder) placeholder_in_data = item;
                    else ins.append("<div class='drop-selection-item' rel='"+ item[rel_name || "rel"] +"' "+ (item.is_default ? "selected" : "") +">"+ item[name_name || "name"] +"</div>");
                });
                
                if(placeholder_in_data[name_name] || select_placeholder){ //placeholder
                    ins.find(".drop-selection-item[selected]").each(function(){ this.removeAttribute("selected"); }); //remove any selected to prevent error
                    //add placeholder
                    if(placeholder_in_data[name_name]) ins.prepend(specto_faker.placeholderDivHtml(placeholder_in_data[name_name]));
                    else if(select_placeholder) ins.prepend(specto_faker.placeholderDivHtml(select_placeholder));
                }
                
                this.innerHTML = ins.html();
            });
            
            element.specto_faker(settings); //init 
        });
    },
    keyEvents: function(fakr_js, e){

        var key = e.keyCode || e.which;
        switch(key){
            case 13: //enter - close faker
                if(!specto_faker.isFakerOpen(fakr_js)) specto_faker.animateFaker(fakr_js, true);
                else specto_faker.animateFaker(fakr_js, false, {dont_remove_focus: true});
                break;
            case 27: //escape - close faker
                specto_faker.animateFaker(fakr_js, false, {dont_remove_focus: true});
                break;
            case 40: //down
                e.preventDefault(); e.stopPropagation(); //prevent moving of scrollbar
                if(specto_faker.isFakerOpen(fakr_js)) specto_faker.selection.next(fakr_js);
                break;
            case 38: //up
                e.preventDefault(); e.stopPropagation(); //prevent moving of scrollbar
                if(specto_faker.isFakerOpen(fakr_js)) specto_faker.selection.previous(fakr_js);
                break;
            case 9: //tab
            case 16: //shift
                break;
            default:
                var ch = String.fromCharCode(key);
                if(key === 8 || key === 46 || specto_faker.isCharAplhanumeric(ch)){ //backspace, delete or alphanumeric
                    if(!specto_faker.isFakerOpen(fakr_js)) specto_faker.animateFaker(fakr_js, true, {dont_select: true}); //open if closed
                    
                    if(!specto_faker.isFakerSearchable(fakr_js)) specto_faker.selection.tochar(fakr_js, ch.toLowerCase());
                    else specto_faker.filterBySearchInput(fakr_js, key);
                }
                break;
        }
    },
    timoutKeyEvent: null,
    isCharAplhanumeric: function(character){
        return character.search(/[a-zA-Z0-9 `\.\-\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/) > -1;
    },
    selection: {
        filter_fn: function(){ return !this.classList.contains(specto_faker.config.disabled_val_class) && !this.classList.contains(specto_faker.config.search_hidden); },
        next: function(fakr_js){ //move to next option
            var selected = fakr_js.querySelector(".drop-selection-item."+ specto_faker.config.selected_val_class);
            if(selected) {
                var sel = $(selected);
                var nextEl = sel.nextAll().filter(specto_faker.selection.filter_fn).first();
                if(nextEl.length > 0) specto_faker.triggerChangeEventsAndUpdateValue(nextEl, "noclick", {from_key: true, up_down: true});
                else {
                    var prevs = sel.prevAll().filter(specto_faker.selection.filter_fn).last();
                    if(prevs.length > 0) specto_faker.triggerChangeEventsAndUpdateValue(prevs, "noclick", {from_key: true, up_down: true});
                }
            }
            else specto_faker.triggerChangeEventsAndUpdateValue($(fakr_js).find(".drop-selection-item").filter(specto_faker.selection.filter_fn).first(), "noclick", {from_key: true, up_down: true});
        },
        previous: function(fakr_js){ //move to prevoius option
            var selected = fakr_js.querySelector(".drop-selection-item."+ specto_faker.config.selected_val_class);
            if(selected) {
                var sel = $(selected);
                var prevEl = sel.prevAll().filter(specto_faker.selection.filter_fn).first();
                if(prevEl.length > 0) specto_faker.triggerChangeEventsAndUpdateValue(prevEl, "noclick", {from_key: true, up_down: true});
                else {
                    var nexts = sel.nextAll().filter(specto_faker.selection.filter_fn);
                    if(nexts.length > 0) specto_faker.triggerChangeEventsAndUpdateValue(nexts.last(), "noclick", {from_key: true, up_down: true});
                }
            }
            else specto_faker.triggerChangeEventsAndUpdateValue($(fakr_js).find(".drop-selection-item").filter(specto_faker.selection.filter_fn).last(), "noclick", {from_key: true, up_down: true});
        },
        tochar: function(fakr_js, ch){ //move to char
            var is_already = false;
            var selected = fakr_js.querySelector(".drop-selection-item."+ specto_faker.config.selected_val_class);
            if(selected) {
                if(selected.innerHTML.slice(0,1).toLowerCase() == ch) is_already = true;
            }
            
            if(is_already){ //not first time
                var start_proper = $(selected).nextAll().filter(function(){ return this.innerHTML.slice(0,1).toLowerCase() == ch && !this.classList.contains(specto_faker.config.search_hidden); }).first();
                if(start_proper.length < 1) is_already = false;
                else specto_faker.triggerChangeEventsAndUpdateValue(start_proper, "noclick", {from_key: true});
            }
            
            if(!is_already) { //first time - or no more matching elements, so start again from beginning
                $(fakr_js).find(".drop-selection-item").filter(function(){ return this.innerHTML.slice(0,1).toLowerCase() == ch && !this.classList.contains(specto_faker.config.search_hidden); }).first().each(function(){
                    specto_faker.triggerChangeEventsAndUpdateValue($(this), "noclick", {from_key: true});
                });
            }
        },
    },
    getSearchInput: function(fakr_random){ return $(fakr_random).find(".drop-value input[name='faker-search']"); },
    removeFakerSearchable: function(fakr_js, dont_remove_focus){
        //remove searchable classes
        fakr_js.querySelectorAll(".drop-selection-item."+ specto_faker.config.search_hidden).forEach(function(item){
            item.classList.remove(specto_faker.config.search_hidden);
        });
        
        if(dont_remove_focus) fakr_js.querySelector(".drop-value input[name='faker-search']").focus();
    },
    searchInputSelectText: function(fakr_random, newVal, skip, skipSelection){
        var srch_input = specto_faker.getSearchInput(fakr_random);
        if(typeof newVal !== "string") newVal = srch_input[0].value;
        else {
            srch_input[0].value = newVal;
        }
        if(!skipSelection) {
            srch_input[0].setSelectionRange(skip || 0, newVal.length + 1);
            specto_faker.setSearchSkipAttribute(srch_input[0], newVal.substr(0, skip || newVal.length)); //mark which text was acctually entered
        }
        else specto_faker.setSearchSkipAttribute(srch_input[0], newVal);
    },
    filterBySearchInput: function(fakr_js, pressed_key_code){
        var fakr = $(fakr_js);
        var has_aria = specto_faker.isFakerBrailleSupport(fakr_js);
        var filtered_values = [];
        var srch_input = specto_faker.getSearchInput(fakr);
        var srch_val = srch_input.val();
        if(srch_val === srch_input.attr("data-skip")) return; //prevent editing if no change
        
        if(srch_val) srch_val = srch_val.toLowerCase();
        else if(typeof srch_val !== "string") return; //prevent error
        
        var cnt = 0;
        var first_found = null;
        
        //if has aria, values are stored in memory
        if (has_aria) {
            var memory_id = specto_faker.parseIdPrefix(fakr_js.getAttribute("id"));
            specto_faker.memory[memory_id].forEach(function(item){
                var search_pos = item.val.toLowerCase().search(srch_val);
                if(search_pos === 0) {
                    filtered_values.push(item);
                    fakr_js.querySelector(".drop-selection-item[rel='"+ item.key +"']").classList.remove(specto_faker.config.search_hidden);
                    cnt++;
                    if(!first_found) first_found = fakr_js.querySelector(".drop-selection-item[rel='"+ item.key +"']");
                }
                else fakr_js.querySelector(".drop-selection-item[rel='"+ item.key +"']").classList.add(specto_faker.config.search_hidden);
            });
        }
        else fakr.find(".drop-selection-item").each(function(){
            var search_pos = this.innerHTML.toLowerCase().search(srch_val);
            var from_start = specto_faker.isFakerSearchableFromStart(fakr_js);
            if((from_start && search_pos === 0) || (!from_start && search_pos > -1)) { //diff search from start or contains
                this.classList.remove(specto_faker.config.search_hidden);
                cnt++;
                if(!first_found) first_found = this;
            }
            else this.classList.add(specto_faker.config.search_hidden);
        });

        if(specto_faker.timoutKeyEvent) clearTimeout(specto_faker.timoutKeyEvent);
        if(cnt === 1 && fakr.hasClass(specto_faker.config.select_single)){ //select single option that was left from filtering
            specto_faker.timoutKeyEvent = setTimeout(function(){ //debounce filtering
                specto_faker.triggerChangeEventsAndUpdateValue($(first_found), "noclick", {manual_close: true});
            }, specto_faker.config.search_debouce);
        }
        else if (has_aria) {
            if(cnt){ //if there is an element to select
                specto_faker.timoutKeyEvent = setTimeout(function(){ //debounce filtering            
                    if(pressed_key_code !== 8 && pressed_key_code !== 46) { //don't meddle with search input if deleting
                        specto_faker.searchInputSelectText(fakr, first_found.innerHTML, srch_val.length);
                    }
                    else specto_faker.setSearchSkipAttribute(srch_input[0], srch_val);
                    specto_faker.triggerChangeEventsAndUpdateValue($(first_found), "noclick", {leave_search_alone: true});
                    specto_faker.ariaFilteredList(fakr, filtered_values, first_found.getAttribute("rel")); //make new aria list 
                }, specto_faker.config.search_debouce);
            }
            else {
                specto_faker.setNoneValue(fakr_js);
                specto_faker.clearAriaFilteredList(fakr);
                //show all unfiltered values
                fakr_js.querySelectorAll('.drop-selection-item.'+ specto_faker.config.search_hidden).forEach(function(item){
                    item.classList.remove(specto_faker.config.search_hidden);
                });
            }
        }
    },
    setSearchSkipAttribute: function(search_input_js, val){ search_input_js.setAttribute("data-skip", val); },
    sortValues: function(fakr, ascending){
        
        var all = [];
        $(fakr).find(".drop-selection-item:not(."+ specto_faker.config.disabled_val_class +")").each(function(i){
            all.push({
                rel: this.getAttribute("rel"),
                val: this.innerHTML,
                i: i
            });
        });

        //sort
        all.sort(function(a,b){
            return a.val.localeCompare(b.val) * (ascending ? 1 : -1);
        });
        //create new html
        $.each(all, function(ind, item){ $(fakr).find(".drop-selection").append( $(fakr).find(".drop-selection-item:not(."+ specto_faker.config.disabled_val_class +")").eq(item.i).clone().addClass("tmp") ); });
        //delete old values
        $.each(all, function(ind, item){ $(fakr).find(".drop-selection-item:not(."+ specto_faker.config.disabled_val_class +"):not(.tmp)").each(function(){ $(this).remove(); }); });
        $(fakr).find(".drop-selection-item.tmp").each(function(){ this.classList.remove("tmp"); });
        
        return true;
    },
    /* ARIA */
    buildAria: function(fakr, settings, this_faker_required){
        var newId = specto_faker.makeUniqueIds();
        var allValues = [];
        
        fakr.attr("id", newId.combobox)
            .find(".drop-value span").attr("id", newId.labelby);
        fakr.find(".drop-selection-item").each(function(ii){
            if(!settings.searchable) this.setAttribute("role", "option");
            this.setAttribute("id", newId.listbox +"-"+ ii);
            allValues.push({
                key: this.getAttribute("rel"),
                val: this.innerHTML
            });
        });
        specto_faker.memory[newId.nr] = allValues; //save to memory
        
        
        //if searchable, connect aria control to input
        if(settings.searchable) specto_faker.getSearchInput(fakr).each(function(){
            var helper_listbox = specto_faker.getFilteredAriaListbox(fakr);
            if(helper_listbox.length < 1){
                fakr.append("<ul class='filtered-listbox' role='listbox' id='"+ newId.filtered_listbox +"' tabindex='-1'></ul>");
            }
            else helper_listbox.attr("id", newId.filtered_listbox);
            
            this.setAttribute("id", newId.search);
            this.setAttribute("role", "combobox");
            this.setAttribute("aria-haspopup", "listbox");
            this.setAttribute("aria-required", this_faker_required ? "true" : "false")
            this.setAttribute("aria-autocomplete", "both");
            this.setAttribute("aria-activedescendant", "");
            this.setAttribute("aria-expanded", "false");
            this.setAttribute("aria-controls", newId.filtered_listbox);
            if(settings.label_id) {
                this.setAttribute("aria-labelledby", settings.label_id);
                this.removeAttribute("aria-label");
            }
            else {
                this.setAttribute("aria-label", settings.listbox_label);
                this.removeAttribute("aria-labelledby");
            }
            
            specto_faker.buildFilteredAriaHelper(fakr);
            specto_faker.setFilteredActiveDescendant(fakr);
        });
        else {
            fakr.attr("role", "combobox")
                .attr("aria-haspopup", "listbox")
                .attr("aria-required", this_faker_required ? "true" : "false")
                .attr("aria-controls", "")
                .attr("aria-describedby", newId.labelby)
                .attr("aria-autocomplete", "list")
                .attr("aria-expanded", "false")
                .attr("aria-activedescendant", "");
                
            if(settings.label_id) fakr.attr("aria-labelledby", settings.label_id).removeAttr("aria-label");
            else fakr.attr("aria-label", settings.listbox_label).removeAttr("aria-labelledby");
            
            fakr.find(".drop-selection").each(function(){
                this.setAttribute("role", "listbox");
                this.setAttribute("id", newId.listbox);
            });
        }
    },
    rebuildMemory: function(fakr_random){ //public function
        var fakr = $(fakr_random);
        if(specto_faker.isFakerBrailleSupport(fakr[0])) {
            var allValues = [];
            var id = fakr.attr("id").replace(/\-combobox/, "");
            fakr.find(".drop-selection-item").each(function(ii){
                allValues.push({
                    key: this.getAttribute("rel"),
                    val: this.innerHTML
                });
            });
            specto_faker.memory[id] = allValues; //save to memory
        }
    },
    buildFilteredAriaHelper: function(fakr){
        var htm = "";
        var unique_id = specto_faker.parseIdPrefix(fakr.attr("id"));
        var this_id = specto_faker.ariaFilteredListPrefix(unique_id);
        
        specto_faker.memory[unique_id].forEach(function(item, ind){ //undefined error shouldn't happen
            htm += "<li role='option' id='"+ (this_id + ind) +"' rel='"+ item.key +"'>"+ item.val +"</li>";
        });
        specto_faker.getFilteredAriaListbox(fakr).empty().append(htm);
    },
    makeUniqueIds: function(){
        var ii = 0, isUnique = false, ids = {combobox: "", listbox: "", filtered_listbox: "", labelby: ""};
        var prefix = "spfa";
        do {
            ii++;
            ids.nr = prefix + ii;
            ids.combobox = prefix + ii +"-combobox";
            ids.listbox = prefix + ii +"-listbox";
            ids.labelby = prefix + ii +"-labelby";
            ids.search = prefix + ii +"-search";
            ids.filtered_listbox = prefix + ii +"-listboxF";
            isUnique = document.getElementById(ids.combobox) || document.getElementById(ids.listbox) || document.getElementById(ids.filtered_listbox) ? false : true;
        } while (!isUnique)
        return ids;
    },
    parseIdPrefix: function(id){ return id.replace(/\-.+$/g, ""); },
    getFilteredAriaListbox: function(fakr_random){ return $(fakr_random).find(".filtered-listbox"); },
    ariaFilteredList: function(fakr, filtered_values, selected_val){
        var htm = "";
        var this_id = specto_faker.ariaFilteredListPrefix($(fakr).attr("id"));
        var selected_id = "";
        filtered_values.forEach(function(item, ind){
            var option_id = this_id + ind;
            if(item.key === selected_val) {
                selected_id = option_id;
            }
            htm += "<li role='option' id='"+ option_id +"' rel='"+ item.key +"'>"+ item.val +"</li>";
        });
        
        specto_faker.getFilteredAriaListbox(fakr).empty().append(htm);
        specto_faker.getSearchInput(fakr).attr("aria-activedescendant", selected_id);
    },
    ariaFilteredListPrefix: function(id_name){ return id_name +"-filtered-"; },
    //TODO test
    clearAriaFilteredList: function(fakr){    
        specto_faker.buildFilteredAriaHelper(fakr);
    },
    setFilteredActiveDescendant: function(fakr, newVal){
        specto_faker.getSearchInput(fakr).attr(
            "aria-activedescendant",
            specto_faker.getFilteredAriaListbox(fakr).find("[rel='"+ (newVal ? newVal : specto_faker.getFakerValue(fakr)) +"']").attr("id")
        );
    },
    traverseFilteredSelection: function(fakr, selectedKey){
        specto_faker.getFilteredAriaListbox(fakr).find("li").each(function(){
            this.setAttribute("aria-selected", this.getAttribute("rel") === selectedKey ? "true" : false);
        });
    },
    removeActiveFilteredSelection: function(fakr_random){
        specto_faker.getFilteredAriaListbox(fakr_random).find("li").each(function(){
            this.removeAttribute("aria-selected");
        }); 
    },
};

//jquery wrapper
(function( $ ){
    $.fn.specto_faker = function(settings) {
        return specto_faker.init($.extend(settings, {object_selector: this}));
    }; 
})( jQuery );