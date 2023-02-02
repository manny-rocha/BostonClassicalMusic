<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/rss">
    <html>
      <head>
        <title>Classical Music Events</title>
      </head>
      <body>
        <xsl:for-each select="channel/item">
          <h2>
            <a href="{link}">
              <xsl:value-of select="title"/>
            </a>
          </h2>
          <p>
            <xsl:value-of select="description"/>
          </p>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
