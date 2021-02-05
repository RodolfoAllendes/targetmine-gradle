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

    // Retrieve the information for the bagk from the
    request.setAttribute("bagName", reportBag.getName());
    try{
      // A list of data elements that we will forward to Javascript for the
      // definition of the graph
      ArrayList<String> data = new ArrayList<String>();
      data.add("ncbiGeneId");
      List<BagValue> values = reportBag.getContents();
      for (BagValue v: values ){
        String ncbiGeneId = (String) v.getValue();
        data.add(ncbiGeneId);
      }
      request.setAttribute("data",data);

    } //try
    catch(Exception e){
      logger.error(e.getMessage());
    }
  }
}
