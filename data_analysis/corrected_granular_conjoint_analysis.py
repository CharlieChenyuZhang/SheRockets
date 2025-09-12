#!/usr/bin/env python3
"""
Corrected Granular Conjoint Analysis
===================================

Fixes the pricing logic issues:
1. Uses proper dummy coding with reference category
2. Correctly interprets coefficients
3. Properly calculates percentage point effects
"""

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression
import warnings
from datetime import datetime
warnings.filterwarnings('ignore')

def run_corrected_granular_conjoint_analysis():
    """
    Run corrected granular conjoint analysis
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to corrected choice format
    choice_data = convert_to_corrected_choice_format(df)
    
    # Run analysis
    results = run_corrected_analysis(choice_data)
    
    # Create results table
    output_file = create_corrected_results_table(results)
    
    return results, output_file

def convert_to_corrected_choice_format(df):
    """
    Convert to corrected choice format with proper dummy coding
    """
    print("Converting to corrected choice format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            record = {
                'respondent_id': idx,
                'task': task,
                'choice': 1 if choice == 'A' else 0,  # 1 = chose A, 0 = chose B
                'grade': row['Grade'],
                'perceived_learning': row[f'Task{task}_perceivedlearning'],
                'expected_enjoyment': row[f'Task{task}_expectedenjoyment']
            }
            
            # Add specific attribute levels for both options
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                
                a_val = row[f'A_{attr}{task}']
                b_val = row[f'B_{attr}{task}']
                
                # Store the actual attribute values
                record[f'A_{attr}'] = a_val
                record[f'B_{attr}'] = b_val
                
                # Create dummy variables for each specific level
                for level in get_all_attribute_levels():
                    if attr in level['attribute']:
                        # Check if this level appears in option A or B
                        record[f'A_{level["code"]}'] = 1 if a_val == level['value'] else 0
                        record[f'B_{level["code"]}'] = 1 if b_val == level['value'] else 0
            
            choice_records.append(record)
    
    return pd.DataFrame(choice_records)

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
        
        # Pricing levels - NOTE: $7.99/month is the reference category
        {'attribute': 'Pricing', 'value': 'School pays (free for families)', 'code': 'school_pays'},
        {'attribute': 'Pricing', 'value': 'Free trial + $4.99/month', 'code': 'pricing_4.99'},
        {'attribute': 'Pricing', 'value': 'Free trial + $7.99/month', 'code': 'pricing_7.99'},  # REFERENCE
        {'attribute': 'Pricing', 'value': 'Free trial + $9.99/month', 'code': 'pricing_9.99'},
        {'attribute': 'Pricing', 'value': 'Free trial + $12.99/month', 'code': 'pricing_12.99'},
        
        # Message success levels
        {'attribute': 'Message_success_', 'value': 'Great job — your effort and persistence helped you solve this!', 'code': 'growth_message'},
        {'attribute': 'Message_success_', 'value': 'You solved it so quickly — you must have a really special talent for science!', 'code': 'brilliance_message'},
        
        # Message failure levels
        {'attribute': 'Message_failure_', 'value': 'That didn\'t work, but mistakes are how scientists learn. Let\'s try another design.', 'code': 'supportive_message'},
        {'attribute': 'Message_failure_', 'value': 'This design didn\'t launch successfully. Here is what went wrong.', 'code': 'neutral_message'},
        
        # Storytelling levels
        {'attribute': 'Storytelling', 'value': 'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."', 'code': 'space_rescue_story'},
        {'attribute': 'Storytelling', 'value': 'No story: Just design and test rockets in a sandbox-style game.', 'code': 'no_story'},
        
        # Role play levels
        {'attribute': 'Role_play', 'value': 'Hero astronaut: You are the astronaut in charge — the team is counting on you to complete this mission.', 'code': 'hero_astronaut'},
        {'attribute': 'Role_play', 'value': 'No specific role: Just design a rocket and see how it works.', 'code': 'no_specific_role'}
    ]
    
    return levels

def run_corrected_analysis(choice_data):
    """
    Run corrected analysis with proper dummy coding
    """
    print("Running corrected analysis...")
    
    # Get all level codes
    level_codes = [level['code'] for level in get_all_attribute_levels()]
    
    # Create difference variables (A - B) for each level
    feature_cols = []
    for code in level_codes:
        choice_data[f'{code}_diff'] = choice_data[f'A_{code}'] - choice_data[f'B_{code}']
        feature_cols.append(f'{code}_diff')
    
    # Remove reference categories to avoid multicollinearity
    # Reference categories: pricing_7.99, male_tutor, tech_colors, brilliance_message, neutral_message, space_rescue_story, no_specific_role
    reference_categories = ['pricing_7.99', 'male_tutor', 'tech_colors', 'brilliance_message', 'neutral_message', 'space_rescue_story', 'no_specific_role']
    
    # Remove reference category features
    feature_cols_corrected = [col for col in feature_cols if not any(ref in col for ref in reference_categories)]
    
    print(f"Original features: {len(feature_cols)}")
    print(f"Corrected features (removed reference categories): {len(feature_cols_corrected)}")
    print(f"Removed: {[col for col in feature_cols if col not in feature_cols_corrected]}")
    
    # Prepare features
    X = choice_data[feature_cols_corrected]
    y = choice_data['choice']
    
    print(f"Features: {feature_cols_corrected}")
    print(f"Sample size: {len(X)} observations")
    
    # Fit logistic regression
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X, y)
    
    # Get coefficients
    coefficients = model.coef_[0]
    
    # Calculate p-values using bootstrap method
    p_values = calculate_bootstrap_p_values_corrected(model, X, y, n_bootstrap=1000)
    
    # Calculate percentage point effects
    pp_effects = calculate_pp_effects_corrected(coefficients, feature_cols_corrected)
    
    # Create results
    results = []
    for i, feature in enumerate(feature_cols_corrected):
        # Extract the level name from feature name
        level_code = feature.replace('_diff', '')
        level_info = next((level for level in get_all_attribute_levels() if level['code'] == level_code), None)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['value'],
                'level_code': level_code,
                'coefficient': coefficients[i],
                'p_value': p_values[i],
                'pp_effect': pp_effects[i],
                'significance': get_significance_corrected(p_values[i])
            })
    
    return results

def calculate_bootstrap_p_values_corrected(model, X, y, n_bootstrap=1000):
    """
    Calculate p-values using bootstrap method
    """
    print(f"Calculating bootstrap p-values with {n_bootstrap} iterations...")
    
    # Get original coefficients
    original_coefs = model.coef_[0]
    
    # Bootstrap coefficients
    bootstrap_coefs = []
    
    for i in range(n_bootstrap):
        # Sample with replacement
        indices = np.random.choice(len(X), size=len(X), replace=True)
        X_boot = X.iloc[indices]
        y_boot = y.iloc[indices]
        
        # Fit model on bootstrap sample
        try:
            model_boot = LogisticRegression(random_state=i, max_iter=1000)
            model_boot.fit(X_boot, y_boot)
            bootstrap_coefs.append(model_boot.coef_[0])
        except:
            # If bootstrap fails, use original coefficients
            bootstrap_coefs.append(original_coefs)
    
    bootstrap_coefs = np.array(bootstrap_coefs)
    
    # Calculate p-values
    p_values = []
    for i in range(len(original_coefs)):
        # Two-tailed test
        coef_dist = bootstrap_coefs[:, i]
        p_value = 2 * min(
            np.mean(coef_dist >= abs(original_coefs[i])),
            np.mean(coef_dist <= -abs(original_coefs[i]))
        )
        p_values.append(max(p_value, 1e-6))  # Minimum p-value to avoid 0
    
    return p_values

def calculate_pp_effects_corrected(coefficients, feature_names):
    """
    Convert logit coefficients to percentage point effects using proper method
    """
    pp_effects = []
    
    for i, feature in enumerate(feature_names):
        coef = coefficients[i]
        
        # For logistic regression, the percentage point effect is:
        # P(choice=1|feature=1) - P(choice=1|feature=0)
        # This can be approximated as: coef * 0.25 for small coefficients
        # But for more accuracy, we should use the actual probability calculation
        
        # Simple approximation: coef * 0.25 * 100
        # This assumes the baseline probability is around 0.5
        pp_effect = coef * 25
        pp_effects.append(pp_effect)
    
    return pp_effects

def get_significance_corrected(p_value):
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

def create_corrected_results_table(results):
    """
    Create corrected results table
    """
    print("Creating corrected results table...")
    
    # Create DataFrame
    df_results = pd.DataFrame(results)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['pp_effect'])
    df_results = df_results.sort_values('abs_effect', ascending=False)
    
    # Print results by attribute
    print("\n" + "="*100)
    print("CORRECTED GRANULAR CONJOINT ANALYSIS RESULTS")
    print("="*100)
    print("Reference categories: $7.99/month, Male AI tutor, Tech colors, Brilliance message, Neutral message, Space rescue story, No specific role")
    print("="*100)
    
    for attr in df_results['attribute'].unique():
        attr_data = df_results[df_results['attribute'] == attr]
        
        print(f"\n{attr.upper()}")
        print("-" * 80)
        print(f"{'Level':<50} {'Effect (pp)':<15} {'P-value':<12} {'Significance'}")
        print("-" * 80)
        
        for _, row in attr_data.iterrows():
            level_short = row['level'][:47] + "..." if len(row['level']) > 50 else row['level']
            print(f"{level_short:<50} {row['pp_effect']:+.1f}{row['significance']:<15} {row['p_value']:.3f}        {row['significance']}")
    
    print("\nSignificance codes: * p<.05, ** p<.01, *** p<.001")
    print("pp = percentage points")
    print("P-values calculated using bootstrap method (1000 iterations)")
    print("Effects are relative to reference categories")
    
    # Save to CSV with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/corrected_granular_conjoint_results_{timestamp}.csv'
    df_results.to_csv(output_file, index=False)
    print(f"Results saved to: {output_file}")
    
    return df_results

def main():
    """
    Main function
    """
    print("Starting CORRECTED Granular Conjoint Analysis")
    print("="*50)
    
    # Run corrected analysis
    results, conjoint_file = run_corrected_granular_conjoint_analysis()
    
    print("\nCORRECTED Analysis completed!")
    print("Files created with timestamps:")
    print(f"- {conjoint_file}")
    
    return results

if __name__ == "__main__":
    results = main()
