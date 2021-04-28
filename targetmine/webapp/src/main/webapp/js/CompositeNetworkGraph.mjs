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
   * retrieved from the database
   * @param {string} containerId The DOM identifier of the container for the
   * visualization
   * @param {int} width the width of the visualization
   * @param {int} height the height of the visualization
   * @param {string} rootClass the class to which the initial elements belong to
   */
  constructor(name, data, containerId, width, height,
    rootClass,){
    // collections){
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
    
    /* retrieve the underlying biological model from the service */
    this._service.fetchModel()
      .then( model => {
        this._model = model; 
        /* once we have the model, we load the initial data directly from the DB */
        return this.loadData(data);
      })
      .then( (loadDataValue ) => {
        /* finally, we initialize general DOM elements and visualization */
        this.initDOM(); 
    }).then( () => {
    //   console.log('initialize layers DOM elements');
      this.updateLayersDOM();
    }).then( () => {
    //   console.log('call to plot the graph');
      this.plot();
    // }).then( () => {
    //   console.log('all finished');
      });
  }

  /**
   * Load initial data for the visualization
   * This initial list of identifiers should be used to define the first layer 
   * of the multi-layer network.
   * Notice that, as we need to fetch the information associated to the initial
   * elements from the DB, the results from this function need to be returned
   * asynchronously
   *
   * @param {string} data Java ArrayList string representation of the ncbiGeneId
   * for element in the initial bag
   * @returns the number of elements added to the network
   */
  async loadData(data){
    // parse the received array into a simple list of String identifiers
    super.loadData(data);
    this._data = this._data.map( d => { return d.ncbiGeneId.toString(); } );

    // for the initial class, retrieve the list of the class' attributes based
    // on the current model
    let attributes = Object.keys( this._model.classes[this._rootClass].attributes );
    let j = attributes.indexOf('primaryIdentifier');

    // use all this information to define an initial query to the database
    let query = new imjs.Query({model: this._model});
    query.adjustPath( this._rootClass );
    query.select( attributes );
    query.addConstraint({ path: this._rootClass, op: "LOOKUP", value: this._data },)

    // run the query and store the results in the initial layer of the network
    const rows = await this._service.rows(query);
    rows.forEach(row => { 
      let node = {};
      attributes.forEach(function(d,i){
        // we wont add undefined/null elements,
        // we dont add the primaryIdentifier 
        // we dont add attributes too long (over 100 chars)
        if( row[i] !== undefined && row[i] !== null && i !== j && row[i].length < 100 ){
          node[d] = row[i];
        }
      });
      this._network.addNode(row[j], this._rootClass, node);
    });
    return(rows.length);
    
    // // fetch initial from the database, using the model, and add it to the network
    // // let att = Object.keys(this._model.classes[this._rootClass].attributes);
    // let from = this._rootClass; //'Gene';
    // let select = ['ncbiGeneId', 'symbol'];
    // let where = [
    //   { path: this._rootClass, op: "LOOKUP", value: this._data },
    // ];

    // update the add layer select 
    // let col = Object.keys(this._model.classes[this._rootClass].collections);
    // this.updateTargets(col);

    // return this.runQuery(from, select, where);
  }

  /**
   * Initialize DOM elements
   */
  initDOM(){
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
            id: 'layers-div', 
            children: [
              { type: 'label', attributes: new Map([ ['text', 'Layers:'] ])},
              { type: 'table', id: 'layer-table' },
            ]
          },
          // { 
          //   type: 'div', 
          //   id: 'newLayer-div',
          //   attributes: new Map([ ['class', 'flex-table'] ]), 
          //   children: [
          //     { type: 'label', attributes: new Map([ ['text', 'Add Layer:'] ])},
          //     { type: 'select', id: 'networkLayer-select' },
          //     { 
          //       type: 'button',
          //       id: 'layer-add',
          //       attributes: new Map([ ['text','Add'], ['class', 'modal-button'] ]),
          //       on: new Map([ ['click', function(){ self.addLayer(); }] ]),
          //     },
          //   ]
          // },
        ]
      },
      // { 
      //   type: 'div',
      //   id: 'modal',
      //   attributes: new Map([ ['class', 'modal'], ]),
      //   children:[
      //     { 
      //       type: 'div',
      //       id: 'modal-content',
      //       attributes: new Map([ ['class', 'modal-content'], ]),
      //       children:[
      //         { 
      //           type: 'h3',
      //           id: 'modal-title',
      //           attributes: new Map([ ['class', 'modal-title'], ]),
      //         },
      //         { type: 'label', attributes: new Map([ ['class','modal-item modal-label'], ['text','Category:'] ]), },
      //         { 
      //           type: 'select',
      //           id: 'modal-column-select',
      //           attributes: new Map([ ['class','modal-item modal-select'] ]),
      //           on: new Map([ ['change',function(e){
      //             console.log('estoy aqui');
      //             let values = [...new Set(self._data.map(pa => pa[e.target.value]))];
      //             self.updateSelectOptions('#modal-value-select', values);}] ]),
      //         },
      //         { type: 'label', attributes: new Map([ ['class','modal-item modal-label'], ['text','Value:'] ]) },
      //         { 
      //           type: 'select',
      //           id: 'modal-value-select',
      //           attributes: new Map([ ['class','modal-item modal-select'], ]),
      //         },
      //         { 
      //           type: 'div', 
      //           id: 'modal-input', 
      //           attributes: new Map([ ['class','modal-content'], ]),
      //           style: new Map([ ['grid-column','span 3'], ]),
      //         },
      //         { 
      //           type: 'button', 
      //           id: 'modal-ok', 
      //           attributes: new Map([ ['class', 'modal-item modal-button'], ['text', 'OK'] ]),
      //           style: new Map([ ['grid-column', '3'] ]),
      //           on: new Map([ ['click', function(){self.modalOK()} ] ]) 
      //         },
      //         { 
      //           type: 'button', 
      //           id: 'modal-cancel', 
      //           attributes: new Map([ ['class', 'modal-item modal-button'], ['text', 'Cancel'] ]),
      //           style: new Map([ ['grid-column','3'] ]),
      //           on: new Map([ ['click',function(){ d3.select('#modal').style('display','none'); }] ]),
      //         },
      //       ],
      //     }
      //   ]   
      // }
    ];

    super.addToDOM(this._containerId, elements);
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

    // let query = new imjs.Query();

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
   * Given the current layers in the netork, display the appropriate elements
   * in the matching DOM menu element
   */
  updateLayersDOM(){
    let elements = [];
    for( let[k,v] of this._network.getLayers() ){
      elements.push({
        type:'div',
        id: 'row_'+k,
        attributes: new Map([ ['class', 'flex-row'] ]),
        children:[
          { type: 'svg', attributes: new Map([ ['class', 'display-cell'], ['viewBox', '-5 -5 10 10'] ])},
          { type: 'div', attributes: new Map([ ['class', 'flex-cell label'], ['text', k] ])},
          { type: 'span', attributes: new Map([ ['class', 'flex-cell small-close'], ['text', 'x'] ])},
        ]
      });
    }
    
    super.addToDOM('layer-table', elements);

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
   * Plot the elements of the MultiLayer Network
   */
  plot(){
    let eles = this._network.getCytoscapeElements();
    console.log(eles);
    this._cy.add( eles );
    this._cy.layout({name: 'grid'}).run();
    
  }

}
