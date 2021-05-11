<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<%! String containerId = "compositeNetwork3dsGraph-div"; %>

<div class='collection-table'>
<h3>Composite Network 3ds Graph</h3>

<!-- Visualization Container -->
<div id=<%=containerId%> class='targetmineGraphDisplayer'></div>

<!-- Visualization Definition -->
<script type="text/javascript">
  import(window.location.origin+'/targetmine/js/CompositeNetwork3dsGraph.mjs')
    .then((module) => {
      // dimensions for the visualization
      let width = 400;
      let height = 400;
      
      /* initialize the visualization container */
      window.compositeNetworkGraph = new module.CompositeNetwork3dsGraph(
        '${name}',
        '${data}',
        '<%=containerId%>',
        width, height,
        '${rootClass}',
      );

    });
</script>
</div>
