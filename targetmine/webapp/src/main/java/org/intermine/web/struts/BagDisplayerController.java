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
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.struts.action.ActionForm;
import org.apache.struts.action.ActionForward;
import org.apache.struts.action.ActionMapping;
import org.apache.struts.tiles.ComponentContext;
import org.apache.struts.tiles.actions.TilesAction;
import org.intermine.web.displayer.ReportDisplayer;
import org.intermine.api.profile.InterMineBag;

/**
 * Execute a BagDisplayer placed on the context.
 * @author Rodolfo Allendes
 *
 * based on ReportDisplayerController, by Richard Smith
 *
 */
public class BagDisplayerController extends TilesAction
{
    /**
     * {@inheritDoc}
     */
    @Override
    public ActionForward execute(ComponentContext context,
                                 ActionMapping mapping,
                                 ActionForm form,
                                 HttpServletRequest request,
                                 HttpServletResponse response) {

        ReportDisplayer displayer = (ReportDisplayer) context.getAttribute("displayer");
        InterMineBag reportBag = (InterMineBag) context.getAttribute("reportBag");

        displayer.execute(request, reportObject);

        return null;
    }
}
