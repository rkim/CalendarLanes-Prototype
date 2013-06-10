/*
 * Front Desk Scheduler
 *
 * Copyright (c) 2013 Front Desk, Inc.
 *
 */
 
 
;(function($){

/**
 * fdScheduler
 * ----------------------------------------------------------------------------------
 *
 * jQuery plugin that creates, loads, and renders a configurable calendar of events 
 * within a <div/>.
 *
 * Though I'd like to make this a bit more portable and reusable, time constraints
 * require that I hard-code dependencies on certain CSS classes and so forth.
 *
 * ----------------------------------------------------------------------------------
 * Class hierarchy for the event scheduler
 * ----------------------------------------------------------------------------------
 *
 *	scheduler
 *		calendar-container
 *			calendar-scroller
 *				calendar-data
 *					group
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
 *			group
 *				time-lane
 *				lane
 *			...
 *
 * ----------------------------------------------------------------------------------
 * Parameters
 * ----------------------------------------------------------------------------------
 *   horizLayout           : 
 *                         : 
 * ..................................................................................
 *   gridHoverOn           : 
 *                         : 
 * ..................................................................................
 *   drawEvents            : 
 *                         : 
 * ..................................................................................
 *   hardwareAcceleration  : 
 *                         : 
 * ..................................................................................
 *   minHeight             : 
 *                         : 
 * ..................................................................................
 *   maxHeight             : 
 *                         : 
 * ..................................................................................
 *   maxWidth              : 
 *                         : 
 * ..................................................................................
 *   minWidth              :
 *                         : 
 * ..................................................................................
 *   divisionsPerHour      : 
 *                         : 
 * ..................................................................................
 *   divisionWidth         : 
 *                         : 
 * ..................................................................................
 *   laneHeight            : 
 *                         : 
 * ..................................................................................
 *   startTime             : 
 *                         : 
 * ..................................................................................
 *   endTime               : 
 *                         : 
 * ----------------------------------------------------------------------------------
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
	DEFAULT_SETTINGS.startTime.setHours(7,0,0,0);
	DEFAULT_SETTINGS.endTime.setHours(18,0,0,0);

	var SETTINGS_KEY = "fdScheduler-Settings";

	// TODO :: rkim :: 04-Jun-2013
	// Define all the styles used in the rendering
	// of the calendar here.
	var CLASSES = {

	};

	// Globals
	var scheduleData = null;

	/**
	 * $.fn.fdScheduler
	 * ----------------------------------------------------------------------------------
	 *
	 */
	$.fn.fdScheduler = function(options) {
		initializeScheduler.call(this, options);

		return this;
	};	// end $.fn.frontdeskCalendar

	/**
	 * intializeScheduler
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var initializeScheduler = function(options) {

		this.addClass("fdScheduler-enabled").each(function() {
			var $this = $(this);

			// Check if the element has already been initialized for
			// the fdScheduler
			if ($this.data(SETTINGS_KEY))
				return;

			// Extend default settings
			var settings = $.extend({}, DEFAULT_SETTINGS, options);

			// Hardware acceleration
			$this.data(SETTINGS_KEY, settings);
			if (settings.hardwareAcceleration) {
				$this.css({
					"-webkit-transform": "translate3d(0,0,0)"
				});
			}

			// Render the thing
			renderCalendar($this, settings);

			// Bind event Handlers
			bindEventHandlers($this, settings);
			
			// Set scroller position
			$(document).ready(function() {
				setScrollPosition($this, settings)
			});

		});	// this.each(function...)
	}; // initializeScheduler



	/**
	 * renderCalendar
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var renderCalendar = function($calendar, settings) {
		var elementId = $calendar.attr("id");

		// ---------------------------------------------------------
		// Setup calendar structure.
		// ---------------------------------------------------------
		// var $modalBox = jQuery('<div/>', {class:"modal"});
		var $calendarContainer = jQuery("<div/>", {class: "calendar-container"});
		var $calendarScroller = jQuery("<div/>", {class: "calendar-scroller"});
		var $calendarData = jQuery ("<div/>", {class: "calendar-data"});
		var $laneColumn = jQuery("<div/>", {class: "lane-column"});

		$calendar.append($calendarContainer);
		$calendar.append($laneColumn);

		$calendarContainer.append($calendarScroller);
		$calendarScroller.append($calendarData);
	 	// $calendarScroller.append($modalBox);


		// ---------------------------------------------------------
		// Fetch the EventOccurence data and
		// grouping heirarchy and generate
		// the calendar.
		// ---------------------------------------------------------
		jQuery.getJSON('http://dl.dropboxusercontent.com/u/15259292/CalendarLanes/fragments/events.json')

			// Successfully retrieved event data
			.done(function(data) {
				var startDate = settings.startTime;
				var endDate = settings.endTime;

				scheduleData = data;

				// Parse and massage the data, detect and alert on
				// errors, etc...
				//
				// TODO :: rkim :: 08-Jun-2013
				// It'd be prudent to break this out into a separate
				// function better suited to handling error detection.
				scheduleData.groups.map(function(group) {
					group.lanes.map(function(lane) {
						lane.events.map(function(event) {

							// Convert dates to objects
							event.startDate = new Date(event.startDate);
							event.endDate = new Date(event.endDate);

							// Check and extend the range of times to display
							if (startDate.getTime() > event.startDate.getTime())
								startDate = event.startDate;
							if (endDate.getTime() < event.endDate.getTime())
								endDate = event.endDate;
						});
					});
				});

				// Business hours do not necessarily have to start and end
				// on the hour, but we'll snap to the hour mark for display
				// consistency.
				if (startDate.getMinutes() > 0)
					startDate.setHours(startDate.getHours(), 0, 0, 0);
				if (endDate.getMinutes() > 0)
					endDate.setHours(endTime.getHours()+1);

				// Extend the time range of the calendar if necessary.
				settings.startTime = startDate;
				settings.endTime = endDate;

				// Render...everything!!
				renderLaneColumn($laneColumn, scheduleData, settings);
				renderLaneGroups($calendarData, scheduleData, settings);
			})

			// Shit went wrong. What should I do? Fail.
			//
			// TODO :: rkim :: 08-Jun-2013
			// Add something resembling an error handler here though.
			.fail(function(jqXHR, textStatus, errorThrown) {

				console.log(textStatus);
				console.log(errorThrown);
			});
	};

	/**
	 * renderLaneGroups
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var renderLaneGroups = function($calendarData, scheduleData, settings) {

		// The lane-group loop...
		//
		// For now, assume we'll won't see nested subloops. They're
		// possible given the data structure, but I've no pressing
		// desire or need to over-complicate the code here for a
		// possibility.
		$(scheduleData.groups).each(function(groupIndex, groupData) {

			// Group header
			var $laneGroup = jQuery("<div/>", {
				class: "lane-group",
				id: "group-" + groupIndex});

			if (groupData.displayHeader) {
				$laneGroup.append(jQuery("<div/>", {class: "group-spacer"}));
			}

			// Render time and calendar lanes
			renderTimeLane($laneGroup, groupData, settings);
			renderCurrentTimeMarker($laneGroup, settings);
			renderCalendarLanes($laneGroup, groupData, settings);

			$calendarData.append($laneGroup);
		});
	};

	/**
	 *
	 *
	 */
	var renderCalendarLanes = function($laneGroup, groupData, settings) {
			
		$(groupData.lanes).each(function(laneIndex, laneData) {
			var events = laneData.events;

			// Calendar lane that'll encapsulate both the event and grid lanes
			//
			// TODO :: rkim :: 08-Jun-2013 
			// Will need a better, unique-r id.
			var $calendarLane = jQuery("<div/>", {
				id: "calendar-lane-" + laneIndex,
				class: "calendar-lane"});


			// Create and add event lane
			var $eventLane = jQuery('<div/>', {class: "event-lane"});
			console.log ("lane: " + laneIndex);
			if (events.length > 0) {
				renderEventOccurrences($eventLane, events, settings);
			}
			$calendarLane.append($eventLane);



			// Create and add grid lane
			var $gridLane = jQuery("<div/>", {class: "grid-lane"});
			renderGridLane($gridLane, settings);
			$calendarLane.append($gridLane);


			// Add the new calendar lane to the lane group
			$laneGroup.append($calendarLane);
		});
	};

	/**
	 * renderEventOccurrences
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var renderEventOccurrences = function($eventLane, eventOccurrences, settings) {

		var eventIndex = 0;
		var numEvents = eventOccurrences.length;

		// ---------------------------------------------------------
		// Step 1.
		// Sort the array of event occurrences. Events will be ordered
		// by the following criteria:
		//
		//    a. earlier start time
		//    b. later end time
		//    c. name (optional)
		//
		// This is important since much of the following logic relies
		// on the premise that the events are sorted by time in that
		// specific order.
		// ---------------------------------------------------------
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
		// Construct the "event tree."
		//
		// TODO :: rkim :: 04-Jun-2013
		// Test the shit out of this. This is the important,
		// meaty part.
		// ---------------------------------------------------------
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

			else {

				var nodeAdded = false;
				var parentNode = lastNode.parent;
				while (typeof parentNode != 'undefined' && parentNode != null) {
					if (parentNode.endDate > event.startDate) {
						lastNode = parentNode.addEvent(event);
						nodeAdded = true;
						break;
					}
					else
					{
						parentNode = parentNode.parent;
					}
				}

				// Start new layer
				if (!nodeAdded)
				{
					lastNode = eventNode(event, null);
					eventTree.push(lastNode);	
				}
			}
		} // for (eventIndex ...)


		// ---------------------------------------------------------
		// Step 3.
		// Generate event occurrences from the event stacks.
		// ---------------------------------------------------------
		renderEventTree($eventLane, eventTree, settings);
	};

	/**
	 * renderEventTree
	 * ----------------------------------------------------------------------------------
	 *
	 */
	 var renderEventTree = function($eventLane, eventTree, settings) {
	 	var $eventTree = $(eventTree);

	 	// Event rendering parameters
	 	var eventParams = {
	 		height: "65px",
	 		width: "180px",
			left: "0px",
			top: "0px",	 		

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
			 	eventHeight = eventHeight / eventNode.events.length;

			 	$events = $(eventNode.events);	// jQueryify 
			 	$events.each(function(eventIndex, event) {

				 	// Set the display config values, render the element
				 	// and add it to the event lane.

					var startOffset = getTimeOffsetInPixels(event.startDate, settings);
					var eventLength = getTimeOffsetInPixels(event.endDate, settings) - startOffset;

				 	var depthOffset = currentDepth * 5;
				 	var topOffset = depthOffset+(eventHeight*eventIndex);


				 	// Horizontal layout
				 	if (settings.horizLayout)
				 	{
				 		eventParams.height = eventHeight.toString()+"px";
				 		eventParams.top = topOffset.toString()+"px";
					 	eventParams.left = startOffset.toString()+"px";
					 	eventParams.width = eventLength.toString()+"px";
					 	eventParams.stacked = (currentDepth > 0);
					 }

					 // Vertical layout
					 else
					 {
					 	// NOT YET IMPLEMENTED
					 }

				 	var eventElement = createEventElement(event, eventParams);
				 	$eventLane.append(eventElement);
			 	}); // $events.each ...

			} // while (eventNodesToRender ...)

	 	}); // $eventTree.each
	 }

	/**
	 * renderLaneColumn
	 * ----------------------------------------------------------------------------------
	 *
	 */
	 var renderLaneColumn = function($laneColumn, scheduleData, settings) {

	 	$(scheduleData.groups).each(function(groupIndex, group) {
	 		var $groupDiv = jQuery("<div/>", {class: "grouping"});

	 		// Render the group headers if enabled
	 		if (group.displayHeader) {
	 			var $groupLane = jQuery("<div/>", {class: "group-lane"});
	 			
	 			var groupLabelClass = "group-label";
	 			if (groupIndex === 0)
	 			 	groupLabelClass += " first";

	 			var $groupLabel = jQuery("<div/>", {
	 				class: groupLabelClass,
	 				text: group.headerLabel
	 			});

	 			var $groupSpacer = jQuery("<div/>", {class: "group-spacer"})
	 			$groupLane.append($groupLabel);
	 			$groupDiv.append($groupLane);
	 			$groupDiv.append($groupSpacer);
	 		}

	 		// Render the time lane
	 		var $timeLane = jQuery("<div/>", {class:"time-lane"});
	 		var timeLabelClass = "time-label border";
	 		if (group.displayHeader) {
	 			timeLabelClass += " group";
	 		}
	 		var $timeLabel = jQuery("<div/>", {class: timeLabelClass});
	 		var $timeSpacer = jQuery("<div/>", {class: "time-spacer"});
	 		$timeLane.append($timeLabel);
	 		$groupDiv.append($timeLane);
	 		$groupDiv.append($timeSpacer);

	 		// Render the lane names
	 		$(group.lanes).each(function(groupIndex, lane) {
	 			var $laneDiv = jQuery("<div/>", {class: "lane"});
	 			var $laneLabel = jQuery("<div/>", {
	 				class:"lane-label",
	 				text:lane.name});
	 			$laneDiv.append($laneLabel);
	 			$groupDiv.append($laneDiv);
	 		});

	 		// Add the whole thing to the lane column
	 		$laneColumn.append($groupDiv);
	 	});
	 }

	/**
	 * createEventElement
	 * ----------------------------------------------------------------------------------
	 * Pretty sloppy looking down there. Simple functionally though. It take an event
	 * occurence and creates / returns a formatted <div> containing the event details.
	 *
	 * Positioning, color and a couple of other options are specified by the caller 
	 * via the params variable.
	 *
	 * ----------------------------------------------------------------------------------
	 * Sample Event Occurence HTML 
	 * ----------------------------------------------------------------------------------
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
	 * ----------------------------------------------------------------------------------
	 */
	var createEventElement = function(event, params) {
		console.log("    rendering event: "+event.id)
		console.log("    height: "+params.height+" width: "+params.width+" left: "+params.left+" top: "+params.top)

		var eventDiv  = jQuery('<div/>', {
			class: 'event',
			style: 'top:'+params.top+'; left:'+params.left+'; height:'+params.height+'; width:'+params.width});

		var classString = 'event_o '+'service_color_'+event.serviceColor+' type_'+event.type;
		if (params.stacked) {
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
		var endTimeString = event.endDate.getHours().toString();
		if (event.endDate.getMinutes() > 0) {
			endTimeString += ":"+event.endDate.getMinutes().toString();
		}
		var spanEndAt = jQuery('<span/>', {
			class:'end_at',
			text: endTimeString});

		var staffString = ' w/';
		event.staff.map(function(staff){
			staffString += ' ' + staff.name;
		});
		var eventStaff = jQuery('<span/>', {
			text:staffString});

		var eventName = jQuery('<strong/>', {
			text: ' '+event.name})

		var eventLocation = jQuery('<span/>', {
			class:'location',
			text:' - '+event.location});

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
	 * renderTimeLane
	 * ----------------------------------------------------------------------------------
	 * 
	 * TODO :: rkim :: 06-Jun-2013
	 * Make the time lanes work with gutters. Time labels are to be  fixed to two cell
	 * divisions wide with paddings to be inserted between them.
	 */
	var renderTimeLane = function($laneGroup, groupData, settings) {
		
		var displayGroupHeaders = groupData.displayHeader;
		var startHour = settings.startTime.getHours();
		var endHour = settings.endTime.getHours();

		// Start by rendering in the time row into the calendar.
		// Make sure localized time strings can be supported.
		var $timeLane = jQuery('<div/>', {class: "time-lane"});
		var currentHour = startHour;
		while(currentHour <= endHour) {

			// Build the class string for the time lane
			var classString = "time-label";
			if (displayGroupHeaders)
				classString += " group";

			// 
			var $timeCell = jQuery("<div/>", {
				class: classString,
				text: currentHour + ":00"});
			$timeLane.append($timeCell);

			// 
			if (settings.divisionsPerHour > 2) {
				var $timePadding = jQuery("<div/>", {class:"time-padding"});
				$timeLane.append($timePadding);
			}
			currentHour++;
		}

		// Calculate and set the width of the elements in the 
		// time lane.
		var timeLabelWidth = 2 * settings.divisionWidth;
		var timePadding = (settings.divisionsPerHour - 2) * settings.divisionWidth;
		timeLabelWidth = timeLabelWidth.toString() + "px";

		$timeLane.find(".time-label").css({
			"width": timeLabelWidth,
			"min-width": timeLabelWidth,
			"max-width": timeLabelWidth});
		$timeSpacer = jQuery("<div/>", {class: "time-spacer"});

		$laneGroup.append($timeLane);
		$laneGroup.append($timeSpacer);
	}

	/**
	 * renderGridLane
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var renderGridLane = function ($gridLane, settings) {
		var startHour = settings.startTime.getHours();
		var endHour = settings.endTime.getHours();

		// TODO  :: rkim :: 08-Jun-2013
		// Though this value is configurable, changing cellsPerHour to anything
		// other than 2 will cause the solid grid lines to misalign under the 
		// hour labels.
		var cellsPerHour = settings.divisionsPerHour;
		var numberOfCells = (endHour - startHour) * cellsPerHour;
		
		// Need to add two cells for the gutters - the width for these will
		// eventually be made configurable, but for now, treat them as regular
		// grid cells.
		numberOfCells += 2;

		var gridIndex = 0;
		var gridClass = "grid start";
		while (gridIndex < numberOfCells) {
			$gridLane.append(jQuery("<div/>", {class: gridClass}));
			gridClass = "grid";

			// Set class string for the next iteration through
			//
			// TODO :: rkim :: 07-Jun-2013
			// This logic will need to be adjusted for values of cellsPerHour
			// greater than 2.
			if (gridIndex % cellsPerHour !== 0)
				gridClass += ' mid';

			gridIndex++;
		}
	};

	/**
	 * renderCurrentTimeMarker
	 * ----------------------------------------------------------------------------------
	 * Add a marker to the calendar indicating the current time and registers a function
	 * on a timer to update the position of the marker.
	 *
	 */
	var renderCurrentTimeMarker = function($laneGroup, settings) {

		var currentTime = new Date();
		if (currentTime.getTime() > settings.endTime.getTime()) {
			console.log("bailing")
			return;
		}

		currentTime.setSeconds(0);
		currentTime.setMilliseconds(0);

		// Create and add the time marker
		var pixelOffset = getTimeOffsetInPixels(currentTime, settings);
		var $timeMarker = jQuery('<div/>', {
			class: "current-time",
			style: "left: " + pixelOffset + "px"});
		$laneGroup.append($timeMarker);

		var updateInterval = 60000;	// 1 minute

		// If the current time occurs before the start of the calendar, set
		// the initial update interval to the difference in milliseconds
		// between the current time and the calendar start time by using
		// the previously determined pixel offset.
		if (currentTime.getTime() < settings.startTime.getTime()) {

		 	var hourWidth = settings.divisionWidth * settings.divisionsPerHour;
			var pixelsPerMinute = hourWidth / 60;
			updateInterval *= (60000 / pixelsPerMinute);
		}

		// Register update handler. We might want to save this off in case
		// we need to reference it in the future...
		setTimeout(function() {
			updateTimeMarker($timeMarker);
		}, updateInterval);
	};
	var updateTimeMarker = function($timeMarker) {

		// Might be smarter to recalculate the position. This method may
		// lead to gradual inaccuraccies....but I don't think we care
		// much.
		var currentPos = $timeMarker.position().left + 2;
		$timeMarker.css({"left": currentPos + "px"});

		console.log("updating time marker: " + currentPos);

		// Make sure the current position of the time marker is scrolled
		// off the page before turning off the marker update callback.
		var scrollWidth = $timeMarker.parents(".calendar-scroller")[0].scrollWidth;
		if (scrollWidth > currentPos + 2) {
			setTimeout(function() {
				updateTimeMarker($timeMarker);
			}, 60000);
		}
	};

	/**
	 * getTimeOffsetInPixels
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var getTimeOffsetInPixels = function(time, settings) {

	 	// Again, this assumes the start and end time occur on the same day
	 	var startHour = settings.startTime.getHours();
	 	var endHour = settings.endTime.getHours();

		// TODO :: rkim :: 08-Jun-2013
		// Compute and store all this at initialization.

	 	var cellsPerHour = settings.divisionsPerHour;
	 	var minutesPerCell = 60 / cellsPerHour;
	 	var hourWidth = settings.divisionWidth * cellsPerHour;
	 	var pixelsPerMinute = hourWidth / 60;

	 	var timeInMilliseconds = time.getTime();
	 	var startinMilliseconds = settings.startTime.getTime();
	 	var pixelOffset = timeInMilliseconds - startinMilliseconds;
	 	//var pixelOffset = (time.getTime() - settings.startTime.getTime());

	 	pixelOffset /= (60000 / pixelsPerMinute);			// to pixels
	 	pixelOffset += minutesPerCell * pixelsPerMinute;	// gutter width

	 	return pixelOffset;
	};

	/**
	 * setScrollPosition
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var setScrollPosition = function($scheduler, settings) {
		var $scroller = $scheduler.find('.calendar-scroller');


		var currentTime = new Date();
		var clientWidth = $scroller[0].clientWidth;
		var scrollerWidth = $scroller[0].scrollWidth - clientWidth;

		// If the current time is out of range, set the scroller
		// to the middle of the day.
		if (currentTime.getTime() < settings.startTime.getTime() ||
			currentTime.getTime() > settings.endTime.getTime()) {
			$scroller.scrollLeft(scrollerWidth / 2);
		}

		// Otherwise, center around the time marker
		else {
			var timePos = getTimeOffsetInPixels(currentTime, settings);
			$scroller.scrollLeft(timePos - clientWidth/2);
		}
	};

	/**
	 * bindEventHandlers
	 * ----------------------------------------------------------------------------------
	 *
	 */
	var bindEventHandlers = function($scheduler, settings) {

		// Handlers for most events that I think will be relevant.
		// Pretty sure some of these will not be used.

		var handlers = {
			expandedEvent: null,
			modalBox: null,
			collapseEvents: function(e) {

				// Skip collapse operation if an event was just
				// expanded.
				if (typeof e.eventExpanded != 'undefined' && e.eventExpanded) {
					return;
				}
				
				// Remove modal box
				if (handlers.modalBox != null) {
					handlers.modalBox.remove();
				}

				var expandedEvents = handlers.expandedEvents;
				if (handlers.expandedEvent != null) {
					var $event = $(handlers.expandedEvent);
					$event.css({"opacity":"1", "pointer-events":"auto"});
					$event.children('.event_o').children().css({"display":"block"});

					handlers.expandedEvent = null;
				}
			}
		};

		handlers.events = {

			clickHandler: function(e) {
				var $this = $(this);
				var xPos = e.clientX;
				var yPos = e.clientY;

				// Collapse open events before expanding another
				handlers.collapseEvents(e);
				
				// Mark current event as expanded
				handlers.expandedEvent = $this;
				e.eventExpanded = true;

				// Create popup
				var evPos = $this.position();
				var evOffset = $this.offset();

				var evHeight = $this.height();
				var evWidth = $this.width();

				var $modalBox = jQuery("<div/>", {
					class: "event popup",
					style: "height:"+evHeight+"px;width:"+evWidth+"px;left:"+evOffset.left+"px;top:"+evOffset.top+"px;"
				});
				$('.viewport').append($modalBox);

				//$this.parent().append($modalBox);

				handlers.modalBox = $modalBox;
				$modalBox.html($this.html());
				$modalBox.children('.event_o').css({"opacity":"1"});

				// Set the original event to transparent
				$this.css({"opacity":"0.3", "pointer-events":"none"});
				$this.children('.event_o').children().css({"display":"none"});



				// Calculate transition location and size
				var newHeight = "80px";
				var newWidth = "200px";

				// The new top and left positions should be calculated based off
				// the event click location.
				var clickClientX = e.clientX;
				var clickClientY = e.clientY;
				var scrollTop = $(window).scrollTop();
				var scrollLeft = $(window).scrollLeft();

				var moveX = clickClientX - evOffset.left + scrollLeft  - 205;
				if (moveX + evOffset.left < scrollLeft) {
					moveX += 210;
				}

				var moveY = clickClientY - evOffset.top + scrollTop - 85;
				if (moveY + evOffset.top < scrollTop) {
					moveY += 90;
				}

				// Animate
				setTimeout(function(){
					$modalBox.css({
						"-webkit-transition":"all .3s ease-in-out",
						"transform":"translate("+moveX+"px,"+moveY+"px)",
						"height":newHeight,
						"width":newWidth});
				}, 50);



				// Note :: rkim :: 09-Jun-2013
				// We are allowing the event to progate up through the DOM
			}
		};

		handlers.scheduler = {
			mouseDown: false,

			clickHandler: function(e) {
				handlers.collapseEvents(e);
			},
			mousedownHandler: function(e) {
				handlers.scheduler.mouseDown = true;
			},
			mousemoveHandler: function(e) {
				if (handlers.scheduler.mouseDown &&
					handlers.expandedEvent != null) {
					handlers.collapseEvents(e);
				}
			},
			mouseupHandler: function(e) {
				handlers.scheduler.mouseDown = false;
			}
		};


		handlers.grids = {

		};


		// Event Occurrences
		$scheduler.on("click", ".event", handlers.events.clickHandler);


		// Calendar Grids


		// Scheduler
		$scheduler.on("click", handlers.collapseEvents);
		$scheduler.on("scroll", handlers.collapseEvents);
		$scheduler.on("mousedown", handlers.scheduler.mousedownHandler);
		$scheduler.on("mousemove", handlers.scheduler.mousemoveHandler);
		$scheduler.on("mouseup", handlers.scheduler.mouseupHandler);

	}; // bindEventHandlers


 
})( jQuery );
