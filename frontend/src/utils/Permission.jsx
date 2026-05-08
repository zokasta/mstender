import { hasPermission } from "./hasPermission";

/**
 * =====================================================
 * COMPONENT
 * =====================================================
 */
export default function Permission({

  types = [],

  children,

}) {

  return hasPermission(types)
    ? <>{children}</>
    : null;
}