'use strict';
import { TargetMineGraph } from "./TargetMineGraph.mjs";
import { MultiLayerNetwork } from "./MultiLayerNetwork.mjs";

/**
 * @class CompositeNetworkThreeJSGraph
 * @classdesc
 * @author Rodolfo Allendes
 * @version 1.0
 */

export class CompositeNetworkThreeJSGraph extends TargetMineGraph{

  /**
   * Constructor
   * @param {string} name The name of the network
   * @param {string} data The ArrayList string representation of the data retrieved
   * from the database
   * @param {int} width
   * @param {int} height
   */
  constructor(name, ...args){
    // data, containerId, width, height){
    /* initialize super class attributes */
    // super('threeJSNetwork', name, width, height);
    super('threeJSNetwork', name, args[2], args[3]);
    
    /* define variables specific to the class */
    this._service = new intermine.Service({root:'https://targetmine.mizuguchilab.org/targetmine'});
    this._network = new MultiLayerNetwork();

    this._containerId = args[1];

    this.initDOM();

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
    let container = d3.select('#'+this._containerId)
      .append('canvas')
        .attr('id', 'canvas_'+this._type)
        .ready
      ;

    let canvas = document.querySelector('#canvas_'+this._type);
    this._renderer = new THREE.WebGLRenderer({canvas});

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;

    const scene = new THREE.Scene();

    const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);
this._renderer.render(scene, camera);

// function render(time) {
//   time *= 0.001;  // convert time to seconds
 
//   cube.rotation.x = time;
//   cube.rotation.y = time;
 
//   this._renderer.render(scene, camera);
 
//   requestAnimationFrame(render);
// }
// requestAnimationFrame(render);
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
