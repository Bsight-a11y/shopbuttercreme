// sw.js — Buttercreme PWA Service Worker
// 캐시 버전을 바꾸면 사용자 브라우저의 캐시가 자동 갱신됩니다.
const CACHE_NAME = 'buttercreme-cache-v1';

// 오프라인에서도 보여줄 핵심 파일들 (필요에 맞게 경로 수정하세요)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 설치 시: 핵심 파일 미리 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// 활성화 시: 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리: 네트워크 우선, 실패 시 캐시 (사이트 자주 업데이트하는 경우 추천)
self.addEventListener('fetch', (event) => {
  // POST 등 non-GET 요청은 그대로 통과 (예: 이메일 가입 폼 Apps Script 호출)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
