
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im" %>
<%@ taglib uri="/WEB-INF/struts-tiles.tld" prefix="tiles" %>

<%@ page import="org.intermine.dwr.AjaxServices" %>
<%@ page import="org.intermine.web.logic.session.SessionMethods" %>

<!-- Rodolfo's wsFilterList.jsp -->

<tiles:importAttribute name="type"/>
<tiles:importAttribute name="wsListId"/>
<tiles:importAttribute name="scope"/>
<tiles:importAttribute name="showNames" ignore="true"/>
<tiles:importAttribute name="showTitles" ignore="true"/>
<tiles:importAttribute name="showDescriptions" ignore="true"/>
<tiles:importAttribute name="showTags" ignore="true"/>
<tiles:importAttribute name="showSearchBox" ignore="true"/>

<tiles:importAttribute name="makeCheckBoxes" ignore="true"/>
<tiles:importAttribute name="makeTable" ignore="true"/>
<tiles:importAttribute name="makeLine" ignore="true"/>
<tiles:importAttribute name="wsHeader" ignore="true"/>
<tiles:importAttribute name="wsRow" ignore="true"/>
<tiles:importAttribute name="height" ignore="true"/>
<tiles:importAttribute name="limit" ignore="true"/>
<tiles:importAttribute name="initialFilterText" ignore="true"/>
<tiles:importAttribute name="loginMessageKey" ignore="true"/>
<tiles:importAttribute name="showCount" ignore="true"/>
<tiles:importAttribute name="templatesPublicPage" ignore="true"/>


<html:xhtml/>

<%-- Add a block of code in Java --%>
<%
  String id =  pageContext.getAttribute("wsListId") + "_" + pageContext.getAttribute("type") + "_item_description";
  org.intermine.web.logic.results.WebState webState = SessionMethods.getWebState(session);
  if (webState.getState(id) != null) {
    if (webState.getState(id).toString().equals("true")) {
      pageContext.setAttribute("userShowDescription", true);
    }
  }
  else {
    pageContext.setAttribute("userShowDescription", true);
  }

  id =  pageContext.getAttribute("wsListId") + "_" + pageContext.getAttribute("type") + "_item_tags";
  if (webState.getState(id) != null && webState.getState(id).toString().equals("true")) {
    pageContext.setAttribute("userShowTags", true);
  }
%>

<c:set var="ws_input_id" value="${wsListId}_${type}_filter_text"/>
<c:set var="ws_input_aspect" value="${wsListId}_${type}_filter_aspect"/>
<c:set var="textForBox" value="${WEB_PROPERTIES['lists.input.example']}" />

<script type="text/javascript" charset="utf-8">


  function clearBagName(element) {
    if(element.value == '${textForBox}'){
        element.value='';
        element.style.fontStyle = 'normal';
        element.style.color = '';
    }
  }
  /**
   * Function used by the filter-by-tag drop down select component of the
   * filter-bar
   */
  function filterByTag(tag) {
    filterByUserTag('${type}', '${wsListId}', tag);
  }

  /** Not sure if this function is required as not able to find the export_button element */
  jQuery("document").ready(function() {
    jQuery("#export_button").click(function() {
      jQuery("#modifyTemplateForm").submit();
    });
  });

  function isEmptyChecklist(){
      if ((jQuery("input[type=checkbox][name=selected]:checked").length) < 1) {
        alert("Please select some templates to export...");
        return false;
      }
  }

  /**
   * Assing functions to different interface elements once the loading of the
   * page has been completed
   */
  jQuery(document).ready(function() {
    jQuery(".boxy").boxy();

    jQuery("#all_templates_template_container input[name='selected']").click(function(){
      var checked = jQuery("#all_templates_template_container input[name='selected']:checked");
      var selected = checked.length;
      if (selected > 0) {
        jQuery("#export").attr('disabled', false);
      }
      else {
        jQuery("#export").attr('disabled', true);
      }
    });

    /**
     * Activate and De-activate action links based in the number of selected
     * items from the list of bags
     */
    jQuery("#all_bag_bag_container input[name='selectedBags']").click(function() {
      var checked = jQuery("#all_bag_bag_container input[name='selectedBags']:checked");
      var selected = checked.length;

      // "Union"
      // "Intersect"
      // "Subtract"
      // "AsymmetricDifference"
      // "Copy"
      // "Analysis"
      // "Delete"

      // Tools only become active depending on the number of lists currently selected
      if (selected <= 0) {
        jQuery('#filter_tool_bar a.boxy').addClass('inactive')
      }
      else{
        // If 1 and only 1 item is selected, only Copy, Analysis and Delete options
        // become available
        if( selected == 1 ){
          jQuery("#filter_tool_bar a.boxy[title='Copy']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Analysis']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Delete']").removeClass('inactive');

          jQuery("#filter_tool_bar a.boxy[title='Union']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Intersect']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Subtract']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='AsymmetricDifference']").addClass('inactive');

          jQuery("#filter_tool_bar a.boxy[title='Copy']").attr("href", "#operations");

          jQuery("#filter_tool_bar a.boxy[title='Analysis']").attr(
            "href",
            "bagDetails.do?scope=all&bagName="+jQuery("input[name='selectedBags']:checked").val()
            // "http://10.100.60.138:8080/targetmine/bagDetails.do?scope=all&bagName=Gene+list+for+all+organisms+26+Nov+2020+10.45"
            // "/bagDetails.do?type=${type}&amp;"//scope=${scope}&amp;name=${entry.key}${extraParams}"//>
          );
                    // <%-- <html:link action=
                    //   ${entry.value.title}
                    // </html:link> --%>
        }
        // If 2 and only 2 lists are selected, all list operations become available
        // Only the deletion of a list remain an available action
        if( selected == 2 ){
          jQuery("#filter_tool_bar a.boxy[title='Copy']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Analysis']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Delete']").removeClass('inactive');

          jQuery("#filter_tool_bar a.boxy[title='Union']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Intersect']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Subtract']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='AsymmetricDifference']").removeClass('inactive');

          // For the specific case of assymetric difference, we need to keep track
          // of the names of both lists
          jQuery("#listA1").html(checked[0].value);
          jQuery("#listB1").html(checked[1].value);
          jQuery("#listA2").html(checked[0].value);
          jQuery("#listB2").html(checked[1].value);

          jQuery("#filter_tool_bar a.boxy[title='Copy']").attr("href", "");
        }
        // Finally, if the number of selected lists is greater than two, list
        // operations, with the excception of assymetric difference remain available.
        // Only deletion of lists also remain available
        if ( selected > 2 ){
          jQuery("#filter_tool_bar a.boxy[title='Copy']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Analysis']").addClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Delete']").removeClass('inactive');

          jQuery("#filter_tool_bar a.boxy[title='Union']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Intersect']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='Subtract']").removeClass('inactive');
          jQuery("#filter_tool_bar a.boxy[title='AsymmetricDifference']").addClass('inactive');
        }
      }
    });

    /**
     * Assign functions to Action links
     */
    jQuery("#filter_tool_bar a.boxy").click(function(e){
      // functions are assigned only if the buttons are 'active'
      if (!jQuery(this).hasClass('inactive')) {
        // "Union"
        // "Intersect"
        // "Subtract"
        // "AsymmetricDifference"
        // "Copy"
        // "Analysis"
        // "Delete"
        let action = jQuery(this).attr('title').toLowerCase();
        jQuery("#listsButton").val(action);
        if ( action == 'analysis'){
          console.log('clicked on action', action);
        }
        else{
          if (jQuery(this).attr('title').toLowerCase() == "delete") {
            deleteBag();
          }
          else {
            if (jQuery(this).attr('title').toLowerCase() == "copy") {
              var selected = jQuery("#all_bag_bag_container input[name='selectedBags']:checked").length;
              if (selected > 1) {
                submitBagOperation();
              }
            }
          }
          // avoid calling the default action when clicking
        }
      }
      e.preventDefault();
    });

    // enable filter only after the list is populated
    jQuery('#filterText').attr('disabled', false);
    if( document.getElementById('${ws_input_aspect}') != null &&
        document.getElementById('${ws_input_aspect}').value != '') {
      filterAspect('${type}', '${wsListId}');
    }
    else
      if (document.getElementById('filterText').value != '') {
        filterWebSearchablesHandler(null, document.getElementById('filterText'), '${type}', '${wsListId}');
      }
      else {
        showWSList('${wsListId}', '${type}');
      }

  });  // end document(ready)

  function deleteBag() {
      jQuery('#listsButton').val('delete');
      submitBagOperation();
  }

  function submitBagOperation() {
    if (jQuery('#listsButton').val() != "Delete") {
      jQuery("#newBagName").val(jQuery("#dummy_text").val());
    }
    validateBagOperations('modifyBagForm',jQuery('#listsButton').val());
  }

  function submitAsymOperation1() {
    jQuery("#newBagName").val(jQuery("#dummy_text1").val());
    jQuery("#listLeft").val(jQuery("#listA1").html());
    jQuery("#listRight").val(jQuery("#listB1").html());
    modifyBagForm.submit();
  }
  function submitAsymOperation2() {
    jQuery("#newBagName").val(jQuery("#dummy_text2").val());
    jQuery("#listLeft").val(jQuery("#listB2").html());
    jQuery("#listRight").val(jQuery("#listA2").html());
    modifyBagForm.submit();
  }

  // turn off autocomplete because of a Gecko bug:
  // http://geekswithblogs.net/shahedul/archive/2006/08/14/87910.aspx
  jQuery('#${wsListId}_${type}_filter_text').attr('autocomplete','off');


</script>

<%-- Add the filter toolBar --%>
<div class="filterBar">

  <%-- First, we add an input field to filter by custom text --%>
  Filter:&nbsp;
  <input
    type="text"
    id="filterText"
    name="newName_${name}"
    size="20"
    onkeyup="return filterWebSearchablesHandler(event, this, '${type}', '${wsListId}');"
    onmouseup="if(this.value != null && this.value.length > 1) {return filterWebSearchablesHandler(event, this, '${type}', '${wsListId}');}"
    onKeyPress="return disableEnterKey(event);"
    disabled="true"
    value=""
  />

  <%-- Then we add the option to filter by favorites or user tags --%>
  <c:if test="${PROFILE.loggedIn || type == 'template'}">
    Filter:&nbsp;
  </c:if>
  <c:if test="${PROFILE.loggedIn}">
    <a href="javascript:filterFavourites('${type}', '${wsListId}');"><img id="filter_favourites_${wsListId}_${type}" src="images/filter_favourites.png" width="20" height="20" title="Show Only Favourites" style="vertical-align: middle;"/></a>
    <a href="javascript:changeScope('${type}', '${wsListId}');"><img id="filter_scope_${wsListId}_${type}" src="images/filter_all.png" width="20" height="20" title="Show all or mine only" style="vertical-align: middle;"/></a>
    <c:if test="${type == 'bag'}">
      <tiles:insert name="tagSelect.tile">
        <tiles:put name="type" value="${type}" />
        <tiles:put name="selectId" value="tagSelect" />
        <tiles:put name="onChangeFunction" value="filterByTag" />
      </tiles:insert>
    </c:if>
  </c:if>
  <c:if test="${type == 'template'}">
    <%-- aspects --%>
    <select onchange="javascript:filterAspect('${type}', '${wsListId}')" id="${ws_input_aspect}" class="aspectSelect" style="">
      <c:if test="${aspect == null}">
        <option value="" selected>-- all categories --</option>
      </c:if>
      <c:forEach items="${ASPECTS}" var="entry">
        <c:set var="set" value="${entry.value}" />
          <option value="${set.name}"
            <c:if test="${aspect.name == set.name || initialFilterText == set.name}">
            selected
            </c:if>
          >
            ${set.name}
          </option>
      </c:forEach>
    </select>
  </c:if>

  <input type="button" name="reset" value="Reset" id="reset_button" onclick="javascript:return clearFilter('${type}', '${wsListId}')">
  <input type="hidden" name="filterAction_${wsListId}_${type}" id="filterAction_${wsListId}_${type}"/>
  <input type="hidden" name="filterScope_${wsListId}_${type}" id="filterScope_${wsListId}_${type}" value="${scope}"/>
</div>


<%-- Add the actions bar --%>
<div id="filter_tool_bar">
    <strong>Actions:</strong>
    <c:choose>
      <c:when test="${type == 'template'}">
        <html:submit property="export" styleId="export" value="Export selected" disabled="true" onclick="javascript: return isEmptyChecklist();"/>
        <html:hidden property="pageName" value="templates"/>
        <html:hidden property="templateButton" value="export"/>
      </c:when>
      <c:otherwise>
        <a href="#operations" title="Union" class="boxy inactive"><img src="images/union.png" width="21" height="14" alt="Union">Union</a>&nbsp;|&nbsp;
        <a href="#operations" title="Intersect" class="boxy inactive"><img src="images/intersect.png" width="21" height="14" alt="Intersect">Intersect</a>&nbsp;|&nbsp;
        <a href="#operations" title="Subtract" class="boxy inactive"><img src="images/subtract.png" width="21" height="14" alt="Subtract">Subtract</a>&nbsp;|&nbsp;
        <a href="#asymoperations" title="AsymmetricDifference" class="boxy inactive"><img src="images/asymmetricdifference.png" width="21" height="14" alt="Asymmetric Difference">Asymmetric Difference</a>&nbsp;|&nbsp;
        <a href="#" title="Copy" class="boxy inactive"><img src="images/icons/copy.png" width="16" height="16" alt="Copy">Copy</a>
        <a href="#" title="Analysis" class="boxy inactive"><img src="images/icons/lists-16.png" width="16" height="16" alt="Copy">Analysis</a>
        <a href="#" title="Delete" class="boxy inactive"><img src="images/icons/delete.png" width="16" height="16" alt="Delete">Delete</a>
      </c:otherwise>
    </c:choose>
    <br />
    <strong class="pad">Options:</strong>
    <c:if test="${! empty userShowDescription}">
        <c:set var="checkboxChecked" value="checked" />
    </c:if>
    <input type="checkbox" <c:out value="${checkboxChecked}" /> id="showCheckbox" onclick="showDescriptions('<c:out value="${wsListId}" />', '<c:out value="${type}" />', this.checked)">
    <label for="showCheckbox">Show descriptions</label>

    <c:if test="${! empty userShowTags}">
        <c:set var="tagCheckboxChecked" value="checked" />
    </c:if>
    <input type="checkbox" <c:out value="${tagCheckboxChecked}" /> id="showTagCheckbox" onclick="showTags('<c:out value="${wsListId}" />', '<c:out value="${type}" />', this.checked)">
    <label for="showCheckbox">Show Tags</label>
</div>


<%-- Need a dummy because boxy puts it outside of the form --%>
<html:hidden property="listsButton" value="" styleId="listsButton"/>
<html:hidden property="newBagName" value="" styleId="newBagName"/>
<html:hidden property="listLeft" value="" styleId="listLeft"/>
<html:hidden property="listRight" value="" styleId="listRight"/>
<div id="operations" style="display:none">
  Enter a new List name:<br>
  <html:text styleId="dummy_text" property="" size="12" value="${textForBox}" style="color:#666;font-style:italic;vertical-align:top" onclick="clearBagName(this)"/>
  <html:submit property="save" value="Save" onclick="submitBagOperation()"/>
</div>

<div id="asymoperations" style="display:none">
    List <span id="listA1"></span> minus <span id="listB1"></span>:<br>
    <html:text styleId="dummy_text1" property="" size="12" value="${textForBox}" style="color:#666;font-style:italic;vertical-align:top" onclick="clearBagName(this)"/>
    <html:submit property="save" value="Save" onclick="submitAsymOperation1()"/><br><br>
    List <span id="listB2"></span> minus <span id="listA2"></span>:<br>
    <html:text styleId="dummy_text2" property="" size="12" value="${textForBox}" style="color:#666;font-style:italic;vertical-align:top" onclick="clearBagName(this)"/>
    <html:submit property="save" value="Save" onclick="submitAsymOperation2()"/>
</div>


<%--
  Use the webSearchableList Tile to actually add the table with all the
  lists saved by the user
--%>
<tiles:insert name="webSearchableList.tile">
  <tiles:put name="type" value="${type}"/>
  <tiles:put name="wsListId" value="${wsListId}"/>
  <tiles:put name="scope" value="${scope}"/>
  <tiles:put name="tags" value="${tags}"/>
  <tiles:put name="showNames" value="${showNames}"/>
  <tiles:put name="showTitles" value="${showTitles}"/>
  <tiles:put name="showDescriptions" value="${showDescriptions}"/>
  <tiles:put name="showTags" value="${showTags}"/>
  <tiles:put name="makeCheckBoxes" value="${makeCheckBoxes}"/>
  <tiles:put name="makeTable" value="${makeTable}"/>
  <tiles:put name="makeLine" value="${makeLine}"/>
  <tiles:put name="wsHeader" value="${wsHeader}"/>
  <tiles:put name="wsRow" value="${wsRow}"/>
  <tiles:put name="limit" value="${limit}"/>
  <tiles:put name="height" value="${height}"/>
  <tiles:put name="showSearchBox" value="${showSearchBox}"/>
  <tiles:put name="loginMessageKey" value="${loginMessageKey}"/>
  <tiles:put name="showCount" value="${showCount}"/>
  <tiles:put name="templatesPublicPage" value="${templatesPublicPage}"/>
</tiles:insert>


<c:if test="${empty userShowDescription}">
   <script type="text/javascript">
<%-- If show description checkbox is not checked, then descriptions should be hidden --%>
   showDescriptions('<c:out value="${wsListId}" />', '<c:out value="${type}" />', false);
   </script>
</c:if>

<c:if test="${empty userShowTags}">
   <script type="text/javascript">
<%-- If show tags checkbox is not checked, then tags should be hidden --%>
   showTags('<c:out value="${wsListId}" />', '<c:out value="${type}" />', false);
   </script>
</c:if>

<!-- /Rodolfo's wsFilterList.jsp -->
