/*
 * jQuery Infinitely Scrollable Calendar
 *
 * version 0.0a (28-May-2013)
 * Copyright (c) 2013 Front Desk, Inc.
 *
 */
;(function($){

/**
 *
 * TODO :: rkim :: 28-May-2013
 *
 * A long and useful commemnt on how all this works
 *
 *
 *
 *
 */
$.fn.infiniteScrollable = function(options) {

	// TODO :: rkim :: 28-May-2013
	// Implement these things.
	//
	// They're non-trivial, btw.
	var prefetchRequestQueue = null;	// Queue to hold data fetch requests
	var dataCache = null;				// Where loaded data resides

	//
	//
	var scrollerStateEnum =
	{
		UNINITIALIZED	: 0,
		READY			: 1,
		IN_PROGRESS		: 2
	};

	//
	//
	var settings = $.extend({
		scrollSelector		: '>:first',
		triggerPercent		: 0.05,
		maxNumberOfPanels	: 5,

	}, options || {});
		
	// The following variables are for 
	// tracking the state of the infinite
	// scroller.
	settings.handlerState = scrollerStateEnum.READY;
	settings.inTriggerRegion = false;

	
	//
	//
	//
	var rearrangePanels = function($scroller, direction)
	{
		// TODO :: rkim :: 28-May-2013
		// Panel rearrangement / infinite scroll functionality
		// TBD.
		// 
		// Do a fancy bg-color transition for now to indicate
		// the event handler has fired
		/*
		$scroller.find('.event').not('.day-boundary').css({
			"transition":"background-color 1s",
			"background-color":"#cc2233"});
		*/
		
		settings.handlerState = scrollerStateEnum.IN_PROGRESS;
		
		/*
		setTimeout(function()
			{
				$scroller.find('.event').not('.day-boundary').css({
					"transition":"background-color 0.5s",
					"background-color":"#ffffff"});
				
				settings.handlerState = scrollerStateEnum.READY;
			}, 300);	// Timeout in milliseconds
		*/
	}


	//
	//
	//
	var prefetchData = function ($scroller){
	}

	var infiniteScroll = 
	{
		scrollHandler : function(event)
		{
			// 1. Check if an action handler is already in progress
			if (settings.handlerState === scrollerStateEnum.IN_PROGRESS)
				return;

			var $this = event.data.$this;
			var scrollable = event.data.scrollable;

			// Should save all this off into the settings
			// structure so we don't have to recalculate them 
			var clientWidth = $this.width();
			var scrollPosition = scrollable.scrollLeft;
			var scrollWidth = scrollable.scrollWidth;
			var triggerPercent = settings.triggerPercent;
			var triggerRange = scrollWidth * triggerPercent;
		
			// 2. Check if the current scroll position is within
			// the "actionable zone"
			var triggerLeftPos = triggerRange;
			var triggerRightPos = scrollWidth - triggerRange - clientWidth;

			var triggeredLeftZone = scrollPosition < triggerLeftPos;
			var triggeredRightZone = scrollPosition > triggerRightPos;
			if (!triggeredLeftZone && !triggeredRightZone)
			{
				settings.inTriggerRegion = false;
				return;
			}

			if (settings.inTriggerRegion)
				return;

			// 3. Do infinite scroll magic
			settings.inTriggerRegion = true;
			rearrangePanels($this);
		},

		resizeHandler : function(event)
		{
			// Recalculate scroller values
		
		}
	}
	 
	this.each(function() {
		// closure for each scrollable element
		var data = {
			$this : $(this),
			scrollable : $(this)[0]
		}

		// Bind scroll handler
		$(this).scroll(data, infiniteScroll.scrollHandler);
	});

};	// end $.fn.infiniteScrollable

})( jQuery ); 
