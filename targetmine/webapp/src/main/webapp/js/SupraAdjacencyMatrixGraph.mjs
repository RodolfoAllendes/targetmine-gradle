'use strict';

import { TargetMineGraph } from "./TargetMineGraph.mjs";
import { MultiLayerNetwork } from "./MultiLayerNetwork.mjs";

/**
 * @class SupraAdjacencyMatrixGraph
 * @classdesc
 * @author Rodolfo Allendes
 * @version 1.0
 */

export class SupraAdjacencyMatrixGraph extends TargetMineGraph{

  /**
   * Constructor
   * @param {string} name The name of the network
   * @param {string} data The ArrayList string representation of the data retrieved
   * from the database
   * @param {string} containerId
   * @param {int} width
   * @param {int} height
   */
  constructor(name, data, containerId, width, height){
    /* initialize super class attributes */
    super('supraAdjacencyMatrix', name, width, height);
    super.initDOM([], containerId);

    /* define variables specific to the class */
    this._service = new intermine.Service({root:'https://targetmine.mizuguchilab.org/targetmine'});
    this._network = new MultiLayerNetwork();


    this.loadData(data).then( () => {
      console.log('data loaded');

      this.initXLabels();
      super.initXAxis();
      super.plotXAxis(90);

      this.initYAxis();
      super.plotYAxis();

      this.plot();
    });
  }

  /**
   * use data to load initial layer of the network
   *
   * @param {string} data Java ArrayList string representation of the ncbiGeneId
   * for element in the initial bag
   */
  loadData(data){
    let self = this;
    super.loadData(data);
    this._data = this._data.map( d => { return d.ncbiGeneId.toString(); } );

    // we will add the core elements (those coming directly from the original
    // bag) to a new layer
    this._network.addLayer( 'Gene', 'LightGray', 'ellipse');
    let query = {
      from: 'Gene',
      select: ['ncbiGeneId', 'symbol'],
      where:[
        { path: 'Gene', op: "LOOKUP", value: this._data },
      ]
    };
    return new Promise( resolve => {
      resolve(self._service.rows(query));
    }).then(rows => {
      rows.forEach(row => { self._network.addNode(row[0], row[1], 'Gene'); });

    }).then( () => {
      this._network.addLayer( 'MiRNA', 'DarkKhaki', 'triangle');
      // Once we have the core, we add pre-defined layers to the graph
      let mirnaquery = {
        from: 'Gene',
        select: [
          'ncbiGeneId',
          'miRNAInteractions.miRNA.primaryIdentifier',
          'miRNAInteractions.miRNA.secondaryIdentifier'
        ],
        where:[
          { path: 'Gene', op: "LOOKUP", value: this._data },
          { path: 'miRNAInteractions.supportType', op: '=', value: 'Functional MTI' }
        ]
      };
      return new Promise( resolve => {
        resolve(self._service.rows(mirnaquery))
      }).then( rows => {
        this.addNodesFromResults(rows, 'MiRNA');
        this.addEdgesFromResults(rows);
      });

    }).then( () => {
      let hcdpQuery = {
        from: 'Gene',
        select: [
          'ncbiGeneId',
          'interactions.gene2.ncbiGeneId',
          'interactions.gene2.symbol'
        ],
        where:[
          { path: 'Gene', op: "LOOKUP", value: this._data },
          { path: 'interactions.confidences.type', op: '=', value: 'HCDP' }
        ]
      };
      return new Promise( resolve => {
        resolve(self._service.rows(hcdpQuery))
      }).then( rows => {
        this.addNodesFromResults(rows, 'Gene');
        this.addEdgesFromResults(rows);
      });

    }).then( () => {
      this._network.addLayer('TranscriptionFactor', 'LightBlue' , 'rectangle');
      let tfQuery = {
      from: 'Gene',
        select: [
          'transcriptionalRegulations.targetGene.ncbiGeneId',
          'ncbiGeneId',
          'symbol'
        ],
        where:[
          { path: 'transcriptionalRegulations.targetGene', op: "LOOKUP", value: this._data },
          { path: 'transcriptionalRegulations.dataSets.name', op: "!=", value: "ENCODE ChIP-seq data" }
        ]
      };
      return new Promise( resolve => {
        resolve(self._service.rows(tfQuery))
      }).then( rows => {
        this.addNodesFromResults(rows, 'TranscriptionFactor');
        this.addEdgesFromResults(rows);
      });
    });

  }

  /**
   * Add the nodes that result from the query to the network and the cytoscape
   */
  addNodesFromResults(rows, layer){
    rows.forEach(row => {
      this._network.addNode(row[1], row[2], layer);
    });
  }

  /**
   *
   */
  addEdgesFromResults(rows){
    rows.forEach( row => {
      this._network.addEdge(row[0]+'-'+row[1],row[0], row[1]);
    });
  }

  /**
   *
   */
  initXLabels(){
    this._xLabels = [];
    let nodes = this._network.getNodes();
    for( let node in nodes ){
      this._xLabels.push(nodes[node].label);
    }
  }

  /**
   * As the graph plots a squared matrix, the Y-axis required is a copy of the
   * alreay available x-Axis
   */
  initYAxis(){
    let scale = d3.scaleBand()
      .domain(this._xLabels)
      .range( [this._height-this._margin.bottom, this._margin.top] )
      .padding(0.05)
    ;
    /* create the corresponding axis */
    this._yAxis = d3.axisLeft(scale);
  }

  /**
   *
   */
  plot(){
    let X = this._xAxis.scale();
    let Y = this._yAxis.scale();

    let points = [];
    let nodes = this._network.getNodes();
    let edges = this._network.getEdges();
    let layers = this._network.getLayers();

    for( let edge in edges ){

      points.push({
        x: X(nodes[edges[edge].source].label),
        y: Y(nodes[edges[edge].target].label),
        color: layers[nodes[edges[edge].target].layer].color,
      });

      points.push({
        y: Y(nodes[edges[edge].source].label),
        x: X(nodes[edges[edge].target].label),
        color: layers[nodes[edges[edge].target].layer].color,
      });
    }

    // console.log(points);

    // d3 part for plotting the squares
    let canvas = d3.select('svg#canvas_supraAdjacencyMatrix > g#graph');
    canvas.selectAll('#points').remove();
    canvas.append('g')
      .attr('id', 'points')
      .attr('transform', 'translate('+this._margin.left+',0)')
    ;

    let pts = d3.select('#points').selectAll('g')
      .data(points)
    ;
    let point = pts.enter().append('rect')
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", d => d.color);
  }

}
