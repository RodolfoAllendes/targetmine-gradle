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
