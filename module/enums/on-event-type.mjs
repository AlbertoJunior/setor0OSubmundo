export const OnEventType = Object.freeze({
  CHARACTERISTIC: 'characteristic',
  ADD: 'add',
  REMOVE: 'remove',
  EDIT: 'edit',
  VIEW: 'view',
  CHAT: 'chat',
  CHANGE: 'change',
  CONTEXTUAL: 'contextual',
  CHECK: 'check',
  CHECK_CONTEXTUAL: 'check_contextual',
  ROLL: 'roll',
});

export const OnMethod = Object.freeze({
  CLICK: 'click',
  CONTEXTUAL: 'contextual',
  CHANGE: 'change',
});

export const OnEventTypeClickableEvents = Object.values(OnEventType)
  .filter(event => event !== OnEventType.CHARACTERISTIC)
  .filter(event => event !== OnEventType.CHANGE)
  .filter(event => event !== OnEventType.CONTEXTUAL);

export const OnEventTypeContextualEvents = [OnEventType.CONTEXTUAL, OnEventType.CHECK_CONTEXTUAL];

export function verifyAndParseOnEventType(action, onMethod) {
  if (action == OnEventType.CHECK_CONTEXTUAL) {
    if (onMethod == OnMethod.CLICK) {
      return OnEventType.CHECK;
    }

    if (onMethod == OnMethod.CONTEXTUAL) {
      return OnEventType.CONTEXTUAL;
    }
  }

  return action;
}