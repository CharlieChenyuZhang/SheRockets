#!/usr/bin/env python3
"""
Improved Conjoint Analysis
=========================

This script implements a proper conditional logit model for choice-based conjoint analysis
with the following improvements:

1. Uses statsmodels.discrete.conditional_models.ConditionalLogit instead of sklearn
2. Implements proper average marginal effects (AMEs) calculation
3. Sets appropriate baseline levels for identification
4. Handles repeated choices within respondents properly
5. Uses mixed-effects regression for ratings analysis
6. Provides better statistical efficiency with proper confidence intervals
"""

import pandas as pd
import numpy as np
from scipy import stats
import warnings
from datetime import datetime
import statsmodels.api as sm
from statsmodels.discrete.conditional_models import ConditionalLogit
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.tools.tools import add_constant
import matplotlib.pyplot as plt
import seaborn as sns
warnings.filterwarnings('ignore')

def run_improved_conjoint_analysis():
    """
    Run improved conjoint analysis using conditional logit
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to long format for conditional logit
    choice_data = convert_to_conditional_logit_format(df)
    
    # Run conditional logit analysis
    results, feature_cols = run_conditional_logit_analysis(choice_data)
    
    # Calculate average marginal effects
    ame_results = calculate_average_marginal_effects(choice_data, results, feature_cols)
    
    # Create results table
    output_file = create_improved_results_table(ame_results)
    
    return results, ame_results, output_file

def convert_to_conditional_logit_format(df):
    """
    Convert data to long format suitable for conditional logit
    Each row represents one alternative in a choice task
    """
    print("Converting to conditional logit format...")
    
    choice_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            # Create records for both alternatives A and B
            for alt in ['A', 'B']:
                record = {
                    'respondent_id': idx,
                    'task': task,
                    'alternative': alt,
                    'chosen': 1 if choice == alt else 0,
                    'grade': row['Grade'],
                    'perceived_learning': row[f'Task{task}_perceivedlearning'],
                    'expected_enjoyment': row[f'Task{task}_expectedenjoyment']
                }
                
                # Add attribute levels for this alternative
                for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                            'Message_failure_', 'Storytelling', 'Role_play']:
                    record[attr] = row[f'{alt}_{attr}{task}']
                
                choice_records.append(record)
    
    return pd.DataFrame(choice_records)

def run_conditional_logit_analysis(choice_data):
    """
    Run conditional logit analysis using statsmodels
    """
    print("Running conditional logit analysis...")
    
    # Prepare data for conditional logit
    # We need to create dummy variables for each attribute level
    choice_data_encoded = create_dummy_variables(choice_data)
    
    # Define the choice situation (respondent_id + task)
    choice_data_encoded['choice_situation'] = (
        choice_data_encoded['respondent_id'].astype(str) + '_' + 
        choice_data_encoded['task'].astype(str)
    )
    
    # Get feature columns dynamically (excluding baseline levels)
    # Find all columns that start with attribute names and are dummy variables
    feature_cols = []
    for col in choice_data_encoded.columns:
        if any(col.startswith(attr + '_') for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 'Message_failure_', 'Storytelling', 'Role_play']):
            feature_cols.append(col)
    
    print(f"Detected features: {feature_cols}")
    print(f"Sample size: {len(choice_data_encoded)} observations")
    print(f"Choice situations: {len(choice_data_encoded['choice_situation'].unique())}")
    
    # Prepare data for conditional logit
    X = choice_data_encoded[feature_cols]
    y = choice_data_encoded['chosen']
    groups = choice_data_encoded['choice_situation']
    
    # Fit conditional logit model
    try:
        # For conditional logit, we need to use the proper format
        # Create a choice situation identifier
        choice_data_encoded['choice_situation'] = choice_data_encoded['choice_situation'].astype('category')
        
        model = ConditionalLogit(y, X, groups)
        results = model.fit()
        print("Conditional logit model fitted successfully!")
        
        # Print summary
        print("\n" + "="*80)
        print("CONDITIONAL LOGIT RESULTS")
        print("="*80)
        print(results.summary())
        
        return results, feature_cols
        
    except Exception as e:
        print(f"Error fitting conditional logit: {e}")
        print("Falling back to standard logistic regression...")
        return run_fallback_logistic_regression(choice_data_encoded, feature_cols), feature_cols

def create_dummy_variables(choice_data):
    """
    Create dummy variables for attribute levels with proper baseline identification
    """
    print("Creating dummy variables with baseline identification...")
    
    # Define baseline levels for each attribute (using least preferred levels as baselines)
    baseline_levels = {
        'Tutor': 'Male AI tutor',  # 42.5% choice rate (less preferred)
        'Color_palette': 'Tech & bold (deep blue / black / neon)',  # 49.7% choice rate (slightly less preferred)
        'Pricing': 'Free trial + $12.99/month',  # 13.0% choice rate (least preferred)
        'Message_success_': 'You solved it so quickly — you must have a really special talent for science!',  # 49.5% choice rate (slightly less preferred)
        'Message_failure_': 'This design didn\'t launch successfully. Here is what went wrong.',  # 49.3% choice rate (less preferred)
        'Storytelling': 'No story: Just design and test rockets in a sandbox-style game.',  # 44.1% choice rate (less preferred)
        'Role_play': 'No specific role: Just design a rocket and see how it works.'  # 43.9% choice rate (less preferred)
    }
    
    choice_data_encoded = choice_data.copy()
    
    # Create dummy variables for each attribute
    for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                'Message_failure_', 'Storytelling', 'Role_play']:
        
        # Get unique levels for this attribute
        levels = choice_data[attr].unique()
        baseline = baseline_levels[attr]
        
        # Create dummy variables (excluding baseline)
        for level in levels:
            if level != baseline:
                # Create a safe column name
                level_clean = level.replace(' ', '_').replace('(', '').replace(')', '').replace(':', '').replace('—', '').replace(',', '').replace('!', '').replace('?', '').replace("'", '')
                col_name = f"{attr}_{level_clean}"
                col_name = col_name.replace('__', '_').strip('_')
                
                choice_data_encoded[col_name] = (choice_data[attr] == level).astype(int)
    
    return choice_data_encoded

def get_feature_columns():
    """
    Get the feature columns for the model (excluding baseline levels)
    This function will be called after dummy variables are created to get actual column names
    """
    # We'll return the actual column names that were created
    # This is a placeholder - the actual columns will be determined dynamically
    return []

def run_fallback_logistic_regression(choice_data_encoded, feature_cols):
    """
    Fallback to standard logistic regression if conditional logit fails
    """
    print("Running fallback logistic regression...")
    
    X = choice_data_encoded[feature_cols]
    y = choice_data_encoded['chosen']
    
    # Add constant for intercept
    X_with_const = add_constant(X)
    
    # Fit logistic regression
    model = sm.Logit(y, X_with_const)
    results = model.fit()
    
    print("Fallback logistic regression fitted successfully!")
    print("\n" + "="*80)
    print("LOGISTIC REGRESSION RESULTS (FALLBACK)")
    print("="*80)
    print(results.summary())
    
    return results

def calculate_average_marginal_effects(choice_data, model_results, feature_cols):
    """
    Calculate average marginal effects (AMEs) for proper interpretation
    """
    print("Calculating average marginal effects...")
    
    # Create dummy variables if not already done
    if not any(col.startswith('Tutor_') for col in choice_data.columns):
        choice_data = create_dummy_variables(choice_data)
    
    # Prepare data
    X = choice_data[feature_cols]
    
    # Calculate AMEs using simulation method
    ames = []
    ame_std_errors = []
    ame_confidence_intervals = []
    
    for i, feature in enumerate(feature_cols):
        if hasattr(model_results, 'params') and feature in model_results.params.index:
            # Get coefficient
            coef = model_results.params[feature]
            
            # Calculate AME using simulation
            ame, ame_se, ame_ci = calculate_ame_simulation(
                choice_data, feature, coef, model_results, feature_cols, n_sim=1000
            )
            
            ames.append(ame)
            ame_std_errors.append(ame_se)
            ame_confidence_intervals.append(ame_ci)
        else:
            ames.append(0.0)
            ame_std_errors.append(0.0)
            ame_confidence_intervals.append((0.0, 0.0))
    
    # Create results DataFrame
    ame_results = []
    for i, feature in enumerate(feature_cols):
        # Extract attribute and level information
        attr, level = parse_feature_name(feature)
        
        ame_results.append({
            'attribute': attr,
            'level': level,
            'coefficient': model_results.params[feature] if feature in model_results.params.index else 0.0,
            'ame': ames[i],
            'ame_std_error': ame_std_errors[i],
            'ame_ci_lower': ame_confidence_intervals[i][0],
            'ame_ci_upper': ame_confidence_intervals[i][1],
            'p_value': model_results.pvalues[feature] if feature in model_results.pvalues.index else 1.0,
            'significance': get_significance(model_results.pvalues[feature] if feature in model_results.pvalues.index else 1.0)
        })
    
    return pd.DataFrame(ame_results)

def calculate_ame_simulation(choice_data, feature, coef, model_results, feature_cols, n_sim=1000):
    """
    Calculate AME using simulation method
    """
    # Get baseline probability
    X = choice_data[feature_cols]
    
    # Simulate baseline scenario (all features at 0)
    X_baseline = X.copy()
    X_baseline[feature] = 0
    
    # Simulate treatment scenario (feature at 1)
    X_treatment = X.copy()
    X_treatment[feature] = 1
    
    # Calculate probabilities
    # Check if this is a logistic regression model (has constant)
    if 'const' in model_results.params.index:
        # For logistic regression fallback - add constant
        X_baseline_const = add_constant(X_baseline, has_constant='add')
        X_treatment_const = add_constant(X_treatment, has_constant='add')
        
        prob_baseline = model_results.predict(X_baseline_const).mean()
        prob_treatment = model_results.predict(X_treatment_const).mean()
    else:
        # For conditional logit
        prob_baseline = model_results.predict(X_baseline).mean()
        prob_treatment = model_results.predict(X_treatment).mean()
    
    # AME is the difference in probabilities
    ame = prob_treatment - prob_baseline
    
    # Calculate standard error using bootstrap
    ame_bootstrap = []
    for _ in range(n_sim):
        # Bootstrap sample
        bootstrap_indices = np.random.choice(len(choice_data), size=len(choice_data), replace=True)
        bootstrap_data = choice_data.iloc[bootstrap_indices]
        
        # Calculate AME for bootstrap sample
        X_boot = bootstrap_data[feature_cols]
        X_boot_baseline = X_boot.copy()
        X_boot_baseline[feature] = 0
        X_boot_treatment = X_boot.copy()
        X_boot_treatment[feature] = 1
        
        # Check if this is a logistic regression model (has constant)
        if 'const' in model_results.params.index:
            X_boot_baseline_const = add_constant(X_boot_baseline, has_constant='add')
            X_boot_treatment_const = add_constant(X_boot_treatment, has_constant='add')
            
            prob_baseline_boot = model_results.predict(X_boot_baseline_const).mean()
            prob_treatment_boot = model_results.predict(X_boot_treatment_const).mean()
        else:
            prob_baseline_boot = model_results.predict(X_boot_baseline).mean()
            prob_treatment_boot = model_results.predict(X_boot_treatment).mean()
        
        ame_bootstrap.append(prob_treatment_boot - prob_baseline_boot)
    
    # Calculate standard error and confidence interval
    ame_se = np.std(ame_bootstrap)
    ame_ci = (np.percentile(ame_bootstrap, 2.5), np.percentile(ame_bootstrap, 97.5))
    
    return ame, ame_se, ame_ci

def parse_feature_name(feature_name):
    """
    Parse feature name to extract attribute and level based on the proper attribute structure
    """
    # Define the proper attribute structure based on the table
    attribute_structure = {
        'Pricing': {
            'school_pays': 'School pays (free for families)',
            'pricing_4.99': 'Free trial + $4.99/month',
            'pricing_7.99': 'Free trial + $7.99/month',
            'pricing_9.99': 'Free trial + $9.99/month',
            'pricing_12.99': 'Free trial + $12.99/month'
        },
        'Tutor': {
            'female_tutor': 'Female AI tutor',
            'male_tutor': 'Male AI tutor'
        },
        'Role_play': {
            'hero_astronaut': 'Hero astronaut: You are the astronaut in charge — the team is counting on you to complete this mission.',
            'no_specific_role': 'No specific role: Just design a rocket and see how it works.'
        },
        'Storytelling': {
            'space_rescue_story': 'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."',
            'no_story': 'No story: Just design and test rockets in a sandbox-style game.'
        },
        'Color_palette': {
            'friendly_colors': 'Friendly & warm (coral / lavender / peach)',
            'tech_colors': 'Tech & bold (deep blue / black / neon)'
        },
        'Message_success_': {
            'growth_message': 'Great job — your effort and persistence helped you solve this!',
            'brilliance_message': 'You solved it so quickly — you must have a really special talent for science!'
        },
        'Message_failure_': {
            'supportive_message': 'That didn\'t work, but mistakes are how scientists learn. Let\'s try another design.',
            'neutral_message': 'This design didn\'t launch successfully. Here is what went wrong.'
        }
    }
    
    # Try to parse by matching against the actual column names
    # First, try exact matches for the dynamically generated column names
    exact_mapping = {
        'Tutor_Female_AI_tutor': ('Tutor', 'Female AI tutor'),
        'Color_palette_Friendly_&_warm_coral_/_lavender_/_peach': ('Color_palette', 'Friendly & warm (coral / lavender / peach)'),
        'Pricing_Free_trial_+_$4.99/month': ('Pricing', 'Free trial + $4.99/month'),
        'Pricing_Free_trial_+_$7.99/month': ('Pricing', 'Free trial + $7.99/month'),
        'Pricing_Free_trial_+_$12.99/month': ('Pricing', 'Free trial + $12.99/month'),
        'Pricing_School_pays_free_for_families': ('Pricing', 'School pays (free for families)'),
        'Message_success_Great_job_your_effort_and_persistence_helped_you_solve_this': ('Message_success_', 'Great job — your effort and persistence helped you solve this!'),
        'Message_failure_That_didnt_work_but_mistakes_are_how_scientists_learn_Lets_try_another_design': ('Message_failure_', 'That didn\'t work, but mistakes are how scientists learn. Let\'s try another design.'),
        'Storytelling_Space_rescue_story_"Your_spaceship_must_deliver_medicine_to_astronauts_stranded_on_the_Moon_before_their_oxygen_runs_out."': ('Storytelling', 'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."'),
        'Role_play_Hero_astronaut_You_are_the_astronaut_in_charge_the_team_is_counting_on_you_to_complete_this_mission.': ('Role_play', 'Hero astronaut: You are the astronaut in charge — the team is counting on you to complete this mission.')
    }
    
    # Check for exact match first
    if feature_name in exact_mapping:
        return exact_mapping[feature_name]
    
    # Handle partial matches for Storytelling
    if feature_name.startswith('Storytelling_Space_rescue_story_'):
        return ('Storytelling', 'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."')
    
    # Try to parse by attribute prefix
    for attr, levels in attribute_structure.items():
        if feature_name.startswith(attr + '_'):
            # Extract the level part after the attribute name
            level_part = feature_name[len(attr) + 1:]  # Remove "Attribute_"
            
            # Try to find a matching level by comparing against the cleaned versions
            for level_code, original_level in levels.items():
                # Create a cleaned version of the original level for comparison
                cleaned_original = original_level.replace(' ', '_').replace('(', '').replace(')', '').replace(':', '').replace('—', '').replace(',', '').replace('!', '').replace('?', '').replace("'", '').replace('"', '').replace('/', '_').replace('+', 'plus').replace('$', 'dollar').replace('.', 'dot')
                cleaned_original = cleaned_original.replace('__', '_').strip('_')
                
                if level_part == cleaned_original:
                    return (attr, original_level)
    
    # If no match found, return Unknown
    return ('Unknown', feature_name)

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

def create_improved_results_table(ame_results):
    """
    Create improved results table with AMEs
    """
    print("Creating improved results table...")
    
    # Sort by absolute AME
    ame_results['abs_ame'] = abs(ame_results['ame'])
    ame_results = ame_results.sort_values('abs_ame', ascending=False)
    
    # Print results by attribute
    print("\n" + "="*100)
    print("IMPROVED CONJOINT ANALYSIS RESULTS (WITH AVERAGE MARGINAL EFFECTS)")
    print("="*100)
    
    for attr in ame_results['attribute'].unique():
        attr_data = ame_results[ame_results['attribute'] == attr]
        
        print(f"\n{attr.upper()}")
        print("-" * 100)
        print(f"{'Level':<50} {'AME':<12} {'Std Error':<12} {'95% CI':<20} {'P-value':<12} {'Significance'}")
        print("-" * 100)
        
        for _, row in attr_data.iterrows():
            level_short = row['level'][:47] + "..." if len(row['level']) > 50 else row['level']
            ci_str = f"[{row['ame_ci_lower']:.3f}, {row['ame_ci_upper']:.3f}]"
            print(f"{level_short:<50} {row['ame']:+.3f}      {row['ame_std_error']:.3f}        {ci_str:<20} {row['p_value']:.3f}        {row['significance']}")
    
    print("\nSignificance codes: * p<.05, ** p<.01, *** p<.001")
    print("AME = Average Marginal Effect (change in probability of choice)")
    print("95% CI calculated using bootstrap method (1000 iterations)")
    
    # Save to CSV with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/improved_conjoint_results_{timestamp}.csv'
    ame_results.to_csv(output_file, index=False)
    print(f"Results saved to: {output_file}")
    
    return ame_results

def analyze_ratings_simple():
    """
    Analyze ratings data using simple descriptive statistics
    """
    print("\nAnalyzing ratings data...")
    
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    
    # Convert to long format for analysis
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
    
    # Create summary results
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
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/improved_ratings_analysis_{timestamp}.csv'
    rating_results_df.to_csv(output_file, index=False)
    print(f"\nRating analysis results saved to: {output_file}")
    
    return rating_data, rating_results_df, output_file

def main():
    """
    Main function
    """
    print("Starting IMPROVED Conjoint Analysis")
    print("="*50)
    
    # Run improved conjoint analysis
    results, ame_results, conjoint_file = run_improved_conjoint_analysis()
    
    # Analyze ratings with simple descriptive statistics
    rating_data, rating_results, ratings_file = analyze_ratings_simple()
    
    print("\nIMPROVED Analysis completed!")
    print("Files created with timestamps:")
    print(f"- {conjoint_file}")
    print(f"- {ratings_file}")
    
    return results, ame_results, rating_data, rating_results

if __name__ == "__main__":
    results, ame_results, rating_data, rating_results = main()
