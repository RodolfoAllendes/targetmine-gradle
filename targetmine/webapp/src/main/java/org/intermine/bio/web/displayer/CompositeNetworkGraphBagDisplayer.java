package org.intermine.bio.web.displayer;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;


import org.apache.log4j.Logger;
import org.intermine.api.InterMineAPI;
import org.intermine.model.InterMineObject;
import org.intermine.api.profile.InterMineBag;
import org.intermine.web.displayer.BagDisplayer;
import org.intermine.web.logic.config.ReportDisplayerConfig;
import org.intermine.web.logic.results.ReportObject;
import org.intermine.api.profile.BagValue;


// extra imports
import org.intermine.metadata.ClassDescriptor;
import org.intermine.metadata.CollectionDescriptor;
import org.intermine.metadata.Model;
import org.intermine.web.logic.session.SessionMethods;

/**
 * Class used for retrieval and handling of information used in the display
 * of a Composite Network in Targetmine
 *
 * @author Rodolfo Allendes
 * @version 0.1
 */
public class CompositeNetworkGraphBagDisplayer extends BagDisplayer{
  /* define a LOG to post messages to */
  protected static final Logger logger = Logger.getLogger(CompositeNetworkGraphBagDisplayer.class);

  /**
   * Constructor
   * Use super class to initialize required components
   */
  public CompositeNetworkGraphBagDisplayer(ReportDisplayerConfig config, InterMineAPI im){
    super(config,im);
  }

  /**
   * Display method for Objects.
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
  @SuppressWarnings("unchecked")
  @Override
  public void display(HttpServletRequest request, ReportObject reportObject){
    // Retrieve the information from the single reportObject
    InterMineObject gene = (InterMineObject) reportObject.getObject();
    try{
      /* first we set the name of the graph element */
      String geneID = (String)gene.getFieldValue("ncbiGeneId");
      request.setAttribute("name", geneID);

      /* the initial data points to be visualized */
      ArrayList<String> data = new ArrayList<String>();
      data.add("ncbiGeneId");
      data.add(geneID);
      request.setAttribute("data", data);

      /* and the extra data required for the expansion of the multi-layer network */
      HttpSession session = request.getSession();
      final InterMineAPI im = SessionMethods.getInterMineAPI(session);
      Model model = im.getModel();
            
      /* the class of the root elements */
      request.setAttribute("rootClass", model.getQualifiedTypeName(reportObject.getType()));

      /* and the collections linked by these elements */
      ClassDescriptor cld = reportObject.getClassDescriptor();
      ArrayList<String> collectionDescriptors = new ArrayList<String>();
      for( CollectionDescriptor coldes: cld.getCollectionDescriptors() ){
        collectionDescriptors.add(coldes.getReferencedClassDescriptor().getName());
      }
      request.setAttribute("collections", collectionDescriptors);
    }
    catch(IllegalAccessException | ClassNotFoundException e){
      logger.error(e.getMessage());
    }
  }

  /**
   * Display method for bags.
   * As an extension of BagDisplayer, we also need to implement the display 
   * method for Bag elements.
   * 
   * @param request
   * @param reportBag
   */
  @SuppressWarnings("unchecked")
  @Override
  public void display(HttpServletRequest request, InterMineBag reportBag){
    /* first, we set the name of the graph element */
    String bagName = reportBag.getName();
    request.setAttribute("name", bagName);
    try{
      /* the initial data points for the visualization */
      ArrayList<String> data = new ArrayList<String>();
      data.add("ncbiGeneId");
      List<BagValue> values = reportBag.getContents();
      for (BagValue v: values ){
        String ncbiGeneId = (String) v.getValue();
        data.add(ncbiGeneId);
      }
      request.setAttribute("data",data);

      /* and the extra data required for the expansion of the multi-layer network */
      HttpSession session = request.getSession();
      final InterMineAPI im = SessionMethods.getInterMineAPI(session);
      Model model = im.getModel();
      
      /* the class of the root elements */
      request.setAttribute("rootClass", model.getQualifiedTypeName(reportBag.getType()));

      /* and the collections linked by these elements */
      ClassDescriptor cld = model.getClassDescriptorByName(reportBag.getType());
      ArrayList<String> collectionDescriptors = new ArrayList<String>();
      for( CollectionDescriptor coldes: cld.getCollectionDescriptors() ){
        collectionDescriptors.add(coldes.getReferencedClassDescriptor().getName());
      }
      request.setAttribute("collections", collectionDescriptors);
    } //try
    catch(Exception e){
      logger.error(e.getMessage());
    }
  }
}
