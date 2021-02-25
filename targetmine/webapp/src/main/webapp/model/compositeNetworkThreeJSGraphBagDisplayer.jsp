<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%@ taglib tagdir="/WEB-INF/tags" prefix="im"%>
<%@ taglib uri="/WEB-INF/struts-html.tld" prefix="html" %>

<%! int width = 400; %>
<%! int height = 400; %>
<%! String containerId = "threeJSNetworkGraph-div"; %>

<div class='collection-table'>
<h3>ThreeJS Network Graph</h3>

<!-- Visualization Container -->
<div id= <%= containerId %> class='targetmineGraphDisplayer'></div>

<script type="text/javascript">
  import(window.location.origin+'/targetmine/js/CompositeNetworkThreeJSGraph.mjs')
    .then((module) => {
      window.compositeNetworkThreeJSGraph = new module.CompositeNetworkThreeJSGraph(
        '${bagName}',
        '${data}',
        '<%= containerId %>',
        <%= width %>,
        <%= height %>
      );
    });
</script>
</div>
