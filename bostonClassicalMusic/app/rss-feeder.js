var xml = document.implementation.createDocument("", "", null);
xml.async = false;
xml.load("./rss.xml");

var xsl = document.implementation.createDocument("", "", null);
xsl.async = false;
xsl.load("../styles/stylesheet.xsl");

var xsltProcessor = new XSLTProcessor();
xsltProcessor.importStylesheet(xsl);

var resultDocument = xsltProcessor.transformToFragment(xml, document);
document.body.appendChild(resultDocument);

