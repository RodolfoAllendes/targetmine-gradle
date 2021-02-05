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

    var flymine   = new intermine.Service({root: 'localhost:8080/targetmine/query'});
    var query     = {
      from: 'Gene',
      select: [
        'exons.symbol',
        'chromosome.primaryIdentifier',
        'exons.chromosomeLocation.start',
        'exons.chromosomeLocation.end'
      ],
      where: {
        symbol: 'eve',
        organism: {lookup: 'D. melanogaster'}}
    };

    flymine.rows(query).then(function(rows) {
      console.log("No. of exons: " + rows.length);
      rows.forEach(function printRow(row) {
        console.log("[" + row[0] + "] " + row[1] + ":" + row[2] + ".." + row[3]);
      });
    });
  }


// pathQuery.addViews("Gene.primaryIdentifier", "Gene.symbol", "Gene.name", "Gene.id");
// pathQuery.addConstraint(Constraints.eq("Gene.ncbiGeneId", "351,10001"));

//   Query q = new Query();
//   QueryClass qcGene = new QueryClass(Gene.class);
//   QueryField qfSymbol = new QueryField(qcGene, "symbol");
//   q.addFrom(qcGene);
//   q.addToSelect(qfSymbol);
//   // ConstraintSet cs = new ConstraintSet(ConstraintOp.AND);
//    // organism in our list
//   //cs.addConstraint(new BagConstraint(qfOrganismTaxonId, ConstraintOp.IN, taxonIds));
// // protein.organism = organism
// //   QueryObjectReference qor = new QueryObjectReference(qcProtein, "organism");
// // cs.addConstraint(new ContainsConstraint(qor, ConstraintOp.CONTAINS, qcOrganism));
// // q.setConstraint(cs);
//   Results results = os.execute(q);
//   Set<String> proteinIds = new HashSet<String>();
//   Iterator<Object> iterator = results.iterator();
// 	while (iterator.hasNext()) {
// 		ResultsRow<String> rr = (ResultsRow<String>) iterator.next();
// 		proteinIds.add(rr.get(0));
//     LOG.error("GeneID: "+rr.get(0));
//   }
//   LOG.error("Results (all IDs): "+proteinIds);
//
//   request.setAttribute("results", proteinIds);
}
