#!/usr/bin/env python3
"""
Create All Attributes Visualization
==================================

Creates comprehensive visualizations for all attribute levels
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns

# Set style
plt.style.use('default')
sns.set_palette("husl")

def create_all_attributes_visualization():
    """
    Create comprehensive visualization for all attributes
    """
    
    # Data from the comprehensive analysis
    data = {
        'Attribute': [
            'School pays (free)',
            'Male AI tutor',
            'Free trial + $12.99/month',
            'Free trial + $9.99/month',
            'Hero astronaut',
            'Space rescue story',
            'Free trial + $4.99/month',
            'Free trial + $7.99/month',
            'Friendly & warm colors',
            'Supportive failure message',
            'Growth success message',
            'Tech & bold colors',
            'Brilliance success message',
            'Neutral failure message'
        ],
        'Effect_pp': [20.7, -7.5, -15.8, -8.3, 6.1, 5.9, 4.4, -0.8, 0.3, 0.7, 0.5, -0.3, -0.5, -0.7],
        'P_value': [0.000, 0.000, 0.000, 0.001, 0.000, 0.000, 0.089, 0.776, 0.874, 0.681, 0.776, 0.874, 0.776, 0.681],
        'Significance': ['***', '***', '***', '**', '***', '***', '(marginal)', 'n.s.', 'n.s.', 'n.s.', 'n.s.', 'n.s.', 'n.s.', 'n.s.'],
        'Category': ['Pricing', 'Tutor', 'Pricing', 'Pricing', 'Role Play', 'Storytelling', 'Pricing', 'Pricing', 'Color', 'Message', 'Message', 'Color', 'Message', 'Message']
    }
    
    df = pd.DataFrame(data)
    
    # Create figure with subplots
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(20, 16))
    
    # Plot 1: All effects with significance
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
    ax1.set_title('All Attribute Effects\n(Statistically Significant Only)', fontsize=14, fontweight='bold')
    ax1.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax1.grid(axis='x', alpha=0.3)
    ax1.set_xlim(-20, 25)
    
    # Add value labels on bars
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax1.text(width + (1 if width > 0 else -1), bar.get_y() + bar.get_height()/2, 
                f'{width:+.1f}', ha='left' if width > 0 else 'right', va='center',
                fontsize=10, fontweight='bold')
    
    # Plot 2: Effects by category
    category_effects = df.groupby('Category')['Effect_pp'].agg(['mean', 'std', 'count']).reset_index()
    category_effects = category_effects.sort_values('mean', key=abs, ascending=False)
    
    bars2 = ax2.bar(category_effects['Category'], category_effects['mean'], 
                   color='skyblue', alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add error bars
    ax2.errorbar(category_effects['Category'], category_effects['mean'], 
                yerr=category_effects['std'], fmt='none', color='black', capsize=5)
    
    # Add value labels
    for i, bar in enumerate(bars2):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + (0.5 if height > 0 else -0.5),
                f'{height:+.1f}', ha='center', va='bottom' if height > 0 else 'top', 
                fontweight='bold')
    
    ax2.set_ylabel('Average Effect (Percentage Points)', fontsize=12)
    ax2.set_title('Average Effects by Attribute Category', fontsize=14, fontweight='bold')
    ax2.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    ax2.grid(axis='y', alpha=0.3)
    plt.setp(ax2.get_xticklabels(), rotation=45, ha='right')
    
    # Plot 3: Pricing analysis
    pricing_data = df[df['Category'] == 'Pricing'].copy()
    pricing_data = pricing_data.sort_values('Effect_pp', ascending=False)
    
    colors3 = ['darkgreen' if x == '***' else 'orange' if x == '(marginal)' else 'gray' 
               for x in pricing_data['Significance']]
    
    bars3 = ax3.bar(range(len(pricing_data)), pricing_data['Effect_pp'], 
                   color=colors3, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add value labels
    for i, bar in enumerate(bars3):
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height + (0.5 if height > 0 else -0.5),
                f'{height:+.1f} pp\n{pricing_data.iloc[i]["Significance"]}',
                ha='center', va='bottom' if height > 0 else 'top', fontweight='bold')
    
    ax3.set_xticks(range(len(pricing_data)))
    ax3.set_xticklabels([x.replace('Free trial + ', '').replace('/month', '') 
                        for x in pricing_data['Attribute']], rotation=45, ha='right')
    ax3.set_ylabel('Effect (Percentage Points)', fontsize=12)
    ax3.set_title('Pricing Analysis', fontsize=14, fontweight='bold')
    ax3.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    ax3.grid(axis='y', alpha=0.3)
    
    # Plot 4: Non-pricing attributes
    non_pricing = df[df['Category'] != 'Pricing'].copy()
    non_pricing = non_pricing.sort_values('Effect_pp', key=abs, ascending=False)
    
    colors4 = ['red' if x < 0 else 'green' for x in non_pricing['Effect_pp']]
    bars4 = ax4.barh(non_pricing['Attribute'], non_pricing['Effect_pp'], 
                    color=colors4, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add significance markers
    for i, (idx, row) in enumerate(non_pricing.iterrows()):
        p_val = row['P_value']
        if p_val < 0.001:
            marker = '***'
        elif p_val < 0.01:
            marker = '**'
        elif p_val < 0.05:
            marker = '*'
        elif p_val < 0.1:
            marker = '(marginal)'
        else:
            marker = 'n.s.'
        
        x_pos = row['Effect_pp'] + (0.5 if row['Effect_pp'] > 0 else -0.5)
        ax4.text(x_pos, i, marker, va='center', ha='left' if row['Effect_pp'] > 0 else 'right',
                fontsize=10, fontweight='bold')
    
    ax4.set_xlabel('Effect (Percentage Points)', fontsize=12)
    ax4.set_title('Non-Pricing Attributes', fontsize=14, fontweight='bold')
    ax4.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax4.grid(axis='x', alpha=0.3)
    ax4.set_xlim(-10, 10)
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/all_attributes_visualization.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def create_summary_table_visualization():
    """
    Create summary table visualization
    """
    fig, ax = plt.subplots(figsize=(16, 12))
    ax.axis('tight')
    ax.axis('off')
    
    # Prepare table data
    table_data = [
        ['School pays (free)', '+20.7***', 'Institutional sponsorship most preferred'],
        ['Male AI tutor', '-7.5***', 'Strong preference for female tutors'],
        ['Free trial + $12.99/month', '-15.8***', 'Premium pricing least preferred'],
        ['Free trial + $9.99/month', '-8.3**', 'High pricing less preferred'],
        ['Hero astronaut', '+6.1***', 'Role adoption critical'],
        ['Space rescue story', '+5.9***', 'Narratives enhance appeal'],
        ['Free trial + $4.99/month', '+4.4 (marginal)', 'Affordable pricing acceptable'],
        ['Free trial + $7.99/month', '-0.8 n.s.', 'Moderate pricing neutral'],
        ['Friendly & warm colors', '+0.3 n.s.', 'Color preference minimal'],
        ['Supportive failure message', '+0.7 n.s.', 'Message framing minimal'],
        ['Growth success message', '+0.5 n.s.', 'Message framing minimal'],
        ['Tech & bold colors', '-0.3 n.s.', 'Color preference minimal'],
        ['Brilliance success message', '-0.5 n.s.', 'Message framing minimal'],
        ['Neutral failure message', '-0.7 n.s.', 'Message framing minimal']
    ]
    
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
    
    plt.title('Table 2. Conjoint results (pp = percentage points)\nAll Attribute Levels', 
             fontsize=16, fontweight='bold', pad=20)
    
    # Add significance codes
    plt.figtext(0.5, 0.02, 'Significance codes: * p<.05, ** p<.01, *** p<.001', 
               ha='center', fontsize=12, style='italic')
    
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/all_attributes_summary_table.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    print("Creating comprehensive all-attributes visualizations...")
    
    # Create main visualization
    create_all_attributes_visualization()
    
    # Create summary table
    create_summary_table_visualization()
    
    print("Visualizations created:")
    print("- all_attributes_visualization.png")
    print("- all_attributes_summary_table.png")
