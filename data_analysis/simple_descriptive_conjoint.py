#!/usr/bin/env python3
"""
Simple Descriptive Conjoint Analysis
===================================

Alternative to logistic regression - uses simple counting and descriptive statistics
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

def run_simple_descriptive_analysis():
    """
    Run simple descriptive analysis without logistic regression
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to choice format
    choice_data = convert_to_choice_format(df)
    
    # Run descriptive analysis
    results = run_descriptive_analysis(choice_data)
    
    # Create visualizations
    create_visualizations(results, choice_data)
    
    return results

def convert_to_choice_format(df):
    """
    Convert to choice format for analysis
    """
    print("Converting to choice format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            record = {
                'respondent_id': idx,
                'task': task,
                'choice': choice,  # Keep as 'A' or 'B'
                'grade': row['Grade'],
                'perceived_learning': row[f'Task{task}_perceivedlearning'],
                'expected_enjoyment': row[f'Task{task}_expectedenjoyment']
            }
            
            # Add attribute levels for both options
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                record[f'A_{attr}'] = row[f'A_{attr}{task}']
                record[f'B_{attr}'] = row[f'B_{attr}{task}']
            
            choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def run_descriptive_analysis(choice_data):
    """
    Run descriptive analysis using simple counting methods
    """
    print("Running descriptive analysis...")
    
    results = {}
    
    # 1. Overall choice distribution
    choice_dist = choice_data['choice'].value_counts()
    results['choice_distribution'] = choice_dist
    
    print(f"\nOverall Choice Distribution:")
    print(f"Option A: {choice_dist.get('A', 0)} ({choice_dist.get('A', 0)/len(choice_data)*100:.1f}%)")
    print(f"Option B: {choice_dist.get('B', 0)} ({choice_dist.get('B', 0)/len(choice_data)*100:.1f}%)")
    
    # 2. Attribute-level analysis
    attributes = ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                 'Message_failure_', 'Storytelling', 'Role_play']
    
    attribute_results = {}
    
    for attr in attributes:
        print(f"\n{attr.upper()} Analysis:")
        print("-" * 50)
        
        # Count how often each level appears in chosen options
        chosen_levels = []
        for _, row in choice_data.iterrows():
            if row['choice'] == 'A':
                chosen_levels.append(row[f'A_{attr}'])
            else:
                chosen_levels.append(row[f'B_{attr}'])
        
        # Count how often each level appears in non-chosen options
        non_chosen_levels = []
        for _, row in choice_data.iterrows():
            if row['choice'] == 'A':
                non_chosen_levels.append(row[f'B_{attr}'])
            else:
                non_chosen_levels.append(row[f'A_{attr}'])
        
        # Calculate choice rates
        chosen_counts = pd.Series(chosen_levels).value_counts()
        non_chosen_counts = pd.Series(non_chosen_levels).value_counts()
        
        # Calculate choice rate for each level
        all_levels = set(chosen_counts.index) | set(non_chosen_counts.index)
        level_analysis = []
        
        for level in all_levels:
            chosen_count = chosen_counts.get(level, 0)
            non_chosen_count = non_chosen_counts.get(level, 0)
            total_appearances = chosen_count + non_chosen_count
            
            if total_appearances > 0:
                choice_rate = chosen_count / total_appearances
                level_analysis.append({
                    'level': level,
                    'chosen_count': chosen_count,
                    'non_chosen_count': non_chosen_count,
                    'total_appearances': total_appearances,
                    'choice_rate': choice_rate,
                    'preference_score': (choice_rate - 0.5) * 100  # Convert to percentage points
                })
        
        # Sort by preference score
        level_analysis = sorted(level_analysis, key=lambda x: x['preference_score'], reverse=True)
        
        print(f"{'Level':<50} {'Choice Rate':<12} {'Preference':<12} {'N':<6}")
        print("-" * 50)
        
        for level_data in level_analysis:
            level_short = level_data['level'][:47] + "..." if len(level_data['level']) > 50 else level_data['level']
            print(f"{level_short:<50} {level_data['choice_rate']:.3f}      {level_data['preference_score']:+.1f}pp     {level_data['total_appearances']:<6}")
        
        attribute_results[attr] = level_analysis
    
    results['attribute_results'] = attribute_results
    
    # 3. Demographic analysis
    print(f"\nDEMOGRAPHIC ANALYSIS:")
    print("-" * 30)
    
    grade_analysis = choice_data.groupby('grade').agg({
        'choice': lambda x: (x == 'A').mean(),
        'perceived_learning': 'mean',
        'expected_enjoyment': 'mean'
    }).round(3)
    
    print("Choice rates by grade:")
    for grade, row in grade_analysis.iterrows():
        print(f"Grade {grade}: {row['choice']:.3f} (A choice rate)")
    
    results['grade_analysis'] = grade_analysis
    
    return results

def create_visualizations(results, choice_data):
    """
    Create visualizations for the descriptive analysis
    """
    print("\nCreating visualizations...")
    
    # Set up the plotting style
    plt.style.use('default')
    sns.set_palette("husl")
    
    # 1. Overall choice distribution
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Simple Descriptive Conjoint Analysis Results', fontsize=16, fontweight='bold')
    
    # Choice distribution pie chart
    choice_dist = results['choice_distribution']
    axes[0, 0].pie(choice_dist.values, labels=choice_dist.index, autopct='%1.1f%%', startangle=90)
    axes[0, 0].set_title('Overall Choice Distribution')
    
    # Attribute preference heatmap
    attr_data = []
    for attr, levels in results['attribute_results'].items():
        for level_data in levels:
            attr_data.append({
                'attribute': attr,
                'level': level_data['level'][:30] + "..." if len(level_data['level']) > 30 else level_data['level'],
                'preference_score': level_data['preference_score']
            })
    
    attr_df = pd.DataFrame(attr_data)
    pivot_table = attr_df.pivot_table(values='preference_score', index='level', columns='attribute', fill_value=0)
    
    sns.heatmap(pivot_table, annot=True, fmt='.1f', cmap='RdYlBu_r', center=0, ax=axes[0, 1])
    axes[0, 1].set_title('Preference Scores by Attribute Level')
    axes[0, 1].set_xlabel('Attribute')
    axes[0, 1].set_ylabel('Level')
    
    # Top preferences bar chart
    all_preferences = []
    for attr, levels in results['attribute_results'].items():
        for level_data in levels:
            all_preferences.append({
                'attribute': attr,
                'level': level_data['level'][:25] + "..." if len(level_data['level']) > 25 else level_data['level'],
                'preference_score': level_data['preference_score']
            })
    
    pref_df = pd.DataFrame(all_preferences)
    top_preferences = pref_df.nlargest(10, 'preference_score')
    
    bars = axes[1, 0].barh(range(len(top_preferences)), top_preferences['preference_score'])
    axes[1, 0].set_yticks(range(len(top_preferences)))
    axes[1, 0].set_yticklabels(top_preferences['level'], fontsize=8)
    axes[1, 0].set_xlabel('Preference Score (percentage points)')
    axes[1, 0].set_title('Top 10 Most Preferred Levels')
    axes[1, 0].axvline(x=0, color='black', linestyle='-', alpha=0.3)
    
    # Color bars by preference score
    for i, bar in enumerate(bars):
        if top_preferences.iloc[i]['preference_score'] > 0:
            bar.set_color('green')
        else:
            bar.set_color('red')
    
    # Grade analysis
    grade_data = results['grade_analysis']
    axes[1, 1].bar(grade_data.index, grade_data['choice'], color='skyblue', alpha=0.7)
    axes[1, 1].set_xlabel('Grade')
    axes[1, 1].set_ylabel('Choice Rate for Option A')
    axes[1, 1].set_title('Choice Rates by Grade')
    axes[1, 1].set_ylim(0, 1)
    
    # Add value labels on bars
    for i, v in enumerate(grade_data['choice']):
        axes[1, 1].text(grade_data.index[i], v + 0.02, f'{v:.3f}', ha='center', va='bottom')
    
    plt.tight_layout()
    
    # Save the plot
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/simple_descriptive_results_{timestamp}.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"Visualization saved to: {output_file}")
    
    plt.show()

def create_summary_table(results):
    """
    Create a summary table of results
    """
    print("\nCreating summary table...")
    
    # Flatten results for table
    summary_data = []
    for attr, levels in results['attribute_results'].items():
        for level_data in levels:
            summary_data.append({
                'attribute': attr,
                'level': level_data['level'],
                'choice_rate': level_data['choice_rate'],
                'preference_score': level_data['preference_score'],
                'total_appearances': level_data['total_appearances']
            })
    
    summary_df = pd.DataFrame(summary_data)
    summary_df = summary_df.sort_values('preference_score', ascending=False)
    
    # Save to CSV
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/simple_descriptive_results_{timestamp}.csv'
    summary_df.to_csv(output_file, index=False)
    print(f"Summary table saved to: {output_file}")
    
    return summary_df

def main():
    """
    Main function
    """
    print("Starting Simple Descriptive Conjoint Analysis")
    print("="*50)
    
    # Run analysis
    results = run_simple_descriptive_analysis()
    
    # Create summary table
    summary_df = create_summary_table(results)
    
    print("\nSimple Descriptive Analysis completed!")
    print("This analysis uses simple counting methods instead of logistic regression.")
    print("Preference scores show how much more/less likely each level is to be chosen.")
    
    return results, summary_df

if __name__ == "__main__":
    results, summary_df = main()
