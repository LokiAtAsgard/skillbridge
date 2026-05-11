<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" indent="yes"/>

<xsl:template match="/">
<html>
<head>
  <title>SkillBridge Listings - XSL Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f8faf8; color: #1a1a1a; }
    .header { background: #061a0e; color: white; padding: 26px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .header h1 { font-size: 22px; }
    .header p { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 4px; }
    .btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .btn-print { background: #15803d; color: white; }
    .wrap { max-width: 1200px; margin: 0 auto; padding: 28px 22px; }
    .summary { background: white; border-radius: 10px; padding: 18px 22px; margin-bottom: 18px; border: 1px solid #e5e7e5; display: flex; gap: 32px; flex-wrap: wrap; }
    .stat-num { font-size: 26px; font-weight: 700; color: #15803d; }
    .stat-lbl { font-size: 11px; color: #6b736b; margin-top: 2px; }
    .controls { background: white; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; border: 1px solid #e5e7e5; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .controls input, .controls select { padding: 7px 11px; border: 1px solid #d1d5d1; border-radius: 6px; font-size: 13px; min-width: 160px; }
    .controls label { font-size: 12px; font-weight: 700; color: #6b736b; }
    .btn-reset { background: #f3f4f3; color: #374137; padding: 7px 14px; border: 1px solid #d1d5d1; border-radius: 6px; font-size: 12px; cursor: pointer; }
    .result-count { font-size: 12px; color: #6b736b; margin-left: auto; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7e5; }
    th { background: #f3f4f3; padding: 11px 13px; text-align: left; font-size: 10.5px; font-weight: 700; letter-spacing: .8px; text-transform: uppercase; color: #6b736b; border-bottom: 1px solid #e5e7e5; cursor: pointer; }
    th:hover { background: #e8ebe8; }
    td { padding: 10px 13px; font-size: 12.5px; border-bottom: 1px solid #f3f4f3; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f0fdf4; }
    .bdg { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
    .bdg-app { background: #dcfce7; color: #166534; }
    .bdg-int { background: #dbeafe; color: #1d4ed8; }
    .bdg-ver { background: #dcfce7; color: #166534; }
    .bdg-no  { background: #fef9c3; color: #854d0e; }
    .allowance { font-weight: 700; color: #15803d; }
.no-results { text-align: center; padding: 40px; color: #9ca39c; font-size: 14px; display: none; }
    @media print {
      .controls, .btn-print, .header { display: none !important; }
      body { background: white; }
      th, td { border: 1px solid #ccc; }
      .wrap { padding: 0; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>SkillBridge - Listings XSL Report</h1>
      
    </div>
    <div>
      <button class="btn btn-print" onclick="window.print()">Print Report</button>
    </div>
  </div>

  <div class="wrap">

    <div class="summary">
      <div>
        <div class="stat-num"><xsl:value-of select="count(//listing)"/></div>
        <div class="stat-lbl">Total Listings</div>
      </div>
      <div>
        <div class="stat-num"><xsl:value-of select="count(//listing[type='apprenticeship'])"/></div>
        <div class="stat-lbl">Apprenticeships</div>
      </div>
      <div>
        <div class="stat-num"><xsl:value-of select="count(//listing[type='internship'])"/></div>
        <div class="stat-lbl">Internships</div>
      </div>
      <div>
        <div class="stat-num"><xsl:value-of select="count(//listing[verified='true'])"/></div>
        <div class="stat-lbl">Verified</div>
      </div>
      <div>
        <div class="stat-num"><xsl:value-of select="count(//listing[featured='true'])"/></div>
        <div class="stat-lbl">Featured</div>
      </div>
    </div>

    <div class="controls">
      <label>Search:</label>
      <input type="text" id="xslSearch" placeholder="Title, company, skill..." oninput="applyXSLFilters()"></input>
      <label>Type:</label>
      <select id="xslType" onchange="applyXSLFilters()">
        <option value="">All Types</option>
        <option value="apprenticeship">Apprenticeship</option>
        <option value="internship">Internship</option>
      </select>
      <label>City:</label>
      <select id="xslCity" onchange="applyXSLFilters()">
        <option value="">All Cities</option>
        <option value="Batangas City">Batangas City</option>
        <option value="Lipa City">Lipa City</option>
        <option value="Calamba">Calamba</option>
        <option value="Santa Rosa">Santa Rosa</option>
        <option value="Antipolo">Antipolo</option>
        <option value="Lucena">Lucena</option>
        <option value="Tanauan">Tanauan</option>
        <option value="Cabuyao">Cabuyao</option>
        <option value="Santo Tomas">Santo Tomas</option>
      </select>
      <label>Industry:</label>
      <select id="xslIndustry" onchange="applyXSLFilters()">
        <option value="">All Industries</option>
        <option value="electrical">Electrical</option>
        <option value="automotive">Automotive</option>
        <option value="construction">Construction</option>
        <option value="it">Information Technology</option>
        <option value="food">Food Service</option>
        <option value="manufacturing">Manufacturing</option>
        <option value="retail">Retail</option>
        <option value="healthcare">Healthcare</option>
      </select>
      <button class="btn-reset" onclick="resetXSLFilters()">Reset</button>
      <span class="result-count" id="xslResultCount"></span>
    </div>

    <table id="xslTable">
      <thead>
        <tr>
          <th onclick="sortXSLTable(0)">ID</th>
          <th onclick="sortXSLTable(1)">Title</th>
          <th onclick="sortXSLTable(2)">Company</th>
          <th onclick="sortXSLTable(3)">Type</th>
          <th onclick="sortXSLTable(4)">City</th>
          <th onclick="sortXSLTable(5)">Industry</th>
          <th onclick="sortXSLTable(6)">Allowance/Day</th>
          <th onclick="sortXSLTable(7)">Duration</th>
          <th>Slots</th>
          <th>Verified</th>
        </tr>
      </thead>
      <tbody id="xslTableBody">
        <xsl:for-each select="skillbridge/listings/listing">
          <tr>
            <td><xsl:value-of select="@id"/></td>
            <td><strong><xsl:value-of select="title"/></strong></td>
            <td><xsl:value-of select="company"/></td>
            <td>
              <xsl:choose>
                <xsl:when test="type='apprenticeship'">
                  <span class="bdg bdg-app">apprenticeship</span>
                </xsl:when>
                <xsl:otherwise>
                  <span class="bdg bdg-int">internship</span>
                </xsl:otherwise>
              </xsl:choose>
            </td>
            <td><xsl:value-of select="city"/></td>
            <td><xsl:value-of select="industry"/></td>
            <td class="allowance">&#8369;<xsl:value-of select="allowance"/></td>
            <td><xsl:value-of select="duration"/></td>
            <td><xsl:value-of select="slots"/></td>
            <td>
              <xsl:choose>
                <xsl:when test="verified='true'">
                  <span class="bdg bdg-ver">Verified</span>
                </xsl:when>
                <xsl:otherwise>
                  <span class="bdg bdg-no">Pending</span>
                </xsl:otherwise>
              </xsl:choose>
            </td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>

    <div class="no-results" id="xslNoResults">No listings match your filters.</div>

  </div>

  <script>
  //<![CDATA[
    var sortDirections = {};

    function applyXSLFilters() {
      var search   = document.getElementById('xslSearch').value.toLowerCase();
      var type     = document.getElementById('xslType').value.toLowerCase();
      var city     = document.getElementById('xslCity').value.toLowerCase();
      var industry = document.getElementById('xslIndustry').value.toLowerCase();
      var tbody    = document.getElementById('xslTableBody');
      var rows     = tbody.getElementsByTagName('tr');
      var visible  = 0;
      for (var i = 0; i < rows.length; i++) {
        var text = rows[i].textContent.toLowerCase();
        var show = (!search   || text.indexOf(search)   > -1)
                && (!type     || text.indexOf(type)     > -1)
                && (!city     || text.indexOf(city)     > -1)
                && (!industry || text.indexOf(industry) > -1);
        rows[i].style.display = show ? '' : 'none';
        if (show) visible++;
      }
      document.getElementById('xslResultCount').textContent = visible + ' listing(s) shown';
      document.getElementById('xslNoResults').style.display = visible === 0 ? 'block' : 'none';
    }

    function resetXSLFilters() {
      document.getElementById('xslSearch').value   = '';
      document.getElementById('xslType').value     = '';
      document.getElementById('xslCity').value     = '';
      document.getElementById('xslIndustry').value = '';
      applyXSLFilters();
    }

    function sortXSLTable(colIndex) {
      var tbody = document.getElementById('xslTableBody');
      var rows  = Array.from(tbody.getElementsByTagName('tr'));
      var asc   = !sortDirections[colIndex];
      sortDirections = {};
      sortDirections[colIndex] = asc;
      rows.sort(function(a, b) {
        var aText = a.cells[colIndex] ? a.cells[colIndex].textContent.trim() : '';
        var bText = b.cells[colIndex] ? b.cells[colIndex].textContent.trim() : '';
        var aNum  = parseFloat(aText.replace(/[^\d.]/g, ''));
        var bNum  = parseFloat(bText.replace(/[^\d.]/g, ''));
        if (!isNaN(aNum) && !isNaN(bNum)) return asc ? aNum - bNum : bNum - aNum;
        return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
      });
      rows.forEach(function(r) { tbody.appendChild(r); });
    }

    window.onload = function() { applyXSLFilters(); };
  //]]>
  </script>

</body>
</html>
</xsl:template>
</xsl:stylesheet>