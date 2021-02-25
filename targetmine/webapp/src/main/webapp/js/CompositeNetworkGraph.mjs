'use strict';
import { TargetMineGraph } from "./TargetMineGraph.mjs";
import { MultiLayerNetwork } from "./MultiLayerNetwork.mjs";

/**
 * @class CompositeNetworkGraph
 * @classdesc
 * @author Rodolfo Allendes
 * @version 1.0
 */

export class CompositeNetworkGraph extends TargetMineGraph{

  /**
   * Constructor
   * @param {string} name The name of the network
   * @param {string} data The ArrayList string representation of the data retrieved
   * from the database
   * @param {int} width
   * @param {int} height
   */
  constructor(name, data, width, height){
    /* initialize super class attributes */
    super('compositeNetwork', name, width, height);

    /* define variables specific to the class */
    this._service = new intermine.Service({root:'https://targetmine.mizuguchilab.org/targetmine'});
    this._cy = undefined;
    this._network = new MultiLayerNetwork();

    this.initDOM();

    let self = this;
    this.loadData(data).then( () => {
      self._cy.add( self._network.getCytoscapeElements() );
      self._cy.layout({name: 'grid'}).run();
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
   * Initialize DOM elements
   */
  initDOM(){
    /* init common DOM elements */
    let container = d3.select('#compositeNetworkGraph-div');
    let cydiv = container.append('div')
      .attr('id', 'canvas_'+this._type)
      .attr('class', 'targetmineGraphCytoscape')
      .ready
      ;

    this._cy = cytoscape({
      container: jQuery('.targetmineGraphCytoscape'),
      style:[
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'shape': 'data(shape)',
            'background-color': 'data(color)',
            'border-color': 'data(borderColor)',
            'border-width': '1px',
            'display': 'element',
          }
        }
      ],
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

}
