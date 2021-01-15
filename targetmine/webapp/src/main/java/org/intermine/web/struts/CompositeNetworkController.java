package org.intermine.web.struts;

/*
 * Copyright (C) 2002-2020 FlyMine
 *
 * This code may be freely distributed and modified under the
 * terms of the GNU Lesser General Public Licence.  This should
 * be distributed with the code.  See the LICENSE file for more
 * information or http://www.gnu.org/copyleft/lesser.html.
 *
 */

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.action.ActionMessage;
import org.apache.struts.action.ActionMessages;
import org.apache.struts.tiles.ComponentContext;
import org.apache.struts.tiles.actions.TilesAction;
import org.intermine.api.InterMineAPI;
import org.intermine.api.bag.BagManager;
import org.intermine.api.profile.InterMineBag;
import org.intermine.api.profile.Profile;
import org.intermine.api.results.ResultElement;
import org.intermine.api.results.WebTable;
import org.intermine.api.results.flatouterjoins.MultiRow;
import org.intermine.api.results.flatouterjoins.MultiRowFirstValue;
import org.intermine.api.results.flatouterjoins.MultiRowValue;
import org.intermine.api.search.Scope;
import org.intermine.metadata.ClassDescriptor;
import org.intermine.metadata.FieldDescriptor;
import org.intermine.metadata.Model;
import org.intermine.objectstore.ObjectStore;
import org.intermine.objectstore.query.ResultsRow;
import org.intermine.pathquery.PathQuery;
import org.intermine.web.logic.config.FieldConfig;
import org.intermine.web.logic.config.Type;
import org.intermine.web.logic.config.WebConfig;
import org.intermine.web.logic.pathqueryresult.PathQueryResultHelper;
import org.intermine.web.logic.results.PagedTable;
import org.intermine.web.logic.session.SessionMethods;
import org.intermine.web.logic.widget.config.WidgetConfig;

// from Chen's code
import org.apache.commons.lang.StringUtils;
import org.intermine.pathquery.Constraints;
import org.intermine.pathquery.OrderDirection;

import org.intermine.model.bio.Gene;
import org.intermine.objectstore.query.Query;
import org.intermine.objectstore.query.QueryClass;
import org.intermine.objectstore.query.QueryField;
import org.intermine.objectstore.query.ConstraintSet;
import org.intermine.objectstore.query.QueryObjectReference;
import org.intermine.objectstore.query.Results;

// import org.intermine.webservice.client.core.ServiceFactory;
// import org.intermine.webservice.client.services.QueryService;


/**
 *
 * Based on BagDetailsController by Xavier Watkins
 *
 * @author Rodolfo Allendes
 * @version 0.1
 */
@SuppressWarnings("deprecation")
public class CompositeNetworkController extends TilesAction{

  private static final int PAGE_SIZE = 10;
  private static final Logger LOG = Logger.getLogger(BagDetailsController.class);

  /**
   * {@inheritDoc}
   */
  @Override
  public ActionForward execute(ComponentContext context, ActionMapping mapping,
      ActionForm form, HttpServletRequest request, HttpServletResponse response)
      throws Exception {

    LOG.error("TEST ERROR MESSAGE COMPOSITE NETWORK - RODOLFO");

    HttpSession session = request.getSession();
    final InterMineAPI im = SessionMethods.getInterMineAPI(session);
    Profile profile = SessionMethods.getProfile(session);
    ObjectStore os = im.getObjectStore();
    Map<String, List<FieldDescriptor>> classKeys = im.getClassKeys();
    BagManager bagManager = im.getBagManager();

    String bagName = request.getParameter("bagName");
    if (bagName == null) {
      bagName = request.getParameter("name");
    }

        String scope = request.getParameter("scope");
        if (scope == null) {
          scope = Scope.ALL;
        }

     // retrieve the bag either from a specific user or as a global bag depending
     // on the scope
     // If the bag is invalid or inexistant, pass the according message and
     // finish execution
    InterMineBag imBag = null;
    Boolean myBag = Boolean.FALSE;
    if (scope.equals(Scope.USER) || scope.equals(Scope.ALL)) {
      imBag = bagManager.getUserBag(profile, bagName);
      if (imBag != null) {
        myBag = Boolean.TRUE;
      }
      if (profile.getInvalidBags().containsKey(bagName)) {
        request.setAttribute("bag", profile.getInvalidBags().get(bagName));
        request.setAttribute("invalid", true);
        return null;
      }
    }

    if (scope.equals(Scope.GLOBAL) || scope.equals(Scope.ALL)) {
      if (bagManager.getGlobalBag(bagName) != null) {
        imBag = bagManager.getGlobalBag(bagName);
      } else if (imBag == null) {
      imBag = bagManager.getSharedBags(profile).get(bagName);
      }
    }

    if (imBag == null) {
      ActionMessages actionMessages = getErrors(request);
      actionMessages.add(ActionMessages.GLOBAL_MESSAGE, new ActionMessage("errors.bag.missing", bagName));
      saveErrors(request, actionMessages);
      request.setAttribute("bag", imBag);
      return null;
    }


    // Get the contents of the bag
    List bagContentsIds = imBag.getContents();
    request.setAttribute("bagContentsIds", bagContentsIds);

    // Check if the list hasnt been modified by the owner before we load it
    final String currentState = "CURRENT";
    if (!currentState.equalsIgnoreCase(imBag.getState())) {
        // list is not current
        final String msg = "List '" + bagName + "' is currently unavailable. It requires "
                + "upgrading by the list owner.";
        request.setAttribute("errorMessage", msg);
        request.setAttribute("invalid", true);
        return null;
    }

    // Configuration required to perform queries on the DB
    WebConfig webConfig = SessionMethods.getWebConfig(request);
    Model model = os.getModel();
    Map<String, Type> types = webConfig.getTypes();

    // PathQuery pathQuery = PathQueryResultHelper.makePathQueryForBag(imBag, webConfig, model);
    PathQuery pathQuery = new PathQuery(model);
    SessionMethods.setQuery(session, pathQuery);

    pathQuery.addViews("Gene.primaryIdentifier", "Gene.symbol", "Gene.name", "Gene.id");
    pathQuery.addConstraint(Constraints.eq("Gene.ncbiGeneId", "351,10001"));

    Query q = new Query();
	  QueryClass qcGene = new QueryClass(Gene.class);
	  QueryField qfSymbol = new QueryField(qcGene, "symbol");
    q.addFrom(qcGene);
    q.addToSelect(qfSymbol);
    // ConstraintSet cs = new ConstraintSet(ConstraintOp.AND);
	   // organism in our list
	  //cs.addConstraint(new BagConstraint(qfOrganismTaxonId, ConstraintOp.IN, taxonIds));
	// protein.organism = organism
	//   QueryObjectReference qor = new QueryObjectReference(qcProtein, "organism");
	// cs.addConstraint(new ContainsConstraint(qor, ConstraintOp.CONTAINS, qcOrganism));
	// q.setConstraint(cs);
	 Results results = os.execute(q);
   // Set<String> proteinIds = new HashSet<String>();
   // Iterator<Object> iterator = results.iterator();
		// while (iterator.hasNext()) {
		// 	ResultsRow<String> rr = (ResultsRow<String>) iterator.next();
		// 	proteinIds.add(rr.get(0));
   //  }
    LOG.error("Results: "+results);
  
    request.setAttribute("results", results);

    // PagedResults creates a table-structured data representation of the elements
    // found in the bag. We use it to later display these elements in the
    // at the beginning of the Composite Network site
    PagedTable pagedResults = SessionMethods.getResultsTable(session, "bag." + imBag.getName());
    int bagSize = imBag.getSize();
    if (pagedResults == null || pagedResults.getExactSize() != bagSize) {
      pagedResults = SessionMethods.doQueryGetPagedTable(request, imBag);
    }

    // // tracks the list execution only if the list hasn't
    // // just been created
    // if (request.getParameter("trackExecution") == null
    //     || "true".equals(request.getParameter("trackExecution"))) {
    //     im.getTrackerDelegate().trackListExecution(imBag.getType(),
    //             bagSize, profile, session.getId());
    // }
    //


    // Set the size
    String pageStr = request.getParameter("page");
    int page = -1;

        // String highlightIdStr = request.getParameter("highlightId");
        // Integer highlightId = null;
        // if (highlightIdStr != null) {
        //     highlightId = new Integer(Integer.parseInt(highlightIdStr));
        // }
        // boolean gotoHighlighted = false;
        // String gotoHighlightedStr = request.getParameter("gotoHighlighted");
        // if (gotoHighlightedStr != null
        //     && ("t".equalsIgnoreCase(gotoHighlightedStr)
        //         || "true".equalsIgnoreCase(gotoHighlightedStr))) {
        //     gotoHighlighted = true;
        // }
        // if (highlightId != null && gotoHighlighted) {
        //     // calculate the page
        //     WebTable webTable = pagedResults.getAllRows();
        //
        //     for (int i = 0; i < webTable.size(); i++) {
        //         MultiRow<ResultsRow<MultiRowValue<ResultElement>>> row
        //             = webTable.getResultElements(i);
        //         for (ResultsRow<MultiRowValue<ResultElement>> resultsRow : row) {
        //             for (MultiRowValue<ResultElement> mrv : resultsRow) {
        //                 if (mrv instanceof MultiRowFirstValue) {
        //                     ResultElement resultElement = mrv.getValue();
        //                     if (resultElement != null) {
        //                         Integer id = resultElement.getId();
        //                         if (id.equals(highlightId)) {
        //                             page = i / PAGE_SIZE;
        //                             break;
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        //
        // // which fields shall we show in preview?
        // List<String> showInPreviewTable = new ArrayList<String>();
        // for (Entry<String, FieldConfig> entry : type.getFieldConfigMap().entrySet()) {
        //     if (entry.getValue().getShowInListAnalysisPreviewTable()) {
        //         showInPreviewTable.add(type.getDisplayName() + "." + entry.getKey());
        //     }
        // }
        // request.setAttribute("showInPreviewTable", showInPreviewTable);
        //
        // request.setAttribute("firstSelectedFields",
        //                      pagedResults.getFirstSelectedFields(os, classKeys));

        if (page == -1) {
            // use the page from the URL
            page = (pageStr == null ? 0 : Integer.parseInt(pageStr));
        }

        pagedResults.setPageAndPageSize(page, PAGE_SIZE);
        // is this list public?
        // Boolean isPublic = bagManager.isPublic(imBag);
        // request.setAttribute("isBagPublic", isPublic);
        //
        // request.setAttribute("addparameter", request.getParameter("addparameter"));
        // request.setAttribute("myBag", myBag);

        request.setAttribute("bag", imBag);
        request.setAttribute("bagSize", new Integer(imBag.size()));
        request.setAttribute("pagedResults", pagedResults);

      // Trying to reuse the query structured used by @chen in Vermillion
      // ServiceFactory factory = new ServiceFactory("https://targetmine.mizuguchilab.org/targetmine/service");
      String[] ids = {"9779","7287","7288","7289","9253","8650","222484","7275"};
      String taxonId =  "H. sapiens";
      PathQuery secondQuery = new PathQuery(model);
  		secondQuery.addViews("Gene.primaryIdentifier", "Gene.symbol", "Gene.name", "Gene.id");
  		secondQuery.addOrderBy("Gene.primaryIdentifier", OrderDirection.ASC);
  		secondQuery.addConstraint(Constraints.lookup("Gene", StringUtils.join(ids, ","), ""), "A");
  		secondQuery.addConstraint(Constraints.eq("Gene.organism.taxonId", taxonId), "B");
  		secondQuery.setConstraintLogic("A and B");

      // SessionMethods.setQuery(session, secondQuery);
      // PagedTable secondResults = SessionMethods.getResultsTable(session, "secondQuery." + imBag.getName());

      // QueryService service = factory.getQueryService();
    	// List<List<String>> queryResults = service.getAllResults(query);
      // request.setAttribute("secondResults", secondResults);

        // // request.setAttribute("highlightId", highlightIdStr);
        // // // disable using pathquery saved in session in following jsp page
        // // // because it caused displaying invalid column names
        // // request.setAttribute("notUseQuery", Boolean.TRUE);
        // //
        // Get us token so we can show non-public widgets.
        request.setAttribute("token", profile.getDayToken());
        LOG.debug("API key: " + profile.getDayToken());

        return null;
    }
}
