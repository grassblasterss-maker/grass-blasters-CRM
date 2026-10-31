import { estimate } from './estimate.js';
import { checklist } from './checklist.js';
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const decimal = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(n);
let member = null, lastEstimate = null, contentBrief = '', contentPrompt = '', cursor = null, recognition = null;
const titles = { overview: 'Overview', clients: 'Jobber clients', design: 'Design & materials', content: 'Content Studio', checklist: 'Launch checklist', connections: 'Connections & access' };
function notify(message) { $('toast').textContent = message; $('toast').hidden = false; setTimeout(() => $('toast').hidden = true, 4500); }
function showPage(page) {
  if (!member?.permissions.includes(page)) return;
  document.querySelectorAll('.page').forEach(el => el.hidden = el.id !== `page-${page}`);
  document.querySelectorAll('[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  $('page-title').textContent = titles[page];
  window.scrollTo(0, 0);
}
function clearSession() {
  member = null; cursor = null; lastEstimate = null; contentBrief = ''; contentPrompt = '';
  $('workspace').hidden = true; $('gate').hidden = false;
  $('client-list').replaceChildren(); $('client-status').textContent = 'Load clients to check the connection.';
  $('more-clients').hidden = true;
  $('estimate-form').reset(); $('content-form').reset(); $('estimate-result').textContent = 'Start with your measurements.';
  $('content-result').textContent = 'Your brief will appear here.';
  ['export-estimate', 'copy-content', 'export-content'].forEach(id => $(id).hidden = true);
  $('connection-status').textContent = 'Not checked yet.';
  recognition?.abort(); window.speechSynthesis?.cancel();
}
async function api(path) {
  const token = await window.Clerk?.session?.getToken();
  if (!token) { clearSession(); throw new Error('Sign in again to continue.'); }
  const response = await fetch(path, { headers: { authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) clearSession();
    const messages = { access_not_allowed: 'This account does not have access. Ask the owner to review your verified email and permissions.', sign_in_not_configured: 'Secure sign-in is not configured yet.', jobber_not_configured: 'Jobber website access is not configured yet. Your ChatGPT/Zapier connection is separate.', jobber_reconnect_required: 'The Jobber token expired or was rejected. Reconnect before loading clients.', jobber_rate_limited: 'Jobber is rate limiting requests. Try again shortly.', jobber_unavailable: 'Jobber could not be read. Check permissions, API version, and connection status.', sign_in_unavailable: 'The sign-in service is unavailable. Try again shortly.', session_expired: 'Your session expired. Sign in again.' };
    throw new Error(messages[data.error] || 'The request could not be completed.');
  }
  return data;
}
async function loadScript(src, key) {
  await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = src; script.async = true; script.crossOrigin = 'anonymous'; if (key) script.dataset.clerkPublishableKey = key; script.onload = resolve; script.onerror = () => reject(new Error('Sign-in could not load. Check your connection and try refreshing.')); document.head.appendChild(script); });
}
async function boot() {
  try {
    const response = await fetch('/api/auth/config', { cache: 'no-store' });
    if (!response.ok) throw new Error('Sign-in configuration is unavailable. Please try again later.');
    const config = await response.json();
    if (!config.configured) { $('gate-status').textContent = 'Private workspace setup is in progress. The owner must finish sign-in configuration before access opens.'; return; }
    const domain = atob(config.publishableKey.split('_')[2]).replace(/\$$/, '');
    if (!/^[a-z0-9.-]+$/i.test(domain)) throw new Error('Sign-in configuration is invalid.');
    await loadScript(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadScript(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, config.publishableKey);
    await window.Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
    if (!window.Clerk.session) {
      $('gate-status').textContent = 'Sign in with your invited email address.';
      window.Clerk.mountSignIn($('sign-in'), { forceRedirectUrl: window.location.origin, signUpForceRedirectUrl: window.location.origin });
      window.Clerk.addListener(({ session }) => { if (session) window.location.reload(); });
      return;
    }
    $('switch-account').hidden = false;
    const result = await api('/api/auth/session'); member = result.member;
    document.querySelectorAll('[data-page]').forEach(el => el.hidden = !member.permissions.includes(el.dataset.page));
    document.querySelectorAll('[data-permission]').forEach(el => el.hidden = !member.permissions.includes(el.dataset.permission));
    $('identity').textContent = `${member.email} · ${member.role}`;
    $('gate').hidden = true; $('workspace').hidden = false;
    showPage('overview');
    window.Clerk.addListener(({ session }) => { if (!session) { clearSession(); window.location.reload(); } });
  } catch (error) { $('gate-status').textContent = error.message; }
}
$('switch-account').onclick = async () => { clearSession(); await window.Clerk.signOut(); window.location.reload(); };
$('sign-out').onclick = async () => { clearSession(); try { await window.Clerk.signOut(); window.location.reload(); } catch { $('gate-status').textContent = 'Sign-out could not finish. Refresh and try again.'; } };
document.querySelectorAll('[data-page]').forEach(el => el.onclick = () => showPage(el.dataset.page));
document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => showPage(el.dataset.go));
async function clients(more = false) {
  $('refresh-clients').disabled = true; $('more-clients').disabled = true;
  if (!more) { $('client-list').replaceChildren(); cursor = null; }
  $('client-status').textContent = 'Reading Jobber…';
  try {
    const currentMember = member?.id;
    const data = await api('/api/jobber/clients' + (more && cursor ? `?after=${encodeURIComponent(cursor)}` : ''));
    if (!member || member.id !== currentMember) return;
    for (const client of data.clients) { const li = document.createElement('li'); li.textContent = client.name; $('client-list').appendChild(li); }
    cursor = data.pageInfo.endCursor;
    $('more-clients').hidden = !data.pageInfo.hasNextPage;
    $('client-status').textContent = `${$('client-list').children.length} clients loaded · Jobber · fetched ${new Date(data.fetchedAt).toLocaleString()}`;
  } catch (error) { $('client-status').textContent = error.message; $('more-clients').hidden = true; }
  finally { $('refresh-clients').disabled = false; $('more-clients').disabled = false; }
}
$('refresh-clients').onclick = () => clients(); $('more-clients').onclick = () => clients(true);
const form = $('estimate-form');
function measureLabels() {
  const type = form.elements.type.value;
  const units = { bulk: ['Area (square feet)', 'cubic yard'], area: ['Area (square feet)', 'square foot'], linear: ['Length (feet)', 'linear foot'], count: ['Number of plants / items', 'item'] }[type];
  $('measure-label').textContent = units[0]; $('pack-label').textContent = `Order increment (${units[1]} units)`; $('cost-label').textContent = `Cost per ${units[1]} ($)`;
  $('depth-label').hidden = $('factor-label').hidden = type !== 'bulk';
  form.elements.depth.disabled = form.elements.factor.disabled = type !== 'bulk';
  form.elements.percent.max = form.elements.pricing.value === 'margin' ? 99 : 1000;
}
form.addEventListener('input', () => { lastEstimate = null; $('export-estimate').hidden = true; $('estimate-result').textContent = 'Inputs changed. Calculate to update the worksheet.'; });
form.addEventListener('change', measureLabels);
form.onsubmit = event => {
  event.preventDefault();
  try {
    const inputs = Object.fromEntries(new FormData(form));
    const output = estimate(inputs); lastEstimate = { schemaVersion: 1, createdAt: new Date().toISOString(), project: inputs.project, inputs, output, status: 'worksheet_only_not_saved_to_jobber' };
    $('estimate-result').replaceChildren();
    const name = document.createElement('h3'); name.textContent = inputs.project; $('estimate-result').appendChild(name);
    const dl = document.createElement('dl');
    for (const [label, value] of [['Measured quantity', `${decimal(output.net)} ${output.unit}`], ['With waste / volume factor', `${decimal(output.quantity)} ${output.unit}`], ['Order quantity', `${decimal(output.ordered)} ${output.unit} (${output.packs} increments)`], ['Materials', money(output.materials)], ['Labor', money(output.labor)], ['Total entered cost', money(output.cost)], ['Gross profit', money(output.grossProfit)], ['Gross margin', `${decimal(output.grossMargin * 100)}%`]]) {
      const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; dl.append(dt, dd);
    }
    const price = document.createElement('p'); price.className = 'price'; price.textContent = money(output.price); $('estimate-result').append(dl, price); $('export-estimate').hidden = false;
  } catch (error) { lastEstimate = null; $('estimate-result').textContent = error.message; $('export-estimate').hidden = true; }
};
function download(name, text, type) { const url = URL.createObjectURL(new Blob([text], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
$('export-estimate').onclick = () => { if (lastEstimate) download('jarvis-material-worksheet.json', JSON.stringify(lastEstimate, null, 2), 'application/json'); };
$('content-form').addEventListener('input', () => { contentBrief = ''; contentPrompt = ''; $('copy-content').hidden = $('export-content').hidden = true; $('content-result').textContent = 'Inputs changed. Build the brief again.'; });
$('content-form').onsubmit = event => {
  event.preventDefault(); const data = new FormData(event.target); const platforms = data.getAll('platform');
  if (!platforms.length) { notify('Choose at least one platform.'); return; }
  const info = Object.fromEntries(data);
  contentPrompt = `Create a short-video content package for ${info.brand}.\nTopic: ${info.topic}\nFacts supplied by the owner: ${info.story}\nCall to action: ${info.cta}\nPlatforms: ${platforms.join(', ')}.\nProduce 3 hook options, a 20–40 second script, a shot list, and separate platform captions. ${info.brand === 'Grass Blasters' ? 'Use a clear local-service business voice.' : 'Use a first-person owner/behind-the-scenes voice.'}\nDo not invent results, savings, customer statements, prices, or footage. Flag missing facts. Keep customer addresses and private details out of captions. This is a draft for review, not permission to publish.`;
  contentBrief = `FILMING BRIEF — ${info.brand}\nPlanned filming date: ${info.date}\nTopic: ${info.topic}\nPlatforms: ${platforms.join(', ')}\nStatus: planned only — not scheduled or published\n\nSTORY NOTES\n${info.story}\n\nSHOT LIST STARTER (template, not AI-generated)\n1. Wide before shot of the work area.\n2. Close-up of the problem.\n3. Two or three clips of the work in progress.\n4. After shot from the same angle as the before.\n5. Owner explains one useful lesson or result.\n\nCALL TO ACTION\n${info.cta}\n\nAI PROMPT — paste into ChatGPT\n${contentPrompt}`;
  $('content-result').textContent = contentBrief; $('copy-content').hidden = $('export-content').hidden = false;
};
$('copy-content').onclick = async () => { try { await navigator.clipboard.writeText(contentPrompt); notify('AI prompt copied.'); } catch { notify('Clipboard unavailable. Download the brief instead.'); } };
$('export-content').onclick = () => { if (contentBrief) download('jarvis-content-brief.txt', contentBrief, 'text/plain'); };
for (const [group, items] of checklist) {
  const article = document.createElement('article'); article.className = 'check-group'; const title = document.createElement('h3'); title.textContent = group; article.append(title);
  for (const [name, status, detail] of items) { const row = document.createElement('div'); row.className = 'check-row'; const text = document.createElement('div'); const b = document.createElement('b'); b.textContent = name; const p = document.createElement('p'); p.textContent = detail; text.append(b, p); const badge = document.createElement('span'); badge.className = 'badge' + (status.startsWith('Built') ? ' built' : ''); badge.textContent = status; row.append(text, badge); article.append(row); }
  $('checklist').append(article);
}
$('refresh-connections').onclick = async () => {
  $('refresh-connections').disabled = true; $('connection-status').textContent = 'Checking server configuration…';
  try {
    const data = await api('/api/integrations/status'); if (!member) return;
    $('connection-status').replaceChildren();
    const labels = { signIn: 'Team sign-in', jobberRead: 'Jobber client read', inboundWebhook: 'Inbound event secret', actionWebhook: 'Zapier action routing', tablesIntakeWebhook: 'Zapier event persistence', outboundSigning: 'Outbound event signing', protectedToolApi: 'Private automation API' };
    for (const [key, label] of Object.entries(labels)) { const row = document.createElement('div'); row.className = 'connection'; const title = document.createElement('span'); title.textContent = label; const state = document.createElement('span'); state.className = 'badge'; state.textContent = data.integrations[key] ? 'Configured · test required' : 'Needs setup'; row.append(title, state); $('connection-status').append(row); }
  } catch (error) { $('connection-status').textContent = error.message; } finally { $('refresh-connections').disabled = false; }
};
function speak(message) {
  $('voice-status').textContent = message;
  if (!$('voice-replies').checked || !window.speechSynthesis) return;
  window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(message);
  const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-GB'); if (voice) utterance.voice = voice;
  utterance.rate = 1; window.speechSynthesis.speak(utterance);
}
$('mic').onclick = () => {
  if (!member) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { speak('Speech recognition is not available in this browser. Use the menu to navigate.'); return; }
  recognition?.abort(); recognition = new SpeechRecognition(); recognition.lang = 'en-US'; recognition.continuous = false; recognition.interimResults = false;
  recognition.onstart = () => { $('mic').disabled = true; $('voice-status').textContent = 'Listening…'; };
  recognition.onend = () => { $('mic').disabled = false; };
  recognition.onerror = event => { $('voice-status').textContent = `Microphone: ${event.error}. Check browser permission.`; };
  recognition.onresult = event => {
    if (!member) return;
    const q = event.results[0][0].transcript.toLowerCase().replace(/^(hey\s+)?jarvis[, ]*/, '').trim();
    if (/^(stop|cancel|be quiet)/.test(q)) { window.speechSynthesis?.cancel(); return; }
    if (!/^(open|show|go to|take me to)/.test(q)) { speak('Business actions are not connected yet. I can open design, content, clients, or your overview.'); return; }
    const routes = [['design', /design|material|estimat/], ['content', /content|social/], ['clients', /client|customer/], ['checklist', /checklist|launch/], ['connections', /connection|setting/], ['overview', /overview|home|dashboard/]];
    const found = routes.find(([, pattern]) => pattern.test(q));
    if (!found) speak('I did not find that page. Try open design or open content.');
    else if (!member.permissions.includes(found[0])) speak('Your account does not have access to that page.');
    else { showPage(found[0]); speak(`Opening ${titles[found[0]]}.`); }
  };
  try { recognition.start(); } catch { $('voice-status').textContent = 'Could not start listening. Try again.'; }
};
$('stop-voice').onclick = () => { recognition?.abort(); window.speechSynthesis?.cancel(); $('voice-status').textContent = 'Stopped.'; };
$('voice-replies').onchange = () => { if (!$('voice-replies').checked) window.speechSynthesis?.cancel(); };
measureLabels();
boot();
