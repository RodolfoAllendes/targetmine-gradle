<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<%! String containerId = "bioActivityGraph-div"; %>

<div class="collection-table">
<h3>Bio-Activities Graph</h3>

<!-- Visualization Container -->
<div id=<%= containerId %> class='targetmineGraphDisplayer'></div>

<!-- Visualization Definition -->
<script type="text/javascript">
  import(window.location.origin+'/targetmine/js/BioActivityGraph.mjs')
    .then((module) => {
      // dimensions for the visualization
      let width = 400;
      let height = 400;

      window.bioActivityGraph = new module.BioActivityGraph(
        '${compound}',
        '${data}',
        '<%=containerId%>',
        width, height
      );
    });
</script>
</div>