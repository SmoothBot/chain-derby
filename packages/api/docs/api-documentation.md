# Chain Derby API Documentation

This document provides comprehensive information about the Chain Derby API, which stores race results from the Chain Derby application in a PostgreSQL database.

## Authentication

All API endpoints require an API key for authentication. The API key should be included in the request headers.

```
x-api-key: your_api_key_here
```

## Base URL

The base URL for all endpoints is:

```
http://localhost:3001/api
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": [ ... ] // Optional validation errors
  }
}
```

## Endpoints

### Race Sessions

#### Get All Race Sessions

Retrieves a list of race sessions with optional filtering.

- **URL**: `/race-sessions`
- **Method**: `GET`
- **Query Parameters**:
  - `walletAddress` (optional): Filter by wallet address
  - `country` (optional): Filter by country code
  - `region` (optional): Filter by region/state/province
  - `city` (optional): Filter by city
  - `limit` (optional): Maximum number of results to return (default: 20)
  - `offset` (optional): Number of results to skip (default: 0)

**Example Request**:
```
GET /api/race-sessions?walletAddress=0x123456789abcdef&limit=10&offset=0
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "My First Race",
      "description": "Testing different chains",
      "walletAddress": "0x123456789abcdef",
      "transactionCount": 10,
      "status": "completed",
      "createdAt": "2023-05-10T12:00:00.000Z",
      "updatedAt": "2023-05-10T12:01:30.000Z"
    },
    {
      "id": 2,
      "sessionId": "650e8400-e29b-41d4-a716-446655440001",
      "title": "Second Race",
      "description": null,
      "walletAddress": "0x123456789abcdef",
      "transactionCount": 5,
      "status": "completed",
      "createdAt": "2023-05-11T14:30:00.000Z",
      "updatedAt": "2023-05-11T14:31:45.000Z"
    }
  ]
}
```

#### Get Race Session by ID

Retrieves a specific race session along with its chain results.

- **URL**: `/race-sessions/:id`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: The unique session ID (UUID)

**Example Request**:
```
GET /api/race-sessions/550e8400-e29b-41d4-a716-446655440000
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Race",
    "description": "Testing different chains",
    "walletAddress": "0x123456789abcdef",
    "transactionCount": 10,
    "status": "completed",
    "createdAt": "2023-05-10T12:00:00.000Z",
    "updatedAt": "2023-05-10T12:01:30.000Z",
    "results": [
      {
        "id": 1,
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "chainId": 1,
        "chainName": "Ethereum",
        "chainColor": "#627EEA",
        "chainEmoji": "🐎",
        "status": "success",
        "position": 2,
        "completed": true,
        "txCompleted": 10,
        "txTotal": 10,
        "txLatencies": [100, 150, 200, 120, 135, 145, 160, 130, 140, 155],
        "averageLatency": 143,
        "totalLatency": 1435,
        "txHash": "0xabcdef1234567890",
        "error": null,
        "createdAt": "2023-05-10T12:01:30.000Z",
        "updatedAt": "2023-05-10T12:01:30.000Z"
      },
      {
        "id": 2,
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "chainId": 11155931,
        "chainName": "RISE Testnet",
        "chainColor": "#7967E5",
        "chainEmoji": "🐎",
        "status": "success",
        "position": 1,
        "completed": true,
        "txCompleted": 10,
        "txTotal": 10,
        "txLatencies": [80, 95, 110, 85, 90, 100, 105, 95, 90, 85],
        "averageLatency": 93,
        "totalLatency": 935,
        "txHash": "0x1234567890abcdef",
        "error": null,
        "createdAt": "2023-05-10T12:01:30.000Z",
        "updatedAt": "2023-05-10T12:01:30.000Z"
      }
    ]
  }
}
```

#### Create Race Session

Creates a new race session with optional chain results.

- **URL**: `/race-sessions`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "session": {
      "title": "Race Name",
      "description": "Race Description",
      "walletAddress": "0x123456789abcdef",
      "transactionCount": 10,
      "status": "completed"
    },
    "results": [
      {
        "chainId": 1,
        "chainName": "Ethereum",
        "chainColor": "#627EEA",
        "chainEmoji": "🐎",
        "status": "success",
        "position": 2,
        "completed": true,
        "txCompleted": 10,
        "txTotal": 10,
        "txLatencies": [100, 150, 200, 120, 135, 145, 160, 130, 140, 155],
        "averageLatency": 143,
        "totalLatency": 1435,
        "txHash": "0xabcdef1234567890",
        "error": null
      },
      {
        "chainId": 11155931,
        "chainName": "RISE Testnet",
        "chainColor": "#7967E5",
        "chainEmoji": "🐎",
        "status": "success",
        "position": 1,
        "completed": true,
        "txCompleted": 10,
        "txTotal": 10,
        "txLatencies": [80, 95, 110, 85, 90, 100, 105, 95, 90, 85],
        "averageLatency": 93,
        "totalLatency": 935,
        "txHash": "0x1234567890abcdef",
        "error": null
      }
    ]
  }
  ```

**Required Session Fields**:
- `walletAddress`: The address of the wallet that created the race
- `transactionCount`: The number of transactions executed in the race (1, 5, 10, or 20)

**Optional Session Fields** (automatically collected if not provided):
- `ipAddress`: User's IP address
- `country`: User's country code
- `region`: User's state/province
- `city`: User's city
- `coordinates`: Location coordinates (lat,long)
- `isp`: User's internet service provider
- `timezone`: User's timezone
- `browserSession`: Browser session identifier (provided by client via X-Session-ID header)

**Required Result Fields**:
- `chainId`: The ID of the EVM chain
- `chainName`: The name of the chain
- `status`: The final status of the chain in the race (success, error, etc.)
- `txCompleted`: Number of completed transactions
- `txTotal`: Total number of transactions in the race

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Race Name",
    "description": "Race Description",
    "walletAddress": "0x123456789abcdef",
    "transactionCount": 10,
    "status": "completed",
    "ipAddress": "123.45.67.89",
    "country": "US",
    "region": "California",
    "city": "San Francisco",
    "coordinates": "37.7749,-122.4194",
    "isp": "Comcast Cable Communications, LLC",
    "timezone": "America/Los_Angeles",
    "browserSession": "unique-browser-session-id-12345",
    "createdAt": "2023-05-10T12:00:00.000Z",
    "updatedAt": "2023-05-10T12:00:00.000Z",
    "results": [
      {
        "id": 1,
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "chainId": 1,
        "chainName": "Ethereum",
        "chainColor": "#627EEA",
        "chainEmoji": "🐎",
        "status": "success",
        "position": 2,
        "completed": true,
        "txCompleted": 10,
        "txTotal": 10,
        "txLatencies": [100, 150, 200, 120, 135, 145, 160, 130, 140, 155],
        "averageLatency": 143,
        "totalLatency": 1435,
        "txHash": "0xabcdef1234567890",
        "error": null,
        "createdAt": "2023-05-10T12:00:00.000Z",
        "updatedAt": "2023-05-10T12:00:00.000Z"
      },
      {
        "id": 2,
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "chainId": 11155931,
        "chainName": "RISE Testnet",
        "chainColor": "#7967E5",
        "chainEmoji": "🐎",
        "status": "success",
        "position": 1,
        "completed": true,
        "txCompleted": 10,
        "txTotal": 10,
        "txLatencies": [80, 95, 110, 85, 90, 100, 105, 95, 90, 85],
        "averageLatency": 93,
        "totalLatency": 935,
        "txHash": "0x1234567890abcdef",
        "error": null,
        "createdAt": "2023-05-10T12:00:00.000Z",
        "updatedAt": "2023-05-10T12:00:00.000Z"
      }
    ]
  }
}
```

#### Delete Race Session

Deletes a race session and its associated chain results.

- **URL**: `/race-sessions/:id`
- **Method**: `DELETE`
- **URL Parameters**:
  - `id`: The unique session ID (UUID)

**Example Request**:
```
DELETE /api/race-sessions/550e8400-e29b-41d4-a716-446655440000
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "message": "Race session deleted successfully"
  }
}
```

### Chain Results

#### Get Chain Results by Session ID

Retrieves all chain results for a specific race session.

- **URL**: `/chain-results/session/:sessionId`
- **Method**: `GET`
- **URL Parameters**:
  - `sessionId`: The unique session ID (UUID)

**Example Request**:
```
GET /api/chain-results/session/550e8400-e29b-41d4-a716-446655440000
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "chainId": 1,
      "chainName": "Ethereum",
      "chainColor": "#627EEA",
      "chainEmoji": "🐎",
      "status": "success",
      "position": 2,
      "completed": true,
      "txCompleted": 10,
      "txTotal": 10,
      "txLatencies": [100, 150, 200, 120, 135, 145, 160, 130, 140, 155],
      "averageLatency": 143,
      "totalLatency": 1435,
      "txHash": "0xabcdef1234567890",
      "error": null,
      "createdAt": "2023-05-10T12:01:30.000Z",
      "updatedAt": "2023-05-10T12:01:30.000Z"
    },
    {
      "id": 2,
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "chainId": 11155931,
      "chainName": "RISE Testnet",
      "chainColor": "#7967E5",
      "chainEmoji": "🐎",
      "status": "success",
      "position": 1,
      "completed": true,
      "txCompleted": 10,
      "txTotal": 10,
      "txLatencies": [80, 95, 110, 85, 90, 100, 105, 95, 90, 85],
      "averageLatency": 93,
      "totalLatency": 935,
      "txHash": "0x1234567890abcdef",
      "error": null,
      "createdAt": "2023-05-10T12:01:30.000Z",
      "updatedAt": "2023-05-10T12:01:30.000Z"
    }
  ]
}
```

#### Get Statistics

Retrieves statistical data about chain performance across all races.

- **URL**: `/chain-results/stats`
- **Method**: `GET`

**Example Request**:
```
GET /api/chain-results/stats
```

**Example Response**:
```json
{
  "success": true,
  "message": "Statistics feature not yet implemented",
  "data": {
    "totalSessions": 0,
    "chainPerformance": []
  }
}
```

## Error Codes

The API uses conventional HTTP response codes to indicate the success or failure of requests:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid or malformed
- `401 Unauthorized`: Authentication failed or API key is missing
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

## Integration with Chain Derby Frontend

To integrate this API with the Chain Derby frontend, you'll need to:

1. Create a service in the frontend to handle API calls
2. Add a hook to save race results after each race is completed
3. Add a UI component to view past race results

Example frontend integration code:

```typescript
// api.service.ts
export async function saveRaceResults(session, results) {
  const response = await fetch('http://localhost:3001/api/race-sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.API_KEY,
    },
    body: JSON.stringify({ session, results }),
  });
  
  return response.json();
}

export async function fetchRaceSessions(walletAddress) {
  const response = await fetch(`http://localhost:3001/api/race-sessions?walletAddress=${walletAddress}`, {
    headers: {
      'x-api-key': process.env.API_KEY,
    },
  });
  
  return response.json();
}

export async function fetchRaceSession(sessionId) {
  const response = await fetch(`http://localhost:3001/api/race-sessions/${sessionId}`, {
    headers: {
      'x-api-key': process.env.API_KEY,
    },
  });
  
  return response.json();
}
```

Update the `useChainRace` hook to save results after a race:

```typescript
// At the end of the race in useChainRace.ts
useEffect(() => {
  if (status === 'finished' && results.length > 0) {
    // Save race results to API
    saveRaceResults({
      title: `Race ${new Date().toLocaleString()}`,
      walletAddress: account?.address || '',
      transactionCount,
      status: 'completed',
    }, results);
  }
}, [status, results]);
```