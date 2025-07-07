<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Sitemap | ASMA-GERME</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
					body {
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
						color: #333;
						font-size: 14px;
						background: #f1f1f1;
						margin: 0;
						padding: 20px;
					}
					h1 {
						color: #0072b1;
						font-size: 28px;
						margin-top: 0;
					}
					h2 {
						color: #666;
						font-size: 18px;
					}
					a {
						color: #0072b1;
						text-decoration: none;
					}
					a:hover {
						text-decoration: underline;
					}
					table {
						border: none;
						border-collapse: collapse;
						width: 100%;
						margin: 20px 0;
						background: #fff;
						box-shadow: 0 1px 3px rgba(0,0,0,0.1);
						border-radius: 8px;
						overflow: hidden;
					}
					th {
						text-align: left;
						padding: 12px 15px;
						background-color: #0072b1;
						color: #fff;
						font-weight: 600;
					}
					td {
						padding: 10px 15px;
						border-bottom: 1px solid #eee;
					}
					tr:last-child td {
						border-bottom: 0;
					}
					tr:hover td {
						background: #f9f9f9;
					}
					.logo {
						margin-bottom: 20px;
					}
					.logo img {
						height: 40px;
					}
					.container {
						max-width: 1200px;
						margin: 0 auto;
						background: #fff;
						padding: 30px;
						border-radius: 10px;
						box-shadow: 0 2px 10px rgba(0,0,0,0.1);
					}
					footer {
						text-align: center;
						margin-top: 20px;
						font-size: 13px;
						color: #777;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="logo">
						<img src="/logo.svg" alt="ASMA-GERME Logo" />
					</div>
					<h1>ASMA-GERME Site Haritası</h1>
					<p>
						Bu sitemap, Google, Bing, Yandex ve diğer arama motorları için ASMA-GERME web sitesinin yapısını gösterir.
					</p>
					
					<xsl:apply-templates></xsl:apply-templates>
					
					<footer>
						<p>Oluşturma tarihi: <xsl:value-of select="substring(concat(sitemap:urlset/sitemap:url/sitemap:lastmod[1]),0,11)"/></p>
						<p>Copyright © <xsl:value-of select="substring(concat(sitemap:urlset/sitemap:url/sitemap:lastmod[1]),0,5)"/> ASMA-GERME. Tüm hakları saklıdır.</p>
					</footer>
				</div>
			</body>
		</html>
	</xsl:template>
	
	<xsl:template match="sitemap:urlset">
		<h2>URL Listesi (<xsl:value-of select="count(sitemap:url)"/> URL)</h2>
		<table>
			<tr>
				<th>URL</th>
				<th>Öncelik</th>
				<th>Değişim Sıklığı</th>
				<th>Son Güncelleme</th>
			</tr>
			<xsl:for-each select="sitemap:url">
				<tr>
					<td>
						<xsl:variable name="url"><xsl:value-of select="sitemap:loc"/></xsl:variable>
						<a href="{$url}" target="_blank">
							<xsl:value-of select="sitemap:loc"/>
						</a>
					</td>
					<td>
						<xsl:value-of select="sitemap:priority"/>
					</td>
					<td>
						<xsl:value-of select="sitemap:changefreq"/>
					</td>
					<td>
						<xsl:value-of select="substring(sitemap:lastmod,0,11)"/>
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
</xsl:stylesheet>
