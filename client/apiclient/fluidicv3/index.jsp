<%-- $Id$ --%>
<!DOCTYPE html>
<%@ page import="com.adventnet.me.opmanager.webclient.login.LoginHandler" %>
<%@ page import="com.adventnet.nms.util.NmsUtil"%>
<%
	String accessedLoginHandler = (String) request.getSession().getAttribute("accessedLoginHandler");
	if (accessedLoginHandler == null || !accessedLoginHandler.equals("true")) {
			LoginHandler handler = new LoginHandler();
			handler.doLogin(request, response);
			return; // Stop further execution if login is not successful
	}
%>
<jsp:include page="/apiclient/fluidicv3/itom/index.html" />
<%-- <html>
	<head>
		<%
			String productName = (String) request.getSession().getAttribute("productName");
			String favPfx = NmsUtil.isOPMPLUS ? "-nexus" : NmsUtil.isOPM ? "-opm" : ""; //No I18N
		%>
		<script>
			window.OPM = {};
			window.OPM.productName = "<%=productName%>";
		</script>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<title><%=productName%></title>
		
		<link rel="icon" href="/apiclient/fluidicv3/itom/favicon<%= favPfx %>.ico" type="image/x-icon">
		<meta name="description" content="">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		 <meta name="itom/config/environment" content="%7B%22modulePrefix%22%3A%22itom%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2Fapiclient%2Ffluidicv3%2Fitom%2F%22%2C%22locationType%22%3A%22hash%22%2C%22EmberENV%22%3A%7B%22EXTEND_PROTOTYPES%22%3Afalse%2C%22FEATURES%22%3A%7B%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_NO_IMPLICIT_ROUTE_MODEL%22%3Atrue%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22itom%22%2C%22version%22%3A%220.0.0%2B363e7804%22%7D%7D" />
		<link integrity="" rel="stylesheet" href="/apiclient/fluidicv3/itom/assets/vendor.css">
		<link integrity="" rel="stylesheet" href="/apiclient/fluidicv3/itom/assets/itom.css">
	</head>
	<body>
		<div id="itom"></div>
		<script src="/apiclient/fluidicv3/itom/assets/vendor.js"></script>
		<script src="/apiclient/fluidicv3/itom/assets/chunk.app.c08391240c69c03915e4.js"></script>
		<script src="/apiclient/fluidicv3/itom/assets/itom.js"></script>
	</body>
</html> --%>
