export async function readClients(after = null) {
  if (!process.env.JOBBER_ACCESS_TOKEN || !process.env.JOBBER_API_VERSION) {
    return { status: 503, body: { error: 'jobber_not_configured' } };
  }
  try {
    const response = await fetch('https://api.getjobber.com/api/graphql', {
      method: 'POST', signal: AbortSignal.timeout(8000), redirect: 'error',
      headers: { authorization: `Bearer ${process.env.JOBBER_ACCESS_TOKEN}`, 'content-type': 'application/json', 'X-JOBBER-GRAPHQL-VERSION': process.env.JOBBER_API_VERSION },
      body: JSON.stringify({ query: 'query JarvisClients($after: String) { clients(first: 25, after: $after) { nodes { id name } pageInfo { hasNextPage endCursor } } }', variables: { after } })
    });
    if (response.status === 401) return { status: 503, body: { error: 'jobber_reconnect_required' } };
    if (response.status === 429) return { status: 429, body: { error: 'jobber_rate_limited' } };
    if (!response.ok) throw new Error('upstream');
    const result = await response.json();
    const clients = result.data?.clients;
    if (result.errors?.length || !Array.isArray(clients?.nodes) || typeof clients?.pageInfo?.hasNextPage !== 'boolean' || (clients.pageInfo.hasNextPage && !clients.pageInfo.endCursor)) throw new Error('schema');
    const nodes = clients.nodes.map(n => {
      if (typeof n.id !== 'string' || typeof n.name !== 'string') throw new Error('schema');
      return { id: n.id, name: n.name };
    });
    return { status: 200, body: { source: 'jobber', fetchedAt: new Date().toISOString(), clients: nodes, pageInfo: clients.pageInfo } };
  } catch {
    return { status: 502, body: { error: 'jobber_unavailable' } };
  }
}
