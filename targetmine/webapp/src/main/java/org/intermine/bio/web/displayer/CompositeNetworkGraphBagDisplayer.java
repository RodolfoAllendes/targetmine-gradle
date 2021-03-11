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
    InterMineObject gene = (InterMineObject) reportObject.getObject();
    try{
      ArrayList<String> data = new ArrayList<String>();
      data.add("ncbiGeneId");
      String identifier = (String)gene.getFieldValue("ncbiGeneId");
      data.add(identifier);
      request.setAttribute("data", data);


      /** Desde aqui es una prueba para cargar el modelo */
      HttpSession session = request.getSession();
      final InterMineAPI im = SessionMethods.getInterMineAPI(session);
      Model model = im.getModel();
            
      request.setAttribute("rootClass", model.getQualifiedTypeName(reportObject.getType()));

      ClassDescriptor cld = reportObject.getClassDescriptor();
      
      request.setAttribute("fieldDescriptors", cld.getFieldDescriptors());

      ArrayList<String> collectionDescriptors = new ArrayList<String>();
      for( CollectionDescriptor coldes: cld.getCollectionDescriptors() ){
        // collectionDescriptors.add(coldes.getName());
        collectionDescriptors.add(coldes.getReferencedClassDescriptor().getName());
      }

      request.setAttribute("collectionDescriptors", collectionDescriptors);
      
      
      
    }
    catch(IllegalAccessException | ClassNotFoundException e){
      logger.error(e.getMessage());
    }
  }

  /**
   *
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

      /** This is to retrieve the possible extensions for the network */
      HttpSession session = request.getSession();
      final InterMineAPI im = SessionMethods.getInterMineAPI(session);
      Model model = im.getModel();
      
      request.setAttribute("rootClass", model.getQualifiedTypeName(reportBag.getType()));

      ClassDescriptor cld = model.getClassDescriptorByName(reportBag.getType());
      
      request.setAttribute("fieldDescriptors", cld.getFieldDescriptors());

      ArrayList<String> collectionDescriptors = new ArrayList<String>();
      for( CollectionDescriptor coldes: cld.getCollectionDescriptors() ){
        // collectionDescriptors.add(coldes.getName());
        collectionDescriptors.add(coldes.getReferencedClassDescriptor().getName());
      }

      request.setAttribute("collectionDescriptors", collectionDescriptors);
      
    } //try
    catch(Exception e){
      logger.error(e.getMessage());
    }
  }
}
