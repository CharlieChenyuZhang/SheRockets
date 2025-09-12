#!/usr/bin/env python3
"""
Create Granular Conjoint Visualizations
======================================

Creates comprehensive visualizations for the granular conjoint analysis
"""

import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import seaborn as sns
from matplotlib.patches import Rectangle

# Set style
plt.style.use('default')
sns.set_palette("husl")

def create_granular_visualizations():
    """
    Create comprehensive visualizations for granular conjoint analysis
    """
    
    # Load the results data
    results_df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_conjoint_results.csv')
    
    # Create multiple visualizations
    create_main_effects_plot(results_df)
    create_pricing_analysis_plot(results_df)
    create_rating_analysis_plots()
    create_attribute_importance_plot(results_df)
    create_comprehensive_dashboard(results_df)
    
    print("All visualizations created successfully!")

def create_main_effects_plot(results_df):
    """
    Create main effects plot showing all attribute levels
    """
    fig, ax = plt.subplots(figsize=(16, 12))
    
    # Sort by effect size
    results_df = results_df.sort_values('pp_effect', ascending=True)
    
    # Create color mapping based on significance
    colors = []
    for _, row in results_df.iterrows():
        if row['significance'] == '***':
            colors.append('darkgreen' if row['pp_effect'] > 0 else 'darkred')
        elif row['significance'] == '**':
            colors.append('green' if row['pp_effect'] > 0 else 'red')
        elif row['significance'] == '*':
            colors.append('lightgreen' if row['pp_effect'] > 0 else 'lightcoral')
        else:
            colors.append('gray')
    
    # Create horizontal bar plot
    bars = ax.barh(range(len(results_df)), results_df['pp_effect'], color=colors, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add significance markers
    for i, (_, row) in enumerate(results_df.iterrows()):
        effect = row['pp_effect']
        sig = row['significance']
        
        # Position marker
        x_pos = effect + (1 if effect > 0 else -1)
        ax.text(x_pos, i, sig, va='center', ha='left' if effect > 0 else 'right',
                fontsize=10, fontweight='bold')
    
    # Customize plot
    ax.set_yticks(range(len(results_df)))
    ax.set_yticklabels([row['level'][:40] + "..." if len(row['level']) > 43 else row['level'] 
                       for _, row in results_df.iterrows()], fontsize=9)
    ax.set_xlabel('Effect (Percentage Points)', fontsize=12)
    ax.set_title('Granular Conjoint Analysis Results\nAll Attribute Levels', fontsize=14, fontweight='bold')
    ax.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax.grid(axis='x', alpha=0.3)
    ax.set_xlim(-20, 25)
    
    # Add value labels on bars
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax.text(width + (1 if width > 0 else -1), bar.get_y() + bar.get_height()/2, 
                f'{width:+.1f}', ha='left' if width > 0 else 'right', va='center',
                fontsize=9, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_main_effects.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def create_pricing_analysis_plot(results_df):
    """
    Create detailed pricing analysis plot
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    
    # Filter pricing data
    pricing_data = results_df[results_df['attribute'] == 'Pricing'].copy()
    pricing_data = pricing_data.sort_values('pp_effect', ascending=False)
    
    # Plot 1: Pricing effects
    colors1 = ['darkgreen' if x == '***' else 'orange' if x == '*' else 'gray' 
               for x in pricing_data['significance']]
    
    bars1 = ax1.bar(range(len(pricing_data)), pricing_data['pp_effect'], 
                   color=colors1, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add value labels
    for i, bar in enumerate(bars1):
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height + (0.5 if height > 0 else -0.5),
                f'{height:+.1f} pp\n{pricing_data.iloc[i]["significance"]}',
                ha='center', va='bottom' if height > 0 else 'top', fontweight='bold')
    
    ax1.set_xticks(range(len(pricing_data)))
    ax1.set_xticklabels([x.replace('Free trial + ', '').replace('/month', '').replace('School pays (free for families)', 'Free') 
                        for x in pricing_data['level']], rotation=45, ha='right')
    ax1.set_ylabel('Effect (Percentage Points)', fontsize=12)
    ax1.set_title('Pricing Analysis - Choice Effects', fontsize=14, fontweight='bold')
    ax1.axhline(y=0, color='black', linestyle='-', alpha=0.5)
    ax1.grid(axis='y', alpha=0.3)
    
    # Plot 2: Pricing vs Ratings (simulated data based on results)
    pricing_levels = ['Free', '$4.99', '$7.99', '$9.99', '$12.99']
    learning_ratings = [3.83, 3.81, 3.83, 3.90, 3.94]
    enjoyment_ratings = [3.83, 3.82, 3.82, 3.99, 4.00]
    
    x = np.arange(len(pricing_levels))
    width = 0.35
    
    bars2a = ax2.bar(x - width/2, learning_ratings, width, label='Perceived Learning', alpha=0.7, color='skyblue')
    bars2b = ax2.bar(x + width/2, enjoyment_ratings, width, label='Expected Enjoyment', alpha=0.7, color='lightcoral')
    
    ax2.set_xlabel('Pricing Level', fontsize=12)
    ax2.set_ylabel('Rating (0-5 scale)', fontsize=12)
    ax2.set_title('Pricing vs Rating Expectations', fontsize=14, fontweight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(pricing_levels)
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)
    ax2.set_ylim(3.5, 4.2)
    
    # Add value labels
    for bar in bars2a:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{height:.2f}', ha='center', va='bottom', fontsize=9)
    
    for bar in bars2b:
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{height:.2f}', ha='center', va='bottom', fontsize=9)
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_pricing_analysis.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def create_rating_analysis_plots():
    """
    Create rating analysis plots
    """
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))
    
    # Tutor ratings
    tutor_data = {
        'Level': ['Female AI tutor', 'Male AI tutor'],
        'Learning': [3.86, 3.83],
        'Enjoyment': [3.92, 3.81]
    }
    
    x = np.arange(len(tutor_data['Level']))
    width = 0.35
    
    bars1a = ax1.bar(x - width/2, tutor_data['Learning'], width, label='Perceived Learning', alpha=0.7, color='skyblue')
    bars1b = ax1.bar(x + width/2, tutor_data['Enjoyment'], width, label='Expected Enjoyment', alpha=0.7, color='lightcoral')
    
    ax1.set_xlabel('Tutor Type', fontsize=12)
    ax1.set_ylabel('Rating (0-5 scale)', fontsize=12)
    ax1.set_title('Tutor Gender vs Ratings', fontsize=14, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(['Female', 'Male'])
    ax1.legend()
    ax1.grid(axis='y', alpha=0.3)
    ax1.set_ylim(3.7, 4.0)
    
    # Color ratings
    color_data = {
        'Level': ['Friendly & warm', 'Tech & bold'],
        'Learning': [3.88, 3.82],
        'Enjoyment': [3.90, 3.85]
    }
    
    x = np.arange(len(color_data['Level']))
    bars2a = ax2.bar(x - width/2, color_data['Learning'], width, label='Perceived Learning', alpha=0.7, color='skyblue')
    bars2b = ax2.bar(x + width/2, color_data['Enjoyment'], width, label='Expected Enjoyment', alpha=0.7, color='lightcoral')
    
    ax2.set_xlabel('Color Palette', fontsize=12)
    ax2.set_ylabel('Rating (0-5 scale)', fontsize=12)
    ax2.set_title('Color Palette vs Ratings', fontsize=14, fontweight='bold')
    ax2.set_xticks(x)
    ax2.set_xticklabels(['Friendly', 'Tech'])
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)
    ax2.set_ylim(3.7, 4.0)
    
    # Storytelling ratings
    story_data = {
        'Level': ['Space rescue story', 'No story'],
        'Learning': [3.81, 3.89],
        'Enjoyment': [3.85, 3.91]
    }
    
    x = np.arange(len(story_data['Level']))
    bars3a = ax3.bar(x - width/2, story_data['Learning'], width, label='Perceived Learning', alpha=0.7, color='skyblue')
    bars3b = ax3.bar(x + width/2, story_data['Enjoyment'], width, label='Expected Enjoyment', alpha=0.7, color='lightcoral')
    
    ax3.set_xlabel('Storytelling', fontsize=12)
    ax3.set_ylabel('Rating (0-5 scale)', fontsize=12)
    ax3.set_title('Storytelling vs Ratings', fontsize=14, fontweight='bold')
    ax3.set_xticks(x)
    ax3.set_xticklabels(['Story', 'No Story'])
    ax3.legend()
    ax3.grid(axis='y', alpha=0.3)
    ax3.set_ylim(3.7, 4.0)
    
    # Role play ratings
    role_data = {
        'Level': ['Hero astronaut', 'No specific role'],
        'Learning': [3.89, 3.79],
        'Enjoyment': [3.91, 3.83]
    }
    
    x = np.arange(len(role_data['Level']))
    bars4a = ax4.bar(x - width/2, role_data['Learning'], width, label='Perceived Learning', alpha=0.7, color='skyblue')
    bars4b = ax4.bar(x + width/2, role_data['Enjoyment'], width, label='Expected Enjoyment', alpha=0.7, color='lightcoral')
    
    ax4.set_xlabel('Role Play', fontsize=12)
    ax4.set_ylabel('Rating (0-5 scale)', fontsize=12)
    ax4.set_title('Role Play vs Ratings', fontsize=14, fontweight='bold')
    ax4.set_xticks(x)
    ax4.set_xticklabels(['Hero', 'No Role'])
    ax4.legend()
    ax4.grid(axis='y', alpha=0.3)
    ax4.set_ylim(3.7, 4.0)
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_rating_analysis.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def create_attribute_importance_plot(results_df):
    """
    Create attribute importance plot
    """
    fig, ax = plt.subplots(figsize=(12, 8))
    
    # Calculate attribute importance (range of effects within each attribute)
    importance_data = []
    for attr in results_df['attribute'].unique():
        attr_data = results_df[results_df['attribute'] == attr]
        max_effect = attr_data['pp_effect'].max()
        min_effect = attr_data['pp_effect'].min()
        importance = max_effect - min_effect
        importance_data.append({
            'attribute': attr,
            'importance': importance,
            'max_effect': max_effect,
            'min_effect': min_effect
        })
    
    importance_df = pd.DataFrame(importance_data)
    importance_df = importance_df.sort_values('importance', ascending=True)
    
    # Create horizontal bar plot
    colors = ['darkgreen', 'green', 'orange', 'lightcoral', 'lightblue', 'lightgray', 'gray']
    bars = ax.barh(range(len(importance_df)), importance_df['importance'], 
                  color=colors, alpha=0.7, edgecolor='black', linewidth=0.5)
    
    # Add value labels
    for i, bar in enumerate(bars):
        width = bar.get_width()
        ax.text(width + 0.5, bar.get_y() + bar.get_height()/2, 
                f'{width:.1f} pp', ha='left', va='center', fontweight='bold')
    
    ax.set_yticks(range(len(importance_df)))
    ax.set_yticklabels(importance_df['attribute'], fontsize=12)
    ax.set_xlabel('Attribute Importance (Range of Effects)', fontsize=12)
    ax.set_title('Attribute Importance Ranking\n(Range of Effects Within Each Attribute)', fontsize=14, fontweight='bold')
    ax.grid(axis='x', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_attribute_importance.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

def create_comprehensive_dashboard(results_df):
    """
    Create comprehensive dashboard
    """
    fig = plt.figure(figsize=(20, 16))
    
    # Create grid layout
    gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
    
    # Plot 1: Top effects (top-left)
    ax1 = fig.add_subplot(gs[0, 0])
    top_effects = results_df.nlargest(8, 'abs_effect')
    colors1 = ['darkgreen' if x > 0 else 'darkred' for x in top_effects['pp_effect']]
    bars1 = ax1.barh(range(len(top_effects)), top_effects['pp_effect'], color=colors1, alpha=0.7)
    ax1.set_yticks(range(len(top_effects)))
    ax1.set_yticklabels([row['level'][:25] + "..." if len(row['level']) > 28 else row['level'] 
                        for _, row in top_effects.iterrows()], fontsize=8)
    ax1.set_xlabel('Effect (pp)', fontsize=10)
    ax1.set_title('Top 8 Effects', fontsize=12, fontweight='bold')
    ax1.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax1.grid(axis='x', alpha=0.3)
    
    # Plot 2: Significance distribution (top-center)
    ax2 = fig.add_subplot(gs[0, 1])
    sig_counts = results_df['significance'].value_counts()
    colors2 = ['darkgreen', 'green', 'orange', 'lightcoral', 'gray']
    bars2 = ax2.bar(sig_counts.index, sig_counts.values, color=colors2[:len(sig_counts)], alpha=0.7)
    ax2.set_ylabel('Count', fontsize=10)
    ax2.set_title('Significance Distribution', fontsize=12, fontweight='bold')
    ax2.tick_params(axis='x', rotation=45)
    
    # Plot 3: Effect distribution (top-right)
    ax3 = fig.add_subplot(gs[0, 2])
    ax3.hist(results_df['pp_effect'], bins=15, alpha=0.7, color='skyblue', edgecolor='black')
    ax3.axvline(x=0, color='red', linestyle='--', alpha=0.7)
    ax3.set_xlabel('Effect (pp)', fontsize=10)
    ax3.set_ylabel('Frequency', fontsize=10)
    ax3.set_title('Effect Distribution', fontsize=12, fontweight='bold')
    ax3.grid(alpha=0.3)
    
    # Plot 4: Pricing analysis (middle-left)
    ax4 = fig.add_subplot(gs[1, 0])
    pricing_data = results_df[results_df['attribute'] == 'Pricing'].sort_values('pp_effect', ascending=True)
    colors4 = ['darkgreen' if x == '***' else 'orange' if x == '*' else 'gray' 
               for x in pricing_data['significance']]
    bars4 = ax4.barh(range(len(pricing_data)), pricing_data['pp_effect'], color=colors4, alpha=0.7)
    ax4.set_yticks(range(len(pricing_data)))
    ax4.set_yticklabels([x.replace('Free trial + ', '').replace('/month', '').replace('School pays (free for families)', 'Free') 
                        for x in pricing_data['level']], fontsize=9)
    ax4.set_xlabel('Effect (pp)', fontsize=10)
    ax4.set_title('Pricing Effects', fontsize=12, fontweight='bold')
    ax4.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax4.grid(axis='x', alpha=0.3)
    
    # Plot 5: Tutor analysis (middle-center)
    ax5 = fig.add_subplot(gs[1, 1])
    tutor_data = results_df[results_df['attribute'] == 'Tutor'].sort_values('pp_effect', ascending=True)
    colors5 = ['darkgreen' if x > 0 else 'darkred' for x in tutor_data['pp_effect']]
    bars5 = ax5.barh(range(len(tutor_data)), tutor_data['pp_effect'], color=colors5, alpha=0.7)
    ax5.set_yticks(range(len(tutor_data)))
    ax5.set_yticklabels(['Female', 'Male'], fontsize=10)
    ax5.set_xlabel('Effect (pp)', fontsize=10)
    ax5.set_title('Tutor Gender Effects', fontsize=12, fontweight='bold')
    ax5.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax5.grid(axis='x', alpha=0.3)
    
    # Plot 6: Engagement features (middle-right)
    ax6 = fig.add_subplot(gs[1, 2])
    engagement_data = results_df[results_df['attribute'].isin(['Storytelling', 'Role_play'])].sort_values('pp_effect', ascending=True)
    colors6 = ['darkgreen' if x > 0 else 'darkred' for x in engagement_data['pp_effect']]
    bars6 = ax6.barh(range(len(engagement_data)), engagement_data['pp_effect'], color=colors6, alpha=0.7)
    ax6.set_yticks(range(len(engagement_data)))
    ax6.set_yticklabels([row['level'][:20] + "..." if len(row['level']) > 23 else row['level'] 
                        for _, row in engagement_data.iterrows()], fontsize=8)
    ax6.set_xlabel('Effect (pp)', fontsize=10)
    ax6.set_title('Engagement Features', fontsize=12, fontweight='bold')
    ax6.axvline(x=0, color='black', linestyle='--', alpha=0.5)
    ax6.grid(axis='x', alpha=0.3)
    
    # Plot 7: Attribute importance (bottom-left)
    ax7 = fig.add_subplot(gs[2, 0])
    importance_data = []
    for attr in results_df['attribute'].unique():
        attr_data = results_df[results_df['attribute'] == attr]
        importance = attr_data['pp_effect'].max() - attr_data['pp_effect'].min()
        importance_data.append({'attribute': attr, 'importance': importance})
    
    importance_df = pd.DataFrame(importance_data).sort_values('importance', ascending=True)
    colors7 = ['darkgreen', 'green', 'orange', 'lightcoral', 'lightblue', 'lightgray', 'gray']
    bars7 = ax7.barh(range(len(importance_df)), importance_df['importance'], 
                    color=colors7[:len(importance_df)], alpha=0.7)
    ax7.set_yticks(range(len(importance_df)))
    ax7.set_yticklabels(importance_df['attribute'], fontsize=9)
    ax7.set_xlabel('Importance (pp)', fontsize=10)
    ax7.set_title('Attribute Importance', fontsize=12, fontweight='bold')
    ax7.grid(axis='x', alpha=0.3)
    
    # Plot 8: P-value distribution (bottom-center)
    ax8 = fig.add_subplot(gs[2, 1])
    ax8.hist(results_df['p_value'], bins=20, alpha=0.7, color='lightcoral', edgecolor='black')
    ax8.axvline(x=0.05, color='red', linestyle='--', alpha=0.7, label='p=0.05')
    ax8.axvline(x=0.01, color='orange', linestyle='--', alpha=0.7, label='p=0.01')
    ax8.axvline(x=0.001, color='darkred', linestyle='--', alpha=0.7, label='p=0.001')
    ax8.set_xlabel('P-value', fontsize=10)
    ax8.set_ylabel('Frequency', fontsize=10)
    ax8.set_title('P-value Distribution', fontsize=12, fontweight='bold')
    ax8.legend(fontsize=8)
    ax8.grid(alpha=0.3)
    
    # Plot 9: Summary statistics (bottom-right)
    ax9 = fig.add_subplot(gs[2, 2])
    ax9.axis('off')
    
    # Calculate summary statistics
    total_levels = len(results_df)
    significant = len(results_df[results_df['p_value'] < 0.05])
    highly_significant = len(results_df[results_df['p_value'] < 0.001])
    positive_effects = len(results_df[results_df['pp_effect'] > 0])
    negative_effects = len(results_df[results_df['pp_effect'] < 0])
    
    summary_text = f"""
    SUMMARY STATISTICS
    
    Total Attribute Levels: {total_levels}
    Significant (p<0.05): {significant} ({significant/total_levels*100:.1f}%)
    Highly Significant (p<0.001): {highly_significant} ({highly_significant/total_levels*100:.1f}%)
    
    Positive Effects: {positive_effects} ({positive_effects/total_levels*100:.1f}%)
    Negative Effects: {negative_effects} ({negative_effects/total_levels*100:.1f}%)
    
    Largest Effect: +{results_df['pp_effect'].max():.1f} pp
    Smallest Effect: {results_df['pp_effect'].min():.1f} pp
    
    Most Important Attribute: {importance_df.iloc[-1]['attribute']}
    """
    
    ax9.text(0.1, 0.9, summary_text, transform=ax9.transAxes, fontsize=10,
            verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    plt.suptitle('Granular Conjoint Analysis - Comprehensive Dashboard', fontsize=16, fontweight='bold')
    plt.savefig('/Users/charlie/github.com/hai/SheRockets/data_analysis/granular_comprehensive_dashboard.png', 
               dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    print("Creating granular conjoint visualizations...")
    create_granular_visualizations()
    
    print("\nVisualizations created:")
    print("- granular_main_effects.png")
    print("- granular_pricing_analysis.png")
    print("- granular_rating_analysis.png")
    print("- granular_attribute_importance.png")
    print("- granular_comprehensive_dashboard.png")
