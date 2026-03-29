const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CSVParser = require('../parsers/csvParser');
const WasteDetectionEngine = require('../engines/wasteDetectionEngine');
const RecommendationsEngine = require('../engines/recommendationsEngine');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.csv') {
      cb(new Error('Only CSV files allowed'));
    } else {
      cb(null, true);
    }
  }
});

// POST /api/upload - Upload and analyze billing CSV
router.post('/', upload.single('file'), async (req, res) => {
  try {
    console.log('[UPLOAD] Starting upload process...');
    
    if (!req.file || !req.body.client_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing file or client_id' 
      });
    }

    const filePath = req.file.path;
    const clientId = req.body.client_id;

    console.log(`[UPLOAD] Processing: ${req.file.filename} for client: ${clientId}`);

    // Step 1: Parse CSV
    console.log('[UPLOAD] Parsing CSV file...');
    let parseResult = await CSVParser.parseCSVFile(filePath);
    
    if (!parseResult.success || parseResult.totalRows === 0) {
      throw new Error('Failed to parse CSV or file is empty');
    }

    console.log(`[UPLOAD] ✅ Parsed ${parseResult.totalRows} records from ${parseResult.provider}`);

    // Step 2: Run waste detection
    console.log('[UPLOAD] Running waste detection...');
    const wasteEngine = new WasteDetectionEngine(parseResult.records);
    const wasteSummary = wasteEngine.getSummary();

    console.log(`[UPLOAD] ✅ Waste Analysis Complete`);
    console.log(`  - Total Spend: $${wasteSummary.summary.totalMonthlySpend}`);
    console.log(`  - Identified Waste: $${wasteSummary.summary.identifiedWaste}`);
    console.log(`  - Risk Level: ${wasteSummary.riskLevel}`);

    // Step 3: Generate recommendations
    console.log('[UPLOAD] Generating recommendations...');
    const recommendationEngine = new RecommendationsEngine(parseResult.records, wasteSummary);
    const recommendations = recommendationEngine.generate();

    console.log(`[UPLOAD] ✅ Generated ${recommendations.length} recommendations`);

    // Prepare response
    const uploadResult = {
      success: true,
      message: 'Billing data processed successfully',
      analysis: {
        provider: parseResult.provider,
        rowsProcessed: parseResult.totalRows,
        processingTimestamp: parseResult.timestamp,
        clientId: clientId
      },
      wasteAnalysis: {
        totalMonthlySpend: parseFloat(wasteSummary.summary.totalMonthlySpend.toFixed(2)),
        identifiedWaste: parseFloat(wasteSummary.summary.identifiedWaste.toFixed(2)),
        wastePercentage: parseFloat(wasteSummary.summary.wastePercentage),
        potentialAnnualSavings: parseFloat(wasteSummary.summary.potentialAnnualSavings.toFixed(2)),
        riskLevel: wasteSummary.riskLevel,
        breakdown: wasteSummary.wasteBreakdown.map(wb => ({
          category: wb.category,
          severity: wb.severity,
          resourceCount: wb.resourceCount,
          wasteAmount: parseFloat(wb.wasteAmount.toFixed(2)),
          potentialSavings: parseFloat(wb.potentialSavings.toFixed(2))
        }))
      },
      recommendations: {
        total: recommendations.length,
        topOpportunities: recommendations.slice(0, 5).map(r => ({
          id: r.id,
          title: r.title,
          priority: r.priority,
          estimatedMonthlySavings: parseFloat(r.estimatedMonthlySavings.toFixed(2)),
          estimatedAnnualSavings: parseFloat(r.estimatedAnnualSavings.toFixed(2)),
          complexity: r.complexity
        })),
        allRecommendations: recommendations
      },
      summary: {
        actionItems: recommendations.filter(r => r.priority === 'CRITICAL').length,
        totalEstimatedAnnualSavings: parseFloat(
          recommendations.reduce((sum, r) => sum + r.estimatedAnnualSavings, 0).toFixed(2)
        )
      }
    };

    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    console.log('[UPLOAD] ✅ SUCCESS - Returning results');
    res.json(uploadResult);

  } catch (err) {
    console.error('[UPLOAD] ❌ ERROR:', err.message);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

module.exports = router;
