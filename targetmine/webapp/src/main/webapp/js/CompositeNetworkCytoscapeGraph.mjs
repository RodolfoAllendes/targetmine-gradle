'use strict';

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
    this._cy = undefined;

    /* initialize the root class */
    this._rootClass = rootClass.substr(rootClass.lastIndexOf('.')+1);
    
    /* retrieve the underlying biological model from the service */
    this._service.fetchModel()
      .then( model => {
        this._model = model; 
        /* once we have the model, we load the initial data directly from the DB */
        return this.loadData(data);
      })
      .then( (loadDataValue ) => {
        // Once the initial data has been loaded, it is possible to initialize 
        // general, static DOM elements
        return this.initDOM(); 
      }).then( () => {
        // and dynamic DOM elements (this will also change as result of user
        // interaction
      //   return this.updateLayersDOM();
      // }).then( () => {  
        // finally, we plot the network
        this.plot();
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
    
    // retrieve the data identifier 
    let ident = this._data['columns'][0];
    this._data = this._data.map( d => { return d[ident].toString(); } );
    
    // for the initial class, retrieve the list of the class' attributes based
    // on the current model
    let attributes = Object.keys( this._model.classes[this._rootClass].attributes );
    let id_idx = attributes.indexOf('id');
    
    // use all this information to define an initial query to the database
    let query = new imjs.Query({model: this._model});
    query.adjustPath( this._rootClass );
    query.select( attributes );
    query.addConstraint({ path: this._rootClass, op: "LOOKUP", value: this._data },)
    console.log(query);
    
    // run the query and store the results in the initial layer of the network
    const rows = await this._service.rows(query);
    // we will assume all rows have the same attributes, and use the first one
    // to filter out undefined/null elements and attributes that are too long
    let attr_idx = [];
    attributes = attributes.filter(function(d,i){
      let item = rows[0][i];
      if( item !== undefined && item !== null && i !== id_idx && (typeof(item) === 'number' || item.length < 100) ){
        attr_idx.push(i);
        return true;
      }
      return false;
    });

    // initialize the layer for the initial class, using the retrieved
    // attributes and default visual cues
    this._network.addLayer(this._rootClass, attributes, 'LightGray', 'ellipse');

    // and the nodes in the initial layer
    rows.forEach(row => { 
      let node = {};
      attributes.forEach( (d,i) => node[d] = row[attr_idx[i]] )
      this._network.addNode(row[id_idx], this._rootClass, node);
    });
    return(rows.length);
  }

  /**
   * Define and return DOM elements
   * Custom DOM elements are added to the visualization in order to handle 
   * display and user interaction. The custom elements are defined first, and
   * then added to the DOM through functionality implemented in the parent
   * class.
   */
  getVisualizationDOM(){
    
    const elements = [
      // main visualization area
      { 
        id: `canvas_${this._type}`, type: 'div', 
        attributes: new Map([ ['class', 'targetmineGraphCytoscape'] ])
      },
      // right side controlers
      
      
      
    ];
  }
   
  init(){
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
   * @param {string} modalId 
   */  
  async modalDisplay(modalId){
    // display the modal 
    let modal = d3.select(`#${modalId}`)
      .style('display', 'flex')
    ;
    // load the options in the source select element
    let options = [... this._network.getLayers().keys() ];
    await this.modalSelectOptions('modal-select-sourceLayer', options.sort());
    d3.select('#modal-select-sourceLayer').dispatch('change');
  }

  /**
   * 
   * @param {string} modalId 
   */
  modalHide(modalId){
    let modal = d3.select(`#${modalId}`)
      .style('display', 'none')
    ;
  }

  /**
   * 
   * @returns 
   */
  async modalOK(){
    // from
    let sourceClass = d3.select('#modal-select-sourceLayer').property('value');
    let collection = d3.select('#modal-select-targetLayer').property('value');
    let sourceAttr = d3.select('#modal-select-sourceAttr').property('value');
    let collectionAttr = d3.select('#modal-select-targetAttr').property('value');
    
    // edge class is the class associated with the interaction type
    let edgeClass = this._model.classes[sourceClass].collections[collection].referencedType;
    // target class is the class to which target elements belong to 
    let targetClass = this._model.classes[edgeClass].fields[collectionAttr].referencedType;
    
    // we need to retrieve from the database the selected identifier for the 
    // source class, plus all the attributes associated to the target class,
    // for this, we define an array of 'fields' to be retrieved
    let fields = [ sourceAttr ];
    Object.keys(this._model.classes[targetClass].attributes).forEach(d =>{
      fields.push(`${collection}.${collectionAttr}.${d}`);
    });
    
    // finally, we need to add constrains to the query
    // in particular, we will only look for results where the source is already 
    // included in the network
    let values = this._network.getNodesByLayer(sourceClass);
    let data = [];
    let ids = []
    values.forEach( (v,k) => {
      data.push( v[sourceAttr].toString() );
      ids.push( k );
    });

    let query = new imjs.Query({model: this._model});
    query.adjustPath( sourceClass );
    query.select( fields );
    query.addConstraint({ path: sourceClass, op: "LOOKUP", value: data },)
    
    // run the query and store the results in the initial layer of the network
    const rows = await this._service.rows(query);
    console.log(rows);
  
    // Now we need to save the results in the network. For this, we will assume 
    // all rows have the same attributes, and use the first one
    // to filter out undefined/null elements and attributes that are too long
    let attr_idx = [];
    let attributes = Object.keys(this._model.classes[targetClass].attributes);
    let id_idx = attributes.indexOf('id');
    attributes = attributes.filter(function(d,i){
      // since each row has one element more than the attributes in the target class
      // we shift to the right one position
      let item = rows[0][i+1];
      if( item !== undefined && item !== null && i !== id_idx && (typeof(item) === 'number' || item.length < 100) ){
        attr_idx.push(i+1);
        return true;
      }
      return false;
    });
    
    // add a new layer if required
    if( !this._network.hasLayer(targetClass) )
      this._network.addLayer(targetClass, attributes, `#${Math.floor(Math.random()*16777215).toString(16)}`, 'ellipse');

    // process the results from the query
    rows.forEach(row => { 
      // and add the nodes to the network in the corresponding layer  
      let node = {};
      attributes.forEach( (d,i) => node[d] = row[attr_idx[i]] )
      this._network.addNode(row[id_idx+1], targetClass, node);
      // and the edges
      let edge = {};
      let sourceID = ids[data.indexOf(row[0])];
      console.log(sourceID);
      this._network.addEdge(`${sourceID}-${row[id_idx+1]}`,sourceID,row[id_idx+1],edge);
    });
      
    let modal = d3.select('#compositeNetworkGraphModal')
      .style('display', 'none')
    ;

    this.plot();
  }


  /**
   * 
   * @param selectId 
   * @param sourceClass 
   */
  async modalSelectOptions(selectId, sourceClasses){
    console.log(`updating select ${selectId}`);
    // remove all previous options
    d3.select(`#${selectId}`).selectAll('option').remove();
    d3.select(`#${selectId}`).selectAll('option')
      .data(sourceClasses)
      .enter().append('option')
        .attr('value', function(d){ return d; })
        .text(function(d){ return d; })
    ;

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


  }



  /**
   * Given the current layers in the netork, display the appropriate elements
   * in the matching DOM menu element
   */
  async updateLayersDOM(){
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
    
    super.addToDOM('table-layer', elements);
  }

  

  /**
   * Plot the elements of the MultiLayer Network
   */
  plot(){
    let eles = this._network.getCytoscapeElements();
    this._cy.add( eles );
    this._cy.layout({name: 'cose'}).run();
    
  }

}
