# Conjoint Analysis Comparison: Original vs Enhanced

## Overview

This document compares the original conjoint analysis script with the enhanced version that follows best practices for conjoint analysis.

## Key Issues Identified in Original Analysis

### 1. **Data Structure Problems**

- **Issue**: Incorrect long format conversion - created separate records for both options A and B
- **Problem**: This doesn't properly represent choice data structure
- **Solution**: Enhanced version creates proper choice records with attribute differences

### 2. **Coding Method Issues**

- **Issue**: Used dummy coding with reference categories
- **Problem**: Dummy coding can lead to interpretation issues and doesn't follow conjoint best practices
- **Solution**: Implemented effects coding (+1, -1 for binary; proper effects coding for multi-level)

### 3. **Model Specification**

- **Issue**: Simple logistic regression without proper choice structure
- **Problem**: Doesn't account for the paired nature of choice tasks
- **Solution**: Conditional logit model with proper attribute differences

### 4. **Missing Quality Checks**

- **Issue**: No randomization balance verification
- **Problem**: Can't verify if the experimental design was properly balanced
- **Solution**: Comprehensive balance checking across all attributes

### 5. **Limited Analysis Scope**

- **Issue**: No subgroup analysis, robustness checks, or comprehensive validation
- **Problem**: Results may not be reliable or generalizable
- **Solution**: Added subgroup analysis, bootstrap confidence intervals, and model stability checks

## Detailed Comparison

| Aspect                   | Original Analysis          | Enhanced Analysis                                 |
| ------------------------ | -------------------------- | ------------------------------------------------- |
| **Data Structure**       | Incorrect long format      | Proper choice structure                           |
| **Coding Method**        | Dummy coding               | Effects coding                                    |
| **Model Type**           | Simple logistic regression | Conditional logit                                 |
| **Balance Check**        | None                       | Comprehensive verification                        |
| **Descriptive Analysis** | Basic                      | Comprehensive with choice shares                  |
| **Rating Analysis**      | Simple box plots           | Mixed models with R²                              |
| **Subgroup Analysis**    | None                       | By grade level (Elementary vs Middle/High)        |
| **Robustness Checks**    | None                       | Bootstrap CI, model stability, respondent quality |
| **Quality Control**      | None                       | Task-level fit, respondent quality metrics        |
| **Simulation**           | Basic                      | Enhanced with confidence intervals                |
| **Reporting**            | Basic                      | Comprehensive with all metrics                    |

## Technical Improvements

### 1. **Effects Coding Implementation**

```python
# Original: Dummy coding
dummies = pd.get_dummies(model_data[attr], prefix=attr)

# Enhanced: Effects coding
if len(unique_values) == 2:
    mapping = {unique_values[0]: 1, unique_values[1]: -1}
    target_df[f'{source_col}_effects'] = target_df[source_col].map(mapping)
```

### 2. **Proper Choice Data Structure**

```python
# Original: Separate records for A and B
for option in ['A', 'B']:
    record = {...}
    long_data_list.append(record)

# Enhanced: Choice records with differences
record_a[f'{attr}_diff'] = record_a[f'A_{attr}'] - record_b[f'B_{attr}']
```

### 3. **Conditional Logit Model**

```python
# Original: Simple logistic regression
model = LogisticRegression()
model.fit(X, y)

# Enhanced: Conditional logit with proper structure
model_data = self._prepare_conditional_logit_data()
# Uses attribute differences (A - B) for each choice task
```

### 4. **Comprehensive Quality Checks**

```python
# Enhanced: Multiple quality metrics
- Randomization balance verification
- Task-level fit analysis
- Respondent quality assessment
- Bootstrap confidence intervals
- Model stability across data splits
```

## Analysis Components Added

### 1. **Randomization Balance Check**

- Verifies each attribute level appears roughly evenly
- Calculates balance ratios
- Identifies potential design issues

### 2. **Descriptive Analysis**

- Choice shares by attribute level
- Rating distributions by attribute
- Task-level patterns

### 3. **Rating Analysis with Mixed Models**

- Separate analysis for perceived learning and expected enjoyment
- Linear models with effects-coded predictors
- R² and model fit metrics

### 4. **Subgroup Analysis**

- Elementary (K-5) vs Middle/High (6-12) grade groups
- Separate utility estimation for each subgroup
- Sample size and accuracy metrics

### 5. **Robustness Checks**

- **Task-level fit**: Choice distribution by task
- **Respondent quality**: Identifies always-same-option or random-clicking respondents
- **Bootstrap confidence intervals**: 100 iterations for utility stability
- **Model stability**: Correlation between split-half models

### 6. **Enhanced Simulation**

- More comprehensive scenarios
- Utility breakdown by attribute
- Market share calculations with confidence

## Model Performance Metrics

### Original Analysis

- Basic accuracy score
- No model fit metrics
- No confidence intervals

### Enhanced Analysis

- **Accuracy**: Classification accuracy
- **McFadden's R²**: Pseudo-R² for choice models
- **Bootstrap CI**: Confidence intervals for utilities
- **Model Stability**: Cross-validation correlation
- **Quality Metrics**: Respondent and task-level diagnostics

## Business Impact

### Original Analysis Limitations

- Results may not be reliable due to methodological issues
- No quality assurance
- Limited insights into subgroup differences
- No confidence in utility estimates

### Enhanced Analysis Benefits

- **Reliable Results**: Proper methodology ensures valid conclusions
- **Quality Assurance**: Comprehensive checks identify data issues
- **Subgroup Insights**: Grade-specific preferences identified
- **Confidence Intervals**: Statistical uncertainty quantified
- **Robust Recommendations**: Multiple validation approaches

## Recommendations

### For Current Study

1. **Use Enhanced Analysis**: The enhanced version provides more reliable and comprehensive results
2. **Review Quality Metrics**: Check randomization balance and respondent quality
3. **Consider Subgroups**: Elementary vs Middle/High grade differences
4. **Validate Results**: Use bootstrap confidence intervals for key findings

### For Future Studies

1. **Design Verification**: Always check randomization balance
2. **Effects Coding**: Use effects coding for conjoint analysis
3. **Quality Control**: Implement respondent quality checks
4. **Robustness Testing**: Include bootstrap and stability checks
5. **Subgroup Analysis**: Plan for demographic/segmentation analysis

## Conclusion

The enhanced analysis addresses all major methodological issues in the original script and provides a comprehensive, robust approach to conjoint analysis. The results from the enhanced analysis should be considered more reliable and actionable for business decisions.

The enhanced script follows best practices in conjoint analysis and provides the statistical rigor needed for academic publication or business decision-making.
