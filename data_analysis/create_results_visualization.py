#!/usr/bin/env python3
"""
Create Results Visualization
===========================

Creates visualizations that match the format from the screenshots
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns

# Set style
plt.style.use('default')
sns.set_palette("husl")

def create_results_visualization():
    """
    Create visualization matching the screenshot format
    """
    
    # Data from the analysis
    data = {
        'Attribute': [
            'School pays',
            '$4.99',
            'Male tutor',
            '$7.99',
            'No role play',
            'Storytelling (rescue)',
            '$9.99',
            'Color / messages'
        ],
        'Effect_pp': [36.6, 20.8, -15.5, 14.9, -12.9, 12.5, 8.2, 0],
        'P_value': [2.6e-11, 8.7e-06, 5.7e-05, 5.3e-04, 4.7e-05, 0.001, 0.056, 0.5],
        'Significance': ['***', '***', '***', '***', '***', '**', '(marginal)', 'n.s.'],
        'Interpretation': [
            'Institutional sponsorship most preferred',
            'Affordable subscription acceptable',
            'Strong preference for female tutors',
            'Moderate preference',
            'Role adoption critical',
            'Narratives enhance appeal',
            'Borderline acceptable',
            'Small effects, not significant'
        ]
    }
    
    df = pd.DataFrame(data)
    
    # Create figure with subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 10))
    
    # Plot 1: Effect sizes with significance
    significant_data = df[df['P_value'] < 0.05].copy()
    
    if len(significant_data) > 0:
        colors = ['red' if x < 0 else 'green' for x in significant_data['Effect_pp']]
        bars = ax1.barh(significant_data['Attribute'], significant_data['Effect_pp'], 
                       color=colors, alpha=0.7, edgecolor='black', linewidth=0.5)
        
        # Add significance markers
        for i, (idx, row) in enumerate(significant_data.iterrows()):
            p_val = row['P_value']
            if p_val < 0.001:
                marker = '***'
            elif p_val < 0.01:
                marker = '**'
            else:
                marker = '*'
            
            # Position marker
            x_pos = row['Effect_pp'] + (1 if row['Effect_pp'] > 0 else -1)
            ax1.text(x_pos, i, marker, va='center', ha='left' if row['Effect_pp'] > 0 else 'right',
                    fontsize=12, fontweight='bold')
    
    ax1.set_xlabel('Effect (Percentage Points)', fontsize=12)
    ax1.set_title('Conjoint Analysis Results\n(Statistically Significant Effects)', fontsize=14, fontweight='bold')
    ax1.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax1.grid(axis='x', alpha=0.3)
    ax1.set_xlim(-20, 40)
    
    # Add value labels on bars
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax1.text(width + (1 if width > 0 else -1), bar.get_y() + bar.get_height()/2, 
                f'{width:+.1f}', ha='left' if width > 0 else 'right', va='center',
                fontsize=10, fontweight='bold')
    
    # Plot 2: P-value distribution
    p_values = df['P_value'].dropna()
    p_values = p_values[p_values > 0]  # Remove zero p-values for log scale
    
    ax2.hist(p_values, bins=20, alpha=0.7, color='skyblue', edgecolor='black')
    ax2.axvline(x=0.05, color='red', linestyle='--', linewidth=2, label='p=0.05')
    ax2.axvline(x=0.01, color='orange', linestyle='--', linewidth=2, label='p=0.01')
    ax2.axvline(x=0.001, color='darkred', linestyle='--', linewidth=2, label='p=0.001')
    ax2.set_xlabel('P-value', fontsize=12)
    ax2.set_ylabel('Frequency', fontsize=12)
    ax2.set_title('Distribution of P-values', fontsize=14, fontweight='bold')
    ax2.legend()
    ax2.grid(alpha=0.3)
    ax2.set_xscale('log')
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/conjoint_results_visualization.png', 
               dpi=300, bbox_inches='tight')
    plt.show()
    
    # Create summary table visualization
    create_summary_table(df)

def create_summary_table(df):
    """
    Create a summary table visualization
    """
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.axis('tight')
    ax.axis('off')
    
    # Prepare table data
    table_data = []
    for _, row in df.iterrows():
        effect_str = f"{row['Effect_pp']:+.1f}{row['Significance']}"
        table_data.append([
            row['Attribute'],
            effect_str,
            row['Interpretation']
        ])
    
    # Create table
    table = ax.table(cellText=table_data,
                    colLabels=['Attribute', 'Effect (pp)', 'Interpretation'],
                    cellLoc='left',
                    loc='center',
                    bbox=[0, 0, 1, 1])
    
    # Style the table
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)
    
    # Color code significance
    for i in range(len(table_data)):
        significance = df.iloc[i]['Significance']
        if '***' in significance:
            color = 'lightgreen'
        elif '**' in significance:
            color = 'lightblue'
        elif '*' in significance:
            color = 'lightyellow'
        else:
            color = 'lightgray'
        
        table[(i+1, 1)].set_facecolor(color)
    
    # Header styling
    for i in range(3):
        table[(0, i)].set_facecolor('lightblue')
        table[(0, i)].set_text_props(weight='bold')
    
    plt.title('Table 2. Conjoint results (pp = percentage points)', 
             fontsize=14, fontweight='bold', pad=20)
    
    # Add significance codes
    plt.figtext(0.5, 0.02, 'Significance codes: * p<.05, ** p<.01, *** p<.001', 
               ha='center', fontsize=10, style='italic')
    
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/conjoint_summary_table.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def create_pricing_analysis_plot():
    """
    Create pricing analysis plot
    """
    pricing_data = {
        'Pricing_Level': ['School pays', '$4.99', '$7.99', '$9.99', '$12.99'],
        'Effect_pp': [36.6, 20.8, 14.9, 8.2, 0],
        'P_value': [2.6e-11, 8.7e-06, 5.3e-04, 0.056, 1.0],
        'Significance': ['***', '***', '***', '(marginal)', '(baseline)']
    }
    
    df_pricing = pd.DataFrame(pricing_data)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    colors = ['darkgreen' if x == '***' else 'orange' if x == '(marginal)' else 'gray' 
              for x in df_pricing['Significance']]
    
    bars = ax.bar(df_pricing['Pricing_Level'], df_pricing['Effect_pp'], 
                  color=colors, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add value labels
    for i, bar in enumerate(bars):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height + 0.5,
                f'{height:+.1f} pp\n{df_pricing.iloc[i]["Significance"]}',
                ha='center', va='bottom', fontweight='bold')
    
    ax.set_xlabel('Pricing Level', fontsize=12)
    ax.set_ylabel('Effect (Percentage Points)', fontsize=12)
    ax.set_title('Pricing Analysis (Relative to $12.99 baseline)', fontsize=14, fontweight='bold')
    ax.grid(axis='y', alpha=0.3)
    ax.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/pricing_analysis.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    print("Creating conjoint results visualizations...")
    
    # Create main visualization
    create_results_visualization()
    
    # Create pricing analysis
    create_pricing_analysis_plot()
    
    print("Visualizations created:")
    print("- conjoint_results_visualization.png")
    print("- conjoint_summary_table.png")
    print("- pricing_analysis.png")
