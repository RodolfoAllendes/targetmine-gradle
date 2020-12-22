<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>
<%@ taglib uri="/WEB-INF/struts-tiles.tld" prefix="tiles" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>

<!-- otherReportDisplayers.jsp -->

<html:xhtml/>

<tiles:importAttribute name="reportObject"/>
<tiles:importAttribute name="placement"/>

Hola=${reportObject}

<c:forEach items="${reportObject.otherReportDisplayers[placement]}" var="displayer">

   <a name="${displayer.displayerName}" class="anchor"></a>
        <%-- the AJAX way --%>
      <c:set var="displayerWrapper" value="${fn:toLowerCase(displayer.displayerName)}-wrapper"/>
      <div id="${displayerWrapper}" class="wrapper collection-table">
       <h3 class="loading">${displayer.nicerDisplayerName}</h3>
      </div>

      <script type="text/javascript">
       jQuery.ajax({
           url: 'modifyDetails.do',
           dataType: 'html',
           data: 'method=ajaxShowDisplayer&name=${displayer.displayerName}&id=${reportObject.id}',
           success: function(html) {
             var wrapper = jQuery('#${displayerWrapper}');
             wrapper.hide();
             wrapper.html(html);
             wrapper.fadeIn().removeClass('collection-table');
           },
           error: function(jXHR, textStatus) {
             throw new Error('Failed to load Displayer "${displayer.displayerName}" ' + textStatus);
           },
           complete: function(jXHR, textStatus) {
               //
           }
         });
       </script>

</c:forEach>

<!-- /otherReportDisplayers.jsp -->
