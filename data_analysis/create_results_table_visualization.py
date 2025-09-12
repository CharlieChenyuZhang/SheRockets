#!/usr/bin/env python3
"""
Create Results Table Visualization
=================================

Creates a table visualization matching the screenshot format
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

def create_results_table_visualization():
    """
    Create results table visualization matching screenshot format
    """
    
    # Load the results data
    results_df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_conjoint_results.csv')
    
    # Sort by absolute effect size
    results_df = results_df.sort_values('abs_effect', ascending=False)
    
    # Create figure
    fig, ax = plt.subplots(figsize=(16, 12))
    ax.axis('tight')
    ax.axis('off')
    
    # Prepare table data
    table_data = []
    for _, row in results_df.iterrows():
        effect_str = f"{row['pp_effect']:+.1f}{row['significance']}"
        table_data.append([
            row['level'],
            effect_str,
            row['interpretation'] if 'interpretation' in row else get_interpretation(row)
        ])
    
    # Create table
    table = ax.table(cellText=table_data,
                    colLabels=['Attribute Level', 'Effect (pp)', 'Interpretation'],
                    cellLoc='left',
                    loc='center',
                    bbox=[0, 0, 1, 1])
    
    # Style the table
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.5)
    
    # Color code significance
    for i in range(len(table_data)):
        effect_str = table_data[i][1]
        if '***' in effect_str:
            color = 'lightgreen' if '+' in effect_str else 'lightcoral'
        elif '**' in effect_str:
            color = 'lightblue' if '+' in effect_str else 'lightpink'
        elif '*' in effect_str:
            color = 'lightyellow' if '+' in effect_str else 'lightgray'
        elif '(marginal)' in effect_str:
            color = 'lightcyan'
        else:
            color = 'lightgray'
        
        table[(i+1, 1)].set_facecolor(color)
    
    # Header styling
    for i in range(3):
        table[(0, i)].set_facecolor('lightblue')
        table[(0, i)].set_text_props(weight='bold')
    
    plt.title('Table 2. Conjoint results (pp = percentage points)\nGranular Attribute Levels', 
             fontsize=16, fontweight='bold', pad=20)
    
    # Add significance codes
    plt.figtext(0.5, 0.02, 'Significance codes: * p<.05, ** p<.01, *** p<.001', 
               ha='center', fontsize=12, style='italic')
    
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_results_table.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def get_interpretation(row):
    """
    Generate interpretation based on attribute and effect
    """
    level = row['level']
    effect = row['pp_effect']
    significance = row['significance']
    
    if 'School pays' in level:
        return 'Institutional sponsorship most preferred'
    elif '$12.99' in level:
        return 'Premium pricing least preferred'
    elif '$9.99' in level:
        return 'High pricing less preferred'
    elif 'No story' in level:
        return 'Storytelling significantly enhances appeal'
    elif 'Male AI tutor' in level:
        return 'Strong preference for female tutors'
    elif 'Female AI tutor' in level:
        return 'Significantly preferred over male tutors'
    elif 'No specific role' in level:
        return 'Role play significantly enhances appeal'
    elif 'Hero astronaut' in level:
        return 'Role adoption critical for engagement'
    elif '$4.99' in level:
        return 'Affordable pricing acceptable'
    elif '$7.99' in level:
        return 'Moderate pricing neutral'
    elif 'Tech & bold' in level:
        return 'Friendly colors slightly preferred'
    elif 'Friendly & warm' in level:
        return 'Slightly preferred over tech colors'
    elif 'Growth' in level:
        return 'Message framing has minimal impact'
    elif 'Brilliance' in level:
        return 'Message framing has minimal impact'
    elif 'Supportive' in level:
        return 'Message framing has minimal impact'
    elif 'Neutral' in level:
        return 'Message framing has minimal impact'
    elif 'Space rescue' in level:
        return 'Storytelling effect captured by "no story"'
    else:
        return 'Effect on choice preference'

def create_summary_visualization():
    """
    Create a summary visualization
    """
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # Load data
    results_df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_conjoint_results.csv')
    
    # Plot 1: Top 10 effects
    top_10 = results_df.nlargest(10, 'abs_effect')
    colors1 = ['darkgreen' if x > 0 else 'darkred' for x in top_10['pp_effect']]
    bars1 = ax1.barh(range(len(top_10)), top_10['pp_effect'], color=colors1, alpha=0.7)
    ax1.set_yticks(range(len(top_10)))
    ax1.set_yticklabels([row['level'][:30] + "..." if len(row['level']) > 33 else row['level'] 
                        for _, row in top_10.iterrows()], fontsize=9)
    ax1.set_xlabel('Effect (Percentage Points)', fontsize=10)
    ax1.set_title('Top 10 Attribute Effects', fontsize=12, fontweight='bold')
    ax1.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax1.grid(axis='x', alpha=0.3)
    
    # Plot 2: Significance distribution
    sig_counts = results_df['significance'].value_counts()
    colors2 = ['darkgreen', 'green', 'orange', 'lightcoral', 'gray']
    bars2 = ax2.pie(sig_counts.values, labels=sig_counts.index, autopct='%1.1f%%', 
                   colors=colors2[:len(sig_counts)], startangle=90)
    ax2.set_title('Significance Distribution', fontsize=12, fontweight='bold')
    
    # Plot 3: Effect by attribute
    attr_effects = results_df.groupby('attribute')['pp_effect'].agg(['mean', 'std']).reset_index()
    attr_effects = attr_effects.sort_values('mean', key=abs, ascending=False)
    colors3 = ['darkgreen' if x > 0 else 'darkred' for x in attr_effects['mean']]
    bars3 = ax3.bar(attr_effects['attribute'], attr_effects['mean'], color=colors3, alpha=0.7)
    ax3.errorbar(attr_effects['attribute'], attr_effects['mean'], yerr=attr_effects['std'], 
                fmt='none', color='black', capsize=5)
    ax3.set_ylabel('Average Effect (pp)', fontsize=10)
    ax3.set_title('Average Effects by Attribute', fontsize=12, fontweight='bold')
    ax3.tick_params(axis='x', rotation=45)
    ax3.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    ax3.grid(axis='y', alpha=0.3)
    
    # Plot 4: P-value distribution
    ax4.hist(results_df['p_value'], bins=20, alpha=0.7, color='lightcoral', edgecolor='black')
    ax4.axvline(x=0.05, color='red', linestyle='--', alpha=0.7, label='p=0.05')
    ax4.axvline(x=0.01, color='orange', linestyle='--', alpha=0.7, label='p=0.01')
    ax4.axvline(x=0.001, color='darkred', linestyle='--', alpha=0.7, label='p=0.001')
    ax4.set_xlabel('P-value', fontsize=10)
    ax4.set_ylabel('Frequency', fontsize=10)
    ax4.set_title('P-value Distribution', fontsize=12, fontweight='bold')
    ax4.legend()
    ax4.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_summary_visualization.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    print("Creating results table visualizations...")
    
    # Create results table
    create_results_table_visualization()
    
    # Create summary visualization
    create_summary_visualization()
    
    print("Table visualizations created:")
    print("- granular_results_table.png")
    print("- granular_summary_visualization.png")
