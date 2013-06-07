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

	/**
	 *
	 *
	 *
	 *
	 *
	 */
	var renderEventOccurrences = function(eventLane, eventOccurrences, settings) {

		// Sanity check inputs
		if (eventLane === null || eventOccurrences === null ||
			settings === null || eventOccurrences.length === 0) {
			console.log("error: invalid input to renderEventOccurrences");
			return;
		}	

		var eventIndex = 0;
		var numEvents = eventOccurrences.length;

		// Step 0.
		// Convert event dates from Strings to javascript
		// Date objects.
		for (eventIndex = 0; eventIndex < numEvents; eventIndex++) {
			var event = eventOccurrences[eventIndex];
			event.startDate = new Date(event.startDate);
			event.endDate = new Date(event.endDate);
		}

		// Step 1.
		// Sort the array of event occurrences
		var eventSortComparator = function(e1, e2) {
			if (e1.startDate.getTime() === e2.startDate.getTime()) {
				if (e1.endDate.getTime() === e2.endDate.getTime()) {
					return (e1.name >= e2.name) ? 1 : -1;
				}
				else {
					return (e1.endDate.getTime() < e2.endDate.getTime()) ? 1 : -1;
				}
			}
			else {
				return (e1.startDate.getTime() > e2.startDate.getTime()) ? 1 : -1;
			}
		}
		eventOccurrences.sort(eventSortComparator);

		// Step 2.
		// Construct the event occurrence "stacks".
		//
		// This isn't really a stack. The name serves to describe
		// the idea that all events in this structure are "stacked"
		// on top of each other in the calendar due to overlaps in
		// time.
		//
		// TODO :: rkim :: 04-Jun-2013
		// Test the shit out of this. This is the important,
		// meaty part.
		var eventStack = function(event) {
			var stack = {
				depth: 0,

				// May want validation of types
				// and data here.
				startDate: event.startDate,
				endDate: event.endDate,
				eventList: new eventNode(event),
				topEventNode: this.eventList,

				// Heavy lifting happens here...
				//
				// We can trust that events added to this stack 
				// have already been sorted by time.
				addEvent: function(event) {
					console.log(event);

					var nodeAdded = false;
					while (!nodeAdded && this.topEventNode != null)
					{
						// Add the event to topEventNode if the start dates are
						// the same.
						if (this.topEventNode.startDate.getTime() === event.startDate.getTime()) {
							this.topEventNode.addEvent(event);

							nodeAdded = true;
						}

						// Otherwise, add a new node to the stack if overlap between
						// topEventNode and the current event exists.
						else if (this.topEventNode.endDate.getTime() > event.startDate.getTime()) {
							var newEventNode = eventNode(event);
							this.topEventNode.next = newEventNode;
							newEventNode.prev = this.topEventNode;
							this.topEventNode = newEventNode;

							nodeAdded = true;
							depth++;
						}
						// Else, step up one level and try again.
						else 
						{
							topEventNode = topEventNode.prev;
						}
					}

				}
			};

			// Initialization
			console.log("creating stack");
			console.log(event);
			return stack;
		};

		// This isn't really necessary, but serves to 
		// break out the linked list functionality out of
		// eventStack.
		var eventNode = function(event) {
			return {
				startDate: event.startDate,
				endDate: event.endDate,

				events: [event],
				prev: null,
				next: null,

				addEvent: function(event) {
					events.push(event);

					// Check and extend the end date of this
					// collection of events 
					if (endDate < event.endDate)
						endDate = event.endDate;
				}
			};
		};













		// Initialize the event stack
		var event = eventOccurrences[0];
		var eventStacks = new Array();
		var currentStack = eventStack(event);
		eventStacks.push(currentStack);

		for (eventIndex = 1; eventIndex < numEvents; eventIndex++) {
			event = eventOccurrences[eventIndex];

			// Overlap detected
			if (currentStack.endDate > event.startDate) {
				currentStack.addEvent(event);
			}

			// Start new stack
			else {
				currentStack = eventStack(event);
				eventStacks.push(currentStack);
			}
		}

		// Step 3.
		// Generate event occurrences from the event stacks.

	};

	/**
	 *
	 *
	 *
	 *
	 *
	 */
	var renderGridLines = function (gridLane, settings)
	{
		var startHour = settings.timeStart;
		var endHour = settings.timeEnd;

		// Assume the calendar grid is broken into 30m
		// segments.
		var numberOfCells = (endHour - startHour) * 2;

		var gridIndex = 0;
		var classString = 'grid start';
		while (gridIndex++ < numberOfCells) {
			gridLane.append(jQuery('<div/>', {class:classString}));

			classString = 'grid';
			if (gridIndex % 2 === 0)
				classString += ' mid';
		}
	};

	/**
	 *
	 *
	 *
	 *
	 *
	 */
	var renderSingleCalendarLane = function(laneGroup, groupData, settings) {
		// ----------------------------------
		// What do we do if a one-off event is
		// scheduled after business hours?
		var startHour = settings.timeStart;
		var endHour = settings.timeEnd;

		// Start by rendering in the time row into the
		// calendar. Make sure localized time strings
		// can be supported.
		var timeLane = jQuery('<div/>', {class:'time-lane'});
		var currentHour = startHour;
		while(currentHour++ < endHour) {
			var timeCell = jQuery('<div/>', {
				class:'time-label',
				text: currentHour + ':00'});

			timeLane.append(timeCell);
		}
		laneGroup.append(timeLane);
		laneGroup.append(jQuery('<div/>', {class:'time-spacer'}));


		var laneIndex = 0;
		var numberOfLanes = groupData.lanes.length;
		for (laneIndex = 0; laneIndex < numberOfLanes; laneIndex++)
		{
			var calendarLane = jQuery('<div/>', {
				id:'basic-calendar-lane-'+laneIndex,
				class:'calendar-lane'});

			// Create and add event lane
			var eventLane = jQuery('<div/>', {class:'event-lane'});
			var eventOccurrences = groupData.lanes[laneIndex].events;
			if (eventOccurrences.length > 0) {
				renderEventOccurrences(eventLane, eventOccurrences, settings);
			}
			calendarLane.append(eventLane);

			// Create and add grid lane
			var gridLane = jQuery('<div/>', {class:'grid-lane'});
			renderGridLines(gridLane, settings);
			calendarLane.append(gridLane);


			laneGroup.append(calendarLane);
		}
	};


	/**
	 *
	 *
	 *
	 *
	 *
	 */
	var renderCalendarLanes = function(calendarData, eventData, settings) {
		// The lane-group loop...
		//
		// For now, assume we'll won't see
		// nested subloops. They're possible
		//  given the data structure, but I've
		// no pressing desire or need to over-
		// complicate the code here for a
		// possibility.
		var groupIndex = 0;
		var numLaneGroups = eventData.subgroups.length;
		for (groupIndex = 0; groupIndex < numLaneGroups; groupIndex++) {
			
			var groupData = eventData.subgroups[groupIndex];
			var laneGroup = jQuery('<div/>', {
				class:'lane-group',
				id:'subroup-' + groupIndex,
			});

			// Add a spacer if the subgroup is to
			// be displayed
			if (groupData.displayHeader) {
				laneGroup.append(jQuery('<div/>', {class:'subgroup-spacer'}));
			}

			// Create and add the event and grid
			// lanes to the lane group.
			renderSingleCalendarLane(laneGroup, groupData, settings);
			calendarData.append(laneGroup);
		}
	};

	/**
	 *
	 *
	 *
	 *
	 *
	 */
	var renderCalendar = function($this, settings) {
		var elementId = $this.attr('id');

		// Bail for subgroups for now
		if (elementId === "subgroups")
			return;

		// ----------------------------------
		// Setup calendar structure.
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
		// Fetch the EventOccurence data and
		// grouping heirarchy and generate
		// the calendar.
		// ----------------------------------
		jQuery.getJSON('http://dl.dropboxusercontent.com/u/15259292/CalendarLanes/fragments/basic.events.json')
		.done(function(eventData) {
			// Parse and massage the data


			// Render calendar
			renderCalendarLanes(calendarData, eventData, settings);
		})

		.fail(function(jqXHR, textStatus, errorThrown) {
			// Should probably have some sort
			// of intelligent failure handler
			// here.
			console.log(textStatus);
			console.log(errorThrown);
		});
	};

	/**
	 *
	 *
	 *
	 *
	 *
	 */
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
