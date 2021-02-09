'use strict';

export class MultiLayerNetwork{

  constructor(type, name){
    this._type = type;
    this._name = name;

    this._layers = undefined;
    this._nodes = undefined;
    this._edges = undefined;
  }
}
