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

<!-- /otherWidgets -->
