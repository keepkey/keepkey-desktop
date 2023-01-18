import * as Messages from '@keepkey/device-protocol/lib/messages_pb'
import * as Types from '@keepkey/device-protocol/lib/types_pb'

export const FailureType = Types.FailureType

export function isKKFailureType<T extends typeof FailureType[keyof typeof FailureType]>(
  e: unknown,
  ...args: T[]
): boolean {
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
