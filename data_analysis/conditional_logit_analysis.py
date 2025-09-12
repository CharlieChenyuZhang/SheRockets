#!/usr/bin/env python3
"""
Conditional Logit Analysis for Conjoint Data
============================================

Implements proper conditional logit (McFadden 1974) for conjoint analysis
Uses maximum likelihood estimation within choice sets for correct inference
"""

import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.api as sm
from statsmodels.discrete.conditional_models import ConditionalLogit
import warnings
from datetime import datetime
warnings.filterwarnings('ignore')

def run_conditional_logit_analysis():
    """
    Run conditional logit analysis using proper methodology
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to conditional logit format
    choice_data = convert_to_conditional_logit_format(df)
    
    # Run analysis
    results = run_conditional_logit_model(choice_data)
    
    # Create results table
    output_file = create_conditional_logit_results_table(results)
    
    return results, output_file

def convert_to_conditional_logit_format(df):
    """
    Convert to conditional logit format (long format with choice sets)
    Each row represents one alternative within a choice set
    """
    print("Converting to conditional logit format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            choice_set_id = f"{idx}_{task}"  # Unique identifier for each choice set
            
            # Create records for both alternatives A and B
            for alt in ['A', 'B']:
                record = {
                    'choice_set_id': choice_set_id,
                    'respondent_id': idx,
                    'task': task,
                    'alternative': alt,
                    'chosen': 1 if (choice == alt) else 0,
                    'grade': row['Grade']
                }
                
                # Add attribute values for this alternative
                for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                            'Message_failure_', 'Storytelling', 'Role_play']:
                    record[attr] = row[f'{alt}_{attr}{task}']
                
                choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def create_dummy_variables(choice_data):
    """
    Create dummy variables for each attribute level
    """
    print("Creating dummy variables...")
    
    # Get all attribute levels
    all_levels = get_all_attribute_levels()
    
    # Create dummy variables for each level
    for level in all_levels:
        attr = level['attribute']
        value = level['value']
        code = level['code']
        
        # Create dummy variable: 1 if this alternative has this level, 0 otherwise
        choice_data[code] = (choice_data[attr] == value).astype(int)
    
    return choice_data

def get_all_attribute_levels():
    """
    Define all attribute levels with codes
    """
    levels = [
        # Tutor levels
        {'attribute': 'Tutor', 'value': 'Female AI tutor', 'code': 'female_tutor'},
        {'attribute': 'Tutor', 'value': 'Male AI tutor', 'code': 'male_tutor'},
        
        # Color palette levels
        {'attribute': 'Color_palette', 'value': 'Friendly & warm (coral / lavender / peach)', 'code': 'friendly_colors'},
        {'attribute': 'Color_palette', 'value': 'Tech & bold (deep blue / black / neon)', 'code': 'tech_colors'},
        
        # Pricing levels
        {'attribute': 'Pricing', 'value': 'School pays (free for families)', 'code': 'school_pays'},
        {'attribute': 'Pricing', 'value': 'Free trial + $4.99/month', 'code': 'pricing_4.99'},
        {'attribute': 'Pricing', 'value': 'Free trial + $7.99/month', 'code': 'pricing_7.99'},
        {'attribute': 'Pricing', 'value': 'Free trial + $9.99/month', 'code': 'pricing_9.99'},
        {'attribute': 'Pricing', 'value': 'Free trial + $12.99/month', 'code': 'pricing_12.99'},
        
        # Message success levels
        {'attribute': 'Message_success_', 'value': 'Great job — your effort and persistence helped you solve this!', 'code': 'growth_message'},
        {'attribute': 'Message_success_', 'value': 'You solved it so quickly — you must have a really special talent for science!', 'code': 'brilliance_message'},
        
        # Message failure levels
        {'attribute': 'Message_failure_', 'value': 'That didn\u2019t work, but mistakes are how scientists learn. Let\u2019s try another design.', 'code': 'supportive_message'},
        {'attribute': 'Message_failure_', 'value': 'This design didn\u2019t launch successfully. Here is what went wrong.', 'code': 'neutral_message'},
        
        # Storytelling levels
        {'attribute': 'Storytelling', 'value': 'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."', 'code': 'space_rescue_story'},
        {'attribute': 'Storytelling', 'value': 'No story: Just design and test rockets in a sandbox-style game.', 'code': 'no_story'},
        
        # Role play levels
        {'attribute': 'Role_play', 'value': 'Hero astronaut: You are the astronaut in charge — the team is counting on you to complete this mission.', 'code': 'hero_astronaut'},
        {'attribute': 'Role_play', 'value': 'No specific role: Just design a rocket and see how it works.', 'code': 'no_specific_role'}
    ]
    
    return levels

def run_conditional_logit_model(choice_data):
    """
    Run conditional logit model using statsmodels
    """
    print("Running conditional logit model...")
    
    # Create dummy variables
    choice_data = create_dummy_variables(choice_data)
    
    # Get all level codes
    level_codes = [level['code'] for level in get_all_attribute_levels()]
    
    # Check for collinearity and select features
    feature_cols = []
    collinear_features = []
    
    for code in level_codes:
        # Check if this dummy variable has variation
        if choice_data[code].var() > 1e-10:  # Has variation
            feature_cols.append(code)
        else:
            collinear_features.append(code)
            print(f"Warning: {code} has no variation - excluding from model")
    
    print(f"Using features: {feature_cols}")
    print(f"Excluded features: {collinear_features}")
    
    # Use the alternative approach (logistic regression with choice set fixed effects)
    # This is equivalent to conditional logit for binary choice
    return run_alternative_conditional_logit(choice_data, feature_cols, collinear_features)

def run_alternative_conditional_logit(choice_data, feature_cols, collinear_features):
    """
    Alternative approach using logistic regression with choice set fixed effects
    This is equivalent to conditional logit for binary choice
    """
    print("Using conditional logit approach (logistic regression with choice set fixed effects)...")
    
    # For binary choice, we can use a simpler approach
    # Create difference variables (A - B) for each choice set
    choice_records = []
    
    for choice_set in choice_data['choice_set_id'].unique():
        set_data = choice_data[choice_data['choice_set_id'] == choice_set]
        
        # Get A and B alternatives
        alt_a = set_data[set_data['alternative'] == 'A'].iloc[0]
        alt_b = set_data[set_data['alternative'] == 'B'].iloc[0]
        
        # Create difference record
        record = {
            'choice_set_id': choice_set,
            'respondent_id': alt_a['respondent_id'],
            'task': alt_a['task'],
            'chosen_a': alt_a['chosen'],
            'grade': alt_a['grade']
        }
        
        # Create difference variables (A - B)
        for feature in feature_cols:
            record[f'{feature}_diff'] = alt_a[feature] - alt_b[feature]
        
        choice_records.append(record)
    
    diff_data = pd.DataFrame(choice_records)
    
    # Prepare features (difference variables)
    diff_features = [f'{feature}_diff' for feature in feature_cols]
    X = diff_data[diff_features].astype(float)  # Ensure numeric
    y = diff_data['chosen_a'].astype(int)  # Ensure integer
    
    print(f"Sample size: {len(X)} choice sets")
    print(f"Features: {diff_features}")
    
    # Check for collinearity in difference variables
    final_features = []
    collinear_diff_features = []
    
    for feature in diff_features:
        # Check if this difference variable has variation
        if abs(X[feature].sum()) > 1e-10:  # Not perfectly collinear
            final_features.append(feature)
        else:
            collinear_diff_features.append(feature)
            print(f"Warning: {feature} is perfectly collinear (sums to zero) - excluding from model")
    
    print(f"Final features: {final_features}")
    print(f"Excluded collinear features: {collinear_diff_features}")
    
    # Use only non-collinear features
    X_final = X[final_features]
    
    # Fit logistic regression
    model = sm.Logit(y, X_final)
    result = model.fit(disp=0)  # Suppress output
    
    print("Conditional logit model fitted successfully!")
    print(f"Log-likelihood: {result.llf:.4f}")
    print(f"Pseudo R-squared: {result.prsquared:.4f}")
    
    # Extract results
    coefficients = result.params
    p_values = result.pvalues
    std_errors = result.bse
    conf_int = result.conf_int()
    
    # Calculate AME
    pp_effects = calculate_ame_alternative(result, X_final, final_features)
    
    # Create results
    all_levels = get_all_attribute_levels()
    results = []
    
    # Add results for estimated features
    for i, feature in enumerate(final_features):
        # Extract original feature name
        original_feature = feature.replace('_diff', '')
        level_info = next((level for level in all_levels if level['code'] == original_feature), None)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['value'],
                'level_code': original_feature,
                'coefficient': coefficients[i],
                'std_error': std_errors[i],
                'p_value': p_values[i],
                'conf_int_lower': conf_int.iloc[i, 0],
                'conf_int_upper': conf_int.iloc[i, 1],
                'pp_effect': pp_effects[i],
                'significance': get_significance(p_values[i])
            })
    
    # Add placeholder results for excluded features (both original and collinear)
    excluded_features = collinear_features + [f.replace('_diff', '') for f in collinear_diff_features]
    
    for feature in excluded_features:
        level_info = next((level for level in all_levels if level['code'] == feature), None)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['value'],
                'level_code': feature,
                'coefficient': 0.0,
                'std_error': 0.0,
                'p_value': 1.0,
                'conf_int_lower': 0.0,
                'conf_int_upper': 0.0,
                'pp_effect': 0.0,
                'significance': 'excluded (collinear)'
            })
    
    return {
        'results': results,
        'model_result': result,
        'feature_cols': feature_cols,
        'collinear_features': collinear_features
    }

def calculate_ame_conditional_logit(result, X, feature_cols, groups):
    """
    Calculate Average Marginal Effects for conditional logit
    """
    print("Calculating Average Marginal Effects...")
    
    # Get predicted probabilities
    predicted_probs = result.predict()
    
    # Calculate AME for each feature
    pp_effects = []
    
    for i, feature in enumerate(feature_cols):
        coef = result.params[i]
        
        # For dummy variables in conditional logit, AME is simpler
        # AME = mean(predicted_prob * (1 - predicted_prob)) * coefficient
        derivative = predicted_probs * (1 - predicted_probs)
        ame = np.mean(derivative) * coef * 100  # Convert to percentage points
        pp_effects.append(ame)
        
        print(f"{feature}: AME = {ame:.2f} percentage points")
    
    return pp_effects

def calculate_ame_alternative(result, X, feature_cols):
    """
    Calculate AME for alternative approach
    """
    print("Calculating Average Marginal Effects (alternative)...")
    
    # Get predicted probabilities
    predicted_probs = result.predict()
    
    # Calculate AME for each feature
    pp_effects = []
    
    for i, feature in enumerate(feature_cols):
        coef = result.params[i]
        
        # AME = mean(predicted_prob * (1 - predicted_prob)) * coefficient
        derivative = predicted_probs * (1 - predicted_probs)
        ame = np.mean(derivative) * coef * 100  # Convert to percentage points
        pp_effects.append(ame)
        
        print(f"{feature}: AME = {ame:.2f} percentage points")
    
    return pp_effects

def get_significance(p_value):
    """
    Get significance indicator
    """
    if p_value < 0.001:
        return '***'
    elif p_value < 0.01:
        return '**'
    elif p_value < 0.05:
        return '*'
    elif p_value < 0.1:
        return '(marginal)'
    else:
        return 'n.s.'

def create_conditional_logit_results_table(results_dict):
    """
    Create conditional logit results table
    """
    print("Creating conditional logit results table...")
    
    results = results_dict['results']
    
    # Create DataFrame
    df_results = pd.DataFrame(results)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['pp_effect'])
    df_results = df_results.sort_values('abs_effect', ascending=False)
    
    # Print results by attribute
    print("\n" + "="*120)
    print("CONDITIONAL LOGIT ANALYSIS RESULTS")
    print("="*120)
    
    for attr in df_results['attribute'].unique():
        attr_data = df_results[df_results['attribute'] == attr]
        
        print(f"\n{attr.upper()}")
        print("-" * 100)
        print(f"{'Level':<50} {'Effect (pp)':<12} {'P-value':<10} {'95% CI':<20} {'Significance'}")
        print("-" * 100)
        
        for _, row in attr_data.iterrows():
            level_short = row['level'][:47] + "..." if len(row['level']) > 50 else row['level']
            ci_str = f"[{row['conf_int_lower']:.3f}, {row['conf_int_upper']:.3f}]"
            print(f"{level_short:<50} {row['pp_effect']:+.1f}{row['significance']:<12} {row['p_value']:.3f}      {ci_str:<20} {row['significance']}")
    
    print("\nSignificance codes: * p<.05, ** p<.01, *** p<.001")
    print("pp = percentage points")
    print("P-values and confidence intervals from conditional logit maximum likelihood estimation")
    
    # Save to CSV with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/conditional_logit_results_{timestamp}.csv'
    df_results.to_csv(output_file, index=False)
    print(f"Results saved to: {output_file}")
    
    return df_results

def main():
    """
    Main function
    """
    print("Starting CONDITIONAL LOGIT Analysis")
    print("="*50)
    
    # Run conditional logit analysis
    results, output_file = run_conditional_logit_analysis()
    
    print("\nCONDITIONAL LOGIT Analysis completed!")
    print(f"Results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    results = main()
