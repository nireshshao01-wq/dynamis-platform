/**
 * Waste Detection Engine
 * Identifies cloud cost optimization opportunities
 */

class WasteDetectionEngine {
  constructor(billingRecords) {
    this.records = billingRecords || [];
    this.wasteCategories = [];
    this.totalWaste = 0;
    this.totalSpend = 0;
  }

  /**
   * Analyze all records and generate waste findings
   */
  analyze() {
    this.wasteCategories = [];
    this.totalWaste = 0;
    this.totalSpend = 0;

    this.totalSpend = this.records.reduce((sum, r) => sum + r.cost, 0);

    this.detectIdleResources();
    this.detectUnusedVMs();
    this.detectOverCapacityStorage();
    this.detectUnusedSnapshots();
    this.detectExpensiveDataTransfer();
    this.detectUnderutilizedInstances();

    return {
      totalSpend: this.totalSpend,
      totalWaste: this.totalWaste,
      wastePercentage: ((this.totalWaste / this.totalSpend) * 100).toFixed(2),
      wasteCategories: this.wasteCategories.sort((a, b) => b.wasteAmount - a.wasteAmount),
      recordsAnalyzed: this.records.length
    };
  }

  /**
   * Detect idle resources (0% usage)
   */
  detectIdleResources() {
    const idleResources = this.records.filter(r => {
      return (r.usageQuantity === 0 || r.cost < 1) && r.status === 'Active';
    });

    if (idleResources.length > 0) {
      const wasteAmount = idleResources.reduce((sum, r) => sum + r.cost, 0);
      this.totalWaste += wasteAmount;

      this.wasteCategories.push({
        category: 'Idle Resources',
        description: 'Resources running but not being used (0% utilization)',
        severity: 'HIGH',
        resourceCount: idleResources.length,
        wasteAmount: wasteAmount,
        potentialSavings: wasteAmount * 0.9,
        resources: idleResources.slice(0, 10)
      });
    }
  }

  /**
   * Detect unused VMs
   */
  detectUnusedVMs() {
    const vmTypes = ['Virtual Machines', 'EC2', 'Compute Engine', 'VM'];
    const unusedVMs = this.records.filter(r => {
      const isVM = vmTypes.some(type => 
        r.resourceType.toLowerCase().includes(type.toLowerCase()) ||
        r.service.toLowerCase().includes(type.toLowerCase())
      );
      
      return isVM && 
             (r.status === 'stopped' || r.status === 'Idle' || 
              r.usageQuantity < 10 || r.cost < 5);
    });

    if (unusedVMs.length > 0) {
      const wasteAmount = unusedVMs.reduce((sum, r) => sum + r.cost, 0);
      this.totalWaste += wasteAmount;

      this.wasteCategories.push({
        category: 'Unused VMs',
        description: 'Virtual machines with minimal or no usage',
        severity: 'CRITICAL',
        resourceCount: unusedVMs.length,
        wasteAmount: wasteAmount,
        potentialSavings: wasteAmount * 0.95,
        resources: unusedVMs.slice(0, 10)
      });
    }
  }

  /**
   * Detect over-capacity storage
   */
  detectOverCapacityStorage() {
    const storageTypes = ['Storage', 'S3', 'Blob', 'Cloud Storage', 'EBS', 'Disks'];
    const overCapacityStorage = this.records.filter(r => {
      const isStorage = storageTypes.some(type =>
        r.resourceType.toLowerCase().includes(type.toLowerCase()) ||
        r.service.toLowerCase().includes(type.toLowerCase())
      );

      return isStorage && r.usageQuantity && r.cost > 20;
    });

    if (overCapacityStorage.length > 0) {
      const wasteAmount = overCapacityStorage.reduce((sum, r) => sum + r.cost, 0);
      this.totalWaste += wasteAmount * 0.3;

      this.wasteCategories.push({
        category: 'Over-Capacity Storage',
        description: 'Storage resources with excess capacity',
        severity: 'MEDIUM',
        resourceCount: overCapacityStorage.length,
        wasteAmount: wasteAmount * 0.3,
        potentialSavings: wasteAmount * 0.25,
        resources: overCapacityStorage.slice(0, 10)
      });
    }
  }

  /**
   * Detect unused snapshots
   */
  detectUnusedSnapshots() {
    const snapshotTypes = ['Snapshots', 'Backup', 'Backups'];
    const unusedSnapshots = this.records.filter(r => {
      const isSnapshot = snapshotTypes.some(type =>
        r.resourceType.toLowerCase().includes(type.toLowerCase()) ||
        r.serviceType.toLowerCase().includes(type.toLowerCase())
      );

      return isSnapshot;
    });

    if (unusedSnapshots.length > 0) {
      const wasteAmount = unusedSnapshots.reduce((sum, r) => sum + r.cost, 0);
      this.totalWaste += wasteAmount * 0.5;

      this.wasteCategories.push({
        category: 'Unused Snapshots/Backups',
        description: 'Old or orphaned snapshots and backup copies',
        severity: 'MEDIUM',
        resourceCount: unusedSnapshots.length,
        wasteAmount: wasteAmount * 0.5,
        potentialSavings: wasteAmount * 0.4,
        resources: unusedSnapshots.slice(0, 10)
      });
    }
  }

  /**
   * Detect expensive data transfer
   */
  detectExpensiveDataTransfer() {
    const transferTypes = ['Data Transfer', 'Bandwidth', 'Egress'];
    const expensiveTransfers = this.records.filter(r => {
      const isTransfer = transferTypes.some(type =>
        r.resourceType.toLowerCase().includes(type.toLowerCase()) ||
        r.service.toLowerCase().includes(type.toLowerCase())
      );

      return isTransfer && r.cost > 50;
    });

    if (expensiveTransfers.length > 0) {
      const wasteAmount = expensiveTransfers.reduce((sum, r) => sum + r.cost, 0);
      this.totalWaste += wasteAmount * 0.2;

      this.wasteCategories.push({
        category: 'Expensive Data Transfer',
        description: 'High data transfer/egress costs',
        severity: 'HIGH',
        resourceCount: expensiveTransfers.length,
        wasteAmount: wasteAmount * 0.2,
        potentialSavings: wasteAmount * 0.15,
        resources: expensiveTransfers.slice(0, 10)
      });
    }
  }

  /**
   * Detect underutilized instances
   */
  detectUnderutilizedInstances() {
    const computeTypes = ['Compute', 'EC2', 'VM', 'Instance'];
    const underutilized = this.records.filter(r => {
      const isCompute = computeTypes.some(type =>
        r.resourceType.toLowerCase().includes(type.toLowerCase())
      );

      return isCompute && r.usageQuantity < 100 && r.usageQuantity > 0;
    });

    if (underutilized.length > 0) {
      const wasteAmount = underutilized.reduce((sum, r) => sum + r.cost, 0);
      this.totalWaste += wasteAmount * 0.15;

      this.wasteCategories.push({
        category: 'Underutilized Compute',
        description: 'Compute instances using <20% of capacity',
        severity: 'MEDIUM',
        resourceCount: underutilized.length,
        wasteAmount: wasteAmount * 0.15,
        potentialSavings: wasteAmount * 0.12,
        resources: underutilized.slice(0, 10)
      });
    }
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const analysis = this.analyze();
    
    return {
      summary: {
        totalMonthlySpend: parseFloat(this.totalSpend.toFixed(2)),
        identifiedWaste: parseFloat(this.totalWaste.toFixed(2)),
        wastePercentage: analysis.wastePercentage,
        potentialAnnualSavings: parseFloat((this.totalWaste * 12).toFixed(2))
      },
      wasteBreakdown: analysis.wasteCategories,
      riskLevel: this.calculateRiskLevel(analysis.wastePercentage)
    };
  }

  /**
   * Calculate risk level
   */
  calculateRiskLevel(wastePercentage) {
    const percent = parseFloat(wastePercentage);
    if (percent >= 30) return 'CRITICAL';
    if (percent >= 20) return 'HIGH';
    if (percent >= 10) return 'MEDIUM';
    return 'LOW';
  }
}

module.exports = WasteDetectionEngine;
