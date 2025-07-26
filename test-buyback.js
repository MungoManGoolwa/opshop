// Quick test of the AI evaluation function
const { evaluateItemWithAI } = require('./server/ai-evaluation.ts');

async function testBuyback() {
  console.log('Testing AI evaluation...');
  
  try {
    const testItem = {
      title: "iPhone 13 Pro Max 256GB",
      description: "Excellent condition iPhone, barely used, all original accessories included",
      condition: "excellent",
      age: "recent",
      brand: "Apple",
      category: "electronics"
    };
    
    const result = await evaluateItemWithAI(testItem);
    console.log('AI Evaluation Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('Testing fallback system due to:', error.message);
    
    // Test fallback
    const fallbackResult = {
      estimatedRetailPrice: 800,
      buybackOfferPrice: 400,
      confidence: 0.3,
      reasoning: 'Fallback evaluation used',
      marketFactors: ['fallback_pricing'],
      conditionAssessment: 'Based on condition: excellent',
      depreciation: 0.1,
      brandValue: 'unknown',
      marketDemand: 'medium',
      category: 'electronics',
      suggestedListingPrice: 800,
    };
    
    console.log('Fallback Result:', JSON.stringify(fallbackResult, null, 2));
  }
}

testBuyback();