// src/integrations/pagerduty/pagerdutyNotifier.ts
import axios from 'axios';

export async function triggerPagerDuty(integrationKey: string, summary: string) {
  await axios.post('https://events.pagerduty.com/v2/enqueue', {
    routing_key: integrationKey,
    event_action: 'trigger',
    payload: { summary, source: 'mesh' }
  });
}
