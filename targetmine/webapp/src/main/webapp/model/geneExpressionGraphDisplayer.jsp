<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<%! int width = 1000; %>
<%! int height = 400; %>

<div class='collection-table'>

  <!-- Verify that there isnt an empty collection of data -->
  <c:choose>
    <c:when test="${empty data}">
      <h3>No data to display by Rodolfo</h3>
    </c:when>

    <c:otherwise>
      <h3>Gene Expression Graph</h3>
      <!-- Visualization Container -->
      <div class='targetmineGraphDisplayer'>

        <!-- Left Column of the Visualization (main display) -->
        <svg class='targetmineGraphSVG' id='canvas' viewbox="0 0 <%= width %> <%= ' ' %> <%= height%>"></svg>

        <!-- Right Column, reserved for visualization controls -->
        <div class='rightColumn'>
          <table id='category-table'>
            <tbody>
            </tbody>
          </table>
        </div>

      </div>

      <script type="text/javascript">
        import(window.location.origin+'/targetmine/js/GeneExpressionGraph.mjs')
          .then((module) => {
            let graph = new module.GeneExpressionGraph('${gene}', <%= width %>, <%= height %>);
            graph.loadData('${data}');
            graph.initXLabels();
            graph.initXAxis();
            graph.initYAxis();
            graph.initColorsAndShapes();
            graph.plot();
          });
      </script>

    </c:otherwise>
  </c:choose>
</div>
