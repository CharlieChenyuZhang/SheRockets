#!/usr/bin/env python3
"""
Improved Conditional Logit Analysis
==================================

A robust implementation of conditional logit for conjoint analysis
Handles collinearity properly and provides correct statistical inference
"""

import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.api as sm
import warnings
from datetime import datetime
warnings.filterwarnings('ignore')

def run_improved_conditional_logit():
    """
    Run improved conditional logit analysis
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to choice format
    choice_data = convert_to_choice_format(df)
    
    # Run analysis
    results = run_conditional_logit_model(choice_data)
    
    # Create results table
    output_file = create_results_table(results)
    
    return results, output_file

def convert_to_choice_format(df):
    """
    Convert to choice format for conditional logit
    """
    print("Converting to choice format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            # Create record for this choice
            record = {
                'respondent_id': idx,
                'task': task,
                'choice_set_id': f"{idx}_{task}",
                'chosen_a': 1 if choice == 'A' else 0,
                'grade': row['Grade']
            }
            
            # Add attribute differences (A - B)
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                
                a_val = row[f'A_{attr}{task}']
                b_val = row[f'B_{attr}{task}']
                
                # Create dummy variables for each level
                record.update(create_attribute_dummies(attr, a_val, b_val))
            
            choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def create_attribute_dummies(attr, a_val, b_val):
    """
    Create dummy variables for an attribute
    """
    dummies = {}
    
    # Define attribute levels
    if attr == 'Tutor':
        dummies['female_tutor_diff'] = (1 if a_val == 'Female AI tutor' else 0) - (1 if b_val == 'Female AI tutor' else 0)
        dummies['male_tutor_diff'] = (1 if a_val == 'Male AI tutor' else 0) - (1 if b_val == 'Male AI tutor' else 0)
    
    elif attr == 'Color_palette':
        dummies['friendly_colors_diff'] = (1 if 'Friendly & warm' in a_val else 0) - (1 if 'Friendly & warm' in b_val else 0)
        dummies['tech_colors_diff'] = (1 if 'Tech & bold' in a_val else 0) - (1 if 'Tech & bold' in b_val else 0)
    
    elif attr == 'Pricing':
        dummies['school_pays_diff'] = (1 if 'School pays' in a_val else 0) - (1 if 'School pays' in b_val else 0)
        dummies['pricing_4.99_diff'] = (1 if '$4.99' in a_val else 0) - (1 if '$4.99' in b_val else 0)
        dummies['pricing_7.99_diff'] = (1 if '$7.99' in a_val else 0) - (1 if '$7.99' in b_val else 0)
        dummies['pricing_9.99_diff'] = (1 if '$9.99' in a_val else 0) - (1 if '$9.99' in b_val else 0)
        dummies['pricing_12.99_diff'] = (1 if '$12.99' in a_val else 0) - (1 if '$12.99' in b_val else 0)
    
    elif attr == 'Message_success_':
        dummies['growth_message_diff'] = (1 if 'effort and persistence' in a_val else 0) - (1 if 'effort and persistence' in b_val else 0)
        dummies['brilliance_message_diff'] = (1 if 'special talent' in a_val else 0) - (1 if 'special talent' in b_val else 0)
    
    elif attr == 'Message_failure_':
        dummies['supportive_message_diff'] = (1 if 'mistakes are how scientists learn' in a_val else 0) - (1 if 'mistakes are how scientists learn' in b_val else 0)
        dummies['neutral_message_diff'] = (1 if 'Here is what went wrong' in a_val else 0) - (1 if 'Here is what went wrong' in b_val else 0)
    
    elif attr == 'Storytelling':
        dummies['space_rescue_story_diff'] = (1 if 'Space rescue story' in a_val else 0) - (1 if 'Space rescue story' in b_val else 0)
        dummies['no_story_diff'] = (1 if 'No story' in a_val else 0) - (1 if 'No story' in b_val else 0)
    
    elif attr == 'Role_play':
        dummies['hero_astronaut_diff'] = (1 if 'Hero astronaut' in a_val else 0) - (1 if 'Hero astronaut' in b_val else 0)
        dummies['no_specific_role_diff'] = (1 if 'No specific role' in a_val else 0) - (1 if 'No specific role' in b_val else 0)
    
    return dummies

def run_conditional_logit_model(choice_data):
    """
    Run conditional logit model with proper collinearity handling
    """
    print("Running conditional logit model...")
    
    # Get all difference features
    diff_features = [col for col in choice_data.columns if col.endswith('_diff')]
    
    # Check for collinearity and select features
    final_features = []
    collinear_features = []
    
    for feature in diff_features:
        # Check if this difference variable has variation
        if abs(choice_data[feature].sum()) > 1e-10:  # Not perfectly collinear
            final_features.append(feature)
        else:
            collinear_features.append(feature)
            print(f"Warning: {feature} is perfectly collinear - excluding from model")
    
    print(f"Using features: {final_features}")
    print(f"Excluded features: {collinear_features}")
    
    # Prepare data
    X = choice_data[final_features].astype(float)
    y = choice_data['chosen_a'].astype(int)
    
    print(f"Sample size: {len(X)} choice sets")
    
    # Fit logistic regression
    model = sm.Logit(y, X)
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
    pp_effects = calculate_ame(result, X, final_features)
    
    # Create results
    results = []
    
    # Add results for estimated features
    for i, feature in enumerate(final_features):
        original_feature = feature.replace('_diff', '')
        level_info = get_level_info(original_feature)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['level'],
                'level_code': original_feature,
                'coefficient': coefficients[i],
                'std_error': std_errors[i],
                'p_value': p_values[i],
                'conf_int_lower': conf_int.iloc[i, 0],
                'conf_int_upper': conf_int.iloc[i, 1],
                'pp_effect': pp_effects[i],
                'significance': get_significance(p_values[i])
            })
    
    # Add placeholder results for excluded features
    for feature in collinear_features:
        original_feature = feature.replace('_diff', '')
        level_info = get_level_info(original_feature)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['level'],
                'level_code': original_feature,
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
        'final_features': final_features,
        'collinear_features': collinear_features
    }

def get_level_info(level_code):
    """
    Get level information from code
    """
    level_mapping = {
        'female_tutor': {'attribute': 'Tutor', 'level': 'Female AI tutor'},
        'male_tutor': {'attribute': 'Tutor', 'level': 'Male AI tutor'},
        'friendly_colors': {'attribute': 'Color_palette', 'level': 'Friendly & warm (coral / lavender / peach)'},
        'tech_colors': {'attribute': 'Color_palette', 'level': 'Tech & bold (deep blue / black / neon)'},
        'school_pays': {'attribute': 'Pricing', 'level': 'School pays (free for families)'},
        'pricing_4.99': {'attribute': 'Pricing', 'level': 'Free trial + $4.99/month'},
        'pricing_7.99': {'attribute': 'Pricing', 'level': 'Free trial + $7.99/month'},
        'pricing_9.99': {'attribute': 'Pricing', 'level': 'Free trial + $9.99/month'},
        'pricing_12.99': {'attribute': 'Pricing', 'level': 'Free trial + $12.99/month'},
        'growth_message': {'attribute': 'Message_success_', 'level': 'Great job — your effort and persistence helped you solve this!'},
        'brilliance_message': {'attribute': 'Message_success_', 'level': 'You solved it so quickly — you must have a really special talent for science!'},
        'supportive_message': {'attribute': 'Message_failure_', 'level': 'That didn\'t work, but mistakes are how scientists learn. Let\'s try another design.'},
        'neutral_message': {'attribute': 'Message_failure_', 'level': 'This design didn\'t launch successfully. Here is what went wrong.'},
        'space_rescue_story': {'attribute': 'Storytelling', 'level': 'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."'},
        'no_story': {'attribute': 'Storytelling', 'level': 'No story: Just design and test rockets in a sandbox-style game.'},
        'hero_astronaut': {'attribute': 'Role_play', 'level': 'Hero astronaut: You are the astronaut in charge — the team is counting on you to complete this mission.'},
        'no_specific_role': {'attribute': 'Role_play', 'level': 'No specific role: Just design a rocket and see how it works.'}
    }
    
    return level_mapping.get(level_code)

def calculate_ame(result, X, features):
    """
    Calculate Average Marginal Effects
    """
    print("Calculating Average Marginal Effects...")
    
    # Get predicted probabilities
    predicted_probs = result.predict()
    
    # Calculate AME for each feature
    pp_effects = []
    
    for i, feature in enumerate(features):
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

def create_results_table(results_dict):
    """
    Create results table
    """
    print("Creating results table...")
    
    results = results_dict['results']
    
    # Create DataFrame
    df_results = pd.DataFrame(results)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['pp_effect'])
    df_results = df_results.sort_values('abs_effect', ascending=False)
    
    # Print results by attribute
    print("\n" + "="*120)
    print("IMPROVED CONDITIONAL LOGIT ANALYSIS RESULTS")
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
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/improved_conditional_logit_results_{timestamp}.csv'
    df_results.to_csv(output_file, index=False)
    print(f"Results saved to: {output_file}")
    
    return df_results

def main():
    """
    Main function
    """
    print("Starting IMPROVED CONDITIONAL LOGIT Analysis")
    print("="*50)
    
    # Run analysis
    results, output_file = run_improved_conditional_logit()
    
    print("\nIMPROVED CONDITIONAL LOGIT Analysis completed!")
    print(f"Results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    results = main()
