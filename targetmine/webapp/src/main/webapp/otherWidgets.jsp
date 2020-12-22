<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>
<%@ taglib uri="/WEB-INF/struts-tiles.tld" prefix="tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>

<!-- otherWidgets -->
<html:xhtml/>

  <script type="text/javascript">
  <%-- apply white background as report page loads slowly and body bg will show through --%>
  var pageBackgroundColor = jQuery('body').css('background-color');
  jQuery('body').css('background-color', '#FFF');

  <%--  Expose useful properties to the js. The properties themselves are
        set in the foreach later down the page --%>
  var imSummaryFields = {
    type : "${object.type}"
  };
  console.log("${object}");

  </script>

  <%-- Top Header (Contains the title and general information about the object
      being reported on --%>
  <div id="header_wrap">
    <div id="object_header">

    <a name="summary">
    <h1 class="title">
      Sample Title for the Page
    </h1>
    </a>

    </div> <!-- object_header -->
  </div> <!-- header_wrap -->

  <%-- This is the acual content of the page --%>
  <div id="content">

    <%-- This is the top navigation bar of the Report page --%>
    <%-- <div id="toc-menu-wrap">
      <tiles:insert name="reportMenu.jsp">
        <tiles:put name="summary" value="current" />
      </tiles:insert>
    </div> --%>

    <%-- This container allows the division of the main screen into two columns:
    the main content column (grid_10) and the sidebar column (grid_2 sidebar) --%>
    <div class="container_12">

      <div style="float:right;" class='grid_2 sidebar'>
        <div id="external-links">
          <%-- <tiles:insert name="otherMinesLink.tile" />
          <tiles:insert name="attributeLinks.tile" >
            <tiles:put name="reportObject" beanName="object" />
          </tiles:insert> --%>
        </div>
      </div>

      <div class='grid_10'>

        <div id="summaryCategory" class="aspectBlock">
          Chau
          <tiles:insert page="/otherReportDisplayers.jsp">
            <tiles:put name="placement" value="summary" />
            <tiles:put name="reportObject" beanName="object" />
          </tiles:insert>

          <%-- <tiles:insert name="templateList.tile">
            <tiles:put name="scope" value="global" />
            <tiles:put name="placement" value="im:aspect:summary" />
            <tiles:put name="reportObject" beanName="object" />
          </tiles:insert> --%>

          <%-- <tiles:insert page="/reportRefsCols.jsp">
            <tiles:put name="object" beanName="object" />
            <tiles:put name="placement" value="im:summary" />
          </tiles:insert> --%>
        </div>

        <%-- <c:forEach items="${categories}" var="aspect" varStatus="status">
          <div id="${fn:replace(aspect, " ", "_")}Category" class="aspectBlock">
            <tiles:insert name="reportAspect.tile">
              <tiles:put name="mapOfInlineLists" beanName="mapOfInlineLists" />
              <tiles:put name="placement" value="im:aspect:${aspect}" />
              <tiles:put name="reportObject" beanName="object" />
              <tiles:put name="trail" value="${request.trail}" />
              <tiles:put name="aspectId" value="${templateIdPrefix}${status.index}" />
              <tiles:put name="opened" value="${status.index == 0}" />
            </tiles:insert>
          </div>
        </c:forEach> --%>

      </div>

    </div>


  </div> <!-- content -->

<!-- /otherWidgets -->
