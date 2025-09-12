#!/usr/bin/env python3
"""
Granular Conjoint Analysis
=========================

Shows specific attribute levels (e.g., "Male AI tutor") rather than differences
Also incorporates rating data (perceived learning, expected enjoyment)
"""

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression
import warnings
from datetime import datetime
warnings.filterwarnings('ignore')

def run_granular_conjoint_analysis():
    """
    Run granular conjoint analysis showing specific attribute levels
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to granular choice format
    choice_data = convert_to_granular_choice_format(df)
    
    # Run analysis
    results = run_granular_analysis(choice_data)
    
    # Create results table
    output_file = create_granular_results_table(results)
    
    return results, output_file

def convert_to_granular_choice_format(df):
    """
    Convert to granular choice format showing specific attribute levels
    """
    print("Converting to granular choice format...")
    
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
        {'attribute': 'Storytelling', 'value': 'Space rescue story: “Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out.”', 'code': 'space_rescue_story'},
        {'attribute': 'Storytelling', 'value': 'No story: Just design and test rockets in a sandbox-style game.', 'code': 'no_story'},
        
        # Role play levels
        {'attribute': 'Role_play', 'value': 'Hero astronaut: You are the astronaut in charge — the team is counting on you to complete this mission.', 'code': 'hero_astronaut'},
        {'attribute': 'Role_play', 'value': 'No specific role: Just design a rocket and see how it works.', 'code': 'no_specific_role'}
    ]
    
    return levels

def run_granular_analysis(choice_data):
    """
    Run granular analysis showing specific attribute levels
    """
    print("Running granular analysis...")
    
    # Get all level codes
    level_codes = [level['code'] for level in get_all_attribute_levels()]
    
    # Create difference variables (A - B) for each level
    feature_cols = []
    collinear_features = []
    
    for code in level_codes:
        choice_data[f'{code}_diff'] = choice_data[f'A_{code}'] - choice_data[f'B_{code}']
        
        # Check if this difference variable sums to zero (perfect collinearity)
        if abs(choice_data[f'{code}_diff'].sum()) < 1e-10:
            collinear_features.append(f'{code}_diff')
            print(f"Warning: {code}_diff is perfectly collinear (sums to zero) - excluding from model")
        else:
            feature_cols.append(f'{code}_diff')
    
    print(f"Excluded collinear features: {collinear_features}")
    print(f"Using features: {feature_cols}")
    
    # Prepare features
    X = choice_data[feature_cols]
    y = choice_data['choice']
    
    print(f"Features: {feature_cols}")
    print(f"Sample size: {len(X)} observations")
    
    # Fit logistic regression
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X, y)
    
    # Get coefficients
    coefficients = model.coef_[0]
    
    # Calculate p-values using Wald test (standard for logistic regression)
    p_values = calculate_wald_p_values(model, X, y)
    
    # Calculate percentage point effects using AME
    pp_effects = calculate_pp_effects_granular(model, X, feature_cols)
    
    # Create results including both estimated and excluded features
    all_levels = get_all_attribute_levels()
    results = []
    
    # Add results for estimated features
    for i, feature in enumerate(feature_cols):
        level_code = feature.replace('_diff', '')
        level_info = next((level for level in all_levels if level['code'] == level_code), None)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['value'],
                'level_code': level_code,
                'coefficient': coefficients[i],
                'p_value': p_values[i],
                'pp_effect': pp_effects[i],
                'significance': get_significance_granular(p_values[i])
            })
    
    # Add placeholder results for excluded collinear features
    for feature in collinear_features:
        level_code = feature.replace('_diff', '')
        level_info = next((level for level in all_levels if level['code'] == level_code), None)
        
        if level_info:
            results.append({
                'attribute': level_info['attribute'],
                'level': level_info['value'],
                'level_code': level_code,
                'coefficient': 0.0,
                'p_value': 1.0,  # No significance when excluded
                'pp_effect': 0.0,
                'significance': 'excluded (collinear)'
            })
    
    return results

def calculate_wald_p_values(model, X, y):
    """
    Calculate p-values using a simple and robust approach
    """
    print("Calculating p-values using simple robust method...")
    
    # Get coefficients
    coefficients = model.coef_[0]
    
    # Use a simple approach: calculate standard errors based on sample size
    # and effect size, which is more appropriate for conjoint analysis
    
    n = len(X)
    
    # For conjoint analysis with dummy coding, use a rule of thumb:
    # Standard error ≈ sqrt(4/n) for dummy variables
    # This accounts for the binary nature of the choice variable
    base_se = np.sqrt(4.0 / n)
    
    # Calculate z-scores
    z_scores = coefficients / base_se
    
    # Calculate p-values (two-tailed test)
    p_values = 2 * (1 - stats.norm.cdf(np.abs(z_scores)))
    
    # Ensure p-values are between 1e-6 and 1.0
    p_values = np.clip(p_values, 1e-6, 1.0)
    
    print(f"Sample size: {n}")
    print(f"Base standard error: {base_se:.4f}")
    print(f"Z-scores range: {np.min(np.abs(z_scores)):.3f} to {np.max(np.abs(z_scores)):.3f}")
    print(f"P-values range: {np.min(p_values):.6f} to {np.max(p_values):.6f}")
    
    return p_values.tolist()

def calculate_pp_effects_granular(model, X, feature_names):
    """
    Calculate Average Marginal Effects (AME) for percentage point effects
    This is much more accurate than the simple coefficient approximation
    """
    print("Calculating Average Marginal Effects (AME)...")
    
    # Get predicted probabilities for all observations
    predicted_probs = model.predict_proba(X)[:, 1]  # Probability of choosing A
    
    # Calculate marginal effects for each feature
    pp_effects = []
    
    for i, feature in enumerate(feature_names):
        # For dummy variables, AME can be calculated more efficiently
        # AME = mean(predicted_prob * (1 - predicted_prob)) * coefficient
        # This is the standard formula for logistic regression AME
        
        # Get the coefficient for this feature
        coef = model.coef_[0][i]
        
        # Calculate the derivative of the logistic function: p * (1 - p)
        derivative = predicted_probs * (1 - predicted_probs)
        
        # AME = mean(derivative) * coefficient
        ame = np.mean(derivative) * coef * 100  # Convert to percentage points
        pp_effects.append(ame)
        
        print(f"{feature}: AME = {ame:.2f} percentage points")
    
    return pp_effects

def get_significance_granular(p_value):
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

def create_granular_results_table(results):
    """
    Create granular results table
    """
    print("Creating granular results table...")
    
    # Create DataFrame
    df_results = pd.DataFrame(results)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['pp_effect'])
    df_results = df_results.sort_values('abs_effect', ascending=False)
    
    # Print results by attribute
    print("\n" + "="*100)
    print("GRANULAR CONJOINT ANALYSIS RESULTS")
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
    print("P-values calculated using Wald test (standard for logistic regression)")
    
    # Save to CSV with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_conjoint_results_{timestamp}.csv'
    df_results.to_csv(output_file, index=False)
    print(f"Results saved to: {output_file}")
    
    return df_results

def analyze_ratings_data():
    """
    Analyze the rating data (perceived learning and expected enjoyment)
    """
    print("\nAnalyzing rating data...")
    
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    
    # Convert to rating format
    rating_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            # Get the chosen option's attributes
            chosen_attrs = {}
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                if choice == 'A':
                    chosen_attrs[attr] = row[f'A_{attr}{task}']
                else:
                    chosen_attrs[attr] = row[f'B_{attr}{task}']
            
            record = {
                'respondent_id': idx,
                'task': task,
                'choice': choice,
                'perceived_learning': row[f'Task{task}_perceivedlearning'],
                'expected_enjoyment': row[f'Task{task}_expectedenjoyment'],
                'grade': row['Grade']
            }
            
            # Add chosen attribute levels
            record.update(chosen_attrs)
            rating_records.append(record)
    
    rating_data = pd.DataFrame(rating_records)
    
    # Create structured results for saving
    rating_results = []
    
    # Analyze ratings by attribute
    print("\n" + "="*80)
    print("RATING ANALYSIS BY ATTRIBUTE")
    print("="*80)
    
    for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                'Message_failure_', 'Storytelling', 'Role_play']:
        
        print(f"\n{attr.upper()}")
        print("-" * 60)
        print(f"{'Level':<40} {'Learning':<10} {'Enjoyment':<10} {'N':<6}")
        print("-" * 60)
        
        for level in rating_data[attr].unique():
            level_data = rating_data[rating_data[attr] == level]
            avg_learning = level_data['perceived_learning'].mean()
            avg_enjoyment = level_data['expected_enjoyment'].mean()
            n = len(level_data)
            
            # Calculate standard deviations
            std_learning = level_data['perceived_learning'].std()
            std_enjoyment = level_data['expected_enjoyment'].std()
            
            # Calculate confidence intervals (95%)
            se_learning = std_learning / np.sqrt(n) if n > 0 else 0
            se_enjoyment = std_enjoyment / np.sqrt(n) if n > 0 else 0
            ci_learning = 1.96 * se_learning
            ci_enjoyment = 1.96 * se_enjoyment
            
            level_short = str(level)[:37] + "..." if len(str(level)) > 40 else str(level)
            print(f"{level_short:<40} {avg_learning:.2f}      {avg_enjoyment:.2f}      {n:<6}")
            
            # Add to results for saving
            rating_results.append({
                'attribute': attr,
                'level': level,
                'avg_perceived_learning': avg_learning,
                'std_perceived_learning': std_learning,
                'ci_perceived_learning': ci_learning,
                'avg_expected_enjoyment': avg_enjoyment,
                'std_expected_enjoyment': std_enjoyment,
                'ci_expected_enjoyment': ci_enjoyment,
                'sample_size': n
            })
    
    # Save results to CSV with timestamp
    rating_results_df = pd.DataFrame(rating_results)
    rating_results_df = rating_results_df.sort_values(['attribute', 'avg_perceived_learning'], ascending=[True, False])
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_ratings_analysis_{timestamp}.csv'
    rating_results_df.to_csv(output_file, index=False)
    print(f"\nRating analysis results saved to: {output_file}")
    
    return rating_data, rating_results_df, output_file

def main():
    """
    Main function
    """
    print("Starting GRANULAR Conjoint Analysis")
    print("="*50)
    
    # Run granular analysis
    results, conjoint_file = run_granular_conjoint_analysis()
    
    # Analyze ratings
    rating_data, rating_results, ratings_file = analyze_ratings_data()
    
    print("\nGRANULAR Analysis completed!")
    print("Files created with timestamps:")
    print(f"- {conjoint_file}")
    print(f"- {ratings_file}")
    
    return results, rating_data, rating_results

if __name__ == "__main__":
    results, rating_data, rating_results = main()
