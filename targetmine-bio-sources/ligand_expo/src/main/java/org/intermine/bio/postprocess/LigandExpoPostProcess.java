package org.intermine.bio.postprocess;

import java.util.Collections;
import java.util.Iterator;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.intermine.bio.util.Constants;
import org.intermine.metadata.ConstraintOp;
import org.intermine.metadata.Model;
import org.intermine.model.InterMineObject;
import org.intermine.model.bio.DataSet;
import org.intermine.model.bio.Protein;
import org.intermine.objectstore.ObjectStore;
import org.intermine.objectstore.ObjectStoreException;
import org.intermine.objectstore.ObjectStoreWriter;
import org.intermine.objectstore.intermine.ObjectStoreInterMineImpl;
import org.intermine.objectstore.query.ConstraintSet;
import org.intermine.objectstore.query.ContainsConstraint;
import org.intermine.objectstore.query.Query;
import org.intermine.objectstore.query.QueryClass;
import org.intermine.objectstore.query.QueryCollectionReference;
import org.intermine.objectstore.query.QueryObjectReference;
import org.intermine.objectstore.query.Results;
import org.intermine.objectstore.query.ResultsRow;
import org.intermine.postprocess.PostProcessor;
import org.intermine.util.DynamicUtil;

/**
 * 
 * @author chenyian
 *
 */
public class LigandExpoPostProcess extends PostProcessor {

	private static final Logger LOG = LogManager.getLogger(LigandExpoPostProcess.class);
	private DataSet dataSet = null;
	private Model model;

	public LigandExpoPostProcess(ObjectStoreWriter osw) {
		super(osw);
		model = Model.getInstanceByName("genomic");
	}

	@Override
	public void postProcess() throws ObjectStoreException {
		createPDBInteractions();
	}

	private void createPDBInteractions() throws ObjectStoreException {

		dataSet = (DataSet) DynamicUtil.createObject(Collections.singleton(DataSet.class));
		dataSet.setName("Ligand Expo");
		dataSet = (DataSet) osw.getObjectByExample(dataSet, Collections.singleton("name"));
		if (dataSet == null) {
			LOG.error("Failed to find Ligand Expo DataSet object");
			return;
		}

		Results results = findProteinPDBCompound(osw.getObjectStore());
		osw.beginTransaction();

		Iterator<?> resIter = results.iterator();
		int i = 0;
		while (resIter.hasNext()) {
			ResultsRow<?> rr = (ResultsRow<?>) resIter.next();
			InterMineObject protein = (InterMineObject) rr.get(0);
			InterMineObject pdbCompound = (InterMineObject) rr.get(1);

			InterMineObject interaction = (InterMineObject) DynamicUtil.simpleCreateObject(model
					.getClassDescriptorByName("PDBInteraction").getType());

			interaction.setFieldValue("protein", protein);
			interaction.setFieldValue("compound", pdbCompound);
			interaction.setFieldValue("dataSet", dataSet);
			try {
				String primaryAcc = (String) protein.getFieldValue("primaryAccession");
				String pdbCompoundId = (String) pdbCompound.getFieldValue("identifier");
				interaction.setFieldValue("identifier", String.format("%s_%s", primaryAcc, pdbCompoundId));
			} catch (IllegalAccessException e) {
				throw new RuntimeException(e);
			}

			osw.store(interaction);
			i++;
		}

		osw.commitTransaction();
		System.out.println(i + " CompoundProteinInteractions created.");
	}

	protected static Results findProteinPDBCompound(ObjectStore os) throws ObjectStoreException {
		Query q = new Query();
		QueryClass qcProtein = new QueryClass(Protein.class);
		QueryClass qcProteinStructureRegion = new QueryClass(os.getModel()
				.getClassDescriptorByName("ProteinStructureRegion").getType());
		QueryClass qcProteinChain = new QueryClass(os.getModel()
				.getClassDescriptorByName("ProteinChain").getType());
		QueryClass qcProteinStructure = new QueryClass(os.getModel()
				.getClassDescriptorByName("ProteinStructure").getType());
		QueryClass qcPDBCompound = new QueryClass(os.getModel()
				.getClassDescriptorByName("PDBCompound").getType());

		q.addFrom(qcProtein);
		q.addFrom(qcProteinStructureRegion);
		q.addFrom(qcProteinChain);
		q.addFrom(qcProteinStructure);
		q.addFrom(qcPDBCompound);

		q.addToSelect(qcProtein);
		q.addToSelect(qcPDBCompound);

		ConstraintSet cs = new ConstraintSet(ConstraintOp.AND);

		// Protein.structureRelatedRegion.pdbRegion.chain.structure.pdbCompound
		QueryCollectionReference c1 = new QueryCollectionReference(qcProtein,
				"proteinStructureRegions");
		cs.addConstraint(new ContainsConstraint(c1, ConstraintOp.CONTAINS, qcProteinStructureRegion));

		QueryObjectReference r2 = new QueryObjectReference(qcProteinStructureRegion, "chain");
		cs.addConstraint(new ContainsConstraint(r2, ConstraintOp.CONTAINS, qcProteinChain));

		QueryObjectReference r4 = new QueryObjectReference(qcProteinChain, "structure");
		cs.addConstraint(new ContainsConstraint(r4, ConstraintOp.CONTAINS, qcProteinStructure));

		QueryCollectionReference c5 = new QueryCollectionReference(qcProteinStructure,
				"pdbCompounds");
		cs.addConstraint(new ContainsConstraint(c5, ConstraintOp.CONTAINS, qcPDBCompound));

		q.setConstraint(cs);

		ObjectStoreInterMineImpl osimi = (ObjectStoreInterMineImpl) os;
		osimi.precompute(q, Constants.PRECOMPUTE_CATEGORY);
		Results res = os.execute(q);

		return res;
	}
}
