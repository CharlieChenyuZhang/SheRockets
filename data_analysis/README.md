# FINAL analysis run

python granular_conjoint_analysis.py

# Conjoint Analysis for AI Tutor Study

This directory contains a comprehensive conjoint analysis of the AI tutor study data, examining parent preferences for different AI tutor features for their K-12 daughters.

## 📁 Files in this Directory

- `conjoint_analysis.py` - Main analysis script (662 lines)
- `cleaned.csv` - Processed survey data (126 rows)
- `requirements.txt` - Python dependencies
- `README.md` - This instruction file

## 🚀 Quick Start Guide

### Prerequisites

- Python 3.7 or higher
- pip package manager

### Step 1: Install Dependencies

```bash
# Navigate to the data_analysis directory
cd data_analysis

# Install required packages
pip install -r requirements.txt
```

### Step 2: Run the Analysis

```bash
# Run the complete analysis
python conjoint_analysis.py
```

### Step 3: View Results

After running, you'll find these output files:

- `results/` folder with 8 individual visualization files (timestamped):
  - `01_attribute_importance_[timestamp].png`
  - `02_partworth_utilities_[timestamp].png`
  - `03_pricing_sensitivity_[timestamp].png`
  - `04_choice_distribution_[timestamp].png`
  - `05_perceived_learning_[timestamp].png`
  - `06_expected_enjoyment_[timestamp].png`
  - `07_storytelling_roleplay_[timestamp].png`
  - `08_grade_distribution_[timestamp].png`
- `conjoint_report.txt` - Detailed analysis report with business recommendations

## 📊 What the Analysis Does

### Data Processing

- Converts your wide-format survey data to long format for analysis
- Handles 7 attributes with multiple levels:
  - **Tutor type**: Female AI tutor vs Male AI tutor
  - **Color palette**: Warm (coral/lavender/peach) vs Tech (blue/black/neon)
  - **Pricing**: 5 levels from Free to $12.99/month
  - **Success message**: Growth mindset vs Brilliance praise
  - **Failure message**: Supportive vs Neutral
  - **Storytelling**: Space rescue story vs No story
  - **Role play**: Hero astronaut vs No specific role

### Analysis Components

1. **Choice Modeling**: Logistic regression to predict choices
2. **Utility Estimation**: Part-worth utilities for each attribute level
3. **Importance Analysis**: Which attributes matter most (as percentages)
4. **Market Simulation**: Test different product configurations
5. **Statistical Testing**: Significance tests for differences
6. **Visualization**: Comprehensive charts and graphs

## 🎯 Expected Output

### Individual Visualizations (results/ folder)

- **01_attribute_importance**: Attribute importance rankings
- **02_partworth_utilities**: Part-worth utility heatmap
- **03_pricing_sensitivity**: Pricing sensitivity curve
- **04_choice_distribution**: Choice distribution by task
- **05_perceived_learning**: Perceived learning by tutor type
- **06_expected_enjoyment**: Expected enjoyment by tutor type
- **07_storytelling_roleplay**: Storytelling vs Role play interaction
- **08_grade_distribution**: Grade distribution of daughters

### Report (conjoint_report.txt)

- Executive summary with key findings
- Attribute importance rankings
- Part-worth utilities for all levels
- Market simulation results
- Statistical significance tests
- Business recommendations

## 🔧 Troubleshooting

### Common Issues

**1. Import Errors**

```bash
# If you get import errors, try:
pip install --upgrade pandas numpy matplotlib seaborn scipy scikit-learn
```

**2. File Not Found**

```bash
# Make sure you're in the correct directory:
pwd  # Should show: .../SheRockets/data_analysis
ls   # Should show: conjoint_analysis.py, cleaned.csv, requirements.txt
```

**3. Permission Errors**

```bash
# On Mac/Linux, you might need:
chmod +x conjoint_analysis.py
```

**4. Memory Issues**

- The script is optimized for your dataset size
- If you encounter memory issues, the data might be corrupted

### Getting Help

- Check that `cleaned.csv` exists and has 126 rows
- Ensure all required packages are installed
- Run `python --version` to verify Python 3.7+

## 📈 Understanding Your Results

### Key Metrics to Look For:

1. **Attribute Importance**: Which features drive choice most?
2. **Part-worth Utilities**: How much does each level contribute?
3. **Market Share**: Which product configurations win?
4. **Statistical Significance**: Are differences real or random?

### Business Questions Answered:

- Should we use a female or male AI tutor?
- What's the optimal pricing strategy?
- How important is storytelling vs role play?
- Which message framing works best?

## 🧪 Advanced Usage

### Custom Analysis

```python
from conjoint_analysis import ConjointAnalyzer

# Initialize with your data
analyzer = ConjointAnalyzer('cleaned.csv')

# Run step by step
analyzer.load_and_preprocess_data()
analyzer.run_choice_modeling()

# Get specific results
utilities = analyzer.utilities
importance = analyzer.importance

# Custom market simulation
custom_scenarios = {
    'My Product': {
        'tutor': 'Female',
        'color': 'Warm',
        'pricing': '$7.99',
        # ... other attributes
    }
}
results = analyzer.market_simulation(custom_scenarios)
```

### Exporting Data

The script automatically saves:

- High-resolution PNG visualizations
- Detailed text report
- All results are also available in Python variables

## 📋 Study Design Summary

Your original study included:

- **Respondents**: Parents of K-12 daughters
- **Tasks**: 8 choice tasks per respondent
- **Choice**: Binary choice between Option A and Option B
- **Ratings**: Perceived learning and expected enjoyment (0-5 scale)
- **Design**: Balanced orthogonal design
- **Sample**: 125+ completed responses

## 🎓 Technical Details

- **Model**: Logistic regression for choice prediction
- **Validation**: Cross-validation and significance testing
- **Missing Data**: Handled appropriately
- **Code Quality**: Professional-grade with error handling
- **Performance**: Optimized for your dataset size

## 📞 Support

If you encounter any issues:

1. Check this README first
2. Verify your Python environment
3. Ensure all files are in the correct location
4. Check that the data file is not corrupted

The script is designed to be robust and provide clear error messages if something goes wrong.

## 🔄 Running the Analysis Step by Step

### Option 1: Run Everything at Once

```bash
python conjoint_analysis.py
```

### Option 2: Run Individual Components

```python
from conjoint_analysis import ConjointAnalyzer

# Create analyzer instance
analyzer = ConjointAnalyzer('cleaned.csv')

# Step 1: Load and preprocess data
analyzer.load_and_preprocess_data()

# Step 2: Run choice modeling
analyzer.run_choice_modeling()

# Step 3: Create visualizations
analyzer.create_visualizations()

# Step 4: Generate report
report = analyzer.generate_report()

# Step 5: Run market simulation
simulation_results = analyzer.market_simulation()

# Step 6: Get statistical tests
test_results = analyzer.statistical_tests()
```

## 📊 Sample Output Preview

When you run the analysis, you'll see output like:

```
Starting Conjoint Analysis for AI Tutor Study
==================================================
Loading and preprocessing data...
Dataset shape: (125, 120)
Number of respondents: 125
Converting to long format...
Long format data shape: (2000, 15)
Cleaning and encoding data...
Final dataset shape: (2000, 15)
Data preprocessing completed!
Running choice modeling...
Calculating part-worth utilities...
Calculating attribute importance...
Choice modeling completed!
Creating visualizations...
Generating comprehensive report...
Report saved to conjoint_report.txt

Analysis completed! Check the following files:
- conjoint_analysis_results.png (visualizations)
- conjoint_report.txt (detailed report)
```

This comprehensive analysis will give you actionable insights for your AI tutor product development!
