<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<%! int width = 1500; %>
<%! int height = 1500; %>
<%! String containerId = "supraAdjacencyMatrixGraph-div"; %>

<div class='collection-table'>
<h3>Supra-Adjacency Matrix Graph</h3>

<!-- Visualization Container -->
<div id= <%= containerId %> class='targetmineGraphDisplayer'></div>

<script type="text/javascript">
  console.log("containerid", '<%= containerId %>');
  import(window.location.origin+'/targetmine/js/SupraAdjacencyMatrixGraph.mjs')
    .then((module) => {
      window.supraAdjacencyMatrixGraph = new module.SupraAdjacencyMatrixGraph(
        '${bagName}',
        '${data}',
        '<%= containerId %>',
        <%= width %>,
        <%= height %>
      );
    });
</script>
</div>
