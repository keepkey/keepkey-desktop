import { Controller, Get, Post, Route, Body, SuccessResponse } from '@tsoa/runtime'

/**
 * InfoController: Exposes endpoints for paired wallets, context switching, and USB state.
 * These endpoints DO NOT require a connected wallet and are always safe to call.
 */
@Route('admin')
export class InfoController extends Controller {
  /**
   * List all wallets ever paired (with metadata).
   */
  @Get('wallets')
  public async listWallets() {
    // TODO: Implement DB lookup for all paired wallets
    return []
  }

  /**
   * Get the current in-context wallet.
   */
  @Get('wallets/current')
  public async getCurrentWallet() {
    // TODO: Return current in-context wallet metadata
    return null
  }

  /**
   * Switch the in-context wallet.
   */
  @Post('wallets/switch')
  @SuccessResponse('200', 'Switched')
  public async switchWallet(@Body() _body: { walletId: string }) {
    // TODO: Implement switch logic
    return { success: true }
  }


  /**
   * List all USB devices detected.
   */
  @Get('usb/devices')
  public async listUsbDevices() {
    // TODO: Return USB device list
    return []
  }

  /**
   * Get current USB state.
   */
  @Get('usb/state')
  public async getUsbState() {
    // TODO: Return current USB state
    return { connected: false }
  }

  /**
   * Combined info endpoint: all wallets, current, usb devices, usb state.
   */
  @Get('info')
  public async getInfo() {
    // TODO: Compose all info into one response
    return {
      wallets: [],
      currentWallet: null,
      usb: {
        devices: [],
        state: { connected: false },
      },
    }
  }
}
