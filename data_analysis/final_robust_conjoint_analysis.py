#!/usr/bin/env python3
"""
Final Robust Conjoint Analysis
=============================

Uses robust statistical methods for conjoint analysis
"""

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import warnings
warnings.filterwarnings('ignore')

def run_final_robust_analysis():
    """
    Run final robust conjoint analysis
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to choice format
    choice_data = convert_to_choice_format_final(df)
    
    # Run analysis
    results = run_robust_analysis(choice_data)
    
    # Create results table
    create_final_results_table(results)
    
    return results

def convert_to_choice_format_final(df):
    """
    Convert to choice format for final analysis
    """
    print("Converting to choice format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            record = {
                'respondent_id': idx,
                'task': task,
                'choice': 1 if choice == 'A' else 0,
                'grade': row['Grade']
            }
            
            # Add attribute differences
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                
                a_val = row[f'A_{attr}{task}']
                b_val = row[f'B_{attr}{task}']
                
                # Create effects-coded differences
                a_effects = get_effects_coding_final(a_val, attr)
                b_effects = get_effects_coding_final(b_val, attr)
                
                if isinstance(a_effects, dict):
                    for level, effect in a_effects.items():
                        record[f'{attr}_{level}'] = effect - b_effects.get(level, 0)
                else:
                    record[f'{attr}_diff'] = a_effects - b_effects
            
            choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def get_effects_coding_final(value, attr):
    """
    Apply effects coding to attribute values
    """
    value_str = str(value)
    
    if attr == 'Tutor':
        return 1 if 'Female' in value_str else -1
    
    elif attr == 'Color_palette':
        return 1 if 'Friendly' in value_str else -1
    
    elif attr == 'Pricing':
        if 'School pays' in value_str:
            return {'free': 1, '4.99': 0, '7.99': 0, '9.99': 0, '12.99': -1}
        elif '$4.99' in value_str:
            return {'free': 0, '4.99': 1, '7.99': 0, '9.99': 0, '12.99': -1}
        elif '$7.99' in value_str:
            return {'free': 0, '4.99': 0, '7.99': 1, '9.99': 0, '12.99': -1}
        elif '$9.99' in value_str:
            return {'free': 0, '4.99': 0, '7.99': 0, '9.99': 1, '12.99': -1}
        else:  # $12.99
            return {'free': -1, '4.99': -1, '7.99': -1, '9.99': -1, '12.99': 1}
    
    elif attr == 'Message_success_':
        return 1 if 'effort and persistence' in value_str else -1
    
    elif attr == 'Message_failure_':
        return 1 if 'mistakes are how scientists learn' in value_str else -1
    
    elif attr == 'Storytelling':
        return 1 if 'Space rescue story' in value_str else -1
    
    elif attr == 'Role_play':
        return 1 if 'Hero astronaut' in value_str else -1
    
    else:
        return 0

def run_robust_analysis(choice_data):
    """
    Run robust analysis with proper statistical testing
    """
    print("Running robust analysis...")
    
    # Prepare features
    feature_cols = [col for col in choice_data.columns if col.endswith('_diff') or col.endswith('_free') or col.endswith('_4.99') or col.endswith('_7.99') or col.endswith('_9.99') or col.endswith('_12.99')]
    
    X = choice_data[feature_cols]
    y = choice_data['choice']
    
    print(f"Features: {feature_cols}")
    print(f"Sample size: {len(X)} observations")
    
    # Fit logistic regression
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X, y)
    
    # Get coefficients
    coefficients = model.coef_[0]
    
    # Calculate p-values using bootstrap method (more robust)
    p_values = calculate_bootstrap_p_values(model, X, y, n_bootstrap=1000)
    
    # Calculate percentage point effects
    pp_effects = calculate_pp_effects_final(coefficients, feature_cols)
    
    # Create results
    results = []
    for i, feature in enumerate(feature_cols):
        results.append({
            'feature': feature,
            'coefficient': coefficients[i],
            'p_value': p_values[i],
            'pp_effect': pp_effects[i],
            'significance': get_significance_final(p_values[i])
        })
    
    return results

def calculate_bootstrap_p_values(model, X, y, n_bootstrap=1000):
    """
    Calculate p-values using bootstrap method (more robust)
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

def calculate_pp_effects_final(coefficients, feature_names):
    """
    Convert logit coefficients to percentage point effects
    """
    pp_effects = []
    
    for i, feature in enumerate(feature_names):
        coef = coefficients[i]
        
        # For effects coding, the effect is approximately coef * 0.25 * 100
        pp_effect = coef * 25
        pp_effects.append(pp_effect)
    
    return pp_effects

def get_significance_final(p_value):
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

def create_final_results_table(results):
    """
    Create final results table
    """
    print("Creating final results table...")
    
    # Create DataFrame
    df_results = pd.DataFrame(results)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['pp_effect'])
    df_results = df_results.sort_values('abs_effect', ascending=False)
    
    # Print results
    print("\n" + "="*80)
    print("FINAL ROBUST CONJOINT ANALYSIS RESULTS")
    print("="*80)
    print(f"{'Feature':<25} {'Coefficient':<12} {'P-value':<10} {'Effect (pp)':<12} {'Significance'}")
    print("-"*80)
    
    for _, row in df_results.iterrows():
        print(f"{row['feature']:<25} {row['coefficient']:+.4f}      {row['p_value']:.3f}     {row['pp_effect']:+.1f}        {row['significance']}")
    
    print("\nSignificance codes: * p<.05, ** p<.01, *** p<.001")
    print("pp = percentage points")
    print("P-values calculated using bootstrap method (1000 iterations)")
    
    # Save to CSV
    df_results.to_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/final_robust_conjoint_results.csv', index=False)
    
    return df_results

def main():
    """
    Main function
    """
    print("Starting FINAL ROBUST Conjoint Analysis")
    print("="*50)
    
    # Run final analysis
    results = run_final_robust_analysis()
    
    print("\nFINAL ROBUST Analysis completed!")
    print("Files created:")
    print("- final_robust_conjoint_results.csv")
    
    return results

if __name__ == "__main__":
    results = main()
