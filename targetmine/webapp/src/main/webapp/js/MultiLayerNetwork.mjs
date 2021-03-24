 'use strict';

export class MultiLayerNetwork{

  constructor(type, name){
    this._type = type;
    this._name = name;

    /*
    <layer-name>: {
      color: <string> // css format (default undefined)
      shape: <string> // cytoscape node shape (default undefined)
    }
    */
    this._layers = {};

    /* nodes can be present in any layer so they will be objects
    node ={
      id = <string>,
      label = <string>,
      layers: = <string>
    }
    */
    this._nodes = {};
    /* edges are between pairs of nodes, and can be intra- or inter- layer.
    Notice that the layer for source and target elements must be a valid name
    of layer, and that the source and target id must references valid node id's
    that are also part of the corresponding layer.
    edge ={
      id = <string>,
      source = {id: <string>, layer: <string>}
      target = {id: <string>, layer: <string>}
    }
    */
    this._edges = {};
  }

  /**
   *
   *
   */
  addLayer(name, color, shape){
    if( !this._layers.hasOwnProperty(name) ){
      this._layers[name] = { color: color, shape: shape };
      return true;
    }
    return false;
  }

  /**
   * Add a node to the network
   *
   * @param {string} id
   * @param {string} label
   * @param {string} layer
   * @returns {boolean} true if a new value is added to the list of nodes, false
   * otherwise
   */
  addNode(layer, id, attributes){//label, layer){
    /* if the node exits, do not create a new one */
    if( this._layers.hasOwnProperty(layer) && !this._nodes.hasOwnProperty(id) ){
      this._nodes[id] = attributes;//{ label: label, layer: layer };
      return true;
    }
    return false;
  }

  /**
   *
   */
  addEdge(id, source, target){
    // we can only add an edge to the network if the following conditions are met
    // the source node exists
    // the target node exists
    // the edge has not been previously added
    if( this._nodes.hasOwnProperty(source) && this._nodes.hasOwnProperty(target) && !this._edges.hasOwnProperty(id) ) {
      this._edges[id] = {
        source: source,
        target: target,
      };
      return true;
    }
    return false;
  }

  /**
   *
   * @returns {array} the complete set of nodes and edges currently in the
   * network, as an array of objects suitable for cytoscape
   */
  getCytoscapeElements(){
    let elements = [];
    // add nodes
    for( let node in this._nodes ){
      let layer = this._nodes[node].layer;
      elements.push({
        group: 'nodes',
        data:{
          id: node,//.ncbiGeneId,
          label: this._nodes[node].label,//.symbol,
          color: this._layers[layer].color,
          borderColor: this._layers[layer].color,
          shape: this._layers[layer].shape,
        }
      });
    }
    // add edges
    for( let edge in this._edges ){
      elements.push({
        group: 'edges',
        data: {
          id: edge,
          source: this._edges[edge].source,
          target: this._edges[edge].target,
        }
      });
    }
    return elements;
  }

  /**
   *
   */
  getLayers(){
    return this._layers;
  }

  /**
   *
   */
  getNodes(){
    return this._nodes;
  }

  /**
   *
   */
  getEdges(){
    return this._edges;
  }

  /**
   * @param {string} layer
   * @param {string} color
   */
  setLayerColor(layer,color){
    if( Object.keys(this._layers).includes(layer) ){
      this._layers[layer].color = color
      return true;
    }
    return false;
  }

  /**
   * @param {string} layer
   * @param {string} shape
   */
  setLayerShape(layer,shape){
    if( Object.keys(this._layers).includes(layer) ){
      this._layers[layer].shape = shape
      return true;
    }
    return false;
  }

}
