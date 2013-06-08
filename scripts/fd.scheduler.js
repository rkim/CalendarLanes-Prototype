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
	var DEFAULT_SETTINGS = {
		horizLayout: true,
		gridHoverOn: true,
		drawEvents: false,
		hardwareAcceleration: true,

		// Set scheduler dimensions
		minHeight:"100%",
		maxHeight:"100%",
		maxWidth:"100%",
		minWidth:"100%",

		divisionsPerHour:2,
		divisionWidth:60,
		laneHeight:65,

		// Requires that the start and end times occur
		// on the same day.
		startTime:new Date(),
		endTime:new Date()
	};
	DEFAULT_SETTINGS.startTime.setHours(6,0,0,0);
	DEFAULT_SETTINGS.endTime.setHours(20,0,0,0);

	var SETTINGS_KEY = "fdScheduler-Settings";

	// TODO :: rkim :: 04-Jun-2013
	// Define all the styles used in the rendering
	// of the calendar here.
	var CLASSES = {

	};



	// Register fdScheduler 
	$.fn.fdScheduler = function(options) {
		initializeScheduler.call(this, options);
		return this;
	};	// end $.fn.frontdeskCalendar

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

			// Check if the element has already been initialized for
			// the fdScheduler
			if ($this.data(SETTINGS_KEY))
				return;

			// Extend default settings
			var settings = $.extend({}, DEFAULT_SETTINGS, options);

			// ---------------------------------------------------------
			// Handlers for most events that I think will be  relevant.
			// Pretty sure some of these will not be used.
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
			$this.data(SETTINGS_KEY, settings);
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

		// ---------------------------------------------------------
		// Setup calendar structure.
		// ---------------------------------------------------------
		var calendarContainer = jQuery('<div/>', {class: 'calendar-container'});
		var calendarScroller = jQuery('<div/>', {class: 'calendar-scroller'});
		var calendarData = jQuery ('<div/>', {class: 'calendar-data'});
		var laneColumn = jQuery('<div/>', {class: 'lane-column'});

		// Pre-pend these elements for now since the lane-column 
		// element is hard-coded in the HTML file for the time being
		$this.prepend(calendarContainer);
		calendarContainer.prepend(calendarScroller);
		calendarScroller.prepend(calendarData);

		// ---------------------------------------------------------
		// Fetch the EventOccurence data and
		// grouping heirarchy and generate
		// the calendar.
		// ---------------------------------------------------------
		jQuery.getJSON('http://dl.dropboxusercontent.com/u/15259292/CalendarLanes/fragments/basic.events.json')
			.done(function(eventData) {
				var startTime = settings.startTime;
				var endTime = settings.endTime;

				// Parse and massage the data, detect and alert on
				// errors, etc...
				eventData.subgroups.map(function(group) {
					group.lanes.map(function(lane) {
						lane.events.map(function(event) {
							// Convert dates to objects
							event.startDate = new Date(event.startDate);
							event.endDate = new Date(event.endDate);

							// Check and extend the range of times to display
							// This works because javascript is not multi-
							// threaded.
							if (startTime.getTime() > event.startDate.getTime())
								startTime = event.startDate;
							if (endTime.getTime() < event.endDate.getTime())
								endTime = event.endDate;
						});
					});
				});

				// Business hours do not necessarily have to start and end
				// on the hour, but we'll snap to the hour mark for display
				// consistency.
				if (endTime.getMinutes() > 0)
					endTime++;

				// Extend the time range of the calendar if necessary.
				settings.startTime = startTime;
				settings.endTime = endTime;

				// Render everything
				renderLaneGroups(calendarData, eventData, settings);
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				// Should probably have some sort of intelligent failure
				//  handler here.
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
	var renderLaneGroups = function(calendarData, eventData, settings) {

		// The lane-group loop...
		//
		// For now, assume we'll won't see nested subloops. They're
		// possible given the data structure, but I've no pressing
		// desire or need to over-complicate the code here for a
		// possibility.
		var groupIndex = 0;
		var numLaneGroups = eventData.subgroups.length;
		for (groupIndex = 0; groupIndex < numLaneGroups; groupIndex++) {
			
			// --------------------------------------
			// Group header
			var groupData = eventData.subgroups[groupIndex];
			var laneGroup = jQuery('<div/>', {
				class:'lane-group',
				id:'subroup-' + groupIndex,
			});
			// Add a spacer if the subgroup is to be displayed
			if (groupData.displayHeader) {
				laneGroup.append(jQuery('<div/>', {class:'subgroup-spacer'}));
			}

			// --------------------------------------
			// Time lane
			renderTimeLane(laneGroup, settings);

			// --------------------------------------
			// Create and add the event and grid lanes
			// to the lane group.
			renderCalendarLanes(laneGroup, groupData, settings);

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
	var renderCalendarLanes = function(laneGroup, groupData, settings) {
		
		// Build the calendar lanes
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
			console.log ("lane: "+laneIndex);
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
	var renderEventOccurrences = function(eventLane, eventOccurrences, settings) {

		// Sanity check inputs
		if (eventLane === null || eventOccurrences === null ||
			settings === null || eventOccurrences.length === 0) {
			console.log("error: invalid input to renderEventOccurrences");
			return;
		}	

		var eventIndex = 0;
		var numEvents = eventOccurrences.length;

		// ---------------------------------------------------------
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

		// ---------------------------------------------------------
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
		var eventNode = function(event, parentNode) {
			return {
				depth: 0,
				startDate: event.startDate,
				endDate: event.endDate,
				events : [event],

				parent: parentNode,
				children: [],

				addEvent: function(event) {
					var nodeAdded = false;

					var currentNode = this;
					while(!nodeAdded && currentNode != null)
					{
						// Add the event to topEventNode if the start dates are
						// the same.
						if (currentNode.startDate.getTime() === event.startDate.getTime()) {
							currentNode.events.push(event);

							// Check and extend currentLayer.endDate
							if (currentNode.endDate.getTime() < event.endDate.getTime())
								currentNode.endDate = event.endDate;

							nodeAdded = true;
						}

						// Otherwise, add a new node to the stack if overlap between
						// currentLayer and the event exists.
						else if (currentNode.endDate.getTime() > event.startDate.getTime()) {
							var newNode = eventNode(event, this);
							newNode.depth = currentNode.depth + 1;
							this.children.push(newNode);

							currentNode = newNode;
							nodeAdded = true;
						}

						// Else, step up one level and try again.
						else {
							currentNode = currentNode.parent;
						}
					} // while(...)

					if (currentNode === null) {
						console.log("Failed to add event to a layer");
					}
					return currentNode;

 				} // addEvent
			};
		}; // eventLayer

		// Initialize the event layers
		var event = eventOccurrences[0];
		var lastNode = eventNode(event);
		var eventTree = [lastNode];
		for (eventIndex = 1; eventIndex < numEvents; eventIndex++) {
			event = eventOccurrences[eventIndex];

			// Overlap detected
			if (lastNode.endDate > event.startDate) {
				lastNode = lastNode.addEvent(event);
			}

			// Start new layer
			else {
				lastNode = eventNode(event, null);
				eventTree.push(lastNode);
			}
		} // for (eventIndex ...)

		// ---------------------------------------------------------
		// Step 3.
		// Generate event occurrences from the event stacks.
		renderEventTree(eventLane, eventTree, settings);

	};


	/**
	 *
	 *
	 *
	 *
	 *
	 */
	 var renderEventTree = function(eventLane, eventTree, settings) {
	 	var $eventTree = $(eventTree);

	 	// Display config variables;
	 	var config = {
	 		height: '65px',
	 		width: '180px',
			left:'',
			top:'',	 		

	 		stacked: false,
	 		hideDetails:false
	 	};


	 	// Compute offsets
	 	var cellsPerHour = settings.divisionsPerHour;
	 	var hourWidth = settings.divisionWidth * cellsPerHour;
	 	var minutesPerCell = 60 / cellsPerHour;
	 	var pixelsPerMinute = hourWidth / 60;

	 	// Again, this assumes the start and end time occur on the same day
	 	var startHour = settings.startTime.getHours();
	 	var endHour = settings.endTime.getHours();

	 	// Find the number of minutes represented in the calendar
	 	var numberOfMinutes = (startHour - endHour) * 60;
	 	numberOfMinutes += minutesPerCell * 2;	// For the gutters

	 	// Initialize offset at the start of the business day
	 	var calStartOffset = minutesPerCell * pixelsPerMinute;



	 	// Iterate over each 'stack' of events in the tree
	 	$eventTree.each(function(treeIndex, stack) {

	 		var maxDepth = 0;
			var eventNodesToProcess = [stack];
			while (eventNodesToProcess.length > 0) {
				var eventNode = eventNodesToProcess.pop();
				
				// Push child nodes into nodes to process
				var children = eventNode.children;
				$(children).each(function(childIndex, childNode) {
					eventNodesToProcess.push(childNode);
				});

				maxDepth = Math.max(maxDepth, eventNode.depth);
			}
			console.log("  stack: "+treeIndex+" depth: "+maxDepth);



			// do it all over again... we can simplify this
			var eventNodesToRender = [stack];
			while (eventNodesToRender.length > 0) {
				var eventNode = eventNodesToRender.pop();

				var children = eventNode.children;
				$(children).each(function(childIndex, childNode) {
					eventNodesToRender.push(childNode);
				});
				var currentDepth = eventNode.depth;

				// Set height offset by stack depth
				var depthAdjustment = maxDepth * 5;
			 	var eventHeight = settings.laneHeight - depthAdjustment;
			 	eventHeight = eventHeight / stack.events.length;

				// Can't use the startTime since it might not be snapped
				// to the hour.
				var calStartTime = new Date();
				calStartTime.setHours(settings.startTime.getHours(),0,0,0);
			 	$events = $(eventNode.events);	// jQueryify 
			 	$events.each(function(eventIndex, event) {

				 	// Set the display config values, render the element
				 	// and add it to the event lane.
				 	var eventStartTime = event.startDate;
				 	var eventEndTime = event.endDate;
				 	var startOffset = (eventStartTime.getTime() - calStartTime.getTime());

				 	startOffset = startOffset / 1000;
				 	startOffset = startOffset / 60;
				 	startOffset = startOffset * pixelsPerMinute + calStartOffset;

				 	// Find length of event in pixels
				 	var eventLength = eventEndTime.getTime() - eventStartTime.getTime();
				 	eventLength = eventLength / 1000;
				 	eventLength = eventLength / 60;
				 	eventLength = eventLength * pixelsPerMinute;

				 	var depthOffset = currentDepth * 5;
				 	var topOffset = depthOffset+(eventHeight*eventIndex);

				 	// Set config
			 		config.height = eventHeight.toString()+"px";
			 		config.top = topOffset.toString()+"px";
				 	config.left = startOffset.toString()+"px";
				 	config.width = eventLength.toString()+"px";
				 	config.stacked = (currentDepth > 0);

				 	var eventElement = createEventElement(event, config);
				 	eventLane.append(eventElement);
			 	}); // $events.each ...

			} // while (eventNodesToRender ...)

	 	}); // $eventTree.each

	 }


	/**
	 *
	 *
	 *
	 *
	 *
	 *		<div class="event" style="left:450px; height:65px; width:150px;">
	 *			<div class="event_o service_color_1 type_class">
	 *				<span class="name_and_time">
	 *				<span class="full_time">
	 *				<span class="start_at">10am</span>
	 *				<span class="dash">-</span>
	 *				<span class="end_at">11:30am</span>
	 *				</span>
	 *				<span class=""><strong>Class A</strong> w/ Staff 1 & Staff 3</span>
	 *				<span class="location hide">- Los Angeles</span>
	 *				</span>
	 *			</div>	
	 *		</div>
	 *
	 */
	var createEventElement = function(event, config) {
		console.log("    rendering event: "+event.id)
		console.log("    height: "+config.height+" width: "+config.width+" left: "+config.left+" top: "+config.top)

		// Extract event details
		var eventDiv  = jQuery('<div/>', {
			class: 'event',
			style: 'top:'+config.top+'; left:'+config.left+'; height:'+config.height+'; width:'+config.width});

		var classString = 'event_o '+'service_color_'+event.serviceColor+' type_'+event.type;
		if (config.stacked) {
			classString += ' stacked';
		}
		var eventOccurrence = jQuery('<div/>', {
			class: classString});
		
		var eventDetails = jQuery('<span/>', {
			class:'name_and_time'});
		var eventTime = jQuery('<span/>', {
			class:'full_time'});

		var startTimeString = event.startDate.getHours().toString();
		if (event.startDate.getMinutes() > 0) {
			startTimeString += ":"+event.startDate.getMinutes().toString();
		}
		var spanStartAt = jQuery('<span/>', {
			class:'start_at',
			text: startTimeString});
		var spanDash = jQuery('<span/>', {
			class:'dash'});
		var spanEndAt = jQuery('<span/>', {
			class:'end_at',
			text:'11:30am'});
		var eventStaff = jQuery('<span/>', {
			text:' /w Staff 1 & Staff 3'});
		var eventName = jQuery('<strong/>', {
			text:' Class A'})
		var eventLocation = jQuery('<span/>', {
			class:'location',
			text:' - Los Angeles'});

		// Associate event elements
		eventTime.append(spanStartAt);
		eventTime.append(spanDash);
		eventTime.append(spanEndAt);

		eventStaff.prepend(eventName);

		eventDetails.append(eventTime);
		eventDetails.append(eventStaff);
		eventDetails.append(eventLocation);

		eventOccurrence.append(eventDetails);
		eventDiv.append(eventOccurrence);

		return eventDiv;
	}


	/**
	 * TODO :: rkim :: 06-Jun-2013
	 * Make the time lanes work with gutters.
	 * Time labels are to be fixed to 2 hour divisions wide,
	 * with paddings to be inserted between them.
	 */
	var renderTimeLane = function(laneGroup, settings) {

		var startHour = settings.startTime.getHours();
		var endHour = settings.endTime.getHours();

		// Start by rendering in the time row into the calendar.
		// Make sure localized time strings can be supported.
		var timeLane = jQuery('<div/>', {class:'time-lane'});
		var currentHour = startHour;
		while(currentHour <= endHour) {

			var timeCell = jQuery('<div/>', {
				class:'time-label',
				text: currentHour + ':00'});
			timeLane.append(timeCell);

			// 
			if (settings.divisionsPerHour > 2) {
				var timePadding = jQuery('<div/>', {class:'time-padding'});
				timeLane.append(timePadding);
			}
			currentHour++;
		}

		// Calculate and set the width of the elements in the 
		// time lane.
		var timeLabelWidth = 2 * settings.divisionWidth;
		var timePadding = (settings.divisionsPerHour - 2) * settings.divisionWidth;

		timeLabelWidth = timeLabelWidth.toString() + "px";
		timeLane.find('.time-label').css({
			'width':timeLabelWidth,
			'min-width':timeLabelWidth,
			'max-width':timeLabelWidth});

		laneGroup.append(timeLane);
		laneGroup.append(jQuery('<div/>', {class:'time-spacer'}));
	}

	/**
	 *
	 *
	 *
	 *
	 *
	 */
	var renderGridLines = function (gridLane, settings)
	{
		var startHour = settings.startTime.getHours();
		var endHour = settings.endTime.getHours();

		var cellsPerHour = settings.divisionsPerHour;
		var numberOfCells = (endHour - startHour) * cellsPerHour;
		numberOfCells += 2;	// For the gutters

		var gridIndex = 0;
		var classString = 'grid start';
		while (gridIndex < numberOfCells) {
			gridLane.append(jQuery('<div/>', {class:classString}));
			classString = 'grid';

			// Set class string for the next iteration through
			//
			// TODO :: rkim :: 07-Jun-2013
			// This isn't correct for any value of cellsPerHour
			// greater than 0.
			if (gridIndex % cellsPerHour !== 0)
				classString += ' mid';

			gridIndex++;
		}
	};
 
})( jQuery );
