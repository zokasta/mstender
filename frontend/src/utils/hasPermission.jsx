import React from "react";

/**
 * =====================================================
 * CHECK ROLE
 * =====================================================
 */
export function hasPermission(types = []) {

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    const role = user?.type;

    if (!role) return false;

    // Single role support
    if (typeof types === "string") {

      return role === types;
    }

    // Multiple role support
    if (Array.isArray(types)) {

      return types.includes(role);
    }

    return false;

  } catch (error) {

    console.error(
      "hasPermission() failed:",
      error
    );

    return false;
  }
}

