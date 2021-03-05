package org.intermine.bio.web.displayer;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.intermine.api.InterMineAPI;
import org.intermine.model.InterMineObject;
import org.intermine.api.profile.InterMineBag;
import org.intermine.web.displayer.BagDisplayer;
import org.intermine.web.logic.config.ReportDisplayerConfig;
import org.intermine.web.logic.results.ReportObject;
import org.intermine.api.profile.BagValue;

/**
 * Class used for retrieval of the basic details required in the display of a 
 * Composite Network using Three.js
 *
 * @author Rodolfo Allendes
 * @version 0.1
 */
public class CompositeNetworkThreeJSGraphBagDisplayer extends BagDisplayer{
  /* define a LOG to post messages to */
  protected static final Logger logger = Logger.getLogger(CompositeNetworkThreeJSGraphBagDisplayer.class);

  /**
   * Constructor
   * Use super class to initialize required components
   */
  public CompositeNetworkThreeJSGraphBagDisplayer(ReportDisplayerConfig config, 
    InterMineAPI im)
  {
    super(config,im);
  }

  /**
   * As this class extends ReportDisplayer (through BagDisplayer) it has to
   * provide an implementation for the abstract method 'display' that receives
   * a reportObject as parameter.
   * This method will provide the functionality required for the display of a
   * compositeNetwork when a single gene is used for its triggering, like when
   *
   * @param request
   * @param reportObject
   */
  @SuppressWarnings("unchecked")
  @Override
  public void display(HttpServletRequest request, ReportObject reportObject){
    /* retrieve the report object passed when loading the displayer */
    InterMineObject gene = (InterMineObject) reportObject.getObject();
    try{
      /* we will return a list with the ncbiIdentifier of the single gene */
      ArrayList<String> data = new ArrayList<String>();
      // header for the column in the array list
      data.add("ncbiGeneId");
      // Add the ncbiGene id for the current gene
      String identifier = (String) gene.getFieldValue("ncbiGeneId");
      data.add(identifier);
      // return the list 
      request.setAttribute("data", data);
    }
    catch(IllegalAccessException e){
      logger.error(e.getMessage());
    }
  }

  /**
   * As an extension to BagDisplayer, this class needs also to provide an
   * implementation for the corresponding 'display' method.
   * @param request
   * @param reportBag
   */
  @SuppressWarnings("unchecked")
  @Override
  public void display(HttpServletRequest request, InterMineBag reportBag){
    // Retrieve the information for the bag
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