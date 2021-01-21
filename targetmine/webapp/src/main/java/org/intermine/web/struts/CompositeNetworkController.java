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
import org.intermine.web.logic.config.Displayer;
import org.intermine.web.logic.pathqueryresult.PathQueryResultHelper;
import org.intermine.web.logic.results.PagedTable;
import org.intermine.web.logic.session.SessionMethods;
import org.intermine.web.logic.widget.config.WidgetConfig;

// from Chen's code
import org.apache.commons.lang.StringUtils;
import org.intermine.pathquery.Constraints;
import org.intermine.pathquery.OrderDirection;

import org.apache.commons.collections.set.ListOrderedSet;

import org.intermine.model.bio.Gene;
import org.intermine.objectstore.query.Query;
import org.intermine.objectstore.query.QueryClass;
import org.intermine.objectstore.query.QueryField;
import org.intermine.objectstore.query.ConstraintSet;
import org.intermine.objectstore.query.QueryObjectReference;
import org.intermine.objectstore.query.Results;

import org.intermine.web.displayer.DisplayerManager;
import org.intermine.web.displayer.ReportDisplayer;

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

    // Check if the list hasnt been modified by the owner before we load it
    final String currentState = "CURRENT";
    if (!currentState.equalsIgnoreCase(imBag.getState())) {
      // list is not current
      final String msg = "List '" + bagName + "' is currently unavailable. It requires upgrading by the list owner.";
      request.setAttribute("errorMessage", msg);
      request.setAttribute("invalid", true);
      return null;
    }

    // Configuration required to perform queries on the DB
    // PagedResults creates a table-structured data representation of the elements
    // found in the bag. We use it to later display these elements in the
    // at the beginning of the Composite Network site
    PagedTable pagedResults = SessionMethods.getResultsTable(session, "bag." + imBag.getName());
    WebConfig webConfig = SessionMethods.getWebConfig(request);
    Model model = os.getModel();
    PathQuery pathQuery = PathQueryResultHelper.makePathQueryForBag(imBag, webConfig, model);
    SessionMethods.setQuery(session, pathQuery);
    int bagSize = imBag.getSize();
    if (pagedResults == null || pagedResults.getExactSize() != bagSize) {
      pagedResults = SessionMethods.doQueryGetPagedTable(request, imBag);
    }

    // Retrieve the different displayers associated to the CompositeNetwork
    // placement of the current bag
    DisplayerManager displayerManager = DisplayerManager.getInstance(webConfig, im);
    String bagType = model.getClassDescriptorByName(imBag.getType()).getSimpleName();
    Map<String, List<ReportDisplayer>> allDisplayers = displayerManager.getReportDisplayersForType(bagType);
    List<ReportDisplayer> displayers = null;
    // For the given type, retrieve only the displayers placed at the CompositeNetwork aspect
    if( allDisplayers != null )
      displayers = allDisplayers.get("CompositeNetwork");
    request.setAttribute("displayers", displayers);


    // Set the size
    String pageStr = request.getParameter("page");
    int page = -1;
    if (page == -1) {
      // use the page from the URL
      page = (pageStr == null ? 0 : Integer.parseInt(pageStr));
    }

    pagedResults.setPageAndPageSize(page, PAGE_SIZE);

    request.setAttribute("bag", imBag);
    request.setAttribute("bagID", imBag.getOsb().getBagId());
    request.setAttribute("bagSize", new Integer(imBag.size()));
    request.setAttribute("pagedResults", pagedResults);

    // Get us token so we can show non-public widgets.
    request.setAttribute("token", profile.getDayToken());
    LOG.debug("API key: " + profile.getDayToken());

    return null;
  }
}
