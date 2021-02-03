package org.intermine.bio.web.displayer;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.intermine.api.InterMineAPI;
import org.intermine.api.profile.InterMineBag;
import org.intermine.model.InterMineObject;
import org.intermine.model.bio.Gene;
import org.intermine.model.bio.ProbeSet;
import org.intermine.model.bio.Expression;
import org.intermine.model.bio.HbiExpression;
import org.intermine.model.bio.Tissue;
import org.intermine.model.bio.HbiTissue;

import org.intermine.web.displayer.BagDisplayer;
import org.intermine.web.logic.config.ReportDisplayerConfig;
import org.intermine.web.logic.results.ReportObject;

import org.intermine.api.profile.BagValue;

/**
 * Class used for retrieval and handling of information used in the display
 * of a Composite Network in Targetmine
 *
 * @author Rodolfo Allendes
 * @version 0.1
 */
public class CompositeNetworkGraphDisplayer extends BagDisplayer{
  /* define a LOG to post messages to */
  protected static final Logger logger = Logger.getLogger(GeneExpressionGraphDisplayer.class);

  /**
   * Constructor
   * Use super class to initialize required components
   */
  public CompositeNetworkGraphDisplayer(ReportDisplayerConfig config, InterMineAPI im){
    super(config,im);
  }

  /**
   * As this class extends ReportDisplayer (through BagDisplayer) it has to
   * provide an implementation for the abstract method 'display' that receives
   * a reportObject as parameter.
   * This method will provide the functionality required for the display of a
   * compositeNetwork when a single gene is used for its triggering, like when
   * called from a gene report page rather than a list details.
   *
   * @param request
   * @param reportObject
   */
  public void display(HttpServletRequest request, ReportObject reportObject){
    if( reportObject ==  null ){
      request.setAttribute("hellow", "compositeNetworkGraphDisplayer.java - Object:null ");
    }
    else{
      request.setAttribute("hellow", reportObject.getClass());
    }
    try{

      InterMineObject gene = (InterMineObject) reportObject.getObject();
      request.setAttribute("ids", new ArrayList<>(Arrays.asList((String) gene.getFieldValue("ncbiGeneId"))));
    }
    catch(IllegalAccessException e){
      logger.error(e.getMessage());
    }

  }

  /**
   *
   * This is the method called when
   * @param request
   * @param reportBag
   */
  @SuppressWarnings("unchecked")
  @Override
  public void display(HttpServletRequest request, InterMineBag reportBag){

    if( reportBag ==  null ){
      request.setAttribute("hellow", "compositeNetworkGraphDisplayer.java - Bag:null ");
    }
    else{
      request.setAttribute("hellow", reportBag.getClass());
    }
    try{
      InterMineBag imbag = (InterMineBag) reportBag;
      logger.error("keyFields "+imbag.getKeyFieldNames());
      List<BagValue> values = imbag.getContents();
      for (BagValue v: values ){
        logger.error(v.getValue());
      }
      // logger.error("contentsfromOSB "+imbag.getContentsFromOsb());
      request.setAttribute("ids",values);
    // +reportObject.toString());


    // // A list of data elements that we will forward to Javascript for the
    // // definition of the graph
    // ArrayList<String> data = new ArrayList<String>();
    // String header = "probeSetId\t"+
    //   "category\t"+
    //   "organ\t"+
    //   "name\t"+
    //   "call\t"+
    //   "value";
    // String row; // we will use this to add elements to the data array
    // data.add(header);
    //
    // // logger.error("header\n"+header);
    // // The data retrieved from the database
    // // InterMineObject gene = (InterMineObject) reportObject.getObject();
    //
    // try{
    //   // A gene has a collection of ProbeSet objects associated, we need to
    //   // process each probe in order to display its values
    //   Set<ProbeSet> probeSets = (Set<ProbeSet>) gene.getFieldValue("probeSets");
    //   for( ProbeSet ps: probeSets ){
    //
    //     // Each probeSet has a collection of Expression objects associated, we
    //     // process each individually
    //     Set<Expression> expressions = (Set<Expression>) ps.getFieldValue("expressions");
    //     for( Expression exp: expressions ){
    //
    //       String probeID = (String)ps.getFieldValue("probeSetId");
    //       // For each expression value, we need to store the following information
    //       // tissue (hbiTissue)
    //       // |-- category (String)
    //       // |-- organ (String)
    //       // |-- name (String)
    //       // call (String <enum>['P', 'A', 'M'])
    //       // value (float)
    //       Tissue tissue = (HbiTissue) exp.getFieldValue("tissue");
    //       String category = (String) tissue.getFieldValue("category");
    //       String organ = (String) tissue.getFieldValue("organ");
    //       String name = (String) tissue.getFieldValue("name");
    //       // the char '/' cant be part of css selectors, so we replace it for '-'
    //       category = category.replaceAll("/","-");
    //       organ = organ.replaceAll("/","-");
    //       name = name.replaceAll("/","-");
    //
    //       String call = (String) exp.getFieldValue("call");
    //       float value = (Float) exp.getFieldValue("value");
    //
    //       row = probeID+"\t";
    //       row += (category+"\t");
    //       row += (organ+"\t");
    //       row += (name+"\t");
    //       row += (call+"\t");
    //       row += value;
    //
    //       data.add(row);
    //     }
    //
    //   }
    //   /* fill the resulting table with the data */
    //   request.setAttribute("gene", (String) gene.getFieldValue("ncbiGeneId"));

    } //try
    catch(Exception e){
      logger.error(e.getMessage());
    }
  }
}
