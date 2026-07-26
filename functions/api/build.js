import { handleBuild, methodNotAllowed } from "../_shared/automation.js";

export const onRequestPost = handleBuild;
export const onRequestGet = () => methodNotAllowed();
