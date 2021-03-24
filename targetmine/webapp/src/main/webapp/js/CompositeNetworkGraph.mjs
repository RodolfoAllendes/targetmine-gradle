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
   * @param {string} data The ArrayList string representation of the data 
   * retrieved from the database args[0]
   * @param {string} containerId The DOM identifier of the container for the
   * visualization args[1]
   * @param {int} width the width of the visualization container args[2]
   * @param {int} height the height of the visualization container args[3]
   */
  constructor(name, data, containerId, width, height,
    rootClass,
    collections){
    /* initialize super class attributes */
    super('compositeNetwork');
    super.setName(name);
    super.setContainerId(containerId);
    super.setWidth(width);
    super.setHeight(height);
    
    /* and class attributes */
    this._service = new intermine.Service({root:'https://targetmine.mizuguchilab.org/targetmine'});
    this._network = new MultiLayerNetwork();
    this._cy = undefined;

    /* initialize the root class and its corresponding layer */
    this._rootClass = rootClass.substr(rootClass.lastIndexOf('.')+1);
    this._network.addLayer(this._rootClass, 'LightGray', 'ellipse');
    
    /* initialize the underlying model */
    this._service.fetchModel().then( model => {
      this._model = model; 

      /* initialize general DOM elements */
      this.initDOM(); //collections.substring(1,collections.length-1).split(','));

      /* initialize the first layer of the network and display */
      this.loadData(data)//, rootClass);
    });
  }

  /**
   * Load initial data for the visualization
   * This initial list of identifiers should be used to define the first layer 
   * of the multi-layer network
   *
   * @param {string} data Java ArrayList string representation of the ncbiGeneId
   * for element in the initial bag
   */
  loadData(data){
    super.loadData(data);
    this._data = this._data.map( d => { return d.ncbiGeneId.toString(); } );

    // fetch initial from the database, using the model, and add it to the network
    let att = Object.keys(this._model.classes[this._rootClass].attributes);
    let from = this._rootClass; //'Gene';
    let select = ['ncbiGeneId', 'symbol'];
    let where = [
      { path: this._rootClass, op: "LOOKUP", value: this._data },
    ];

    // update the add layer select 
    let col = Object.keys(this._model.classes[this._rootClass].collections);
    this.updateTargets(col);

    return this.runQuery(from, select, where);
  }

  /**
   * Initialize DOM elements
   * 
   * @param {} targets These are all the target collections available for the
   * current source element
   */
  initDOM(){//targets){
    let self = this;
    const elements = [
      // main visualization area
      { 
        type: 'div',
        id: `canvas_${this._type}`,
        attributes: new Map([
          ['class', 'targetmineGraphCytoscape']
        ])
      },
      // right side controlers
      { 
        type: 'div',
        id: `rightColumn_${this._type}`,
        attributes: new Map([
          ['class', 'rightColumn'],
        ]),
        children:[
          { 
            type: 'div', 
            id: 'newLayer-div',
            attributes: new Map([ ['class', 'flex-table'] ]), 
            children: [
              { type: 'label', attributes: new Map([ ['text', 'Add Layer:'] ])},
              { type: 'select', id: 'networkLayer-select' },
              { 
                type: 'button',
                id: 'layer-add',
                attributes: new Map([ ['text','Add'], ['class', 'modal-button'] ]),
                on: new Map([ ['click', function(){ self.addLayer(); }] ]),
              },
            ]
          },
          { 
            type: 'div', 
            id: 'layers-div', 
            children: [
              { type: 'br', },
              { type: 'label', attributes: new Map([ ['text', 'Layers:'] ])},
              { type: 'table', id: 'layer-table', children: [ {type: 'tbody'}]},
              { 
                type: 'button', 
                id: 'color-add', 
                attributes: new Map([ ['text', 'Add'] ]),
                on: new Map([ ['click', function(){ self.modalDisplay('color')}] ]),
              },
            ]
          },
        ]
      },
      { 
        type: 'div',
        id: 'modal',
        attributes: new Map([ ['class', 'modal'], ]),
        children:[
          { 
            type: 'div',
            id: 'modal-content',
            attributes: new Map([ ['class', 'modal-content'], ]),
            children:[
              { 
                type: 'h3',
                id: 'modal-title',
                attributes: new Map([ ['class', 'modal-title'], ]),
              },
              { type: 'label', attributes: new Map([ ['class','modal-item modal-label'], ['text','Category:'] ]), },
              { 
                type: 'select',
                id: 'modal-column-select',
                attributes: new Map([ ['class','modal-item modal-select'] ]),
                on: new Map([ ['change',function(e){
                  console.log('estoy aqui');
                  let values = [...new Set(self._data.map(pa => pa[e.target.value]))];
                  self.updateSelectOptions('#modal-value-select', values);}] ]),
              },
              { type: 'label', attributes: new Map([ ['class','modal-item modal-label'], ['text','Value:'] ]) },
              { 
                type: 'select',
                id: 'modal-value-select',
                attributes: new Map([ ['class','modal-item modal-select'], ]),
              },
              { 
                type: 'div', 
                id: 'modal-input', 
                attributes: new Map([ ['class','modal-content'], ]),
                style: new Map([ ['grid-column','span 3'], ]),
              },
              { 
                type: 'button', 
                id: 'modal-ok', 
                attributes: new Map([ ['class', 'modal-item modal-button'], ['text', 'OK'] ]),
                style: new Map([ ['grid-column', '3'] ]),
                on: new Map([ ['click', function(){self.modalOK()} ] ]) 
              },
              { 
                type: 'button', 
                id: 'modal-cancel', 
                attributes: new Map([ ['class', 'modal-item modal-button'], ['text', 'Cancel'] ]),
                style: new Map([ ['grid-column','3'] ]),
                on: new Map([ ['click',function(){ d3.select('#modal').style('display','none'); }] ]),
              },
            ],
          }
        ]   
      }
    ];

    super.addToDOM(this._containerId, elements);
    // this.updateTargets(targets);

    /* initialize the properties of the Cytoscape container */
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
   * 
   * @param targets 
   */
  updateTargets(targets){
    d3.select('#networkLayer-select').selectAll('option').remove();
    d3.select('#networkLayer-select').selectAll('option')
      .data(targets)
      .enter().append('option')
        .attr('value', d => d)
        .text(d => d.substr(d.lastIndexOf('.')+1))
  }

  /**
   * 
   */
  runQuery(from, select, where){
    // we will add the core elements (those coming directly from the original
    // bag) to a new layer
    let self = this;
    let query = {
      from: from,
      select: select, 
      where: where, 
    };
    return new Promise( resolve => {
      resolve(self._service.rows(query));
    }).then(rows => {
      
      rows.forEach(row => { 
        console.log(row);
        let id = row[0];
        let attributes = {};
        select.forEach(function(d,i){
          if(i > 0)
            attributes[d] = row[i];
        });
        console.log(id, attributes);
        self._network.addNode(from, id, attributes);
      });

    }).then( ()=> { self.plot(); });


    // }).then( () => {
    //   let hcdpQuery = {
    //     from: 'Gene',
    //     select: [
    //       'ncbiGeneId',
    //       'interactions.gene2.ncbiGeneId',
    //       'interactions.gene2.symbol'
    //     ],
    //     where:[
    //       { path: 'Gene', op: "LOOKUP", value: this._data },
    //       { path: 'interactions.confidences.type', op: '=', value: 'HCDP' }
    //     ]
    //   };
    //   return new Promise( resolve => {
    //     resolve(self._service.rows(hcdpQuery))
    //   }).then( rows => {
    //     this.addNodesFromResults(rows, 'Gene');
    //     this.addEdgesFromResults(rows);
    //   });

    // }).then( () => {
    //   this._network.addLayer('TranscriptionFactor', 'LightBlue' , 'rectangle');
    //   let tfQuery = {
    //   from: 'Gene',
    //     select: [
    //       'transcriptionalRegulations.targetGene.ncbiGeneId',
    //       'ncbiGeneId',
    //       'symbol'
    //     ],
    //     where:[
    //       { path: 'transcriptionalRegulations.targetGene', op: "LOOKUP", value: this._data },
    //       { path: 'transcriptionalRegulations.dataSets.name', op: "!=", value: "ENCODE ChIP-seq data" }
    //     ]
    //   };
    //   return new Promise( resolve => {
    //     resolve(self._service.rows(tfQuery))
    //   }).then( rows => {
    //     this.addNodesFromResults(rows, 'TranscriptionFactor');
    //     this.addEdgesFromResults(rows);
    //   });
    // });
  }

  addLayer(){
    console.log('calling add layer function');
        //.then( () => {
    this._network.addLayer( 'MiRNA', 'DarkKhaki', 'triangle');
    //   // Once we have the core, we add pre-defined layers to the graph
    let from = 'Gene';
    let select = [
        'ncbiGeneId',
        'miRNAInteractions.miRNA.primaryIdentifier',
        'miRNAInteractions.miRNA.secondaryIdentifier'
      ];
    let where = [
        { path: 'Gene', op: "LOOKUP", value: this._data },
        { path: 'miRNAInteractions.supportType', op: '=', value: 'Functional MTI' }
      ];
    
    return this.runQuery(from, select, where);
    // return new Promise( resolve => {
    //   resolve(self._service.rows(mirnaquery))
    // }).then( rows => {
    //   this.addNodesFromResults(rows, 'MiRNA');
    //   this.addEdgesFromResults(rows);
    // });
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
  plot(){
      // this.loadData(data, rootClass).then( () => {
    this._cy.add( this._network.getCytoscapeElements() );
    this._cy.layout({name: 'grid'}).run();
      // });
  }

}
