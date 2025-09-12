#!/usr/bin/env python3
"""
Machine Learning Conjoint Analysis
=================================

Alternative approaches using Random Forest, XGBoost, and other ML methods
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

def run_ml_conjoint_analysis():
    """
    Run conjoint analysis using machine learning methods
    """
    print("Loading data...")
    df = pd.read_csv('/Users/charlie/github.com/hai/SheRockets/data_analysis/cleaned.csv')
    print(f"Loaded {len(df)} respondents")
    
    # Convert to ML format
    ml_data = convert_to_ml_format(df)
    
    # Run different ML models
    results = {}
    
    # 1. Random Forest
    print("\n" + "="*50)
    print("RANDOM FOREST ANALYSIS")
    print("="*50)
    rf_results = run_random_forest_analysis(ml_data)
    results['random_forest'] = rf_results
    
    # 2. XGBoost
    print("\n" + "="*50)
    print("XGBOOST ANALYSIS")
    print("="*50)
    xgb_results = run_xgboost_analysis(ml_data)
    results['xgboost'] = xgb_results
    
    # 3. Gradient Boosting
    print("\n" + "="*50)
    print("GRADIENT BOOSTING ANALYSIS")
    print("="*50)
    gb_results = run_gradient_boosting_analysis(ml_data)
    results['gradient_boosting'] = gb_results
    
    # Compare models
    compare_models(results)
    
    return results

def convert_to_ml_format(df):
    """
    Convert data to machine learning format
    """
    print("Converting to ML format...")
    
    ml_records = []
    
    for idx, row in df.iterrows():
        for task in range(1, 9):
            choice = row[f'Task{task}_choice']
            
            record = {
                'respondent_id': idx,
                'task': task,
                'choice': 1 if choice == 'A' else 0,  # Binary target
                'grade': row['Grade'],
                'perceived_learning': row[f'Task{task}_perceivedlearning'],
                'expected_enjoyment': row[f'Task{task}_expectedenjoyment']
            }
            
            # Add attribute levels for both options
            for attr in ['Tutor', 'Color_palette', 'Pricing', 'Message_success_', 
                        'Message_failure_', 'Storytelling', 'Role_play']:
                record[f'A_{attr}'] = row[f'A_{attr}{task}']
                record[f'B_{attr}'] = row[f'B_{attr}{task}']
            
            ml_records.append(record)
    
    ml_data = pd.DataFrame(ml_records)
    
    # Encode categorical variables
    le_dict = {}
    categorical_cols = ['A_Tutor', 'A_Color_palette', 'A_Pricing', 'A_Message_success_', 
                       'A_Message_failure_', 'A_Storytelling', 'A_Role_play',
                       'B_Tutor', 'B_Color_palette', 'B_Pricing', 'B_Message_success_', 
                       'B_Message_failure_', 'B_Storytelling', 'B_Role_play']
    
    for col in categorical_cols:
        le = LabelEncoder()
        ml_data[col] = le.fit_transform(ml_data[col])
        le_dict[col] = le
    
    return ml_data, le_dict

def run_random_forest_analysis(ml_data, le_dict):
    """
    Run Random Forest analysis
    """
    # Prepare features
    feature_cols = [col for col in ml_data.columns if col not in ['respondent_id', 'choice']]
    X = ml_data[feature_cols]
    y = ml_data['choice']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest
    rf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    rf.fit(X_train, y_train)
    
    # Make predictions
    y_pred = rf.predict(X_test)
    y_pred_proba = rf.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = (y_pred == y_test).mean()
    cv_scores = cross_val_score(rf, X, y, cv=5)
    
    print(f"Random Forest Accuracy: {accuracy:.3f}")
    print(f"Cross-validation scores: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    # Calculate attribute-level importance
    attribute_importance = calculate_attribute_importance(feature_importance, le_dict)
    
    return {
        'model': rf,
        'accuracy': accuracy,
        'cv_scores': cv_scores,
        'feature_importance': feature_importance,
        'attribute_importance': attribute_importance,
        'y_test': y_test,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }

def run_xgboost_analysis(ml_data, le_dict):
    """
    Run XGBoost analysis
    """
    # Prepare features
    feature_cols = [col for col in ml_data.columns if col not in ['respondent_id', 'choice']]
    X = ml_data[feature_cols]
    y = ml_data['choice']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train XGBoost
    xgb_model = xgb.XGBClassifier(n_estimators=100, random_state=42, max_depth=6)
    xgb_model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = xgb_model.predict(X_test)
    y_pred_proba = xgb_model.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = (y_pred == y_test).mean()
    cv_scores = cross_val_score(xgb_model, X, y, cv=5)
    
    print(f"XGBoost Accuracy: {accuracy:.3f}")
    print(f"Cross-validation scores: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': xgb_model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    # Calculate attribute-level importance
    attribute_importance = calculate_attribute_importance(feature_importance, le_dict)
    
    return {
        'model': xgb_model,
        'accuracy': accuracy,
        'cv_scores': cv_scores,
        'feature_importance': feature_importance,
        'attribute_importance': attribute_importance,
        'y_test': y_test,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }

def run_gradient_boosting_analysis(ml_data, le_dict):
    """
    Run Gradient Boosting analysis
    """
    # Prepare features
    feature_cols = [col for col in ml_data.columns if col not in ['respondent_id', 'choice']]
    X = ml_data[feature_cols]
    y = ml_data['choice']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Gradient Boosting
    gb = GradientBoostingClassifier(n_estimators=100, random_state=42, max_depth=6)
    gb.fit(X_train, y_train)
    
    # Make predictions
    y_pred = gb.predict(X_test)
    y_pred_proba = gb.predict_proba(X_test)[:, 1]
    
    # Calculate metrics
    accuracy = (y_pred == y_test).mean()
    cv_scores = cross_val_score(gb, X, y, cv=5)
    
    print(f"Gradient Boosting Accuracy: {accuracy:.3f}")
    print(f"Cross-validation scores: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_cols,
        'importance': gb.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print(f"\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    # Calculate attribute-level importance
    attribute_importance = calculate_attribute_importance(feature_importance, le_dict)
    
    return {
        'model': gb,
        'accuracy': accuracy,
        'cv_scores': cv_scores,
        'feature_importance': feature_importance,
        'attribute_importance': attribute_importance,
        'y_test': y_test,
        'y_pred': y_pred,
        'y_pred_proba': y_pred_proba
    }

def calculate_attribute_importance(feature_importance, le_dict):
    """
    Calculate importance by attribute rather than individual features
    """
    attribute_importance = {}
    
    # Group features by attribute
    for feature, importance in zip(feature_importance['feature'], feature_importance['importance']):
        if feature.startswith('A_'):
            attr = feature[2:]  # Remove 'A_' prefix
        elif feature.startswith('B_'):
            attr = feature[2:]  # Remove 'B_' prefix
        else:
            attr = feature
        
        if attr not in attribute_importance:
            attribute_importance[attr] = 0
        attribute_importance[attr] += importance
    
    # Convert to DataFrame and sort
    attr_df = pd.DataFrame([
        {'attribute': attr, 'importance': imp} 
        for attr, imp in attribute_importance.items()
    ]).sort_values('importance', ascending=False)
    
    return attr_df

def compare_models(results):
    """
    Compare different ML models
    """
    print("\n" + "="*60)
    print("MODEL COMPARISON")
    print("="*60)
    
    comparison_data = []
    for model_name, result in results.items():
        comparison_data.append({
            'model': model_name,
            'accuracy': result['accuracy'],
            'cv_mean': result['cv_scores'].mean(),
            'cv_std': result['cv_scores'].std()
        })
    
    comparison_df = pd.DataFrame(comparison_data)
    comparison_df = comparison_df.sort_values('accuracy', ascending=False)
    
    print(f"{'Model':<20} {'Accuracy':<10} {'CV Mean':<10} {'CV Std':<10}")
    print("-" * 60)
    for _, row in comparison_df.iterrows():
        print(f"{row['model']:<20} {row['accuracy']:.3f}     {row['cv_mean']:.3f}     {row['cv_std']:.3f}")
    
    # Create visualization
    create_model_comparison_plot(comparison_df, results)
    
    return comparison_df

def create_model_comparison_plot(comparison_df, results):
    """
    Create visualization comparing models
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Machine Learning Conjoint Analysis Results', fontsize=16, fontweight='bold')
    
    # Model accuracy comparison
    axes[0, 0].bar(comparison_df['model'], comparison_df['accuracy'], color='skyblue', alpha=0.7)
    axes[0, 0].set_title('Model Accuracy Comparison')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    # Add value labels
    for i, v in enumerate(comparison_df['accuracy']):
        axes[0, 0].text(i, v + 0.01, f'{v:.3f}', ha='center', va='bottom')
    
    # Cross-validation scores
    axes[0, 1].bar(comparison_df['model'], comparison_df['cv_mean'], 
                   yerr=comparison_df['cv_std'], color='lightcoral', alpha=0.7, capsize=5)
    axes[0, 1].set_title('Cross-Validation Scores')
    axes[0, 1].set_ylabel('CV Score')
    axes[0, 1].tick_params(axis='x', rotation=45)
    
    # Feature importance comparison (top 10)
    all_features = set()
    for result in results.values():
        top_features = result['feature_importance'].head(10)['feature'].tolist()
        all_features.update(top_features)
    
    feature_importance_comparison = pd.DataFrame(index=list(all_features))
    for model_name, result in results.items():
        feature_importance_comparison[model_name] = result['feature_importance'].set_index('feature')['importance']
    
    feature_importance_comparison = feature_importance_comparison.fillna(0)
    feature_importance_comparison = feature_importance_comparison.head(10)
    
    feature_importance_comparison.plot(kind='bar', ax=axes[1, 0])
    axes[1, 0].set_title('Top 10 Feature Importance Comparison')
    axes[1, 0].set_ylabel('Importance')
    axes[1, 0].tick_params(axis='x', rotation=45)
    axes[1, 0].legend()
    
    # Attribute importance comparison
    attr_importance_comparison = pd.DataFrame()
    for model_name, result in results.items():
        attr_importance_comparison[model_name] = result['attribute_importance'].set_index('attribute')['importance']
    
    attr_importance_comparison = attr_importance_comparison.fillna(0)
    
    attr_importance_comparison.plot(kind='bar', ax=axes[1, 1])
    axes[1, 1].set_title('Attribute Importance Comparison')
    axes[1, 1].set_ylabel('Importance')
    axes[1, 1].tick_params(axis='x', rotation=45)
    axes[1, 1].legend()
    
    plt.tight_layout()
    
    # Save the plot
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'/Users/charlie/github.com/hai/SheRockets/data_analysis/ml_conjoint_results_{timestamp}.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"Visualization saved to: {output_file}")
    
    plt.show()

def main():
    """
    Main function
    """
    print("Starting Machine Learning Conjoint Analysis")
    print("="*50)
    
    # Run analysis
    results = run_ml_conjoint_analysis()
    
    print("\nMachine Learning Analysis completed!")
    print("This analysis uses Random Forest, XGBoost, and Gradient Boosting instead of logistic regression.")
    print("Feature importance shows which attributes are most predictive of choice.")
    
    return results

if __name__ == "__main__":
    results = main()
