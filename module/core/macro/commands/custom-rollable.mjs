import { SYSTEM_ID } from "../../../constants.mjs";
import { verifyAndReturnActor, verifyAndReturnSelectedToken } from "./macro-utils-commands.mjs";

export function createCustomRollableMacro(rollableData) {
    const command = `
${verifyAndReturnSelectedToken}
${verifyAndReturnActor}
await globalThis.${SYSTEM_ID}.MacroMethods.customs.rollable({actor, id: "${rollableData.id}"});
`
    return command.trim();
}
