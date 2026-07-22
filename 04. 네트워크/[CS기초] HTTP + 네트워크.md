---
title: "[CS기초] **HTTP + 네트워크**"
author: "지우 정"
notion: "https://app.notion.com/p/CS-HTTP-3114f7753cf2803ebaa8fd882009573b"
week: "2월 4주차"
category: "자율"
topics: ["네트워크"]
---


# [CS기초] **HTTP + 네트워크**

[출처 - 이것이 ~~다 시리즈 CS책 수기 정리내역 README 형식 변환본]

## 1. 네트워크의 큰 틀

### 1.1 기본 구조

- **클라이언트(호스트)** → **중간 노드** → **서버(호스트)**

- **중간 노드 역할**: 호스트가 주고받는 정보를 수신지까지 안정적으로 전달

  - 예: 스위치, 라우터, 공유기

### 1.2 LAN / WAN

- **LAN**: 한정된 공간의 네트워크 (예: 집/회사 내부, 공유기 기준)

- **WAN**: LAN 간 통신 (ISP가 구축/관리)

  - 예: SK, KT 등

### 1.3 패킷 교환

- 네트워크에서 송수신되는 데이터 단위: **패킷**

- 구성

  - **페이로드(payload)**: 실제 데이터

  - **헤더(header)**: 부가 정보(주소/포트 등)

### 1.4 주소와 전송 방식

- 통신에는 상대를 특정하기 위한 **주소**가 필요

- **IP / MAC / PORT**

- 전송 방식

  - **유니캐스트**: 일대일

  - **브로드캐스트**: 일대다(같은 네트워크의 모든 호스트)

---

## 2. 클라이언트 ↔ 서버 패킷 교환 흐름

### 2.1 요청/응답 경로(현실적인 흐름)

`클라이언트(브라우저/App) → 로컬 캐시 → 프록시 → 게이트웨이/로드밸런서 → 오리진 서버 → (응답은 역방향)`

- **로컬 캐시**: 브라우저/OS 측 캐시

- **프록시 서버**: 캐싱/보안/필터링/성능 개선

- **게이트웨이/로드밸런서**: 라우팅/부하 분산

- **오리진 서버**: 실제 리소스를 가진 최종 서버

### 2.2 캡슐화 / 역캡슐화

- 송신 과정: **캡슐화(계층별 헤더 붙임)**

- 수신 과정: **역캡슐화(계층별 헤더 제거)**

- 헤더 내용은 프로토콜 목적/계층에 따라 달라짐

### 2.3 프로토콜

- 통신 당사자 간 합의된 규약(=네트워크 언어)

---

## 3. 네트워크 참조 모델

### 3.1 OSI 7계층(이론 중심)

1. **물리 계층(비트)**: 0/1 신호 전달

1. **데이터링크 계층(프레임)**: 같은 LAN 내 통신, **MAC 주소**

  - 유선 LAN: **이더넷(Ethernet)** / 무선 LAN: **Wi-Fi**

  - **MTU(보통 1500B)**: 한 프레임에 실을 수 있는 최대 데이터 크기(실무에서 중요)

1. **네트워크 계층(패킷)**: 네트워크 간 통신, **IP**

1. **전송 계층(TCP 세그먼트 / UDP 데이터그램)**: 신뢰성/포트 기반 프로세스 식별

1. **세션 계층**: 연결 상태(세션) 생성/유지/종료

1. **표현 계층**: 인코딩/압축/암호화(번역)

1. **응용 계층**: HTTP, DNS 등 사용자와 맞닿는 계층

### 3.2 TCP/IP 4계층(구현 중심)

- **네트워크 액세스**(=물리+데이터링크)

- **인터넷**(=네트워크/IP)

- **전송**(TCP/UDP)

- **응용**(=세션+표현+응용)

---

# 네트워크 계층(IP)

## 4. IP의 목적과 특징

### 4.1 목적

- **주소 지정**: 네트워크 간 통신에서 호스트를 특정

- **라우팅**: 라우터가 IP 기반으로 최적 경로 선택하여 전달

  - 예: 공유기(가정용 라우터)

### 4.2 단편화(Fragmentation)

- 큰 데이터를 여러 IP 패킷으로 쪼개 전송

- 관련 필드

  - **식별자(ID)**: 같은 원본에서 쪼개진 패킷은 동일

  - **플래그**: 단편화 여부/더 남았는지

  - **단편화 오프셋**: 재조립을 위한 순서 정보

- 단점

  - 헤더 증가 → 트래픽/대역폭 낭비

  - 재조립 부하 → 성능 저하

### 4.3 특징

- **신뢰성 없음**: 유실/순서 뒤바뀜을 보장하지 않음

- **비연결형**: 사전 연결 과정 없이 전송

## 5. IP 주소 구조

- **네트워크 주소 + 호스트 주소**

- 공인/사설

  - **공인 IP**: 전 세계 고유, WAN 통신

  - **사설 IP**: 내부 네트워크용, 보통 공유기가 할당

- **DHCP**: 자동 IP 할당(임대 기간, 바뀔 수 있음)

---

# 전송 계층(TCP / UDP)

## 6. 포트(Port)의 의미

- IP/MAC은 “호스트”는 특정하지만,

- 실제 최종 송수신 대상인 “프로세스(서비스)”는 특정 불가

→ **포트 번호**로 프로세스를 식별

예) `192.168.0.1:8080`

- HTTP: 80 / HTTPS: 443 / 대체: 8080

---

## 7. TCP 특징(신뢰성 + 연결형)

### 7.1 TCP는 왜 신뢰적인가?

- **상태 관리(스테이트풀)**: 통신 단계/상태를 유지(디버깅 힌트)

- **오류 제어**: 손실/중복/타임아웃 감지 시 재전송

  - 중복 ACK 도착

  - 타임아웃 발생(재전송 타이머 만료)

- **흐름 제어**: 수신 측 처리 속도(수신 버퍼)를 고려하여 전송량 조절

- **혼잡 제어**: 네트워크 혼잡(유실/지연)을 유추하여 송신량 조절

  - 혼잡 윈도우 기반

  - 예: AIMD(선형 증가, 혼잡 시 절반 감소)

- **RTT**: 요청→응답까지 왕복 시간

### 7.2 TCP 연결 수립: 3-way handshake

1. Client → Server: **SYN** (Active Open)

1. Server → Client: **SYN + ACK** (Passive Open)

1. Client → Server: **ACK**

### 7.3 순서 보장 메커니즘

- **순서 번호(Sequence Number)**

- **확인 응답 번호(Ack Number)**: “다음에 이 번호를 기대한다”

---

## 8. UDP 특징(비신뢰 + 비연결)

- 연결 수립 없음, 상태 관리 없음

- 일반적으로 TCP보다 빠르지만 **유실/순서 보장 없음**

---

# HTTP 기초

## 9. HTTP의 목적과 특징

- 목적: 다양한 자원을 **데이터 형식에 구애받지 않고** 송수신

- 특징

  - **요청/응답 기반**

  - **미디어 독립적**

  - **Stateless**: 클라이언트 상태를 서버가 기억하지 않음

→ 서버 확장/대체가 쉬움(확장성/견고성)

  - **지속 연결(Keep-Alive)** 지원

    - 과거(HTTP/1.0 이하): 요청마다 TCP 연결 수립/종료(비지속)

    - 현재(HTTP/1.1 이상): 하나의 TCP 연결에서 여러 요청/응답 가능

### Stateless vs Stateful

- **Stateless**: HTTP 기본(REST API)

- **Stateful**: 상태 유지 필요 시(세션 로그인, WebSocket 등)

---

## 10. DNS

- 도메인 ↔ IP 매핑 관리(네임서버)

- 도메인 구조: `www.example.com.`

  - 루트 도메인: 맨 뒤 `.`(보통 생략)

  - 최상위 도메인: `com`, `net`, `kr` 등

- 로컬 네임서버가 계층적 질의를 반복(트래픽/지연 증가 가능)

- **DNS 캐시**: 이전 응답을 저장해 재사용

  - TTL(유효시간) 존재

---

## 11. URI / URL / URN

- **URI**: 자원을 식별하는 통일 방식

- **URN**: 이름 기반 식별(예: ISBN)

- **URL**: 위치 기반 식별

### URL 구조

`scheme://authority/path?query#fragment`

- scheme: 접근 방법(http/https)

- authority: 도메인/IP

- path: 자원 경로

- query: 매개변수(`?key=value`)

- fragment: 문서 내 특정 위치(`#section`)

---

## 12. HTTP 메시지 구조

- 구성: **시작라인(Start line) + 헤더(필드라인) + 본문(Body)**

### 요청 라인(Request Line)

- `METHOD /path HTTP/version`

### 상태 라인(Status Line)

- `HTTP/version status-code reason-phrase`

예시)

**Request**

```plain text
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Chrome
```

**Response**

```plain text
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 342
```

---

## 13. HTTP 메서드(REST API 설계 느낌)

- GET: 조회 (HEAD: 헤더만)

- POST: 생성/처리

- PUT: 전체 수정(덮어쓰기)

- PATCH: 부분 수정

- DELETE: 삭제

- 기타: CONNECT, OPTIONS, TRACE

---

## 14. HTTP 상태코드

### 2xx 성공

- 200 OK

- 201 Created

- 202 Accepted(처리 중)

- 204 No Content

### 3xx 리다이렉션

- 302 Found(메서드 변경 가능)

- 303 See Other(GET으로 변경)

- 307 Temporary Redirect(메서드 유지)

- 304 Not Modified(캐시 사용)

### 4xx 클라이언트 오류

- 400 Bad Request

- 401 Unauthorized(인증 필요)

- 403 Forbidden(권한 없음)

- 404 Not Found

- 405 Method Not Allowed

### 5xx 서버 오류

- 500 Internal Server Error

- 502 Bad Gateway(중간 서버 통신 오류)

---

## 15. 주요 HTTP 헤더

### 요청 헤더

- Host: 목적지 호스트

- User-Agent: 클라이언트 정보

- Referer: 유입 경로

### 응답 헤더

- Server: 서버 정보

- Allow: 허용 메서드

- Location: 리다이렉션/생성된 자원 위치

### 공통 헤더

- Date

- Content-Length

- Content-Type / Language / Encoding

- Connection: keep-alive / close

---

# HTTP 응용

## 16. 쿠키(Cookie)

- Stateless 보완 수단 (서버가 생성 → 클라이언트 저장)

- 흐름

  - 서버 → `Set-Cookie` 전송

  - 클라이언트 → 요청 시 `Cookie` 자동 포함

- 유효기간

  - Expires(날짜) / Max-Age(초)

- 보안 속성

  - Secure: HTTPS에서만 전송

  - HttpOnly: JS 접근 제한

---

## 17. 캐시(Cache)

- 응답 사본을 저장해 대역폭/지연 감소

- 위치: 브라우저/중간 서버 등

- 일관성 문제 → **캐시 신선도 검사** 필요

### 재검증 방식

- 날짜 기반: `If-Modified-Since`

  - 변경됨: 200 + 새 자원

  - 변경 안 됨: 304

- ETag 기반: `If-None-Match`

  - 버전 값(ETag) 비교로 변경 여부 판단

---

## 18. 콘텐츠 협상(Content Negotiation)

- 같은 자원이라도 표현이 다양할 수 있음(JSON/HTML, 언어 등)

- 헤더 예시

  - Accept (미디어 타입)

  - Accept-Language (언어)

  - Accept-Encoding (압축)

---

## 19. HTTPS / TLS

- HTTP + TLS(SSL) 기반 암호화 통신

- 흐름: `TCP 3-way handshake → TLS handshake → HTTP 데이터 송수신`

- TLS handshake

  - 키 생성/교환

  - 인증서 송수신/검증

- 인증서: “상대가 내가 의도한 서버가 맞다”를 제3의 CA가 보증

---

# 프록시 & 트래픽

## 20. 오리진 서버 vs 중간 서버

- **오리진 서버**: 자원 생성/권한 있는 최종 응답 서버

- **중간 서버**: 클라이언트-오리진 사이의 서버들

## 21. 프록시 종류

### 포워드 프록시(Forward Proxy)

- 클라이언트의 대리자

- 캐시/보안/접근 제한/필터링

### 리버스 프록시(Reverse Proxy = Gateway)

- 오리진 서버 앞단에서 요청 수신 후 전달

- 캐시/보안/로드밸런싱(로드밸런서 역할 포함 가능)

---

## 22. 고가용성(High Availability)

- 핵심: “장애가 없게”가 아니라 **장애가 있어도 계속 동작(결함 감내)** 하도록 설계

- 다운타임 원인: 트래픽 폭주, 장애, 보안 공격 등

### 방법

- **다중화**: 장애 시 예비 서버로 전환

- **로드밸런싱**: 트래픽 분산

### 로드밸런싱 알고리즘

- 라운드 로빈

- 최소 연결

- 가중치 기반 분배(서버 성능이 다를 때)

### 확장

- 스케일업(수직)

- 스케일아웃(수평)

- 오토스케일링(트래픽 따라 자동 증감)

---

# Web Server vs WAS + 전체 요청 흐름

## 23. 웹 서버(Web Server)

- HTTP 요청 수신

- 정적 콘텐츠(HTML/CSS/JS/이미지) 응답

## 24. WAS(Web Application Server)

- 동적 요청 처리(로직/DB 조회 등)

- 예: Tomcat, Spring Boot

---

## 25. 전체 흐름 예시

```plain text
[Client (브라우저/App)]
        ↓ ① HTTP 요청
[프록시/게이트웨이 (ex. Nginx)]
        ↓ ② 라우팅(정적/동적 분기)
        ├─→ 정적 자원 → 즉시 응답
        └─→ 동적 요청
               ↓
        [WAS (Tomcat/Spring)]
               ↓
[Controller → Service → Repository → DB]
               ↓
     (동적 응답 생성: HTML/JSON)
               ↓
[Nginx(Reverse Proxy)]
               ↓
[Client 렌더링/처리]
```

---

## 26. 용어 한 줄 요약

- **Proxy**: 요청 중계자(캐시/보안/필터링)

- **API Gateway**: 라우팅+인증+로깅+장애 처리 등 “관문 역할 강화”

- **Nginx**: 웹 서버 + 리버스 프록시 + 로드밸런싱 + HTTPS 처리

- **Tomcat**: Java WAS(Servlet 컨테이너)

- **Spring 계층**: Controller → Service → Repository → DB

---

# 키워드(면접/복습 체크리스트)

- OSI7, TCP/IP 4계층

- TCP vs UDP, 3-way handshake / 4-way termination

- HTTP 구조(메서드/헤더/상태코드), REST 원칙

- Keep-Alive, Connection Pooling

- DNS, IP, NAT, 포트

- TLS/SSL, 인증서

- CORS, 프록시, 로드밸런서

- WebSocket(양방향 통신)

- 쿠키/세션/토큰(JWT)
