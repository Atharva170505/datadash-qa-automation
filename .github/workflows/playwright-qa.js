const { chromium } = require('playwright');

async function scrapeDataDashTables() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'DataDash-QA-Bot/1.0'
  });
  const page = await context.newPage();
  
  // Configure page settings
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  const seeds = [89, 90, 91, 92, 93, 94, 95, 96, 97, 98];
  let grandTotal = 0;
  const results = {};
  
  console.log('🚀 DataDash QA Automation Started');
  console.log('📧 Email: 24f1001859@ds.study.iitm.ac.in');
  console.log('🎯 Target: Sum all numbers in tables across seeds 89-98');
  console.log('=' .repeat(60));
  
  for (const seed of seeds) {
    try {
      // Replace with actual URL pattern - these are example URLs
      const url = `https://datadash-reports.example.com/report?seed=${seed}`;
      
      console.log(`\n📊 Processing Seed ${seed}`);
      console.log(`🔗 URL: ${url}`);
      
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for dynamic content to load
      try {
        await page.waitForSelector('table', { timeout: 15000 });
      } catch (e) {
        console.log(`⚠️  No tables found for seed ${seed}, trying alternative selectors...`);
        
        // Try alternative selectors for dynamic content
        const alternativeSelectors = [
          '.data-table', '.report-table', '[class*="table"]', 
          '.grid', '[role="table"]', '.datatable'
        ];
        
        let foundTable = false;
        for (const selector of alternativeSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000 });
            foundTable = true;
            break;
          } catch (e) { /* continue */ }
        }
        
        if (!foundTable) {
          console.log(`❌ No tables found for seed ${seed}`);
          continue;
        }
      }
      
      // Extract and sum all numbers from tables
      const pageResult = await page.evaluate(() => {
        const allTables = document.querySelectorAll('table, .data-table, .report-table, [class*="table"], .grid, [role="table"]');
        let pageTotal = 0;
        let numbersFound = [];
        let tableCount = 0;
        
        allTables.forEach((table) => {
          if (table.offsetParent === null) return; // Skip hidden tables
          
          tableCount++;
          const cells = table.querySelectorAll('td, th, .cell, [role="cell"], [role="columnheader"]');
          
          cells.forEach(cell => {
            const text = cell.textContent || cell.innerText || '';
            
            // Enhanced regex to catch various number formats
            const numberPatterns = [
              /-?\$?[\d,]+\.?\d*/g,           // Currency and regular numbers
              /-?\d+(?:,\d{3})*(?:\.\d+)?/g, // Numbers with thousands separators
              /-?\d*\.?\d+/g                  // Simple decimals
            ];
            
            numberPatterns.forEach(pattern => {
              const matches = text.match(pattern);
              if (matches) {
                matches.forEach(match => {
                  // Clean the number string
                  const cleanNum = match.replace(/[$,\s]/g, '');
                  const num = parseFloat(cleanNum);
                  
                  if (!isNaN(num) && isFinite(num)) {
                    pageTotal += num;
                    numbersFound.push(num);
                  }
                });
              }
            });
          });
        });
        
        return {
          total: pageTotal,
          numbersFound: numbersFound,
          tableCount: tableCount,
          uniqueNumbers: [...new Set(numbersFound)].length
        };
      });
      
      results[seed] = pageResult;
      grandTotal += pageResult.total;
      
      console.log(`   📋 Tables found: ${pageResult.tableCount}`);
      console.log(`   🔢 Numbers extracted: ${pageResult.numbersFound.length}`);
      console.log(`   🎯 Unique numbers: ${pageResult.uniqueNumbers}`);
      console.log(`   💰 Seed ${seed} total: ${pageResult.total.toFixed(2)}`);
      console.log(`   📊 Sample numbers: [${pageResult.numbersFound.slice(0, 5).map(n => n.toFixed(2)).join(', ')}${pageResult.numbersFound.length > 5 ? '...' : ''}]`);
      
      // Small delay between requests
      await page.waitForTimeout(1000);
      
    } catch (error) {
      console.error(`❌ Error processing Seed ${seed}:`, error.message);
      results[seed] = { total: 0, error: error.message };
    }
  }
  
  await browser.close();
  
  // Final results
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 DATADASH QA AUTOMATION COMPLETE');
  console.log('=' .repeat(60));
  console.log(`📧 Executed by: 24f1001859@ds.study.iitm.ac.in`);
  console.log(`📊 Seeds processed: ${Object.keys(results).length}/${seeds.length}`);
  console.log(`🔢 GRAND TOTAL: ${grandTotal.toFixed(2)}`);
  console.log('=' .repeat(60));
  
  // Detailed breakdown
  console.log('\n📋 DETAILED BREAKDOWN:');
  for (const [seed, result] of Object.entries(results)) {
    if (result.error) {
      console.log(`   Seed ${seed}: ERROR - ${result.error}`);
    } else {
      console.log(`   Seed ${seed}: ${result.total.toFixed(2)} (from ${result.numbersFound?.length || 0} numbers)`);
    }
  }
  
  console.log(`\n🎯 FINAL ANSWER: ${grandTotal.toFixed(2)}`);
  
  return grandTotal;
}

// Run the automation
scrapeDataDashTables()
  .then(total => {
    console.log(`\n✅ Automation completed. Total: ${total}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Automation failed:', error);
    process.exit(1);
  });
