<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<div class='collection-table'>
<h3>Composite Network Graph</h3>

<!-- Visualization Container -->
<!-- <div id='compositeID' class='targetmineGraphDisplayer'></div> -->

<script type="text/javascript">
  import(window.location.origin+'/targetmine/js/CompositeNetworkGraph.mjs')
    .then((module) => {
      // let width = 400;
      // let height = 400;
      // let containerId = 'compositeNetworkGraph-div';

      // console.log('path: ${path}');
      // console.log('prefix: ${prefix}');
      console.log('Base elements: ${rootClass}');
      console.log('collectionDescriptors: ${collectionDescriptors}');

      // window.compositeNetworkGraph = new module.CompositeNetworkGraph(
      //   '${bagName}', //args[0]
      //   '${data}', //args[1]
      //   containerId, //args[2]
      //   width, //args[3]
      //   height, //args[4]
      // );
    });
</script>
</div>
