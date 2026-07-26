import { handleExport, methodNotAllowed } from "../_shared/automation.js";

export const onRequestPost = handleExport;
export const onRequestGet = () => methodNotAllowed();
