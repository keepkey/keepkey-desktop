import * as Messages from '@keepkey/device-protocol/lib/messages_pb'
import * as Types from '@keepkey/device-protocol/lib/types_pb'
import type * as core from '@shapeshiftoss/hdwallet-core'

export const FailureType = Types.FailureType

export function isKKFailureType<T extends typeof FailureType[keyof typeof FailureType]>(
  e: unknown,
  ...args: T[]
): e is
  | {
      message_enum: typeof Messages.MessageType['MESSAGETYPE_FAILURE']
      message: {
        code: T
        message: string
      }
    }
  | { failure_type: T; message: string } {
  if (
    e &&
    typeof e === 'object' &&
    'message_enum' in e &&
    e.message_enum === Messages.MessageType.MESSAGETYPE_FAILURE &&
    'message' in e &&
    e.message &&
    typeof e.message === 'object' &&
    'code' in e.message &&
    typeof e.message.code === 'number' &&
    (args as number[]).includes(e.message.code)
  ) {
    return true
  } else if (
    e &&
    typeof e === 'object' &&
    'failure_type' in e &&
    typeof e.failure_type === 'number' &&
    (args as number[]).includes(e.failure_type)
  ) {
    return true
  } else {
    return false
  }
}

export async function adaptFailureType<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (
      isKKFailureType(e, Types.FailureType.FAILURE_ACTIONCANCELLED) &&
      e.message.toString() === 'PINs do not match'
    ) {
      throw {
        message_type: 'FAILURE',
        message_enum: Messages.MessageType.MESSAGETYPE_FAILURE,
        message: { code: Types.FailureType.FAILURE_PINMISMATCH, message: 'PINs do not match' },
        from_wallet: true,
      } satisfies core.Event
    } else {
      throw e
    }
  }
}
