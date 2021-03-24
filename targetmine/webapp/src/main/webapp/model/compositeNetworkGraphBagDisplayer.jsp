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

<!-- Visualization Definition -->
<script type="text/javascript">
  import(window.location.origin+'/targetmine/js/CompositeNetworkGraph.mjs')
    .then((module) => {
      // dimensions for the visualization
      let width = 400;
      let height = 400;
      
      /* make sure that all the information required for the visualization 
       * is correctly obtained from the Java code */
      // console.log('Name: ${name}');
      // console.log('Data: ${data}');
      // console.log('Root elements: ${rootClass}');
      // console.log('Collections: ${collections}');

      window.compositeNetworkGraph = new module.CompositeNetworkGraph(
        '${name}',
        '${data}',
        '<%=containerId%>',
        width, height,
        '${rootClass}',
        '${collections}'
      );

    });
</script>
</div>
