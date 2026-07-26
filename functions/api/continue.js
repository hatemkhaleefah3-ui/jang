import { handleContinue, methodNotAllowed } from "../_shared/automation.js";

export const onRequestPost = handleContinue;
export const onRequestGet = () => methodNotAllowed();
