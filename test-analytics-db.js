/**
 * Test script to verify analytics database schema and functions
 * Run this in Node.js or in browser console
 */

import { supabase } from './src/lib/supabase.js';
import * as analyticsDB from './src/utils/analyticsDatabase.js';

const tests = {
  results: [],
  
  async testSupabaseConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase.from('categories').select('*').limit(1);
      
      if (error) {
        this.results.push({
          test: 'Supabase Connection',
          status: '❌ FAILED',
          error: error.message
        });
        return false;
      }
      
      this.results.push({
        test: 'Supabase Connection',
        status: '✅ PASSED'
      });
      return true;
    } catch (e) {
      this.results.push({
        test: 'Supabase Connection',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async testCategoriesTable() {
    try {
      console.log('Testing categories table...');
      const categories = await analyticsDB.fetchCategories();
      
      if (!categories || categories.length === 0) {
        this.results.push({
          test: 'Categories Table',
          status: '⚠️ WARNING',
          info: 'Table exists but no categories found. Run SQL migration.'
        });
        return false;
      }
      
      this.results.push({
        test: 'Categories Table',
        status: '✅ PASSED',
        info: `Found ${categories.length} categories`
      });
      return true;
    } catch (e) {
      this.results.push({
        test: 'Categories Table',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async testCategoryStatRecording() {
    try {
      console.log('Testing category stats recording...');
      const categoryId = await analyticsDB.getCategoryIdByName('Food & Dining');
      
      if (!categoryId) {
        this.results.push({
          test: 'Category Stats Recording',
          status: '❌ FAILED',
          error: 'Could not find Food & Dining category'
        });
        return false;
      }
      
      const testData = {
        total: 500,
        advance: 250,
        remaining: 250,
        count: 2
      };
      
      const result = await analyticsDB.recordCategoryStats('Food & Dining', '2024-04-16', testData);
      
      if (!result) {
        this.results.push({
          test: 'Category Stats Recording',
          status: '❌ FAILED',
          error: 'Failed to record stats'
        });
        return false;
      }
      
      this.results.push({
        test: 'Category Stats Recording',
        status: '✅ PASSED',
        info: 'Successfully recorded test category stats'
      });
      return true;
    } catch (e) {
      this.results.push({
        test: 'Category Stats Recording',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async testPaymentMethodStats() {
    try {
      console.log('Testing payment method stats...');
      const testData = {
        total: 1000,
        count: 5
      };
      
      const result = await analyticsDB.recordPaymentMethodStats('Cash', '2024-04-16', testData);
      
      if (!result) {
        this.results.push({
          test: 'Payment Method Stats',
          status: '❌ FAILED',
          error: 'Failed to record payment method stats'
        });
        return false;
      }
      
      this.results.push({
        test: 'Payment Method Stats',
        status: '✅ PASSED',
        info: 'Successfully recorded test payment method stats'
      });
      return true;
    } catch (e) {
      this.results.push({
        test: 'Payment Method Stats',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async testMonthlyStats() {
    try {
      console.log('Testing monthly stats...');
      const testData = {
        total: 5000,
        paid: 3000,
        pending: 2000,
        count: 20,
        average: 250
      };
      
      const result = await analyticsDB.recordMonthlyStats('2024-04-01', testData);
      
      if (!result) {
        this.results.push({
          test: 'Monthly Stats',
          status: '❌ FAILED',
          error: 'Failed to record monthly stats'
        });
        return false;
      }
      
      this.results.push({
        test: 'Monthly Stats',
        status: '✅ PASSED',
        info: 'Successfully recorded test monthly stats'
      });
      return true;
    } catch (e) {
      this.results.push({
        test: 'Monthly Stats',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async testDataRetrieval() {
    try {
      console.log('Testing data retrieval...');
      const stats = await analyticsDB.fetchCategoryStatsRange('2024-04-01', '2024-04-30');
      
      this.results.push({
        test: 'Data Retrieval',
        status: '✅ PASSED',
        info: `Retrieved ${stats.length} category stat records`
      });
      return true;
    } catch (e) {
      this.results.push({
        test: 'Data Retrieval',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async testTableExists(tableName) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        return false; // Table doesn't exist
      }
      
      return true;
    } catch (e) {
      return false;
    }
  },

  async testAllTables() {
    try {
      console.log('Testing all analytics tables...');
      const tables = [
        'categories',
        'category_stats',
        'payment_method_stats',
        'monthly_stats',
        'weekly_stats',
        'monthly_category_stats',
        'monthly_payment_method_stats'
      ];
      
      const tableResults = {};
      for (const table of tables) {
        tableResults[table] = await this.testTableExists(table);
      }
      
      const existingCount = Object.values(tableResults).filter(v => v).length;
      
      this.results.push({
        test: 'Analytics Tables',
        status: existingCount === tables.length ? '✅ PASSED' : '⚠️ PARTIAL',
        info: `${existingCount}/${tables.length} tables exist`,
        details: tableResults
      });
      
      return existingCount > 0;
    } catch (e) {
      this.results.push({
        test: 'Analytics Tables',
        status: '❌ ERROR',
        error: e.message
      });
      return false;
    }
  },

  async runAll() {
    console.log('\n========================================');
    console.log('ANALYTICS DATABASE SCHEMA TEST SUITE');
    console.log('========================================\n');
    
    // Run tests in sequence
    await this.testSupabaseConnection();
    
    if (this.results[0].status.includes('PASSED')) {
      await this.testAllTables();
      await this.testCategoriesTable();
      await this.testCategoryStatRecording();
      await this.testPaymentMethodStats();
      await this.testMonthlyStats();
      await this.testDataRetrieval();
    } else {
      console.warn('⚠️ Skipping remaining tests - Supabase connection failed');
    }
    
    // Print results
    console.log('\n========================================');
    console.log('TEST RESULTS');
    console.log('========================================\n');
    
    this.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}`);
      console.log(`   Status: ${result.status}`);
      if (result.info) console.log(`   Info: ${result.info}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      if (result.details) console.log(`   Details:`, result.details);
      console.log();
    });
    
    // Summary
    const passed = this.results.filter(r => r.status.includes('PASSED')).length;
    const failed = this.results.filter(r => r.status.includes('FAILED')).length;
    const errors = this.results.filter(r => r.status.includes('ERROR')).length;
    const warnings = this.results.filter(r => r.status.includes('WARNING')).length;
    
    console.log('========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log(`✅ Passed:   ${passed}`);
    console.log(`❌ Failed:   ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`💥 Errors:   ${errors}`);
    console.log('========================================\n');
    
    return {
      passed,
      failed,
      errors,
      warnings,
      results: this.results
    };
  }
};

// Run tests
export default tests;

// For direct execution:
// tests.runAll().then(summary => {
//   console.log('Test run completed');
//   console.log(summary);
// }).catch(err => {
//   console.error('Test suite failed:', err);
// });
