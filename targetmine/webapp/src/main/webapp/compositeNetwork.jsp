<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>
<%@ taglib uri="/WEB-INF/struts-tiles.tld" prefix="tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im" %>
<%@ taglib uri="http://jakarta.apache.org/taglibs/string-1.1" prefix="str" %>
<%@ taglib uri="/WEB-INF/functions.tld" prefix="imf" %>

<!-- bagDetails2.jsp by Rodolfo-->
<html:xhtml/>

<link rel="stylesheet" href="css/resultstables.css" type="text/css" />
<link rel="stylesheet" href="css/toolbar.css" type="text/css" media="screen" title="Toolbar Style" charset="utf-8"/>

<script type="text/javascript">
<!--//<![CDATA[
  var modifyDetailsURL = '<html:rewrite action="/modifyDetails"/>';
  var detailsType = 'bag';
  var webappUrl = "${WEB_PROPERTIES['webapp.baseurl']}/${WEB_PROPERTIES['webapp.path']}/";
  var service = webappUrl + "service/";
//]]>-->
</script>

<script type="text/javascript">
  <%-- the number of entries to show in References & Collections before switching to "show all" --%>
  var numberOfTableRowsToShow = '${object.numberOfTableRowsToShow}'; <%-- required on report.js --%>
  numberOfTableRowsToShow = (numberOfTableRowsToShow == '') ? 30 : parseInt(numberOfTableRowsToShow);
</script>
<script type="text/javascript" src="<html:rewrite page='/js/report.js'/>"></script>

<script type="text/javascript" src="<html:rewrite page='/js/inlinetemplate.js'/>"></script>

<script type="text/javascript">
  console.log('Bag: ${bag}');
  console.log('bagContentsIds: ${bagContentsIds}');
  console.log('Results: ${results}');
  console.log('pagedResults: ${pagedResults}');

  console.log('queryResults', ${secondResults});
</script>

<div class="body">

  <!-- <c:forEach items="${results}" var="entry">
    Key = ${entry.key}, value = ${entry.value}<br>
  </c:forEach> -->

  <c:choose>
    <c:when test="${!empty bag}">

      <!-- Title Header -->
      <div class="heading results">
        <h1>
          <fmt:message key="compositeNetwork.title"/>
          for <b>${bag.name}</b>
        </h1>
      </div>

      <!-- Table that list the components of the Bag -->
      <table class="results">
        <tr>
        </tr>

        <tr>
          <td valign="top" class="tableleftcol">
            <div class="results collection-table nomargin">
              <style type="text/css">
                .bag-detail-table { max-width: 1000px; }
              </style>

              <%-- Table displaying bag elements --%>
              <tiles:insert name="resultsTable.tile">
                <tiles:put name="pagedResults" beanName="pagedResults" />
                <tiles:put name="currentPage" value="bagDetails" />
                <tiles:put name="bagName" value="${bag.name}" />
                <tiles:put name="highlightId" value="${highlightId}"/>
                <tiles:put name="cssClass" value="bag-detail-table"/>
                <tiles:put name="pageSize" value="10"/>
              </tiles:insert>
            </div>
          </td>
        </tr>

      </table>

    </c:when>
    <c:otherwise>

      <div class="bigmessage">
        <br />
        <b>Error</b>${errorMessage}
        <br />
        <html:link action="/bag?subtab=view">View all lists</html:link>
      </div>
    </c:otherwise>
  </c:choose>
</div>
<!-- /bagDetails2.jsp by Rodolfo -->
