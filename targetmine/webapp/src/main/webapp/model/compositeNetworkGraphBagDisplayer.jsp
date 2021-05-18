<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<%! String containerId = "compositeNetworkGraph-div"; %>

<div class='collection-table'>
<h3>Composite Network Graph</h3>

<!-- Visualization Container -->
<div id=<%=containerId%> class='targetmineGraphDisplayer'></div>

<!-- <script>
  oldCy = cytoscape;
  window.cytoscape = null;
</script>
<script type="text/javascript" src="cytoscape-1.18.0.min.js"></script>
<script>
  window.newcy = cytoscape;
  window.cytoscape = oldCy;
  // test it worked
  console.log('old', window.cytoscape.version);
  console.log('new', window.newcy.version);
</script> -->

<!-- Visualization Definition -->
<script type="text/javascript">
  import(window.location.origin+'/targetmine/js/CompositeNetworkGraph.mjs')
    .then((module) => {
      // dimensions for the visualization
      let width = 400;
      let height = 400;
      
      /* initialize the visualization container */
      window.compositeNetworkGraph = new module.CompositeNetworkGraph(
        '${name}',
        '${data}',
        '<%=containerId%>',
        width, height,
        '${rootClass}',
      );

    });
</script>
</div>
