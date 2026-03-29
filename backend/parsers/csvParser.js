/**
 * CSV Parser - Detects cloud provider and normalizes billing data
 * Supports: Azure, AWS, GCS
 */

const fs = require('fs');
const csv = require('csv-parser');

class CSVParser {
  /**
   * Detect cloud provider from CSV headers and first row
   */
  static detectProvider(headers, firstRow) {
    const headerStr = headers.join('|').toLowerCase();
    const rowStr = Object.values(firstRow).join('|').toLowerCase();
    const combined = (headerStr + rowStr).toLowerCase();

    // Azure indicators
    if (combined.includes('subscriptionid') || combined.includes('resourcegroup') || combined.includes('metercategory')) {
      return 'AZURE';
    }

    // AWS indicators
    if (combined.includes('accountid') || combined.includes('blendedcost') || combined.includes('unblendedcost')) {
      return 'AWS';
    }

    // GCS indicators
    if (combined.includes('projectid') || combined.includes('billingaccountid') || combined.includes('sku')) {
      return 'GCS';
    }

    return null;
  }

  /**
   * Normalize Azure CSV to standard schema
   */
  static normalizeAzure(row) {
    return {
      provider: 'AZURE',
      subscriptionId: row.SubscriptionId || '',
      resourceGroup: row.ResourceGroup || '',
      resourceName: row.ResourceName || '',
      resourceType: row.ResourceType || '',
      service: row.MeterCategory || '',
      serviceType: row.MeterSubcategory || '',
      unit: row.Unit || '',
      usageQuantity: parseFloat(row.UsageQuantity) || 0,
      cost: parseFloat(row.Cost) || 0,
      date: row.Date || new Date().toISOString().split('T')[0],
      status: row.Status || 'Active',
      region: row.Region || 'Unknown',
      usageType: 'Azure Meter',
      reservedInstance: false
    };
  }

  /**
   * Normalize AWS CSV to standard schema
   */
  static normalizeAWS(row) {
    const cost = parseFloat(row.UnblendedCost || row.BlendedCost || 0);
    return {
      provider: 'AWS',
      accountId: row.AccountId || '',
      resourceId: row.ResourceId || '',
      resourceName: row.ResourceId || '',
      resourceType: row.ResourceType || '',
      service: row.Service || '',
      serviceType: row.InstanceType || row.Service || '',
      unit: row.UsageType || '',
      usageQuantity: parseFloat(row.UsageQuantity) || 0,
      cost: cost,
      date: row.Date || new Date().toISOString().split('T')[0],
      status: row.Status || 'running',
      region: row.Region || 'Unknown',
      usageType: row.UsageType || '',
      reservedInstance: row.ReservedInstance === 'true' || row.ReservedInstance === true
    };
  }

  /**
   * Normalize GCS CSV to standard schema
   */
  static normalizeGCS(row) {
    return {
      provider: 'GCS',
      projectId: row.ProjectId || '',
      resourceId: row.Resource || '',
      resourceName: row.Resource || '',
      resourceType: row.Service || '',
      service: row.Service || '',
      serviceType: row.Sku || '',
      unit: row.Unit || '',
      usageAmount: parseFloat(row.UsageAmount) || 0,
      cost: parseFloat(row.Cost) || 0,
      date: row.Date || new Date().toISOString().split('T')[0],
      status: row.Status || 'active',
      region: row.Region || 'Unknown',
      usageType: row.Sku || '',
      commitmentPlan: row.CommitmentPlan || 'None',
      reservedInstance: row.CommitmentPlan && row.CommitmentPlan !== 'None'
    };
  }

  /**
   * Parse CSV file and return normalized records
   */
  static parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const records = [];
      let headers = null;
      let provider = null;
      let rowCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
        })
        .on('data', (row) => {
          try {
            if (!provider) {
              provider = this.detectProvider(headers || [], row);
            }

            if (!provider) {
              return;
            }

            let normalized = null;
            if (provider === 'AZURE') {
              normalized = this.normalizeAzure(row);
            } else if (provider === 'AWS') {
              normalized = this.normalizeAWS(row);
            } else if (provider === 'GCS') {
              normalized = this.normalizeGCS(row);
            }

            if (normalized) {
              records.push(normalized);
              rowCount++;
            }
          } catch (err) {
            console.error('Error parsing row:', err);
          }
        })
        .on('end', () => {
          resolve({
            success: true,
            provider: provider || 'UNKNOWN',
            totalRows: rowCount,
            records: records,
            timestamp: new Date()
          });
        })
        .on('error', (err) => {
          reject({
            success: false,
            error: err.message,
            provider: provider || 'UNKNOWN'
          });
        });
    });
  }
}

module.exports = CSVParser;
