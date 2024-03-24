/// <reference types="@types/serviceworker" />
import PQueue from 'p-queue';

import { jitter } from './jitter';
import { transformJpegXLToBmp } from './transformJpegXLToBmp';
import { zstdFetch as fetch } from './zstdFetch';

// ServiceWorker が負荷で落ちないように並列リクエスト数を制限する
const queue = new PQueue({
  concurrency: 5,
});

self.addEventListener('install', (ev: ExtendableEvent) => {
  ev.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (ev: ExtendableEvent) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (ev: FetchEvent) => {
  ev.respondWith(
    queue.add(() => onFetch(ev.request), {
      throwOnTimeout: true,
    }),
  );
});

async function onFetch(request: Request): Promise<Response> {
  // キャッシュを参照
  if (request.method === 'GET') {
    const cache = await caches.open('images');
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }
  }

  // サーバーの負荷を分散するために Jitter 処理をいれる
  await jitter();

  const res = await fetch(request);

  if (request.method === 'GET' && res.status === 200) {
    const cache = await caches.open('images');
    if (res.headers.get('Content-Type') === 'image/jxl') {
      const transformed = await transformJpegXLToBmp(res);
      cache.put(request, transformed);
      return transformed;
    }

    cache.put(request, res.clone());
  }

  return res;
}
