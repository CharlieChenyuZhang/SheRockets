#!/usr/bin/env python3
"""
Comprehensive Attribute Analysis
===============================

Analyzes all unique attribute values and their effects on choice
"""

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

def analyze_all_attributes():
    """
    Comprehensive analysis of all attributes and their levels
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Extract all unique attribute values
    attribute_values = extract_unique_values(df)
    
    # Convert to choice format
    choice_data = convert_to_choice_format(df)
    
    # Analyze each attribute
    results = analyze_attributes(choice_data, attribute_values)
    
    # Create comprehensive results table
    create_comprehensive_table(results)
    
    return results

def extract_unique_values(df):
    """
    Extract all unique values for each attribute
    """
    print("Extracting unique attribute values...")
    
    attributes = {
        'Tutor': set(),
        'Color_palette': set(),
        'Pricing': set(),
        'Message_success_': set(),
        'Message_failure_': set(),
        'Storytelling': set(),
        'Role_play': set()
    }
    
    # Extract from all task columns
    for task in range(1, 9):
        for attr in attributes.keys():
            for option in ['A', 'B']:
                col_name = f'{option}_{attr}{task}'
                if col_name in df.columns:
                    unique_vals = df[col_name].dropna().unique()
                    attributes[attr].update(unique_vals)
    
    # Convert sets to sorted lists
    for attr in attributes:
        attributes[attr] = sorted(list(attributes[attr]))
    
    return attributes

def convert_to_choice_format(df):
    """
    Convert wide format to choice format
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
            
            # Add all attribute values
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                
                a_val = row[f'A_{attr}{task}']
                b_val = row[f'B_{attr}{task}']
                
                record[f'A_{attr}'] = a_val
                record[f'B_{attr}'] = b_val
                
                # Create choice indicator (1 if A was chosen, 0 if B was chosen)
                record[f'chose_{attr}_A'] = 1 if choice == 'A' else 0
            
            choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def analyze_attributes(choice_data, attribute_values):
    """
    Analyze each attribute level's effect on choice
    """
    print("Analyzing attribute effects...")
    
    results = {}
    
    for attr in attribute_values.keys():
        print(f"Analyzing {attr}...")
        attr_results = analyze_single_attribute(choice_data, attr, attribute_values[attr])
        results[attr] = attr_results
    
    return results

def analyze_single_attribute(choice_data, attr, levels):
    """
    Analyze a single attribute's levels
    """
    results = []
    
    for level in levels:
        # Calculate choice share when this level appears in option A
        a_data = choice_data[choice_data[f'A_{attr}'] == level]
        a_choice_share = a_data['chose_{}_A'.format(attr)].mean() if len(a_data) > 0 else 0
        
        # Calculate choice share when this level appears in option B
        b_data = choice_data[choice_data[f'B_{attr}'] == level]
        b_choice_share = 1 - b_data['chose_{}_A'.format(attr)].mean() if len(b_data) > 0 else 0
        
        # Overall choice share for this level
        level_data = choice_data[(choice_data[f'A_{attr}'] == level) | (choice_data[f'B_{attr}'] == level)]
        if len(level_data) > 0:
            level_choices = []
            for _, row in level_data.iterrows():
                if row[f'A_{attr}'] == level:
                    level_choices.append(row['chose_{}_A'.format(attr)])
                else:
                    level_choices.append(1 - row['chose_{}_A'.format(attr)])
            overall_choice_share = np.mean(level_choices)
        else:
            overall_choice_share = 0
        
        # Calculate effect relative to baseline (most common level)
        baseline_share = 0.5  # Expected if random
        effect_pp = (overall_choice_share - baseline_share) * 100
        
        # Statistical significance (simplified)
        n_observations = len(level_data)
        if n_observations > 0:
            # Binomial test (using binomtest for newer scipy versions)
            try:
                from scipy.stats import binomtest
                p_value = binomtest(int(overall_choice_share * n_observations), n_observations, 0.5).pvalue
            except ImportError:
                # Fallback for older scipy versions
                p_value = stats.binom_test(int(overall_choice_share * n_observations), n_observations, 0.5)
        else:
            p_value = 1.0
        
        results.append({
            'attribute': attr,
            'level': level,
            'choice_share': overall_choice_share,
            'effect_pp': effect_pp,
            'p_value': p_value,
            'n_observations': n_observations,
            'a_choice_share': a_choice_share,
            'b_choice_share': b_choice_share
        })
    
    return results

def create_comprehensive_table(results):
    """
    Create comprehensive results table
    """
    print("Creating comprehensive results table...")
    
    # Flatten results
    all_results = []
    for attr, attr_results in results.items():
        all_results.extend(attr_results)
    
    # Create DataFrame
    df_results = pd.DataFrame(all_results)
    
    # Add significance indicators
    df_results['significance'] = df_results['p_value'].apply(get_significance)
    df_results['effect_formatted'] = df_results.apply(format_effect, axis=1)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['effect_pp'])
    df_results = df_results.sort_values(['attribute', 'abs_effect'], ascending=[True, False])
    
    # Print results by attribute
    print_comprehensive_results(df_results)
    
    # Save to CSV
    df_results.to_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/comprehensive_attribute_results.csv', index=False)
    
    return df_results

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

def format_effect(row):
    """
    Format effect with significance
    """
    effect = row['effect_pp']
    sig = row['significance']
    
    if abs(effect) < 0.1:
        return 'n.s.'
    else:
        return f"{effect:+.1f}{sig}"

def print_comprehensive_results(df_results):
    """
    Print comprehensive results by attribute
    """
    print("\n" + "="*100)
    print("COMPREHENSIVE ATTRIBUTE ANALYSIS")
    print("="*100)
    
    for attr in df_results['attribute'].unique():
        attr_data = df_results[df_results['attribute'] == attr]
        
        print(f"\n{attr.upper()}")
        print("-" * 80)
        print(f"{'Level':<50} {'Effect (pp)':<15} {'P-value':<12} {'Choice Share':<12} {'N':<6}")
        print("-" * 80)
        
        for _, row in attr_data.iterrows():
            level_short = row['level'][:47] + "..." if len(row['level']) > 50 else row['level']
            print(f"{level_short:<50} {row['effect_formatted']:<15} {row['p_value']:.3f}        {row['choice_share']:.3f}        {row['n_observations']:<6}")
    
    print("\nSignificance codes: * p<.05, ** p<.01, *** p<.001")
    print("pp = percentage points")

def create_attribute_summary():
    """
    Create summary of all attributes and levels
    """
    print("\n" + "="*100)
    print("ATTRIBUTE LEVELS SUMMARY")
    print("="*100)
    
    # Load the data to get unique values
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    attribute_values = extract_unique_values(df)
    
    for attr, levels in attribute_values.items():
        print(f"\n{attr.upper()}:")
        print("-" * 40)
        for i, level in enumerate(levels, 1):
            print(f"{i}. {level}")
    
    return attribute_values

def main():
    """
    Main function
    """
    print("Starting Comprehensive Attribute Analysis")
    print("="*60)
    
    # Create attribute summary
    attribute_values = create_attribute_summary()
    
    # Run comprehensive analysis
    results = analyze_all_attributes()
    
    print("\nAnalysis completed!")
    print("Files created:")
    print("- comprehensive_attribute_results.csv")
    
    return results

if __name__ == "__main__":
    results = main()
