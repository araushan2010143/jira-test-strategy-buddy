interface AdfNode {
  type: string;
  text?: string;
  content?: AdfNode[];
  attrs?: Record<string, unknown>;
}

function extractText(node: AdfNode): string {
  if (node.type === 'text') return node.text || '';
  if (!node.content) return '';
  return node.content.map(extractText).join(node.type === 'paragraph' ? '\n' : '');
}

export function parseJiraDescription(description: unknown): string {
  if (!description) return 'No description provided.';
  if (typeof description === 'string') return description;
  if (typeof description === 'object' && description !== null) {
    try {
      const adf = description as AdfNode;
      if (adf.type === 'doc' && adf.content) {
        return adf.content.map(extractText).join('\n\n').trim() || 'No description provided.';
      }
    } catch {
      return 'Description format not parseable.';
    }
  }
  return 'No description provided.';
}
