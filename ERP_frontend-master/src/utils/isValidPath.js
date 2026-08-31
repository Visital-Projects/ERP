// src/utils/isValidPath.js
import { validPaths } from "./validRoutes";

export const isValidPath = (path) => {
  if (validPaths.has(path)) return true;

  // Handle dynamic patterns like /employees/:id, /sales/invoices/:id
  for (let route of validPaths) {
    if (route.includes(":")) {
      const regex = new RegExp("^" + route.replace(/:\w+/g, "\\d+") + "$");
      if (regex.test(path)) return true;
    }
  }

  return false;
};
