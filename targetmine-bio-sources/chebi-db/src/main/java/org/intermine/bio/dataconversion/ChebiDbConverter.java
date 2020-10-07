package org.intermine.bio.dataconversion;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.intermine.dataconversion.ItemWriter;
import org.intermine.metadata.Model;
import org.intermine.objectstore.ObjectStoreException;
import org.intermine.sql.Database;
import org.intermine.xml.full.Item;

/**
 * 
 * @author chenyian
 * 
 */
public class ChebiDbConverter extends BioDBConverter {
	private static final Logger LOG = LogManager.getLogger(ChebiDbConverter.class);

	//
	private static final String DATASET_TITLE = "ChEBI";
	private static final String DATA_SOURCE_NAME = "ChEBI";

	private Map<String, Item> compoundGroupMap = new HashMap<String, Item>();

	private Map<String, String> nameMap = new HashMap<String, String>();

	/**
	 * Construct a new ChebiDbConverter.
	 * 
	 * @param database
	 *            the database to read from
	 * @param model
	 *            the Model used by the object store we will write to with the ItemWriter
	 * @param writer
	 *            an ItemWriter used to handle Items created
	 */
	public ChebiDbConverter(Database database, Model model, ItemWriter writer) {
		super(database, model, writer, DATA_SOURCE_NAME, DATASET_TITLE);
	}

	/**
	 * {@inheritDoc}
	 */
	public void process() throws Exception {
		// a database has been initialised from properties starting with db.chebi-db

		Connection connection = getDatabase().getConnection();

		// process data with direct SQL queries on the source database, for example:

		// Statement stmt = connection.createStatement();
		// String query = "select column from table;";
		// ResultSet res = stmt.executeQuery(query);
		// while (res.next()) {
		// }
		Statement stmt = connection.createStatement();
		String queryCasReg = "select distinct c1.id, da.accession_number " + " from compounds as c1 "
				+ " join database_accession as da on da.compound_id = c1.id "
				+ " where da.type = 'CAS Registry Number'";
		ResultSet resCasReg = stmt.executeQuery(queryCasReg);
		Map<String, String> casRegMap = new HashMap<String, String>();
		while (resCasReg.next()) {
			casRegMap.put(String.valueOf(resCasReg.getInt("c1.id")),
					resCasReg.getString("da.accession_number"));
		}

		// String query = "SELECT compound_id, structure FROM structures WHERE type = 'InChIKey';";
		String queryNameInchi = " select c1.name, c1.id, c1.parent_id, c2.name, s1.structure "
				+ " from compounds as c1 "
				+ " left join structures as s1 on c1.id = s1.compound_id "
				+ " left join compounds as c2 on c1.parent_id = c2.id "
				+ " where s1.type='InChIKey' ";
		ResultSet res = stmt.executeQuery(queryNameInchi);
		while (res.next()) {
//			LOG.info(String.format("id: %s, %s", res.getInt("c1.id"), res.getString("s1.structure")));

			String chebiId = String.valueOf(res.getInt("c1.id"));
			String name = res.getString("c1.name");

			String structure = res.getString("s1.structure");
			String inchiKey = structure.substring(structure.indexOf("=") + 1);
			String compoundGroupId = inchiKey.substring(0, inchiKey.indexOf("-"));
			if (compoundGroupId.length() != 14) {
				LOG.info(String.format("Bad InChIKey value: %s, %s .", chebiId, structure));
				continue;
			}

			if (StringUtils.isEmpty(name)) {
				name = res.getString("c2.name");
				chebiId = String.valueOf(res.getInt("c1.parent_id"));
			}

			Item item = createItem("ChebiCompound");
			item.setAttribute("identifier", String.format("CHEBI:%s", chebiId));
			item.setAttribute("originalId", chebiId);
			item.setAttribute("inchiKey", inchiKey);
			
//			setSynonyms(item, inchiKey);
			
			// if the length of the name is greater than 40 characters,
			// use id instead and save the long name as the synonym
			if (name.length() > 40) {
				setSynonyms(item, name);
				name = String.format("CHEBI %s", chebiId);
			}
			item.setAttribute("name", name);

			if (casRegMap.get(chebiId) != null) {
				item.setAttribute("casRegistryNumber", casRegMap.get(chebiId));
			}

			item.setReference("compoundGroup", getCompoundGroup(compoundGroupId, name));
			store(item);

		}
		
		stmt.close();
		connection.close();
	}

	/***
	 * 
	 * @param compoundGroupId the first 14-character of the InChIKey
	 * @param name A name for the CompoundGroup
	 * @return A CompoundGroup item
	 * @throws ObjectStoreException
	 */
	private Item getCompoundGroup(String compoundGroupId, String name) throws ObjectStoreException {
		Item ret = compoundGroupMap.get(compoundGroupId);
		if (ret == null) {
			ret = createItem("CompoundGroup");
			ret.setAttribute("identifier", compoundGroupId);
			compoundGroupMap.put(compoundGroupId, ret);
		}
		if (nameMap.get(compoundGroupId) == null
				|| nameMap.get(compoundGroupId).length() > name.length()) {
			nameMap.put(compoundGroupId, name);
			ret.setAttribute("name", name);
		}
		return ret;
	}

	@Override
	public void close() {
		try {
			store(compoundGroupMap.values());
		} catch ( ObjectStoreException e ){
			throw new RuntimeException( "Error storing compound groups" );
		}
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public String getDataSetTitle(String taxonId) {
		return DATASET_TITLE;
	}
	
	private void setSynonyms(Item subject, String value) throws ObjectStoreException {
		Item syn = createItem("CompoundSynonym");
		syn.setAttribute("value", value);
		syn.setReference("subject", subject);
		store(syn);
	}

	@Override
	public String getLicence() {
		return "https://creativecommons.org/licenses/by/4.0/";
	}

}
