export async function subscribePageToFacebookWebhooks(
  pageId: string,
  pageAccessToken: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscribed_fields: "messages,messaging_postbacks,messaging_optins",
          access_token: pageAccessToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Failed to subscribe page to webhooks"
      );
    }

    return {
      success: true,
      pageId,
      data,
    };
  } catch (error: any) {
    throw new Error(
      `Failed to subscribe page ${pageId} to webhooks: ${error.message}`
    );
  }
}
