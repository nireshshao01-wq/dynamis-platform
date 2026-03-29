/**
 * Recommendations Engine
 * Generates actionable cost optimization recommendations
 */

class RecommendationsEngine {
  constructor(billingRecords, wasteAnalysis) {
    this.records = billingRecords || [];
    this.wasteAnalysis = wasteAnalysis || {};
    this.recommendations = [];
  }

  generate() {
    this.recommendations = [];

    const wasteCategories = this.wasteAnalysis.wasteBreakdown || [];
    
    wasteCategories.forEach(waste => {
      switch (waste.category) {
        case 'Idle Resources':
          this.recommendIdleResourcesAction(waste);
          break;
        case 'Unused VMs':
          this.recommendUnusedVMsAction(waste);
          break;
        case 'Over-Capacity Storage':
          this.recommendStorageOptimization(waste);
          break;
        case 'Unused Snapshots/Backups':
          this.recommendSnapshotCleanup(waste);
          break;
        case 'Expensive Data Transfer':
          this.recommendDataTransferOptimization(waste);
          break;
        case 'Underutilized Compute':
          this.recommendComputeRightSizing(waste);
          break;
      }
    });

    this.addProviderSpecificRecommendations();
    this.addGeneralFinOpsRecommendations();

    return this.recommendations.sort((a, b) => b.estimatedAnnualSavings - a.estimatedAnnualSavings);
  }

  recommendIdleResourcesAction(waste) {
    this.recommendations.push({
      id: 'idle-resources-001',
      title: 'Remove Idle Resources',
      description: `${waste.resourceCount} resources with 0% utilization costing $${waste.wasteAmount.toFixed(2)}/month`,
      action: 'Delete or stop these resources immediately',
      priority: 'CRITICAL',
      complexity: 'LOW',
      estimatedMonthlySavings: waste.potentialSavings,
      estimatedAnnualSavings: waste.potentialSavings * 12,
      implementationTime: '1-2 days',
      riskLevel: 'LOW',
      resources: waste.resources,
      steps: [
        'Review listed resources',
        'Verify they are not needed',
        'Stop or terminate resources',
        'Monitor for 7 days',
        'Permanent deletion after verification'
      ]
    });
  }

  recommendUnusedVMsAction(waste) {
    this.recommendations.push({
      id: 'unused-vms-001',
      title: 'Eliminate Unused Virtual Machines',
      description: `${waste.resourceCount} VMs are stopped or underutilized, costing $${waste.wasteAmount.toFixed(2)}/month`,
      action: 'Terminate or repurpose underutilized VMs',
      priority: 'CRITICAL',
      complexity: 'MEDIUM',
      estimatedMonthlySavings: waste.potentialSavings,
      estimatedAnnualSavings: waste.potentialSavings * 12,
      implementationTime: '3-5 days',
      riskLevel: 'MEDIUM',
      resources: waste.resources,
      steps: [
        'Identify VMs with <10% utilization',
        'Contact application owners',
        'Create snapshots for backup',
        'Migrate workloads if needed',
        'Terminate unused instances'
      ]
    });
  }

  recommendStorageOptimization(waste) {
    this.recommendations.push({
      id: 'storage-optimization-001',
      title: 'Optimize Storage Capacity Allocation',
      description: `${waste.resourceCount} storage resources appear over-provisioned, saving potential: $${waste.potentialSavings.toFixed(2)}/month`,
      action: 'Right-size storage volumes to actual usage',
      priority: 'HIGH',
      complexity: 'MEDIUM',
      estimatedMonthlySavings: waste.potentialSavings,
      estimatedAnnualSavings: waste.potentialSavings * 12,
      implementationTime: '5-10 days',
      riskLevel: 'MEDIUM',
      resources: waste.resources,
      steps: [
        'Analyze actual vs allocated storage',
        'Identify over-provisioned volumes',
        'Resize volumes during maintenance',
        'Consider tiered storage',
        'Enable compression'
      ]
    });
  }

  recommendSnapshotCleanup(waste) {
    this.recommendations.push({
      id: 'snapshot-cleanup-001',
      title: 'Clean Up Unused Snapshots and Backups',
      description: `Remove orphaned snapshots to save $${waste.potentialSavings.toFixed(2)}/month`,
      action: 'Implement snapshot lifecycle policy',
      priority: 'MEDIUM',
      complexity: 'LOW',
      estimatedMonthlySavings: waste.potentialSavings,
      estimatedAnnualSavings: waste.potentialSavings * 12,
      implementationTime: '2-3 days',
      riskLevel: 'LOW',
      resources: waste.resources,
      steps: [
        'Identify old snapshots',
        'Cross-reference with volumes',
        'Delete orphaned snapshots',
        'Implement lifecycle policies',
        'Set 7-14 day retention'
      ]
    });
  }

  recommendDataTransferOptimization(waste) {
    this.recommendations.push({
      id: 'data-transfer-001',
      title: 'Reduce Data Transfer Costs',
      description: `Data egress costing $${waste.wasteAmount.toFixed(2)}/month. Optimize with CDN.`,
      action: 'Implement CDN and optimize data flow',
      priority: 'HIGH',
      complexity: 'HIGH',
      estimatedMonthlySavings: waste.potentialSavings,
      estimatedAnnualSavings: waste.potentialSavings * 12,
      implementationTime: '2-3 weeks',
      riskLevel: 'LOW',
      resources: waste.resources,
      steps: [
        'Implement CDN (CloudFront/Edge/Cloud CDN)',
        'Cache static assets',
        'Use same-region transfers',
        'Compress data',
        'Batch transfers during off-peak'
      ]
    });
  }

  recommendComputeRightSizing(waste) {
    this.recommendations.push({
      id: 'compute-rightsizing-001',
      title: 'Right-Size Underutilized Compute',
      description: `${waste.resourceCount} instances using <20% of resources. Savings: $${waste.potentialSavings.toFixed(2)}/month`,
      action: 'Downsize to appropriate instance types',
      priority: 'HIGH',
      complexity: 'MEDIUM',
      estimatedMonthlySavings: waste.potentialSavings,
      estimatedAnnualSavings: waste.potentialSavings * 12,
      implementationTime: '1-2 weeks',
      riskLevel: 'MEDIUM',
      resources: waste.resources,
      steps: [
        'Review CPU and memory metrics',
        'Identify oversized instances',
        'Plan resizing schedule',
        'Right-size during maintenance',
        'Monitor post-resize'
      ]
    });
  }

  addProviderSpecificRecommendations() {
    const providers = new Set(this.records.map(r => r.provider));
    const monthlySpend = this.wasteAnalysis.summary?.totalMonthlySpend || 0;

    if (providers.has('AWS')) {
      this.recommendations.push({
        id: 'aws-reserved-instances-001',
        title: 'Purchase Reserved Instances',
        description: 'AWS RIs offer up to 72% discount on compute',
        action: 'Purchase 1-year or 3-year RIs',
        priority: 'HIGH',
        complexity: 'MEDIUM',
        estimatedMonthlySavings: (monthlySpend * 0.35 * 0.35),
        estimatedAnnualSavings: (monthlySpend * 0.35 * 0.35 * 12),
        implementationTime: '1 day',
        riskLevel: 'LOW',
        steps: ['Analyze usage', 'Identify baseline', 'Purchase RIs', 'Monitor utilization']
      });
    }

    if (providers.has('AZURE')) {
      this.recommendations.push({
        id: 'azure-reserved-instances-001',
        title: 'Purchase Azure Reserved Instances',
        description: 'Azure RIs offer up to 72% discount',
        action: 'Buy 1-year or 3-year RIs',
        priority: 'HIGH',
        complexity: 'MEDIUM',
        estimatedMonthlySavings: (monthlySpend * 0.35 * 0.35),
        estimatedAnnualSavings: (monthlySpend * 0.35 * 0.35 * 12),
        implementationTime: '1 day',
        riskLevel: 'LOW',
        steps: ['Review usage', 'Identify consistent workloads', 'Purchase RIs', 'Monitor']
      });
    }

    if (providers.has('GCS')) {
      this.recommendations.push({
        id: 'gcs-commitment-001',
        title: 'Enroll in GCP Commitments',
        description: 'GCP commitments offer 25-70% discounts',
        action: 'Purchase GCP commitments',
        priority: 'HIGH',
        complexity: 'MEDIUM',
        estimatedMonthlySavings: (monthlySpend * 0.35 * 0.30),
        estimatedAnnualSavings: (monthlySpend * 0.35 * 0.30 * 12),
        implementationTime: '2-3 days',
        riskLevel: 'LOW',
        steps: ['Analyze usage', 'Identify predictable workloads', 'Purchase commitments', 'Monitor']
      });
    }
  }

  addGeneralFinOpsRecommendations() {
    this.recommendations.push({
      id: 'finops-tagging-001',
      title: 'Implement Cloud Resource Tagging',
      description: 'Proper tagging enables cost allocation',
      action: 'Establish tagging policy',
      priority: 'HIGH',
      complexity: 'MEDIUM',
      estimatedMonthlySavings: 0,
      estimatedAnnualSavings: 0,
      implementationTime: '1-2 weeks',
      riskLevel: 'LOW',
      steps: ['Define schema', 'Implement via IaC', 'Enforce policies', 'Audit monthly']
    });

    this.recommendations.push({
      id: 'finops-budget-alerts-001',
      title: 'Set Up Budget Alerts',
      description: 'Catch cost anomalies early',
      action: 'Configure budget alerts',
      priority: 'MEDIUM',
      complexity: 'LOW',
      estimatedMonthlySavings: 0,
      estimatedAnnualSavings: 0,
      implementationTime: '2-3 days',
      riskLevel: 'LOW',
      steps: ['Set budgets', 'Configure alerts', 'Enable anomaly detection', 'Review monthly']
    });
  }
}

module.exports = RecommendationsEngine;
