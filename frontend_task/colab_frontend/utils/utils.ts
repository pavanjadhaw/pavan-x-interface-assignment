import { GetOrganizationActivityResponse } from "@/queries/get-organization-activity";
import { DocumentActivity } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export function getInitialsFromEmail(email: string) {
  return email.split("@")[0].substring(0, 2).toUpperCase();
}

export function getUsernameFromEmail(email: string) {
  return email.split("@")[0];
}

export function getDocumentActivityDescription(
  // @ts-expect-error @TODO: fix this
  activity: GetOrganizationActivityResponse[number]
) {
  const actorUsername = getUsernameFromEmail(activity.actor.email);

  switch (activity.actionType) {
    case "CREATED":
      return `${actorUsername} created a new document`;
    case "UPDATED":
      return `${actorUsername} updated the document`;
    case "DELETED":
      return `${actorUsername} deleted the document`;
  }
}
