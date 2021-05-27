'use strict';

import { MultiLayerNetwork } from "./MultiLayerNetwork.mjs";

/**
 * @class CompositeNetworkCytoscapeGraph
 * @classdesc Utility class used to provide the elements required to display
 * a MultiLayer Network object using a Cytoscape representation
 * @author Rodolfo Allendes
 * @version 1.0
 */

export class CompositeNetworkCytoscapeGraph{

  /**
   * Constructor
   * 
   */
  constructor(){
    // set the type of graph
    this._type = 'compositeNetworkCytoscape';

    // and define other requirements
    this._cy = undefined;   
  }

  async setVisualizationSpace(){
    let ele = jQuery('.targetmineGraphCytoscape')[0];
    this._cy = cytoscape({
      container: ele, //jQuery('.targetmineGraphCytoscape'),
      style: cytoscape.stylesheet()
        .selector('node')
          .style({
            'text-valign': 'center',
            'text-halign': 'center',
            'shape': 'data(shape)',
            'background-color': 'data(color)',
            'border-color': 'data(borderColor)',
            'border-width': '1px',
            'display': 'element',
            'label': 'data(label)'
          })
              
    });
    console.log('init', this._cy.style().json());
  }



  /**
   * Define and return DOM elements
   * Specific DOM elements that need to be added in order to correctly display 
   * this specific type of visualization
   */
  getVisualizationDOM(){
    // 
    let elements = [
      { 
        id: `canvas_${this._type}`, 
        type: 'div', 
        position: ':first-child',
        attributes: new Map([ ['class', 'targetmineGraphCytoscape'] ])
      },
    ];
    return elements;
  }

  getType(){
    return this._type;
  }
   
  /**
   * Plot the elements of the MultiLayer Network
   */
  plot(network){
    let nodes = network.getNodes();
    let layers = network.getLayers();
    let edges = network.getEdges();

    let elements = [];
    // add nodes
    for( let [k,v] of nodes ){
      console.log(v.symbol);
      let layer = network._vm.get(k).values().next().value;
      let nodeid = k.toString();
      elements.push({
        group: 'nodes',
        data:{
          id: nodeid,
          color: layers.get(layer).color,
          label: v.symbol,
          borderColor: layers.get(layer).color,
          shape: layers.get(layer).shape,
        }
      });
    }
    // add edges
    for( let [k,v] of edges ){
      elements.push({
        group: 'edges',
        data: {
          id: k,
          source: v.source,
          target: v.target,
        }
      });
    }
    console.log(elements);
    this._cy.add( elements );
    this._cy.layout({name: 'cose'}).run();
    
  }

}
