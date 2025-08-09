// src/integrations/slack/slackBot.ts
import { WebClient } from '@slack/web-api';
const slack = new WebClient(process.env.SLACK_TOKEN);

export async function postOverrideAlert(channel: string, message: string) {
  await slack.chat.postMessage({ channel, text: `[Override Alert] ${message}` });
}
