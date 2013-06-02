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
 *
 *
 *
 */
 
$.fn.fdScheduler = function(options) {
	
	
	var settings = $.extend({
	}, options || {});
	
	
	var render = function(){
		// 1. Generate calendar grid
		
		
		// 2. Render event overlays
		
	};
	
	//
	//
	var fdSchedule = 
	{
		clickHandler : function(event){
			console.log("clicked");
		},
		resizeHandler : function(event){
		}
	};
	
	
	//
	// Bind event handlers
	this.each(function() {
		// closure for each scheduler element
		var data = {
			$this : $(this),
			scheduler : $(this)[0]
		}

		// Bind click handler
		$(this).click(data, fdSchedule.clickHandler);
		$(this).resize(data, fdSchedule.resizeHandler);
	});


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