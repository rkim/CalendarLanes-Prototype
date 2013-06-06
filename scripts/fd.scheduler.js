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
 *
 *
 *	scheduler
 *		calendar-container
 *			calendar-scroller
 *				calendar-data
 *					subgroup
 *						time-lane
 *						calendar-lane
 *							event-lane
 *								event
 *								...
 *							grid-lane
 *								grid
 *								...
 *						...
 *					...
 *		lane-column
 *			subgroup
 *				time-lane
 *				lane
 *			...
 *
 */
	var DEFAULTS = {
		horizLayout: true,
		gridHoverOn: true,
		drawEvents: false,
		hardwareAcceleration: true,

		minHeight:"100%",
		maxHeight:"100%",
		maxWidth:"100%",
		minWidth:"100%",

		timeStart: 6,
		timeEnd: 20,
	};
	var SETTINGS = "fdScheduler-Settings";

	// Bind event handlers for event occurrences




	// TODO :: rkim :: 04-Jun-2013
	// Define all the styles used in the rendering
	// of the calendar here.
	var cssClasses = {

	};


	// Render the event data
	var renderEventOccurrences = function(eventLanes, eventData, settings) {
		console.log(eventData);
		console.log(settings);

		//
		//eventData.subgroups


	};

	var renderScheduleLanes = function(scheduler, eventData, settings) {

	};

	var renderCalendarGrid = function(calendarData, eventData, settings) {
		// Should I derive this from the event-occurrence data?
		// Probably not. Business configuration information is
		// best left out of the event data imo.
		//
		// What do we do if a one-off event is scheduled after
		// standard business hours?
		var startHour = settings.timeStart;
		var endHour = settings.timeEnd;


		// The subgroup loop...
		//
		// For now, assume we'll won't see nested subloops. They're
		// totally possible given the data structure, but I've no
		// pressing desire or need to over-complicate the code here
		// for a possibility.
		var subgroupIndex = 0;
		var numSubGroups = eventData.subgroups.length;
		for (subgroupIndex = 0; subgroupIndex < numSubGroups; subgroupIndex++) {

		}

		// Start by rendering in the time row into the
		// calendar. Make sure localized time strings
		// can be supported.
		var timeLane = jQuery('<div/>', {class: 'time-lane'});

		var currentHour = startHour;
		while(currentHour++ < endHour) {
			var timeCell = jQuery('<div/>', {
				class:'time-label',
				text: currentHour + ':00'});

			timeLane.append(timeCell);
		}
		calendarData.append(timeLane);
		calendarData.append(jQuery('<div/>',{class:'time-spacer'}));


		// Assume the calendar grid is broken into 30m
		// segments.
		var numberOfCells = (endHour - startHour) * 2;

		
		// TODO :: rkim :: 04-Jun-2013
		// ... for each subgroup
		var numberOfLanes = 4; // hard-coded for now
		var laneIndex = 0;
		var calendarLanes = new Array();
		while (laneIndex++ < numberOfLanes)
		{
			var calendarLane = jQuery('<div/>', {
				id:'basic-calendar-lane-'+laneIndex,
				class:'calendar-lane'});
			calendarLanes.push(calendarLane);
		}

		calendarLanes.map(function(calLane) {
			var gridLane = jQuery('<div/>', {class:'grid-lane'});
			
			var gridIndex = 0;
			var classString = 'grid start';
			while (gridIndex++ < numberOfCells) {
				gridLane.append(jQuery('<div/>', {class:classString}));

				classString = 'grid';
				if (gridIndex % 2 === 0)
					classString += ' mid';
			}
			calLane.append(gridLane);
		});
		calendarData.append(calendarLanes);
	};


	// Render the grid
	var renderCalendar = function($this, settings) {
		var elementId = $this.attr('id');

		// Bail for subgroups for now
		if (elementId === "subgroups")
			return;

		
		// ----------------------------------
		// Step 1: 
		// Setup calendar structure
		// ----------------------------------
		var calendarContainer = jQuery('<div/>', {class: 'calendar-container'});
		var calendarScroller = jQuery('<div/>', {class: 'calendar-scroller'});
		var calendarData = jQuery ('<div/>', {class: 'calendar-data'});
		var laneColumn = jQuery('<div/>', {class: 'lane-column'});

		// Pre-pend these elements for now since
		// the lane-column element is hard-coded
		// in the HTML file for the time being
		$this.prepend(calendarContainer);
		calendarContainer.prepend(calendarScroller);
		calendarScroller.prepend(calendarData);



		// ----------------------------------
		// Step 2:
		// Fetch the EventOccurence data and
		// grouping heirarchy.
		// ----------------------------------
		jQuery.getJSON('http://dl.dropboxusercontent.com/u/15259292/CalendarLanes/fragments/basic.events.json')
		.done(function(data) {
			// Parse and massage the data

			
			// ----------------------------------
			// Step 3: 
			// Dynamically generate the calendar
			// grid
			// ----------------------------------
			renderCalendarGrid (calendarData, data, settings);

			//renderEventOccurrences (calendarData, data, settings);

			// Bind hover over handler

		})
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus);
			console.log(errorThrown);
		});
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
			renderCalendar($this, settings);

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