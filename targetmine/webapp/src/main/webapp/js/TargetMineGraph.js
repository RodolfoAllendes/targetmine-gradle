'use strict';

// margins from the border of the canvas that wont be used for drawing
var margin = {top: 40, right: 40, bottom: 80, left: 40};
// available drawing space for the canvas
// var width = 800;
// var height = 400;

/**
 * @class TargetMineGraph
 * @classdesc Generic description of graph elements required to display a graph
 * as part of a report page in TargetMine
 * @author Rodolfo Allendes
 * @version 0.1
 */
class TargetMineGraph{

  /**
   * Initialize a new instance of TargetMineGraph
   *
   * @param {string} name The title for the graph
   * @param {int} width The width of the viewbox in the svg element
   */
  constructor(name, width, height){
    // the title of the graph
    this.name = name;
    // data used for the generation of the graph
    this.data = undefined;

    // dimensions of the canvas
    this.width = width;
    this.height = height;
    // d3 axis used in the graph
    this.xAxis = undefined;
    this.yAxis = undefined;
    // the labels used in the x axis of the graph
    this.xLabels = undefined;
  }

  /**
   * Load data for graph display
   * Data is provided by TargetMine in the form of an ArrayList. The first
   * element includes the names for the data columns, with the following n-1
   * elements of the array each representing a tab separated data point. Since
   * the ArrayList is converted to its String representation before being
   * transfered, items in the Array are separated by the character ','
   *
   * @param {string} data The Java ArrayList string representation of the data
   * retrieved from the database for the construction of the graph.
   */
  loadData(data){
    /* cleaning of the string provided triming of starting and end charachters
     * and replacement of ', ' for line separators */
    data = data.substring(1, data.length-1);
    data = data.replace(/, /g, '\n');
    /* local storage of the data */
    this.data = d3.tsvParse(data, d3.autoType);
  }

  /**
   * Initialize the labels of the X axis of the Graph.
   * Indiviudual values are required to construct the categorical scales used
   * for color and shape, later used to map distinctive points at the time of
   * display.
   *
   * @param {string} column The column in the data whose individual values will
   * be used for the initial labesl
   */
  initXLabels(column){
    this.xLabels = this.data.reduce(function(prev, current){
      if( ! prev.includes(current[column]) )
        prev.push( current[column] );
      return prev;
    }, ['']);
    this.xLabels = this.xLabels.concat(['']);
  }

  /**
   * Dynamically generate the X-Axis used in the graph
   * Generate a categorical scale and axis, to be used in the display of the
   * current graph, based in the given key. The key must be a valid identifier
   * for the graph's data element.
   *
   * @param {string} key The key (in the dataset) used to define the axis
   */
  initXAxis(){
    /* The bottom axis will map to a series of discrete pixel values, evenly
     * distributed along the drawing area, we use startx and dx to define the
     * starting and step that define the ticks in the axis */
    let startx = margin.left;
    let dx = (this.width-margin.left-margin.right)/(this.xLabels.length-1);
    /* define an ordinal scale */
    let scale = d3.scaleOrdinal()
      .domain(this.xLabels)
      .range(this.xLabels.map(function(k,i){ return startx+i*dx; }))
      ;
    /* create the corresponding axis */
    this.xAxis = d3.axisBottom(scale);
  }

}

/**
 * @class GeneExpressionGraph
 * @classdesc Used to display a Gene Expression level graph in the report page of genes
 * @author Rodolfo Allendes
 * @version 0.1
 */
class GeneExpressionGraph extends TargetMineGraph{


  /**
   * Initialize a new instance of GeneExpressionGraph
   *
   * @param {string} name The title for the graph
   */
  constructor(name, width, height){
    /** initialize super-class attributes */
    super(name, width, height);

    /* the different levels of specificity at which we can look gene expression */
    this.levels = {
      0: 'category',
      1: 'organ',
      2: 'name'
    };
    Object.freeze(this.levels);
    // to handle the expansion and collapsing of labels, we need to know to
    // which level each label belongs
    this.xLabelLevels = undefined;

    /* Add a base component to the SVG element. The drawing of each element in
     * the svg will be nested to this basic component */
    let graph = d3.select('svg#canvas').append('g')
      .attr('id', 'graph')
    ;
  }

  /**
   * Initialize the labels of the X axis of the Graph.
   * Using the super-class method, not only set the text for the labels of the X
   * axis of the graph, but also initialize the list of levels associated to each
   * label.
   *
   * @param {string} column The column in the data used for initial labels
   */
  initXLabels(column){
    // initialize labels
    super.initXLabels(column);
    // and the levels
    this.xLabelLevels = Array(this.xLabels.length).fill(0);
  }

  /**
   *
   * @param {string} key the source element which we are trying to collapse into
   * is parent category.
   * @return {boolean} whether the collapsing took place or not
   */
  collapseXLabels(key){
    /* recover the information on the value being expanded */
    let i = this.xLabels.indexOf(key); // its position
    let lvl = this.xLabelLevels[i]; // its level
    console.log('Collapse:', key, i, lvl);

    /* we can only collapse levels 1 and 2, otherwise, we do nothing */
    if( lvl === 1 || lvl === 2 ){
      let cat = this.levels[lvl];
      let supcat = this.levels[lvl-1];

      /* I need to know the value of the parent category of the current key */
      let supkey = (this.data.find( ele => ele[cat] === key ))[supcat];

      let delLabels = this.data.reduce(function(prev, current){
        if( current[supcat] === supkey && !prev.includes(current[cat]) )
        prev.push(current[cat]);
        return prev;
      }, []);

      let j = this.xLabels.indexOf(delLabels[0]);
      /* update the text labels */
      this.xLabels.splice(j, delLabels.length, supkey);
      // this.xLabels = this.xLabels.flat();
      /* and the level of the labels */
      this.xLabelLevels.splice(j, delLabels.length, lvl-1);
      // this.xLabelLevels = this.xLabelLevels.flat();
      //
      super.initXAxis();
      this.plot();

      return true;
    }
    else{
      console.log('Not possible to collapse this level');
      return false;
    }
  }

  /**
   *
   * @param {string} key
   * @return a boolean value indicating if the expansion was carried out or not
   */
  expandXLabels(key){
    /* recover the information on the value being expanded */
    let i = this.xLabels.indexOf(key); // its position
    let lvl = this.xLabelLevels[i]; // its level
    console.log('Expanding:', key, i, lvl);

    /* we can only expand levels 0 and 1, otherwise, we do nothing */
    if( lvl === 0 || lvl === 1 ){
      let category = this.levels[lvl];
      let subcat = this.levels[lvl+1];
      let newLabels = this.data.reduce(function(prev, current){
        if( current[category] === key && !prev.includes(current[subcat]) )
        prev.push(current[subcat]);
        return prev;
      }, []);
      /* update the text labels */
      this.xLabels.splice(i, 1, newLabels);
      this.xLabels = this.xLabels.flat();
      /* and the level of the labels */
      this.xLabelLevels.splice(i, 1, Array(newLabels.length).fill(lvl+1));
      this.xLabelLevels = this.xLabelLevels.flat();

      super.initXAxis();
      this.plot();

      return true;
    }
    else{
      console.log('Not possible to expand this level');
      return false;
    }
  }



  /**
   * Dynamically generate the Y-Axis used in the graph
   * Different scales can be used for the display of the data. The left-side
   * axis in particular must correspond to a numerical value, and the scale
   * generated is logarithmic.
   *
   * @param {string} key The key value, from the one availables in the dataset,
   * used to construct the scale.
   */
  initYAxis(){
    /* we need to define min and maximum values for the scale */
    let max = this.data.reduce(function(p, c){ return Math.max(+c['value'], p); }, -Infinity);
    // let min = this.data.reduce(function(p, c){ return Math.min(+c['value'], p); }, +Infinity);
    /* define a logarithmic scale */
    let scale = d3.scaleLinear()
      .domain([0,  max])
      .range([height-margin.bottom,margin.top])
      .nice() // make the scale have rounded endpoints based on min and max
    ;
    /* create the corresponding axis */
    this.yAxis = d3.axisLeft(scale);
    this.yAxis.ticks(10, '~g');

  }

  /**
   *
   */
  plotXAxis(angle){
    let self = this;
    /* remove previous axis components */
    let canvas = d3.select('svg#canvas > g#graph');
    canvas.selectAll('#bottom-axis').remove();

    let g = canvas.append('g')
      .attr('id', 'bottom-axis')
      .attr('transform', 'translate(0,'+(this.height-margin.bottom)+')')
      .call(this.xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate("+angle+")")
        .style("text-anchor", "start")
        .on('click', function(d){ self.expandXLabels(d); })
        .on('contextmenu', function(d){ d3.event.preventDefault(); self.collapseXLabels(d); })
    ;
  }

  /**
   *
   */
  plotYAxis(){
    /* remove previous axis components */
    let canvas = d3.select('svg#canvas > g#graph');
    canvas.selectAll('#left-axis').remove();
    canvas.append("g")
      .attr('id', 'left-axis')
      .attr('transform', 'translate('+margin.left+',0)')
      .call(this.yAxis)
    ;

    // d3.selectAll('svg#canvas > text#left-axis-label').remove();
    // let label = canvas.append('text')
    //   .attr('id', 'left-axis-label')
    //   .attr('transform', 'rotate(-90)')
    //   .attr('y', -margin.left/3)
    //   .attr('x', -height/2)
    //   .attr('dy', '1em')
    //   .style('text-anchor', 'middle')
    //   .text('Concentration (nM)')
  }


  /**
   *
   */
  plot(){
    this.plotXAxis(45);
    this.plotYAxis();

    // let self = this;
    //
    // /* Generate an array of data points positions and colors based on the scale
    //  * defined for each axis */
    // let xscale = this.xAxis.scale();
    // let yscale = this.yAxis.scale();
    //
    // let points = [];
    // this.xLabels.forEach(function(ele, i){
    //   let col = self.labels[self.xLabelLevels[i]];
    //   let current = self.data.reduce(function(prev, curr){

    //     if( curr[ele] )
    //     points.push(
    //       {
    //         x: xscale(ele),
    //         y: yscale(current[ele]),
    //       }
    //     );
    //     return prev;
    //   }, []);
    //   points = points.concat(cuurent);
    //   /* filter out the points that are hidden from the visualization */
    // };
    //
    // /* redraw the points, using the updated positions and colors */
    // let canvas = d3.select('svg#canvas > g#graph');
    // canvas.selectAll('#points').remove();
    //
    // canvas.append('g')
    //   .attr('id', 'points')
    // ;
    //
    // /* for each data point, generate a group where we can add multiple svg
    //  * elements */
    // let pts = d3.select('#points').selectAll('g')
    //   .data(points)
    // let point = pts.enter().append('g')
    //   .attr('class', 'data-point')
    //   .append('path')
    //     .attr('transform', function(d){ return 'translate('+d.x+','+d.y+')'; })
    //     .attr('fill', function(d){return d.color;})
    //     .attr('d', function(d){
    //       let s = ['Circle','Cross','Diamond','Square','Star','Triangle','Wye']
    //       let symbol = d3.symbol()
    //         .size(50)
    //         .type(d3.symbols['Circle'])
    //       ;
    //       return symbol();
    //     })
    // ;
    //
  }



}
