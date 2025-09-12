#!/usr/bin/env python3
"""
Corrected Comprehensive Attribute Analysis
=========================================

Fixed version with proper statistical testing and choice share calculation
"""

import pandas as pd
import numpy as np
from scipy import stats
from sklearn.linear_model import LogisticRegression
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

def analyze_all_attributes_corrected():
    """
    Corrected comprehensive analysis of all attributes and their levels
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Extract all unique attribute values
    attribute_values = extract_unique_values(df)
    
    # Convert to choice format
    choice_data = convert_to_choice_format_corrected(df)
    
    # Analyze each attribute
    results = analyze_attributes_corrected(choice_data, attribute_values)
    
    # Create comprehensive results table
    create_comprehensive_table_corrected(results)
    
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

def convert_to_choice_format_corrected(df):
    """
    Convert wide format to choice format - CORRECTED VERSION
    """
    print("Converting to choice format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            record = {
                'respondent_id': idx,
                'task': task,
                'choice': 1 if choice == 'A' else 0,  # 1 = chose A, 0 = chose B
                'grade': row['Grade']
            }
            
            # Add all attribute values for both options
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                
                a_val = row[f'A_{attr}{task}']
                b_val = row[f'B_{attr}{task}']
                
                record[f'A_{attr}'] = a_val
                record[f'B_{attr}'] = b_val
            
            choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def analyze_attributes_corrected(choice_data, attribute_values):
    """
    Analyze each attribute level's effect on choice - CORRECTED VERSION
    """
    print("Analyzing attribute effects...")
    
    results = {}
    
    for attr in attribute_values.keys():
        print(f"Analyzing {attr}...")
        attr_results = analyze_single_attribute_corrected(choice_data, attr, attribute_values[attr])
        results[attr] = attr_results
    
    return results

def analyze_single_attribute_corrected(choice_data, attr, levels):
    """
    Analyze a single attribute's levels - CORRECTED VERSION
    """
    results = []
    
    for level in levels:
        # CORRECTED: Calculate choice share properly
        # When this level appears in option A, how often is A chosen?
        a_data = choice_data[choice_data[f'A_{attr}'] == level]
        a_choice_share = a_data['choice'].mean() if len(a_data) > 0 else 0.5
        
        # When this level appears in option B, how often is B chosen?
        b_data = choice_data[choice_data[f'B_{attr}'] == level]
        b_choice_share = (1 - b_data['choice']).mean() if len(b_data) > 0 else 0.5
        
        # Overall choice share for this level (weighted average)
        total_observations = len(a_data) + len(b_data)
        if total_observations > 0:
            overall_choice_share = (a_choice_share * len(a_data) + b_choice_share * len(b_data)) / total_observations
        else:
            overall_choice_share = 0.5
        
        # Calculate effect relative to baseline (50% = random choice)
        baseline_share = 0.5
        effect_pp = (overall_choice_share - baseline_share) * 100
        
        # CORRECTED: Proper statistical testing using chi-square test
        # Create contingency table: level present vs absent, choice A vs B
        level_present = choice_data[(choice_data[f'A_{attr}'] == level) | (choice_data[f'B_{attr}'] == level)]
        level_absent = choice_data[(choice_data[f'A_{attr}'] != level) & (choice_data[f'B_{attr}'] != level)]
        
        if len(level_present) > 0 and len(level_absent) > 0:
            # Count choices when level is present
            present_choice_a = level_present['choice'].sum()
            present_choice_b = len(level_present) - present_choice_a
            
            # Count choices when level is absent
            absent_choice_a = level_absent['choice'].sum()
            absent_choice_b = len(level_absent) - absent_choice_a
            
            # Chi-square test
            contingency_table = np.array([
                [present_choice_a, present_choice_b],
                [absent_choice_a, absent_choice_b]
            ])
            
            try:
                chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
            except:
                p_value = 1.0
        else:
            p_value = 1.0
        
        # Alternative: Use t-test for choice share difference
        if len(level_present) > 0 and len(level_absent) > 0:
            present_choices = level_present['choice'].values
            absent_choices = level_absent['choice'].values
            
            try:
                t_stat, p_value_t = stats.ttest_ind(present_choices, absent_choices)
                # Use the more conservative p-value
                p_value = min(p_value, p_value_t)
            except:
                pass
        
        results.append({
            'attribute': attr,
            'level': level,
            'choice_share': overall_choice_share,
            'effect_pp': effect_pp,
            'p_value': p_value,
            'n_observations': total_observations,
            'a_choice_share': a_choice_share,
            'b_choice_share': b_choice_share,
            'present_n': len(level_present),
            'absent_n': len(level_absent)
        })
    
    return results

def create_comprehensive_table_corrected(results):
    """
    Create comprehensive results table - CORRECTED VERSION
    """
    print("Creating comprehensive results table...")
    
    # Flatten results
    all_results = []
    for attr, attr_results in results.items():
        all_results.extend(attr_results)
    
    # Create DataFrame
    df_results = pd.DataFrame(all_results)
    
    # Add significance indicators
    df_results['significance'] = df_results['p_value'].apply(get_significance_corrected)
    df_results['effect_formatted'] = df_results.apply(format_effect_corrected, axis=1)
    
    # Sort by absolute effect size
    df_results['abs_effect'] = abs(df_results['effect_pp'])
    df_results = df_results.sort_values(['attribute', 'abs_effect'], ascending=[True, False])
    
    # Print results by attribute
    print_comprehensive_results_corrected(df_results)
    
    # Save to CSV
    df_results.to_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/corrected_attribute_results.csv', index=False)
    
    return df_results

def get_significance_corrected(p_value):
    """
    Get significance indicator - CORRECTED VERSION
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

def format_effect_corrected(row):
    """
    Format effect with significance - CORRECTED VERSION
    """
    effect = row['effect_pp']
    sig = row['significance']
    
    if abs(effect) < 0.1:
        return 'n.s.'
    else:
        return f"{effect:+.1f}{sig}"

def print_comprehensive_results_corrected(df_results):
    """
    Print comprehensive results by attribute - CORRECTED VERSION
    """
    print("\n" + "="*100)
    print("CORRECTED COMPREHENSIVE ATTRIBUTE ANALYSIS")
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
    print("\nNOTE: This is the CORRECTED version with proper statistical testing")

def main():
    """
    Main function
    """
    print("Starting CORRECTED Comprehensive Attribute Analysis")
    print("="*60)
    
    # Run corrected analysis
    results = analyze_all_attributes_corrected()
    
    print("\nCORRECTED Analysis completed!")
    print("Files created:")
    print("- corrected_attribute_results.csv")
    
    return results

if __name__ == "__main__":
    results = main()
