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

	// Bind event handlers for event occurrences


	// Render the grid
	var renderCalendarGrid = function($this, settings) {
		var elementId = $this.attr('id');

		// Bail for subgroups for now
		if (elementId === "subgroups")
			return;

		
		// ----------------------------------
		// Step 1: 
		// Setup calendar structure
		// ----------------------------------
		var $calendarContainer = jQuery('<div/>', {class: 'calendar-container'});
		var $calendarScroller = jQuery('<div/>', {class: 'calendar-scroller'});
		var $calendarData = jQuery ('<div/>', {class: 'calendar-data'});
		var $laneColumn = jQuery('<div/>', {class: 'lane-column'});

		// Pre-pend these elements for now since
		// the lane-column element is hard-coded
		// in the HTML file for the time being
		$this.prepend($calendarContainer);
		$calendarContainer.prepend($calendarScroller);
		$calendarScroller.prepend($calendarData);

		
		// ----------------------------------
		// Step 2: 
		// Dynamically generate the calendar
		// grid
		// ----------------------------------
		var startHour = settings.timeStart;
		var endHour = settings.timeEnd;
		if (endHour <= startHour)
			console.log("error: end of day is before or equal to start of day.");

		// Assume the calendar grid is broken into 30m
		// segments, and add a 30m buffer on either side 
		// of the start and end hours
		var numberOfCells = ((endHour - startHour) * 2) + 2;

		// Start by rendering in the time row into the
		// calendar. Make sure localized time differences
		// can be supported.
		var $timeLane = jQuery('<div/>', {class: 'time-lane'});

		var i;
		for (i = startHour; i < endHour; i++)
		{
			var $timeCell = jQuery('<div/>', {
				class:'time-label',
				text:'7:00am'});

			$timeLane.append($timeCell);
		}
		$calendarData.append($timeLane);
		$calendarData.append(jQuery('<div/>',{class:'time-spacer'}));




		// ----------------------------------
		// Step 3:
		// Populate the calendar with events
		// ----------------------------------



		// Note :: rkim :: 04-Jun-2013
		// These load elements will be quickly replaced
		// by js rendering routines off JSON data. 
		/*
		$.get('http://dl.dropboxusercontent.com/u/15259292/CalendarLanes/fragments/basic.calendar.html',
			function(data){
				$calendarData.append(data);
			}
		);

		$this.append($laneColumn);
		$.get('http://dl.dropboxusercontent.com/u/15259292/CalendarLanes/fragments/basic.lanes.html',
			function(data){
				$laneColumn.append(data);
			}
		);
		*/
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

			// Hardware acceleration
			$this.data(SETTINGS, settings);
			if (settings.hardwareAcceleration) {
				$this.css({
					'-webkit-transform': 'translate3d(0,0,0)',
					'-webkit-perspective': '1000',
					'-webkit-backface-visibility': 'hidden'
				});
			}

			// Genereate the grid
			renderCalendarGrid($this, settings);

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
 */