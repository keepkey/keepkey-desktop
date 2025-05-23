import * as express from 'express'
import { kkStateController } from '../globalState'

// Map of active SSE sessions
const mcpSessions = new Map<string, { sseRes: express.Response, initialized: boolean }>()

/**
 * Register MCP endpoints on the Express app
 */
export function registerMcpEndpoints(app: express.Express): void {
  console.log('[MCP] Registering MCP endpoints')
  
  // Set up the SSE endpoint at /mcp
  app.get('/mcp', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2)
    console.log(`[MCP] New connection established with sessionId: ${sessionId}`)
    mcpSessions.set(sessionId, { sseRes: res, initialized: false })

    res.write(`: ping\n\n`)
    res.write(`event: endpoint\n`)
    res.write(`data: /mcp/message?sessionId=${sessionId}\n\n`)

    const heartbeat = setInterval(() => {
      res.write(`: heartbeat\n\n`)
    }, 3000)

    req.on('close', () => {
      clearInterval(heartbeat)
      mcpSessions.delete(sessionId)
      console.log(`[MCP] Connection closed for sessionId: ${sessionId}`)
    })
  })
  
  // Set up the JSON-RPC endpoint at /mcp/message
  app.post('/mcp/message', async (req: express.Request, res: express.Response) => {
    const sessionId = req.query.sessionId as string
    if (!sessionId) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Missing sessionId parameter" }
      })
      return
    }
    
    const session = mcpSessions.get(sessionId)
    if (!session) {
      res.status(404).json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid or expired session" }
      })
      return
    }
    
    const sseRes = session.sseRes
    const rpcRequest = req.body
    
    console.log(`[MCP] Received request: ${JSON.stringify(rpcRequest)}`)
    
    // Special handling for getFeatures tool to ensure it works even with various input formats
    if (rpcRequest.method === 'tools/call' && 
        rpcRequest.params?.name === 'keepkey-mcp_system-getFeatures') {
      console.log('[MCP] Special handling for getFeatures call')
      // Always set arguments to an empty object for getFeatures
      if (rpcRequest.params) {
        rpcRequest.params.arguments = {}
      }
    }
    
    // Acknowledge receipt of the message
    res.json({ 
      jsonrpc: "2.0", 
      id: rpcRequest.id, 
      result: { ack: `Received ${rpcRequest.method}` } 
    })
    
    try {
      await handleRpcRequest(sseRes, rpcRequest, session)
    } catch (error: unknown) {
      console.error('[MCP] Error handling RPC request', error)
      sendErrorResponse(sseRes, rpcRequest.id, 
                      error instanceof Error ? error.message : 'Unknown error')
    }
  })
}

/**
 * Handle RPC request
 */
async function handleRpcRequest(sseRes: express.Response, rpcRequest: any, 
                              session: { initialized: boolean }): Promise<void> {
  switch (rpcRequest.method) {
    case 'initialize':
      session.initialized = true
      sseRes.write(`event: message\n`)
      sseRes.write(`data: ${JSON.stringify({
        jsonrpc: "2.0",
        id: rpcRequest.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: true },
            resources: { listChanged: true },
            prompts: { listChanged: false },
            logging: {}
          },
          serverInfo: {
            name: "KeepKey Desktop MCP",
            version: "1.0.0"
          }
        }
      })}\n\n`)
      break;

    case 'tools/list':
      sseRes.write(`event: message\n`)
      sseRes.write(`data: ${JSON.stringify({
        jsonrpc: "2.0",
        id: rpcRequest.id,
        result: {
          tools: mcpTools,
          count: mcpTools.length
        }
      })}\n\n`)
      break;

    case 'resources/list':
      sseRes.write(`event: message\n`)
      sseRes.write(`data: ${JSON.stringify({
        jsonrpc: "2.0",
        id: rpcRequest.id,
        result: {
          resources: [
            {
              id: "device_features",
              name: "Device Features",
              description: "Details about the connected KeepKey device"
            },
            {
              id: "supported_coins",
              name: "Supported Coins",
              description: "List of supported cryptocurrencies"
            }
          ]
        }
      })}\n\n`)
      break;

    case 'tools/call':
      await handleToolCall(sseRes, rpcRequest)
      break;

    default:
      sendErrorResponse(sseRes, rpcRequest.id, `Unknown method: ${rpcRequest.method}`)
  }
}

/**
 * Handle tool call
 */
async function handleToolCall(sseRes: express.Response, rpcRequest: any): Promise<void> {
  const toolName = rpcRequest.params?.name
  const toolArgs = rpcRequest.params?.arguments || {}

  // Validate the request has a tool name
  if (!toolName) {
    sendErrorResponse(sseRes, rpcRequest.id || 0, "Missing tool name in request")
    return
  }
  
  // Add debug logging
  console.log(`[MCP] Handling tool call: ${toolName}`, { params: rpcRequest.params })

  try {
    let result: any = { success: false }
    
    // Get wallet from state controller
    const wallet = kkStateController.wallet
    if (!wallet) {
      throw new Error("Device not connected")
    }

    // Handle System tools
    if (toolName === 'keepkey-mcp_system-getFeatures') {
      // getFeatures requires no parameters - simplify the implementation
      try {
        const features = await wallet.getFeatures()
        // Build a simplified feature set 
        result = {
          label: features.label,
          vendor: features.vendor,
          model: features.model,
          firmware_variant: features.firmwareVariant,
          device_id: features.deviceId,
          initialized: features.initialized,
          pin_protection: features.pinProtection,
          passphrase_protection: features.passphraseProtection,
          major_version: features.majorVersion,
          minor_version: features.minorVersion,
          patch_version: features.patchVersion
        }
        console.log(`[MCP] getFeatures success: ${JSON.stringify(result)}`)
      } catch (err) {
        console.error("[MCP] Error getting features:", err)
        throw new Error(`Error getting device features: ${err instanceof Error ? err.message : String(err)}`)
      }
    } 
    else if (toolName === 'keepkey-mcp_system-getPublicKey') {
      // Validate required parameters
      if (!toolArgs.address_n || !Array.isArray(toolArgs.address_n)) {
        throw new Error("address_n parameter is required and must be an array")
      }
      
      const [pubKey] = await wallet.getPublicKeys([{
        addressNList: toolArgs.address_n,
        curve: toolArgs.ecdsa_curve_name || '',
        showDisplay: !!toolArgs.show_display,
        coin: toolArgs.coin_name || '',
        scriptType: toolArgs.script_type || 'p2pkh'
      }])
      result = { xpub: pubKey.xpub }
    }
    else if (toolName === 'keepkey-mcp_system-ping') {
      const response = await wallet.ping({
        msg: toolArgs.message || '',
        button: toolArgs.button_protection,
        pin: toolArgs.pin_protection,
        passphrase: toolArgs.passphrase_protection
      })
      result = { message: response.msg }
    }
    // Handle Ethereum tools
    else if (toolName === 'keepkey-mcp_eth-signTransaction') {
      // Validate required parameters
      if (!toolArgs.addressNList || !Array.isArray(toolArgs.addressNList)) {
        throw new Error("addressNList parameter is required and must be an array")
      }
      if (!toolArgs.to) throw new Error("to parameter is required")
      if (!toolArgs.value) throw new Error("value parameter is required")
      if (!toolArgs.nonce) throw new Error("nonce parameter is required")
      if (!toolArgs.chainId) throw new Error("chainId parameter is required")
      
      result = await wallet.ethSignTx({
        addressNList: toolArgs.addressNList,
        nonce: toolArgs.nonce,
        gasPrice: toolArgs.gasPrice,
        gasLimit: toolArgs.gas,
        to: toolArgs.to,
        value: toolArgs.value,
        data: toolArgs.data || '',
        chainId: parseInt(toolArgs.chainId),
        maxFeePerGas: toolArgs.maxFeePerGas,
        maxPriorityFeePerGas: toolArgs.maxPriorityFeePerGas
      })
    }
    else if (toolName === 'keepkey-mcp_eth-signTypedData') {
      // Validate required parameters
      if (!toolArgs.addressNList || !Array.isArray(toolArgs.addressNList)) {
        throw new Error("addressNList parameter is required and must be an array")
      }
      if (!toolArgs.typedData) throw new Error("typedData parameter is required")
      
      const response = await wallet.ethSignTypedData({
        addressNList: toolArgs.addressNList,
        typedData: toolArgs.typedData
      })
      result = { signature: response.signature }
    }
    // Handle UTXO tools
    else if (toolName === 'keepkey-mcp_utxo-getAddress') {
      // Validate required parameters
      if (!toolArgs.addressNList || !Array.isArray(toolArgs.addressNList)) {
        throw new Error("addressNList parameter is required and must be an array")
      }
      if (!toolArgs.coin) throw new Error("coin parameter is required")
      
      const address = await wallet.btcGetAddress({
        addressNList: toolArgs.addressNList,
        coin: toolArgs.coin,
        scriptType: toolArgs.scriptType,
        showDisplay: !!toolArgs.showDisplay
      })
      result = { address }
    }
    else if (toolName === 'keepkey-mcp_utxo-signTransaction') {
      // Validate required parameters
      if (!toolArgs.coin) throw new Error("coin parameter is required")
      if (!toolArgs.inputs || !Array.isArray(toolArgs.inputs)) {
        throw new Error("inputs parameter is required and must be an array")
      }
      if (!toolArgs.outputs || !Array.isArray(toolArgs.outputs)) {
        throw new Error("outputs parameter is required and must be an array")
      }
      
      result = await wallet.btcSignTx({
        coin: toolArgs.coin,
        inputs: toolArgs.inputs,
        outputs: toolArgs.outputs
      })
    }
    else {
      throw new Error(`Unknown tool: ${toolName}`)
    }
    
    sendToolResponse(sseRes, rpcRequest.id, result)
  } catch (error: unknown) {
    console.error(`[MCP] Error executing ${toolName}:`, error)
    sendErrorResponse(sseRes, rpcRequest.id, 
                     error instanceof Error ? error.message : `Error executing ${toolName}`)
  }
}

/**
 * Send tool response
 */
function sendToolResponse(sseRes: express.Response, id: string | number, data: any): void {
  sseRes.write(`event: message\n`)
  sseRes.write(`data: ${JSON.stringify({
    jsonrpc: "2.0",
    id,
    result: data
  })}\n\n`)
}

/**
 * Send error response
 */
function sendErrorResponse(sseRes: express.Response, id: string | number, message: string, code: number = -32000): void {
  console.error(`[MCP] Sending error response for id ${id}: ${message} (code ${code})`)
  
  sseRes.write(`event: message\n`)
  sseRes.write(`data: ${JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      data: {
        timestamp: new Date().toISOString()
      }
    }
  })}\n\n`)
}

/**
 * MCP Tools definition
 */
const mcpTools = [
  // System tools
  {
    name: "keepkey-mcp_system-getFeatures",
    description: "Get device features information",
    inputSchema: { 
      type: "object",
      properties: {},
      additionalProperties: false,
      required: []
    }
  },
  {
    name: "keepkey-mcp_system-getPublicKey",
    description: "Get public key for a specific path",
    inputSchema: {
      type: "object",
      properties: {
        address_n: {
          type: "array",
          items: { type: "integer" },
          description: "BIP-32 path"
        },
        ecdsa_curve_name: {
          type: "string",
          description: "ECDSA curve name to use"
        },
        show_display: {
          type: "boolean",
          description: "Show on device display"
        },
        coin_name: {
          type: "string",
          description: "Coin name"
        },
        script_type: {
          type: "string",
          enum: ["p2pkh", "p2wpkh", "p2sh-p2wpkh"],
          description: "Script type"
        }
      },
      required: ["address_n"]
    }
  },
  {
    name: "keepkey-mcp_system-ping",
    description: "Confirm device connectivity",
    inputSchema: {
      type: "object",
      properties: {
        button_protection: {
          type: "boolean",
          description: "Request button press"
        },
        pin_protection: {
          type: "boolean",
          description: "Request PIN"
        },
        passphrase_protection: {
          type: "boolean",
          description: "Request passphrase"
        },
        message: {
          type: "string",
          description: "Message to send"
        }
      }
    }
  },
  
  // Ethereum tools
  {
    name: "keepkey-mcp_eth-signTransaction",
    description: "Sign an Ethereum transaction",
    inputSchema: {
      type: "object",
      properties: {
        addressNList: {
          type: "array",
          items: { type: "integer" },
          description: "BIP-32 path"
        },
        to: {
          type: "string",
          description: "Destination address"
        },
        value: {
          type: "string",
          description: "Amount in hex"
        },
        data: {
          type: "string",
          description: "Contract data"
        },
        nonce: {
          type: "string",
          description: "Transaction nonce in hex"
        },
        chainId: {
          type: "string",
          description: "Chain ID"
        },
        gas: {
          type: "string",
          description: "Gas limit in hex"
        },
        gasPrice: {
          type: "string",
          description: "Gas price in hex"
        },
        maxFeePerGas: {
          type: "string",
          description: "Max fee per gas (EIP-1559)"
        },
        maxPriorityFeePerGas: {
          type: "string",
          description: "Max priority fee per gas (EIP-1559)"
        }
      },
      required: ["addressNList", "to", "value", "nonce", "chainId"]
    }
  },
  {
    name: "keepkey-mcp_eth-signTypedData",
    description: "Sign EIP-712 typed data",
    inputSchema: {
      type: "object",
      properties: {
        addressNList: {
          type: "array",
          items: { type: "integer" },
          description: "BIP-32 path"
        },
        typedData: {
          type: "object",
          description: "EIP-712 typed data"
        }
      },
      required: ["addressNList", "typedData"]
    }
  },
  
  // UTXO tools
  {
    name: "keepkey-mcp_utxo-getAddress",
    description: "Get address from device",
    inputSchema: {
      type: "object",
      properties: {
        addressNList: {
          type: "array",
          items: { type: "integer" },
          description: "BIP-32 path"
        },
        coin: {
          type: "string",
          description: "Coin name (e.g., 'Bitcoin')"
        },
        scriptType: {
          type: "string",
          enum: ["p2pkh", "p2wpkh", "p2sh-p2wpkh"],
          description: "Script type"
        },
        showDisplay: {
          type: "boolean",
          description: "Show on device display"
        }
      },
      required: ["addressNList", "coin"]
    }
  },
  {
    name: "keepkey-mcp_utxo-signTransaction",
    description: "Sign a UTXO-based transaction",
    inputSchema: {
      type: "object",
      properties: {
        coin: {
          type: "string",
          description: "Coin name (e.g., 'Bitcoin')"
        },
        inputs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              addressNList: {
                type: "array",
                items: { type: "integer" }
              },
              scriptType: {
                type: "string"
              },
              amount: {
                type: "string"
              },
              vout: {
                type: "number"
              },
              txid: {
                type: "string"
              },
              hex: {
                type: "string"
              }
            }
          },
          description: "Transaction inputs"
        },
        outputs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              address: {
                type: "string"
              },
              addressNList: {
                type: "array",
                items: { type: "integer" }
              },
              scriptType: {
                type: "string"
              },
              amount: {
                type: "string"
              },
              isChange: {
                type: "boolean"
              }
            }
          },
          description: "Transaction outputs"
        }
      },
      required: ["coin", "inputs", "outputs"]
    }
  }
]

/**
 * MCP Schema for the API
 */
const mcpSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "KeepKey Desktop MCP API",
  "description": "API Schema for the KeepKey Desktop MCP Server",
  "type": "object",
  "properties": {
    "tools": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Tool"
      }
    }
  },
  "definitions": {
    "Tool": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "inputSchema": {
          "type": "object"
        }
      },
      "required": ["name", "description", "inputSchema"]
    }
  }
} 
