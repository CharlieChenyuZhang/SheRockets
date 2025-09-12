#!/usr/bin/env python3
"""
Test script to verify the individual visualization functionality
"""

from conjoint_analysis import ConjointAnalyzer

def test_visualizations():
    """Test the individual visualization creation"""
    print("Testing individual visualization creation...")
    
    # Initialize analyzer
    analyzer = ConjointAnalyzer('cleaned.csv')
    
    # Load and preprocess data
    analyzer.load_and_preprocess_data()
    
    # Run choice modeling
    analyzer.run_choice_modeling()
    
    # Create individual visualizations
    analyzer.create_visualizations()
    
    print("Test completed successfully!")

if __name__ == "__main__":
    test_visualizations()
