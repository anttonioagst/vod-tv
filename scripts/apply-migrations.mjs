import { readFileSync } from 'fs';
import { join } from 'path';

const TOKEN = 'sbp_f2c694ba738f957d4bf7b8d275096cef0b4338d3';
const PROJECT = 'lyplbunxjertktddusug';
const URL = `https://api.supabase.com/v1/projects/${PROJECT}/database/query`;
const BASE = 'D:\\.ANTDEV\\02 - PROJECTS\\Websites\\vod-tv\\supabase\\migrations';

const migrations = [
  '001_create_profiles.sql',
  '002_create_channels.sql',
  '003_create_videos.sql',
  '004_create_follows.sql',
  '005_create_subscriptions.sql',
  '006_create_user_video_tables.sql',
  '007_create_referrals_affiliates.sql',
  '008_create_triggers.sql',
];

for (const file of migrations) {
  const sql = readFileSync(join(BASE, file), 'utf-8');
  const resp = await fetch(URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await resp.text();
  if (resp.ok) {
    console.log(`[OK]  ${file}`);
  } else {
    console.error(`[ERR] ${file}: ${resp.status} - ${body.slice(0, 300)}`);
  }
}
