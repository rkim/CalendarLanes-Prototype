/*
 * Front Desk Scheduler
 *
 * Copyright (c) 2013 Front Desk, Inc.
 *
 */
 
 
;(function($){

/**
 *
 * TODO :: rkim :: 31-May-2013
 *
 * A long and useful commemnt on how all this works
 *
 * ---
 *
 * Though I'd like to make all this fairly generic,
 * time constraints demand I bake-in dependencies on
 * certain CSS classes and so forth. Oh well.
 *
 */
	
	var DEFAULTS = {
		horizLayout: true,
		gridHoverOn: true,
		drawEvents: false,
		hardwareAcceleration: true,

		timeStart: 6,
		timeEnd: 20,
	};
	var SETTINGS = "fdScheduler-Settings";


	// Render the grid
	var renderCalendarGrid = function($this, settings) {
		
	};











	// Initialize Scheduler 
	var initializeScheduler = function(options) {
		this.addClass('fdScheduler-enabled').each(function() {

			var $this = $(this);

			// Check if the element has already been
			// initialized for the fdScheduler
			if ($this.data(SETTINGS))
				return;

			// Extend default settings
			var settings = $.extend({}, DEFAULTS, options);






			// Handlers for most events that I think will be
			// relevant. Pretty sure some of these will not
			// be used.
			settings.events = {
				touchStart: function(e) {

				},
				touchMove: function(e) {

				},
				touchEnd: function(e) {

				},
				mouseDown: function(e) {

				},
				mouseMove: function(e) {

				},
				mouseUp: function(e) {

				},
				click: function(e) {

				},
				scroll: function(e) {

				},
				dragStart: function(e) {

				}
			};

			$this.data(SETTINGS, settings);
			if (settings.hardwareAcceleration) {
				$this.css({
					'-webkit-transform': 'translate3d(0,0,0)',
					'-webkit-perspective': '1000',
					'-webkit-backface-visibility': 'hidden'
				});
			}


			// Genereate the grid

			// Populate events

			// Bind event Handlers
			$this.find('.event').click(function(e) {
				console.log(e.clientX + ", " + e.clientY);
			});











		});	// this.each(function...)
	};




	// Register fdScheduler 
	$.fn.fdScheduler = function(options) {
		initializeScheduler.call(this, options);
		return this;
	};	// end $.fn.frontdeskCalendar
 
})( jQuery ); 






/**
 * JSON Object: Event Occurence
 *
 *
 */
 var eventOccurrence =
 {
	id : "",
	startDate : "",
	endDate : "",
	name : "",
	
	staff :
	{
		id : "",
		firstName : "",
		lastName : "",
		fullName : ""
	},
	
	location :
	{
		id : "",
		name : ""
	}
 };