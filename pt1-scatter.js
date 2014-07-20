/* jshint undef: true, strict:false, trailing:false, unused:false, -W110 */
/*global $,_,document,window,console,escape,Backbone,exports,WebSocket,process,_NODE_AJAX,angular,jQuery */

jQuery(document).ready(function() {

	var svg, 
		data,
		hmargin = 40,
		vmargin = 40,
		xscale, yscale,
		width, 
		height;

	var xval = function(tweet) {
		return tweet.text.split(' ').filter(function(x) { return x.trim().length > 0; }).length;
	};
	var yval = function(tweet) { return tweet.retweet_count+1; };

	var plot = function(tweets) {
		width = $('svg').width();
		height = $('svg').height();
		xscale = d3.scale.linear().range([hmargin, width-2*hmargin]),
		yscale = d3.scale.log().range([height-vmargin,vmargin]);

		var xvals = tweets.map(xval), 
			yvals = tweets.map(yval);

		console.log(' tokens - range ', [_.min(xvals), _.max(xvals)] );
		console.log(' retweets - range ', [_.min(yvals), _.max(yvals)] );
		
		xscale.domain([_.min(xvals), _.max(xvals)]);
		yscale.domain([_.min(yvals), _.max(yvals)]);

		svg.selectAll('circle.pt')
			.data(tweets)
			.enter()
			.append('circle')
			.attr('cx', function(t) { return xscale(xval(t)); })
			.attr('cy', function(t) { return yscale(yval(t)); })
			.attr('r', 5)
			.attr('class', 'pt');
 
		// let's add interactivity

		// have to un-declare handler to prevent re-attachment
		// due to the browser jQuery bug dealing with SVG 
		// elements not
		$('circle.pt').off('mouseover', null, null);
		$('circle.pt').on('mouseover', function(evt) {  
			var target = evt.target;
			console.log('target ', target);
			$('.tweet-display .text').html(target.__data__.text);
			$('.tweet-display .author').html("@"+target.__data__.user.screen_name);
			$(target).attr('class', 'pt selected');
		});
		$('circle.pt').on('mouseout', function(evt) { 
			var target = evt.target;
			$('.tweet-display .text, .tweet-display .author').html('');
			$(target).attr('class', 'pt');
		});

		var xaxis = d3.svg.axis().scale(xscale).orient('bottom'),
			yaxis = d3.svg.axis().scale(yscale).orient('left');

		svg.append('g')
			.attr('class','xaxis')
			.attr('transform', 'translate(0,'+(height-vmargin)+')')
			.call(xaxis);

		svg.append('g')
			.attr('class','yaxis')
			.attr('transform','translate('+3.0/4*vmargin+',0)')
			.call(yaxis);

	};

	var setup = function() { 
		console.log('setup');
		svg = d3.select('body').append('svg');
	};


	$.get('/bieber.json').then(function(tweets) { 
		data = tweets.statuses;
		setup();
		plot(data);
		window.biebs = tweets;
	}).fail(function(data) { 
		console.error('error loading data ', data);
	});

});