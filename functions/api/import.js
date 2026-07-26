import { handleImport, methodNotAllowed } from "../_shared/automation.js";

export const onRequestPost = handleImport;
export const onRequestGet = () => methodNotAllowed();
