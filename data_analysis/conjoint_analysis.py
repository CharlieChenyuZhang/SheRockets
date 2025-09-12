#!/usr/bin/env python3
"""
Conjoint Analysis for AI Tutor Study
====================================

This script performs comprehensive conjoint analysis on the AI tutor study data.
It includes choice modeling, utility estimation, importance analysis, and market simulation.

Author: Senior Data Scientist
Date: 2025
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

# Set style for better plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class ConjointAnalyzer:
    """
    Comprehensive Conjoint Analysis Class for AI Tutor Study
    """
    
    def __init__(self, data_path):
        """
        Initialize the analyzer with data path
        
        Args:
            data_path (str): Path to the cleaned CSV file
        """
        self.data_path = data_path
        self.df = None
        self.long_data = None
        self.utilities = {}
        self.importance = {}
        self.model_results = {}
        
        # Define attribute mappings based on the study design
        self.attributes = {
            'tutor': {
                'Female AI tutor': 'Female',
                'Male AI tutor': 'Male'
            },
            'color': {
                'Friendly & warm (coral / lavender / peach)': 'Warm',
                'Tech & bold (deep blue / black / neon)': 'Tech'
            },
            'pricing': {
                'School pays (free for families)': 'Free',
                'Free trial + $4.99/month': '$4.99',
                'Free trial + $7.99/month': '$7.99',
                'Free trial + $9.99/month': '$9.99',
                'Free trial + $12.99/month': '$12.99'
            },
            'message_success': {
                'Great job — your effort and persistence helped you solve this!': 'Growth',
                'You solved it so quickly — you must have a really special talent for science!': 'Brilliance'
            },
            'message_failure': {
                'That didn\'t work, but mistakes are how scientists learn. Let\'s try another design.': 'Supportive',
                'This design didn\'t launch successfully. Here is what went wrong.': 'Neutral'
            },
            'storytelling': {
                'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."': 'Story',
                'No story: Just design and test rockets in a sandbox-style game.': 'No_Story'
            },
            'role_play': {
                'Hero astronaut: "You are the astronaut in charge — the team is counting on you to complete this mission."': 'Role_Play',
                'No specific role: "Just design a rocket and see how it works."': 'No_Role'
            }
        }
        
    def load_and_preprocess_data(self):
        """
        Load and preprocess the conjoint data
        """
        print("Loading and preprocessing data...")
        
        # Load the data
        self.df = pd.read_csv(self.data_path)
        
        # Basic data info
        print(f"Dataset shape: {self.df.shape}")
        print(f"Number of respondents: {len(self.df)}")
        
        # Convert choice data to long format for analysis
        self._convert_to_long_format()
        
        # Clean and encode the data
        self._clean_and_encode_data()
        
        print("Data preprocessing completed!")
        
    def _convert_to_long_format(self):
        """
        Convert wide format data to long format for conjoint analysis
        """
        print("Converting to long format...")
        
        long_data_list = []
        
        for idx, row in self.df.iterrows():
            respondent_id = idx
            
            for task in range(1, 9):  # 8 tasks
                # Get choice (A=1, B=2)
                choice_col = f'Task{task}_choice'
                choice = row[choice_col]
                
                # Get ratings
                learning_col = f'Task{task}_perceivedlearning'
                enjoyment_col = f'Task{task}_expectedenjoyment'
                
                # Get attribute values for both options
                for option in ['A', 'B']:
                    record = {
                        'respondent_id': respondent_id,
                        'task': task,
                        'option': option,
                        'chosen': 1 if choice == option else 0,
                        'perceived_learning': row[learning_col] if choice == option else np.nan,
                        'expected_enjoyment': row[enjoyment_col] if choice == option else np.nan,
                        'grade': row['Grade'],
                        'prolific_id': row['Prolific_ID']
                    }
                    
                    # Add attribute values
                    for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                               'Message_failure_', 'Storytelling', 'Role_play']:
                        col_name = f'{option}_{attr}{task}'
                        if col_name in row:
                            record[attr.lower()] = row[col_name]
                    
                    long_data_list.append(record)
        
        self.long_data = pd.DataFrame(long_data_list)
        print(f"Long format data shape: {self.long_data.shape}")
        
    def _clean_and_encode_data(self):
        """
        Clean and encode the data for analysis
        """
        print("Cleaning and encoding data...")
        
        # Remove rows with missing attribute values
        self.long_data = self.long_data.dropna(subset=['tutor', 'color_palette', 'pricing', 
                                                      'message_success_', 'message_failure_', 
                                                      'storytelling', 'role_play'])
        
        # Create simplified attribute values
        self.long_data['tutor_simple'] = self.long_data['tutor'].map({
            'Female AI tutor': 'Female',
            'Male AI tutor': 'Male'
        })
        
        self.long_data['color_simple'] = self.long_data['color_palette'].map({
            'Friendly & warm (coral / lavender / peach)': 'Warm',
            'Tech & bold (deep blue / black / neon)': 'Tech'
        })
        
        self.long_data['pricing_simple'] = self.long_data['pricing'].map({
            'School pays (free for families)': 'Free',
            'Free trial + $4.99/month': '$4.99',
            'Free trial + $7.99/month': '$7.99',
            'Free trial + $9.99/month': '$9.99',
            'Free trial + $12.99/month': '$12.99'
        })
        
        self.long_data['message_success_simple'] = self.long_data['message_success_'].map({
            'Great job — your effort and persistence helped you solve this!': 'Growth',
            'You solved it so quickly — you must have a really special talent for science!': 'Brilliance'
        })
        
        self.long_data['message_failure_simple'] = self.long_data['message_failure_'].map({
            'That didn\'t work, but mistakes are how scientists learn. Let\'s try another design.': 'Supportive',
            'This design didn\'t launch successfully. Here is what went wrong.': 'Neutral'
        })
        
        self.long_data['storytelling_simple'] = self.long_data['storytelling'].map({
            'Space rescue story: "Your spaceship must deliver medicine to astronauts stranded on the Moon before their oxygen runs out."': 'Story',
            'No story: Just design and test rockets in a sandbox-style game.': 'No_Story'
        })
        
        self.long_data['role_play_simple'] = self.long_data['role_play'].map({
            'Hero astronaut: "You are the astronaut in charge — the team is counting on you to complete this mission."': 'Role_Play',
            'No specific role: "Just design a rocket and see how it works."': 'No_Role'
        })
        
        print(f"Final dataset shape: {self.long_data.shape}")
        
    def run_choice_modeling(self):
        """
        Run choice modeling using logistic regression
        """
        print("Running choice modeling...")
        
        # Prepare data for modeling
        model_data = self.long_data.copy()
        
        # Create dummy variables for all attributes
        dummy_vars = []
        for attr in ['tutor_simple', 'color_simple', 'pricing_simple', 
                    'message_success_simple', 'message_failure_simple', 
                    'storytelling_simple', 'role_play_simple']:
            dummies = pd.get_dummies(model_data[attr], prefix=attr)
            dummy_vars.append(dummies)
            model_data = pd.concat([model_data, dummies], axis=1)
        
        # Remove reference categories (first category of each attribute)
        reference_categories = [
            'tutor_simple_Female', 'color_simple_Warm', 'pricing_simple_Free',
            'message_success_simple_Growth', 'message_failure_simple_Supportive',
            'storytelling_simple_Story', 'role_play_simple_Role_Play'
        ]
        
        # Features for modeling
        feature_cols = [col for col in model_data.columns 
                       if any(attr in col for attr in ['tutor_simple_', 'color_simple_', 
                                                      'pricing_simple_', 'message_success_simple_',
                                                      'message_failure_simple_', 'storytelling_simple_',
                                                      'role_play_simple_']) 
                       and col not in reference_categories]
        
        X = model_data[feature_cols]
        y = model_data['chosen']
        
        # Fit logistic regression
        model = LogisticRegression(random_state=42, max_iter=1000)
        model.fit(X, y)
        
        # Store results
        self.model_results = {
            'model': model,
            'feature_names': feature_cols,
            'coefficients': model.coef_[0],
            'intercept': model.intercept_[0]
        }
        
        # Calculate utilities
        self._calculate_utilities()
        
        print("Choice modeling completed!")
        
    def _calculate_utilities(self):
        """
        Calculate part-worth utilities from model coefficients
        """
        print("Calculating part-worth utilities...")
        
        # Initialize utilities with reference categories (set to 0)
        self.utilities = {
            'tutor': {'Female': 0, 'Male': 0},
            'color': {'Warm': 0, 'Tech': 0},
            'pricing': {'Free': 0, '$4.99': 0, '$7.99': 0, '$9.99': 0, '$12.99': 0},
            'message_success': {'Growth': 0, 'Brilliance': 0},
            'message_failure': {'Supportive': 0, 'Neutral': 0},
            'storytelling': {'Story': 0, 'No_Story': 0},
            'role_play': {'Role_Play': 0, 'No_Role': 0}
        }
        
        # Map coefficients to utilities
        for i, feature in enumerate(self.model_results['feature_names']):
            coef = self.model_results['coefficients'][i]
            
            if 'tutor_simple_Male' in feature:
                self.utilities['tutor']['Male'] = coef
            elif 'color_simple_Tech' in feature:
                self.utilities['color']['Tech'] = coef
            elif 'pricing_simple_' in feature:
                price = feature.split('_')[-1]
                self.utilities['pricing'][price] = coef
            elif 'message_success_simple_Brilliance' in feature:
                self.utilities['message_success']['Brilliance'] = coef
            elif 'message_failure_simple_Neutral' in feature:
                self.utilities['message_failure']['Neutral'] = coef
            elif 'storytelling_simple_No_Story' in feature:
                self.utilities['storytelling']['No_Story'] = coef
            elif 'role_play_simple_No_Role' in feature:
                self.utilities['role_play']['No_Role'] = coef
        
        # Calculate importance scores
        self._calculate_importance()
        
    def _calculate_importance(self):
        """
        Calculate attribute importance scores
        """
        print("Calculating attribute importance...")
        
        for attr, levels in self.utilities.items():
            if attr == 'pricing':
                # For pricing, calculate range
                values = list(levels.values())
                self.importance[attr] = max(values) - min(values)
            else:
                # For binary attributes, use absolute difference
                values = list(levels.values())
                self.importance[attr] = abs(values[1] - values[0])
        
        # Normalize importance scores to percentages
        total_importance = sum(self.importance.values())
        for attr in self.importance:
            self.importance[attr] = (self.importance[attr] / total_importance) * 100
            
    def analyze_ratings(self):
        """
        Analyze the perceived learning and expected enjoyment ratings
        """
        print("Analyzing ratings...")
        
        # Get chosen options only
        chosen_data = self.long_data[self.long_data['chosen'] == 1].copy()
        
        # Calculate average ratings by attribute
        rating_analysis = {}
        
        for attr in ['tutor_simple', 'color_simple', 'pricing_simple', 
                    'message_success_simple', 'message_failure_simple', 
                    'storytelling_simple', 'role_play_simple']:
            
            rating_analysis[attr] = chosen_data.groupby(attr).agg({
                'perceived_learning': ['mean', 'std', 'count'],
                'expected_enjoyment': ['mean', 'std', 'count']
            }).round(3)
        
        return rating_analysis
        
    def create_visualizations(self):
        """
        Create comprehensive visualizations - one at a time with timestamps
        """
        print("Creating visualizations...")
        
        # Create results directory
        import os
        from datetime import datetime
        
        results_dir = '/Users/charlie/github.com/hai/SheRockets/data_analysis/results'
        os.makedirs(results_dir, exist_ok=True)
        
        # Get timestamp for file naming
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Debug information
        print(f"Long data shape: {self.long_data.shape}")
        print(f"Long data columns: {list(self.long_data.columns)}")
        chosen_data = self.long_data[self.long_data['chosen'] == 1]
        print(f"Chosen data shape: {chosen_data.shape}")
        if not chosen_data.empty:
            print(f"Chosen data columns: {list(chosen_data.columns)}")
            print(f"Sample of chosen data:\n{chosen_data.head()}")
        
        # Create individual visualizations
        self._create_importance_plot(results_dir, timestamp)
        self._create_utility_heatmap(results_dir, timestamp)
        self._create_pricing_analysis(results_dir, timestamp)
        self._create_choice_distribution(results_dir, timestamp)
        self._create_learning_ratings(results_dir, timestamp, chosen_data)
        self._create_enjoyment_ratings(results_dir, timestamp, chosen_data)
        self._create_interaction_plot(results_dir, timestamp, chosen_data)
        self._create_grade_distribution(results_dir, timestamp)
        
        print(f"All visualizations saved to {results_dir}/")
        
    def _create_importance_plot(self, results_dir, timestamp):
        """Create attribute importance plot"""
        print("Creating attribute importance plot...")
        
        plt.figure(figsize=(10, 6))
        importance_df = pd.DataFrame(list(self.importance.items()), 
                                   columns=['Attribute', 'Importance'])
        importance_df = importance_df.sort_values('Importance', ascending=True)
        
        bars = plt.barh(importance_df['Attribute'], importance_df['Importance'])
        plt.xlabel('Importance (%)')
        plt.title('Attribute Importance in Choice Decisions')
        plt.grid(axis='x', alpha=0.3)
        
        # Add value labels on bars
        for i, bar in enumerate(bars):
            width = bar.get_width()
            plt.text(width + 0.5, bar.get_y() + bar.get_height()/2, 
                    f'{width:.1f}%', ha='left', va='center')
        
        plt.tight_layout()
        filename = f"{results_dir}/01_attribute_importance_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_utility_heatmap(self, results_dir, timestamp):
        """Create part-worth utilities heatmap"""
        print("Creating part-worth utilities heatmap...")
        
        plt.figure(figsize=(12, 8))
        utility_matrix = []
        labels = []
        
        for attr, levels in self.utilities.items():
            for level, utility in levels.items():
                utility_matrix.append([utility])
                labels.append(f"{attr.replace('_', ' ').title()}\n{level}")
        
        utility_df = pd.DataFrame(utility_matrix, index=labels, columns=['Utility'])
        sns.heatmap(utility_df, annot=True, cmap='RdYlBu_r', center=0, 
                   fmt='.3f', cbar_kws={'label': 'Part-worth Utility'})
        plt.title('Part-worth Utilities by Attribute Level')
        plt.ylabel('')
        
        plt.tight_layout()
        filename = f"{results_dir}/02_partworth_utilities_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_pricing_analysis(self, results_dir, timestamp):
        """Create pricing sensitivity analysis"""
        print("Creating pricing sensitivity analysis...")
        
        plt.figure(figsize=(10, 6))
        pricing_utils = list(self.utilities['pricing'].values())
        pricing_labels = list(self.utilities['pricing'].keys())
        
        plt.plot(pricing_labels, pricing_utils, marker='o', linewidth=2, markersize=8)
        plt.xlabel('Pricing Level')
        plt.ylabel('Part-worth Utility')
        plt.title('Pricing Sensitivity Analysis')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        filename = f"{results_dir}/03_pricing_sensitivity_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_choice_distribution(self, results_dir, timestamp):
        """Create choice distribution by task"""
        print("Creating choice distribution plot...")
        
        plt.figure(figsize=(10, 6))
        choice_dist = self.long_data.groupby(['task', 'option']).size().unstack(fill_value=0)
        choice_dist_pct = choice_dist.div(choice_dist.sum(axis=1), axis=0) * 100
        
        choice_dist_pct.plot(kind='bar', stacked=True)
        plt.xlabel('Task Number')
        plt.ylabel('Choice Percentage (%)')
        plt.title('Choice Distribution by Task')
        plt.legend(title='Option')
        plt.xticks(rotation=0)
        
        plt.tight_layout()
        filename = f"{results_dir}/04_choice_distribution_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_learning_ratings(self, results_dir, timestamp, chosen_data):
        """Create perceived learning ratings plot"""
        print("Creating perceived learning ratings plot...")
        
        plt.figure(figsize=(10, 6))
        try:
            if not chosen_data.empty and 'perceived_learning' in chosen_data.columns:
                sns.boxplot(data=chosen_data, x='tutor_simple', y='perceived_learning')
                plt.xlabel('Tutor Type')
                plt.ylabel('Perceived Learning Rating')
                plt.title('Perceived Learning by Tutor Type')
            else:
                plt.text(0.5, 0.5, 'No perceived learning data available', 
                        ha='center', va='center', transform=plt.gca().transAxes)
                plt.title('Perceived Learning by Tutor Type')
        except Exception as e:
            plt.text(0.5, 0.5, f'Error creating learning plot: {str(e)}', 
                    ha='center', va='center', transform=plt.gca().transAxes)
            plt.title('Perceived Learning by Tutor Type')
        
        plt.tight_layout()
        filename = f"{results_dir}/05_perceived_learning_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_enjoyment_ratings(self, results_dir, timestamp, chosen_data):
        """Create expected enjoyment ratings plot"""
        print("Creating expected enjoyment ratings plot...")
        
        plt.figure(figsize=(10, 6))
        try:
            if not chosen_data.empty and 'expected_enjoyment' in chosen_data.columns:
                sns.boxplot(data=chosen_data, x='tutor_simple', y='expected_enjoyment')
                plt.xlabel('Tutor Type')
                plt.ylabel('Expected Enjoyment Rating')
                plt.title('Expected Enjoyment by Tutor Type')
            else:
                plt.text(0.5, 0.5, 'No expected enjoyment data available', 
                        ha='center', va='center', transform=plt.gca().transAxes)
                plt.title('Expected Enjoyment by Tutor Type')
        except Exception as e:
            plt.text(0.5, 0.5, f'Error creating enjoyment plot: {str(e)}', 
                    ha='center', va='center', transform=plt.gca().transAxes)
            plt.title('Expected Enjoyment by Tutor Type')
        
        plt.tight_layout()
        filename = f"{results_dir}/06_expected_enjoyment_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_interaction_plot(self, results_dir, timestamp, chosen_data):
        """Create storytelling vs role play interaction plot"""
        print("Creating storytelling vs role play interaction plot...")
        
        plt.figure(figsize=(10, 6))
        try:
            interaction_data = chosen_data.groupby(['storytelling_simple', 'role_play_simple']).size().unstack(fill_value=0)
            if interaction_data.size > 0 and not interaction_data.empty:
                sns.heatmap(interaction_data, annot=True, fmt='d', cmap='Blues')
                plt.title('Choice Count: Storytelling vs Role Play')
                plt.xlabel('Role Play')
                plt.ylabel('Storytelling')
            else:
                plt.text(0.5, 0.5, 'No interaction data available', 
                        ha='center', va='center', transform=plt.gca().transAxes)
                plt.title('Choice Count: Storytelling vs Role Play')
        except Exception as e:
            plt.text(0.5, 0.5, f'Error creating interaction plot: {str(e)}', 
                    ha='center', va='center', transform=plt.gca().transAxes)
            plt.title('Choice Count: Storytelling vs Role Play')
        
        plt.tight_layout()
        filename = f"{results_dir}/07_storytelling_roleplay_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def _create_grade_distribution(self, results_dir, timestamp):
        """Create grade distribution plot"""
        print("Creating grade distribution plot...")
        
        plt.figure(figsize=(10, 6))
        try:
            if 'Grade' in self.df.columns and not self.df['Grade'].isna().all():
                grade_dist = self.df['Grade'].value_counts().sort_index()
                if not grade_dist.empty:
                    plt.bar(grade_dist.index, grade_dist.values)
                    plt.xlabel('Grade Level')
                    plt.ylabel('Number of Respondents')
                    plt.title('Distribution of Daughter\'s Grade Level')
                    plt.xticks(rotation=45)
                else:
                    plt.text(0.5, 0.5, 'No grade data available', 
                            ha='center', va='center', transform=plt.gca().transAxes)
                    plt.title('Distribution of Daughter\'s Grade Level')
            else:
                plt.text(0.5, 0.5, 'No grade data available', 
                        ha='center', va='center', transform=plt.gca().transAxes)
                plt.title('Distribution of Daughter\'s Grade Level')
        except Exception as e:
            plt.text(0.5, 0.5, f'Error creating grade plot: {str(e)}', 
                    ha='center', va='center', transform=plt.gca().transAxes)
            plt.title('Distribution of Daughter\'s Grade Level')
        
        plt.tight_layout()
        filename = f"{results_dir}/08_grade_distribution_{timestamp}.png"
        plt.savefig(filename, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Saved: {filename}")
        
    def market_simulation(self, scenarios=None):
        """
        Run market simulation for different product configurations
        """
        print("Running market simulation...")
        
        if scenarios is None:
            # Default scenarios based on key insights
            scenarios = {
                'Premium Female': {
                    'tutor': 'Female',
                    'color': 'Warm',
                    'pricing': 'Free',
                    'message_success': 'Growth',
                    'message_failure': 'Supportive',
                    'storytelling': 'Story',
                    'role_play': 'Role_Play'
                },
                'Tech Male': {
                    'tutor': 'Male',
                    'color': 'Tech',
                    'pricing': '$7.99',
                    'message_success': 'Brilliance',
                    'message_failure': 'Neutral',
                    'storytelling': 'No_Story',
                    'role_play': 'No_Role'
                },
                'Balanced': {
                    'tutor': 'Female',
                    'color': 'Warm',
                    'pricing': '$4.99',
                    'message_success': 'Growth',
                    'message_failure': 'Supportive',
                    'storytelling': 'Story',
                    'role_play': 'No_Role'
                }
            }
        
        # Calculate utilities for each scenario
        scenario_utilities = {}
        
        for scenario_name, config in scenarios.items():
            total_utility = 0
            
            for attr, level in config.items():
                if attr in self.utilities and level in self.utilities[attr]:
                    total_utility += self.utilities[attr][level]
            
            scenario_utilities[scenario_name] = total_utility
        
        # Convert utilities to choice probabilities
        utilities_array = np.array(list(scenario_utilities.values()))
        exp_utilities = np.exp(utilities_array)
        choice_probs = exp_utilities / np.sum(exp_utilities)
        
        # Create results dataframe
        simulation_results = pd.DataFrame({
            'Scenario': list(scenario_utilities.keys()),
            'Total_Utility': list(scenario_utilities.values()),
            'Choice_Probability': choice_probs
        }).sort_values('Choice_Probability', ascending=False)
        
        return simulation_results
        
    def statistical_tests(self):
        """
        Perform statistical significance tests
        """
        print("Performing statistical tests...")
        
        chosen_data = self.long_data[self.long_data['chosen'] == 1]
        
        # Test differences in ratings by tutor type
        female_learning = chosen_data[chosen_data['tutor_simple'] == 'Female']['perceived_learning']
        male_learning = chosen_data[chosen_data['tutor_simple'] == 'Male']['perceived_learning']
        
        female_enjoyment = chosen_data[chosen_data['tutor_simple'] == 'Female']['expected_enjoyment']
        male_enjoyment = chosen_data[chosen_data['tutor_simple'] == 'Male']['expected_enjoyment']
        
        # T-tests
        learning_ttest = stats.ttest_ind(female_learning, male_learning)
        enjoyment_ttest = stats.ttest_ind(female_enjoyment, male_enjoyment)
        
        # Chi-square test for choice preferences
        choice_by_tutor = pd.crosstab(self.long_data['tutor_simple'], self.long_data['chosen'])
        chi2_test = stats.chi2_contingency(choice_by_tutor)
        
        test_results = {
            'learning_ttest': {
                'statistic': learning_ttest.statistic,
                'pvalue': learning_ttest.pvalue,
                'female_mean': female_learning.mean(),
                'male_mean': male_learning.mean()
            },
            'enjoyment_ttest': {
                'statistic': enjoyment_ttest.statistic,
                'pvalue': enjoyment_ttest.pvalue,
                'female_mean': female_enjoyment.mean(),
                'male_mean': male_enjoyment.mean()
            },
            'choice_chi2': {
                'statistic': chi2_test[0],
                'pvalue': chi2_test[1],
                'contingency_table': choice_by_tutor
            }
        }
        
        return test_results
        
    def generate_report(self):
        """
        Generate comprehensive analysis report
        """
        print("Generating comprehensive report...")
        
        # Run all analyses
        rating_analysis = self.analyze_ratings()
        simulation_results = self.market_simulation()
        test_results = self.statistical_tests()
        
        # Create report
        report = f"""
CONJOINT ANALYSIS REPORT - AI TUTOR STUDY
==========================================

EXECUTIVE SUMMARY
-----------------
This report presents the results of a conjoint analysis study examining parent preferences 
for AI tutor features for their K-12 daughters. The study included {len(self.df)} respondents 
who completed 8 choice tasks each, resulting in {len(self.long_data)} total observations.

KEY FINDINGS
------------
1. Most Important Attributes (by importance score):
"""
        
        # Add importance rankings
        importance_ranked = sorted(self.importance.items(), key=lambda x: x[1], reverse=True)
        for i, (attr, importance) in enumerate(importance_ranked, 1):
            report += f"   {i}. {attr.replace('_', ' ').title()}: {importance:.1f}%\n"
        
        report += f"""
2. Part-worth Utilities:
"""
        
        # Add utilities for each attribute
        for attr, levels in self.utilities.items():
            report += f"\n   {attr.replace('_', ' ').title()}:\n"
            for level, utility in levels.items():
                report += f"     - {level}: {utility:.3f}\n"
        
        report += f"""
3. Market Simulation Results:
"""
        
        # Add simulation results
        for _, row in simulation_results.iterrows():
            report += f"   - {row['Scenario']}: {row['Choice_Probability']:.1%} market share\n"
        
        report += f"""
4. Statistical Significance Tests:
   - Perceived Learning (Female vs Male): t={test_results['learning_ttest']['statistic']:.3f}, p={test_results['learning_ttest']['pvalue']:.3f}
   - Expected Enjoyment (Female vs Male): t={test_results['enjoyment_ttest']['statistic']:.3f}, p={test_results['enjoyment_ttest']['pvalue']:.3f}
   - Choice Preference (Chi-square): χ²={test_results['choice_chi2']['statistic']:.3f}, p={test_results['choice_chi2']['pvalue']:.3f}

BUSINESS RECOMMENDATIONS
------------------------
Based on the analysis, the following recommendations are made:

1. Focus on the most important attributes: {importance_ranked[0][0].replace('_', ' ').title()} and {importance_ranked[1][0].replace('_', ' ').title()}

2. Optimal product configuration appears to be: {simulation_results.iloc[0]['Scenario']}

3. Consider the trade-offs between different attribute levels based on the part-worth utilities

4. Further research may be needed to understand the underlying drivers of these preferences

TECHNICAL DETAILS
-----------------
- Sample size: {len(self.df)} respondents
- Total observations: {len(self.long_data)}
- Model type: Logistic Regression
- Attributes analyzed: {len(self.attributes)}
- Tasks per respondent: 8

"""
        
        # Save report
        with open('/Users/charlie/github.com/hai/SheRockets/data_analysis/conjoint_report.txt', 'w') as f:
            f.write(report)
        
        print("Report saved to conjoint_report.txt")
        return report

def main():
    """
    Main function to run the complete conjoint analysis
    """
    print("Starting Conjoint Analysis for AI Tutor Study")
    print("=" * 50)
    
    # Initialize analyzer
    analyzer = ConjointAnalyzer('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    
    # Run complete analysis
    analyzer.load_and_preprocess_data()
    analyzer.run_choice_modeling()
    analyzer.create_visualizations()
    
    # Generate and display report
    report = analyzer.generate_report()
    print(report)
    
    print("\nAnalysis completed! Check the following files:")
    print("- conjoint_analysis_results.png (visualizations)")
    print("- conjoint_report.txt (detailed report)")
    
    return analyzer

if __name__ == "__main__":
    analyzer = main()
