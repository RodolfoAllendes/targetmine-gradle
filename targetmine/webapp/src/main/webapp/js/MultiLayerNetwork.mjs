 'use strict';

export class MultiLayerNetwork{

  constructor(){
    
    /*
    <layer-name>: {
      color: <string> // css format (default undefined)
      shape: <string> // cytoscape node shape (default undefined)
    }
    */
    this._layers = new Map();

    /* nodes can be present in any layer so they will be objects
    node ={
      id = <string>,
      label = <string>,
      layers: = <string>
    }
    */
    this._nodes = new Map();

    /* To represent the tuples tha associate a specific node with the different
    layers to which it belongs 
    node-id = Set(<Layers>)
    */
    this._vm = new Map();

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
    this._edges = new Map();
  }

  /**
   * Add a layer to the network
   * 
   * @param {string} name the name of the layer
   * @param {string} color
   * @param {string} shape
   * @returns {boolean} true/false depending on the layer being added to the 
   * network
   */
  addLayer(name, color, shape){
    //check if the layer already exists
    if( this._layers.has(name) ){
      return false;
    }
    this._layers.set(name, { color: color, shape: shape });
    return true;
  }

  /**
   * Add a node to the network
   * If the node already exists, then its attributes are updated with the
   * provided values
   * 
   * @param {string} id
   * @param {Object} attributes
   * @param {string} layer
   * @returns {boolean} true if a new value is added to the list of nodes, false
   * otherwise
   */
  addNode(id, layer, attributes){
    this._nodes.set(id, attributes);
    /* TO-DO make sure the combination node/layer is added correctly */
    if( !this._vm.has(id) ){
      this._vm.set(id, new Set([layer]) );
    }
  }

  addNodeToLayer(id, layer){
    // check the node already exist in the network
    if( this._nodes.has(id) ){
      this._vm[id].set(layer);
      return true;
    }
    return false;
  }

  /**
   *
   */
  addEdge(id, source, target, attributes){
    // we can only add an edge to the network if the following conditions are met
    // the source node exists
    // the target node exists
    // the edge has not been previously added
    if( this._nodes.has(source) && this._nodes.has(target) ){
      this._edges.set(id, {source: source, target: target, attributes:attributes});
      return true;
    }
    return false;
  }

  /**
   * 
   * @returns the layers of the network
   */
  getLayers(){
    return this._layers;
  }

  /**
   * 
   * @returns the Map that contains the nodes of the network
   */
  getNodes(){
    return this._nodes
  }

  /**
   * 
   * @returns the Map that contains the edges of the network
   */
  getEdges(){
    return this._edges;
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
          id: node.id,//.ncbiGeneId,
          label: node.id, //this._nodes[node].label,//.symbol,
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
