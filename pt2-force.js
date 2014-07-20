/* jshint undef: true, strict:false, trailing:false, unused:false, -W110 */
/* global $,_,document,window,console,escape,Backbone,exports,WebSocket,process,_NODE_AJAX,angular,jQuery */

/* 
  Simple Force directed plot example.
  by electronic Max for WS3 2014
  please copy, appropriate, improve, publish!

  Inspired by code from http://bl.ocks.org/mbostock/2706022

  If you want to jazz things up, add arrows!
  http://bl.ocks.org/d3noob/5141278

  Or, lovely colours http://bl.ocks.org/mbostock/4062045

*/


var plot = function(nodes, links) {

  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
  });

  var width = $(document).width(),
      height = $(document).height();

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(60)
      .charge(-300)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var link = svg.selectAll(".link")
      .data(force.links())
    .enter().append("line")
      .attr("class", "link")
      .attr('style', function(d) { return 'stroke-width:' + d.weight + 'px;'; });

  var node = svg.selectAll(".node")
      .data(force.nodes())
    .enter().append("g")
      .attr("class", "node")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .call(force.drag);

  node.append("circle")
      .attr("r", 8);

  node.append("text")
      .attr("x", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });

  function tick() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  function mouseover() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16);
  }

  function mouseout() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 8);
  }
}


$.get('/bieber.json').then(function(tweets) { 

    var nodes = {}, links = [];

    tweets.statuses.map(function(tweet) { 
       var people = [tweet.user.screen_name].concat(tweet.entities.user_mentions.map(function(mention) { return mention.screen_name ; }));

       // make the nodes
       people.map(function(p) { return nodes[p] || (nodes[p] = { name: p }); });
       
       // make the links
       people.slice(1).map(function(recipient) { 
         var link = links.filter(function(l) { 
            return l.source == tweet.user.screen_name && l.target == recipient; 
         });
         if (link && link[0]) { 
            link[0].weight += 1.0; 
         } else { 
           links.push({ source: tweet.user.screen_name, target:recipient, weight: 1.0 });
        }
       });
    });
    console.log('nodes >> ', nodes);
    console.log('links >> ', links);
    plot(nodes,links);
  }).fail(function(data) { 
    console.error('error loading data ', data);
  });

