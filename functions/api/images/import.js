import { handleImageImport, methodNotAllowed } from "../../_shared/automation.js";

export const onRequestPost = handleImageImport;
export const onRequestGet = () => methodNotAllowed();
