'use strict';

import { TargetMineGraph } from "./TargetMineGraph.mjs";

/**
 * @class CompositeNetworkGraph
 * @classdesc
 * @author Rodolfo Allendes
 * @version 1.0
 */

export class CompositeNetworkGraph extends TargetMineGraph{

  /**
   *
   * @param {string} name The name of the network
   * @param {string} data The ArrayList string representation of the data retrieved
   * from the database
   * @param {int} width
   * @param {int} height
   */
  constructor(name, data, width, height){
    /* initialize super class attributes */
    super('compositeNetwork', name, width, height);
    /* parse data to local storage */
    super.loadData(data);

    /* define variables specific to the class */
    this._service = new intermine.Service({root:'https://targetmine.mizuguchilab.org/targetmine'});
    this._cy = undefined;

    /* FOR NOW TO KEEP A LIST OF NODES, SHOULD USE SPECIFIC CLASS FOR THIS */
    this._nodes = [];
    this._data.forEach(d => {this._nodes.push(d.ncbiGeneId.toString()) });

    /* initialize DOM elements */
    this.initDOM();
  }

  /**
   * Initialize DOM elements
   */
  initDOM(){
    /* init common DOM elements */
    // jQuery('.targetmineGraphDisplayer').append('<div id="canvas_'+this._type+'"></div>')
    //
    // jQuery('canvas_'+this.type).addClass('targetmineGraphCytoscape');

    let container = d3.select('.targetmineGraphDisplayer');
    let cydiv = container.append('div')
      .attr('id', 'canvas_'+this.type)
      .attr('class', 'targetmineGraphCytoscape')
      .ready
      ;

    this._cy = cytoscape({
      container: jQuery('.targetmineGraphCytoscape'),
      layout:{
        name: 'concentric'
      }
    });
    /* define the style of network components */
    this._cy.style()
      /* default style for node elements */
      .selector('node')
      .style({
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'shape': 'data(shape)',
        'background-color': 'data(color)',
        'border-color': 'data(borderColor)',
        'border-width': '1px',
        'display': 'element',
      })
    // .selector('node.connected')
    // .style({
    //   'background-color': nodeColor.CONNECTED,
    //   'border-color': nodeColor.CONNECTED,
    // })
    // .selector('node.highlighted')
    // .style({
    //   'background-color': nodeColor.HIGHLIGHT,
    //   'border-color': nodeColor.HIGHLIGHT,
    // })
    // .selector('node:selected')
    // .style({
    //   'border-width': '5px',
    //   'background-color': nodeColor.SELECTED,
    //   'border-color': nodeColor.SELECTED,
    // })
    // .selector('node.hidden')
    // .style({
    //   'display': 'none',
    // })
    // /* default style for edges */
    // .selector("edge")
    // .style({
    //   "line-color": "data(color)",
    // })
    // .selector('edge.connected')
    // .style({
    //   'line-color': edgeColor.CONNECTED,
    // })
    // .selector('edge.highlighted')
    // .style({
    //   'line-color': edgeColor.HIGHLIGHT,
    // })
      .update();

    this.initGraphData();
  }

  /**
   *
   */
  initGraphData(){
    /* load the core genes and add its nodes and interactions */
    let query = {
      from: 'Gene',
      select: ['symbol', 'ncbiGeneId'],
      where:[
        { path: 'Gene', op: "LOOKUP", value: this._nodes },
      ]
    };
    this._result = this._service.rows(query);

    this._data.forEach(function(ele){
      this._cy.add({
        group: 'nodes',
        data:{
          id: ele.ncbiGeneId,
          label: ele.ncbiGeneId,
          color: '#00ff00',
          borderColor: '#00ff00',
          shape: 'ellipse',
        }
      });
    },this);

    this._hcdpQuery = {
      from: 'Gene',
      select: ['interactions.gene2.ncbiGeneId'],
      where:[
        { path: 'ncbiGeneId', op: "=", value: ['1124'] },
        { path: 'interactions.confidences.type', op: '=', value: 'HCDP' }
      ]
    };

    this._tfTargetsQuery = {
      from: 'Gene',
      select: ['ncbiGeneId'],
      where:[
        { path: 'transcriptionalRegulations.targetGene.ncbiGeneId', op: "=", value: ['1124'] },
        { path: 'transcriptionalRegulations.dataSets.name', op: "!=", value: "ENCODE ChIP-seq data" }
      ]
    };

    this._miRNAQuery = {
      from: 'Gene',
      select: ['miRNAInteractions.miRNA.secondaryIdentifier'],
      where:[
        { path: 'ncbiGeneId', op: "=", value: ['11151'] },
        { path: 'miRNAInteractions.supportType', op: "=", value: "Functional MTI" }
      ]
    };

    this._tfTargets = this._service.rows(this._tfTargetsQuery);
    this._miRNA = this._service.rows(this._miRNAQuery);


    this._cy.layout({name: 'grid'}).run();

  }

}
