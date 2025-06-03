#!/usr/bin/env node

/**
 * Simple script to test the Chain Derby API
 * This script:
 * 1. Creates a new race session with chain results
 * 2. Retrieves the created session and displays its details
 * 3. Retrieves all race sessions for the wallet address
 * 
 * Run with: node ./scripts/test-api.js
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3001/api';
const API_KEY = 'development_api_key'; // Should match the value in your .env file

// Helper to make API requests
async function callApi(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'x-session-id': 'test-session-123', // Example browser session ID
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  console.log(`${method} ${API_URL}${endpoint}`);
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(result)}`);
  }
  
  return result;
}

// Run the test
async function runTest() {
  try {
    console.log('Chain Derby API Test');
    console.log('===================');
    
    // Generate a unique wallet address for testing
    const walletAddress = `0x${Math.random().toString(16).substring(2, 12)}`;
    console.log(`Using test wallet address: ${walletAddress}`);
    
    // Step 1: Create a new race session with chain results
    console.log('\n1. Creating new race session...');
    const raceData = {
      session: {
        title: 'Test Race',
        description: 'Created by test script',
        walletAddress,
        transactionCount: 10,
        // Note: We don't need to specify IP info as the API will collect it
      },
      results: [
        {
          chainId: 1,
          chainName: 'Ethereum',
          chainColor: '#627EEA',
          chainEmoji: '🐎',
          status: 'success',
          position: 2,
          completed: true,
          txCompleted: 10,
          txTotal: 10,
          txLatencies: [100, 150, 120, 130, 140, 125, 135, 145, 110, 160],
          averageLatency: 131,
          totalLatency: 1315,
          txHash: '0xabcdef1234567890',
        },
        {
          chainId: 11155931,
          chainName: 'RISE Testnet',
          chainColor: '#7967E5',
          chainEmoji: '🐎',
          status: 'success',
          position: 1,
          completed: true,
          txCompleted: 10,
          txTotal: 10,
          txLatencies: [50, 60, 55, 65, 70, 75, 60, 50, 55, 60],
          averageLatency: 60,
          totalLatency: 600,
          txHash: '0x1234567890abcdef',
        },
      ],
    };
    
    const createResult = await callApi('/race-sessions', 'POST', raceData);
    console.log('Race session created successfully!');
    console.log(`Session ID: ${createResult.data.sessionId}`);
    
    // Step 2: Retrieve the created session
    console.log('\n2. Retrieving created race session...');
    const sessionId = createResult.data.sessionId;
    const sessionResult = await callApi(`/race-sessions/${sessionId}`);
    
    console.log('Race session details:');
    console.log(`- Title: ${sessionResult.data.title}`);
    console.log(`- Wallet: ${sessionResult.data.walletAddress}`);
    console.log(`- IP Address: ${sessionResult.data.ipAddress}`);
    console.log(`- Location: ${sessionResult.data.city}, ${sessionResult.data.region}, ${sessionResult.data.country}`);
    console.log(`- Chain Results:`);
    
    sessionResult.data.results.forEach(result => {
      console.log(`  * ${result.chainName}: Position ${result.position}, Avg Latency ${result.averageLatency}ms`);
    });
    
    // Step 3: Retrieve all race sessions for this wallet
    console.log('\n3. Retrieving all race sessions for wallet...');
    const allSessions = await callApi(`/race-sessions?walletAddress=${walletAddress}`);
    
    console.log(`Found ${allSessions.data.length} race sessions:`);
    allSessions.data.forEach(session => {
      console.log(`- ${session.title} (${session.sessionId}) - Created: ${new Date(session.createdAt).toLocaleString()}`);
    });
    
    // Step 4: Retrieve chain results directly
    console.log('\n4. Retrieving chain results directly...');
    const chainResults = await callApi(`/chain-results/session/${sessionId}`);
    
    console.log(`Chain results for session ${sessionId}:`);
    chainResults.data.forEach(result => {
      console.log(`- ${result.chainName}: ${result.status}, Position ${result.position}`);
      console.log(`  Latencies: [${result.txLatencies.join(', ')}]`);
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
runTest();