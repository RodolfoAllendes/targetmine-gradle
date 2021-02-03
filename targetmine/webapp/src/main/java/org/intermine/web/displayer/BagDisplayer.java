package org.intermine.web.displayer;

/*
 * Copyright (C) 2002-2020 FlyMine
 *
 * This code may be freely distributed and modified under the
 * terms of the GNU Lesser General Public Licence.  This should
 * be distributed with the code.  See the LICENSE file for more
 * information or http://www.gnu.org/copyleft/lesser.html.
 *
 */

import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.apache.log4j.Logger;
import org.intermine.api.InterMineAPI;
import org.intermine.api.profile.Profile;
import org.intermine.web.logic.config.ReportDisplayerConfig;
import org.intermine.web.logic.results.ReportObject;
import org.intermine.web.logic.session.SessionMethods;
import org.intermine.api.profile.InterMineBag;

/**
 * Parent class for bag displayers that appear on report pages.
 * Subclasses must implement the  display() method to place view information on
 * the request.
 * BagDisplayers are constructed once and the display() method called many times
 * so caching and one time setup can be performed in the displayer class.
 * @author Rodolfo Allendes
 * Based on ReportDsplayer by Richard Smith
 *
 */
public abstract class BagDisplayer extends ReportDisplayer{

    // protected ReportDisplayerConfig config;
    // protected InterMineAPI im;
    private static final Logger LOG = Logger.getLogger(BagDisplayer.class);

    /**
     * Construct with config information read from webconfig-model.xml and the API.
     * @param config config information
     * @param im the InterMine API
     */
    public BagDisplayer(ReportDisplayerConfig config, InterMineAPI im) {
      super(config,im);
    }

    /**
     * Execute is called for each report page with the object to be displayed.  This puts the
     * ReportBag and the JSP name to use on the request then calls the specific subclass'
     * display() method.
     * @param request request for displaying a report page
     * @param reportBag the bag being displayed
     */
    public void execute(HttpServletRequest request, InterMineBag reportBag) {
        request.setAttribute("reportBag", reportBag);
        request.setAttribute("jspPage", getJspPage());
        try {
            display(request, reportBag);
        } catch (ReportDisplayerNoResultsException e) {
            request.setAttribute("displayerName", getClass().getSimpleName());
            request.setAttribute("jspPage", "reportDisplayerNoResults.jsp");
        } catch (Exception e) {
            // failed to display so put an error message in place instead
            LOG.error("Error rendering bag displayer " + getClass() + " for "
                    + reportBag.getType() + "(" + reportBag.getOsb().getBagId() + "): "
                    + ExceptionUtils.getFullStackTrace(e));
            request.setAttribute("displayerName", getClass().getSimpleName());
            request.setAttribute("jspPage", "reportDisplayerError.jsp");

            Profile profile = SessionMethods.getProfile(request.getSession());
            if (profile.isSuperuser()) {
                request.setAttribute("exception",
                        ExceptionUtils.getStackTrace(ExceptionUtils.getRootCause(e)));
            }
        }
    }

    /**
    * To be implemented in subclasses where any specific information to be displayed should be
    * put on the request.
    * @param request request for displaying a report page
    * @param reportBag the bag being displayed
    * @throws ReportDisplayerNoResultsException if something goes wrong
    */
    public abstract void display(HttpServletRequest request, InterMineBag reportBag)
        throws ReportDisplayerNoResultsException;

}
