// lib/slack/slackClient.ts
interface SlackMessageOptions {
    channelId: string;
    text: string;
    callbackId: string;
    actions?: Array<{
        name: string;
        text: string;
        type: 'button' | 'select';
        value?: string;
        options?: Array<{ text: string; value: string }>;
    }>;
}

type SlackBlock =
    | {
        type: 'section';
        text: {
            type: 'mrkdwn';
            text: string;
        };
    }
    | {
        type: 'actions';
        block_id: string;
        elements: Array<
            | {
                type: 'button';
                text: {
                    type: 'plain_text';
                    text: string;
                };
                value: string;
                action_id: string;
            }
            | {
                type: 'static_select';
                placeholder: {
                    type: 'plain_text';
                    text: string;
                };
                options?: Array<{
                    text: {
                        type: 'plain_text';
                        text: string;
                    };
                    value: string;
                }>;
                action_id: string;
            }
        >;
    };

export class SlackClient {
    private webhookUrl: string;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }

    async sendInteractiveMessage(options: SlackMessageOptions) {
        const blocks: SlackBlock[] = [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: options.text
                }
            }
        ];

        // إضافة أزرار تفاعلية
        if (options.actions && options.actions.length > 0) {
            const actionElements: Array<{ type: 'button'; text: { type: 'plain_text'; text: string }; value: string; action_id: string } | { type: 'static_select'; placeholder: { type: 'plain_text'; text: string }; options?: Array<{ text: { type: 'plain_text'; text: string }; value: string }>; action_id: string }> = [];
            for (const action of options.actions) {
                if (action.type === 'button') {
                    actionElements.push({
                        type: 'button' as const,
                        text: { type: 'plain_text' as const, text: action.text },
                        value: action.value || action.name,
                        action_id: action.name,
                    });
                } else if (action.type === 'select') {
                    actionElements.push({
                        type: 'static_select' as const,
                        placeholder: { type: 'plain_text' as const, text: action.text },
                        options: action.options?.map(opt => ({
                            text: { type: 'plain_text' as const, text: opt.text },
                            value: opt.value,
                        })),
                        action_id: action.name,
                    });
                }
            }

            blocks.push({
                type: 'actions',
                block_id: options.callbackId, // استخدام callback_id كـ block_id
                elements: actionElements
            });
        }

        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                blocks,
                text: options.text // Fallback text
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send Slack message');
        }

        return response;
    }
}
