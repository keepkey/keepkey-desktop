# KeepKey MCP Server

This module implements a Model Control Protocol (MCP) server for KeepKey Desktop. The MCP server provides a standardized interface for interacting with KeepKey devices through Server-Sent Events (SSE) and JSON-RPC.

## Overview

The MCP server exposes endpoints that allow clients to:

1. Connect via SSE for real-time communication
2. Send JSON-RPC requests to perform actions on the KeepKey device
3. Access information about the device and supported operations

## Endpoints

- `/mcp` - SSE endpoint for establishing a persistent connection
- `/mcp/message?sessionId={sessionId}` - JSON-RPC endpoint for sending commands

## Available Tools

The MCP server provides the following tool categories:

### System Tools
- `keepkey-mcp_system-getFeatures` - Get device features information
- `keepkey-mcp_system-getPublicKey` - Get public key for a specific path
- `keepkey-mcp_system-ping` - Confirm device connectivity

### Ethereum Tools
- `keepkey-mcp_eth-signTransaction` - Sign an Ethereum transaction
- `keepkey-mcp_eth-signTypedData` - Sign EIP-712 typed data

### UTXO Tools
- `keepkey-mcp_utxo-getAddress` - Get address from device
- `keepkey-mcp_utxo-signTransaction` - Sign a UTXO-based transaction

## Usage

The MCP server is automatically started alongside the existing TSOA server in KeepKey Desktop. Clients can connect to the MCP server to perform operations on the connected KeepKey device.

## Example Client

```javascript
// Connect to the MCP server via SSE
const eventSource = new EventSource('http://localhost:1646/mcp');
let mcpEndpoint;

// Listen for the endpoint event
eventSource.addEventListener('endpoint', (event) => {
  mcpEndpoint = event.data;
  console.log('MCP Message endpoint:', mcpEndpoint);
  
  // Once we have the endpoint, initialize the connection
  initializeMcp();
});

async function initializeMcp() {
  // Initialize the MCP connection
  const response = await fetch(mcpEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize'
    })
  });
  
  // Handle the response
  const result = await response.json();
  console.log('Initialize response:', result);
}

// Listen for SSE messages
eventSource.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received message:', data);
});
``` 