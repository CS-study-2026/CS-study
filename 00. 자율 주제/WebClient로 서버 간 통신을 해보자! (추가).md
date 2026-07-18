---
title: "WebClient로 서버 간 통신을 해보자! (추가)"
author: "이혜림"
notion: "https://app.notion.com/p/WebClient-2fa4f7753cf2808f9e4dd1a1d09f052f"
week: "2월 2주차"
category: "자율"
---


# WebClient로 서버 간 통신을 해보자! (추가)

# 1. 서버 간 통신

## 1.1 서버 간 통신이 필요한 상황

- 인증 서버와의 통신

- 외부 API 연동

- **AI 서버, 데이터 분석 서버 연동**

<details>
<summary>마이크로서비스 아키텍처(MSA)</summary>

**대규모 애플리케이션을 기능 단위로 잘게 쪼개어 독립적인 서비스로 개발, 배포, 운영하는 소프트웨어 아키텍처 스타일**입니다. 레고 블록처럼 각 기능을 분리하여 서비스 간 API 통신으로 작동하며, 유연한 기술 스택 적용, 빠른 배포, 개별 스케일 아웃(Scale-out)이 장점인 반면 복잡도가 높고 통신 장애 관리 등 운영 부담이 있습니다.

**MSA의 핵심 특징 및 장점**

  - **독립적인 배포 및 개발**: 각 서비스가 독립적인 팀에 의해 개발되고 배포되어 전체 서비스 중단 없이 기능을 업데이트할 수 있습니다.

  - **유연한 기술 스택**: 서비스별로 적합한 언어나 데이터베이스(SQL/NoSQL)를 선택하여 사용할 수 있습니다.

  - **서비스별 스케일 아웃**: 특정 기능에 부하가 집중될 때 해당 서비스만 서버를 증설(Scale-out)하여 효율적인 자원 사용이 가능합니다.

  - **장애 격리**: 하나의 서비스가 다운되어도 전체 시스템이 아닌 해당 기능만 장애가 발생하여 시스템 안정성을 높일 수 있습니다.

**MSA의 단점 및 도전 과제**

  - **운영 복잡성 증가**: 서비스 수가 많아지면 모니터링, 추적, 관리가 어려워집니다.

  - **데이터 일관성(Consistency)**: 서비스별로 데이터베이스를 분리하기 때문에 분산 트랜잭션 처리가 복잡합니다.

  - **통신 비용**: HTTP, gRPC 등 네트워크를 통한 서비스 간 통신으로 인해 오버헤드가 발생할 수 있습니다.

  - **테스트의 어려움**: 여러 서비스가 연동되어 작동하므로 통합 테스트가 복잡합니다.

**주요 기술 구성 요소**

  - **[API 게이트웨이](https://www.google.com/search?q=API%20%EA%B2%8C%EC%9D%B4%ED%8A%B8%EC%9B%A8%EC%9D%B4&oq=MSA&gs_lcrp=EgZjaHJvbWUyDAgAEEUYORixAxiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDINCAgQABiDARixAxiABDIHCAkQABiABNIBCDIzNzBqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjzzfPHx8uSAxVXh1YBHdNgBAQQgK4QegYIAQgCEAg)**** (API Gateway)**: 클라이언트의 요청을 받아 적절한 마이크로서비스로 라우팅하는 입구 역할.

  - **[서비스 디스커버리](https://www.google.com/search?q=%EC%84%9C%EB%B9%84%EC%8A%A4%20%EB%94%94%EC%8A%A4%EC%BB%A4%EB%B2%84%EB%A6%AC&oq=MSA&gs_lcrp=EgZjaHJvbWUyDAgAEEUYORixAxiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDINCAgQABiDARixAxiABDIHCAkQABiABNIBCDIzNzBqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjzzfPHx8uSAxVXh1YBHdNgBAQQgK4QegYIAQgCEAo)**** (Service Discovery)**: 유레카(Eureka) 등과 같이 동적으로 변경되는 서비스의 위치를 찾아내는 기술.

  - **[설정 서버](https://www.google.com/search?q=%EC%84%A4%EC%A0%95%20%EC%84%9C%EB%B2%84&oq=MSA&gs_lcrp=EgZjaHJvbWUyDAgAEEUYORixAxiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDINCAgQABiDARixAxiABDIHCAkQABiABNIBCDIzNzBqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8&ved=2ahUKEwjzzfPHx8uSAxVXh1YBHdNgBAQQgK4QegYIAQgCEAw)**** (Config Server)**: 분산된 서비스들의 설정 정보를 중앙에서 통합 관리.
</details>

---

## 1.2 공통 프로젝트에서 사용한 통신 방식 

![image](../assets/notion/2fa4f775-3cf2-808f-9e4d-d1a1d09f052f/image-01.png)

![image](../assets/notion/2fa4f775-3cf2-808f-9e4d-d1a1d09f052f/image-02.png)

> ✅ 

  - **요청 처리 시간이 길다**

  - 결과 개수가 고정되어 있지 않다

  - 즉시 응답이 필요하지 않다

👉 이러한 특성 때문에 동기 방식보다는** 비동기 방식**이 적합 👉 **WebClient 활용**

---

# 2. WebClient란 무엇인가?

## 2.1 WebClient 개요

> 💡 **WebClient**는 Spring에서 제공하는 **비동기 · 논블로킹 HTTP 클라이언트**입니다.

**“Spring에서 HTTP 요청을 만드는 데에 이용되는 도구”**

- Spring WebFlux에 포함

```java
// build.gradle에 의존성 주입
implementation 'org.springframework.boot:spring-boot-starter-webflux'
```

## 2.2 WebClient의 특징 

[https://m.blog.naver.com/seek316/223337685249](https://m.blog.naver.com/seek316/223337685249)

### **교환 메서드 Exchange Method**

- 다양한 HTTP 메서드 (GET, POST, PUT, DELETE 등)에 대해 동일한 방식의 요청-응답 제어 구조 제공

  - `GET`이든, `POST`든, `DELETE`든 요청 방식과 응답 처리 방식 일관

  - 메서드만 다를 뿐 헤더 추가, 바디 설정, 응답 처리 방식은 완전 동일

### **반응형 및 비차단 Reactive & Non-Blocking**

> 💡 **반응형**

---

  - 데이터(결과)가 도착했을 때 그 이벤트에 반응해서 처리

> 💡 **비차단**

---

  - 어떤 작업이 끝날 때까지 현재 스레드가 기다리지 않는 방식

  - 요청을 보냈다고 해서 그 결과가 올 때까지 스레드를 붙잡아 두지 않는다. 

`동기는?` 응답이 올 때까지 현재 스레드 대기

- 반응형 프로그래밍 원칙을 기반으로 구축 → 스레드를 차단하지 않고 많은 수의 동시 연결을 처리해야 하는 어플리케이션 구축에 적합

### **기능적 API Functional API**

- HTTP 요청을 만들기 위한 Functional API를 제공.

- 메서드 체인을 사용하여 선언적 스타일로 요청을 조작할 수 있음

- **클래스 기반이 아니라 람다 + 체이닝 기반 API 사용**

```java
webClient.post()
    .uri("/ai/topics")
    .header("X-Internal-Token", token)
    .bodyValue(requestDto)
    .retrieve()
    .bodyToMono(Void.class);
```

### **비동기 처리 Asynchronous Processing**

- 비동기식 요청 가능, 반응형 스트림 지원 → 응답을 비동기식으로 처리 가능

### **오류 처리 Error Handling**

- 상태 코드 기반 오류 처리 및 예외 기반 오류 처리 포함 → 오류 처리 메커니즘 제공

- **HTTP 오류를 ****선언적****으로 처리.**

- 오류를 스트림의 일부로 다룬다

```java
// onStatus 사용 -> 상태 코드별 분기 처리 -> try-catch보다 흐름 명확
webClient.get()
    .uri("/data")
    .retrieve()
    .onStatus(
        status -> status.is4xxClientError(),
        response -> Mono.error(new IllegalArgumentException("Client Error"))
    )
    .onStatus(
        status -> status.is5xxServerError(),
        response -> Mono.error(new IllegalStateException("Server Error"))
    )
    .bodyToMono(String.class);

```

### **맞춤형 설정 Customizable Configuration**

- 기본 헤더, 시간 초과, 재시도 정책, 오류 처리 동작을 포함하여 클라이언트의 다양한 설정 가능

- 요청을 사용자가 정의할 수 있다

  - 개발자가 원하는 방식으로 세밀하게 조립할 수 있다.

  - HTTP 메서드, URL, 헤더, Content-Type, Body 등

## 2-3. WebClient의 장점

1. 향상된 성능

  1. 반응형 접근 방식을 통해 속도가 빨라지고 높은 부하를 더 효과적으로 처리

1. 더 깔끔한 코드

  1. 선언적 API를 사용하여 더 쉽게 코드를 읽고 유지 및 관리할 수 있음

1. 확장성

  1. Non-Blocking 특성을 통해 여러 요청을 동시에 효율적으로 처리

1. 반응형 생태계와의 통합

  1. Reactor와 같은 반응형 라이브러리와 원활하게 통합 → 반응형 애플리케이션을 개발하는 데 좋은 선택

  <details>
  <summary>`Reactor?`</summary>

낚시닷🐟
  </details>

# 3. 사용 예시

## WebClientConfig

```java
package com.ssafy.a405.backend.config;
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(
            @Value("${ai.server.base-url}") String baseUrl
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Configuration
    @RequiredArgsConstructor
    public class WebConfig implements WebMvcConfigurer {

        private final AIInternalTokenInterceptor aiInternalTokenInterceptor;

        @Override
        public void addInterceptors(InterceptorRegistry registry) {
            registry.addInterceptor(aiInternalTokenInterceptor)
                    .addPathPatterns("/api/ai/callback/**");
        }
    }

}

```

## AIServerClient

```java
package com.ssafy.a405.backend.service.ai;

@Slf4j
@Component
@RequiredArgsConstructor
public class AIServerClient {

    private final WebClient webClient;

    @Value("${ai.server.internal-token}")
    private String internalToken;

    @Value("${ai.server.topic-endpoint:/ai/topics/generate}")
    private String topicEndpoint;

    public Mono<Void> requestTopicGeneration(AITopicGenerateRequest request) {
        return webClient.post()
                .uri(topicEndpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .header("X-Internal-Token", internalToken) // FastAPI에서 검증하도록 권장
                .bodyValue(request)
                .retrieve() // 이 요청에 대한 응답을 말함 (callback을 retrieve하는 것이 아님)
                .onStatus(
                        status -> status.is4xxClientError() || status.is5xxServerError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(body ->
                                        Mono.error(new IllegalStateException(
                                                "AI Topic request failed: " + body
                                        ))
                                )
                )
                .bodyToMono(Void.class);
    }
}

```

## Service

```java
package com.ssafy.a405.backend.service.ai;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIQuestionService {

    private final AIQuestionRepository aiQuestionRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupJobMappingRepository groupJobMappingRepository;
    private final JobCompetencyRepository jobCompetencyRepository;
    private final AIServerClient aiServerClient;

    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    private static final int QUESTION_BATCH_SIZE = 50;

    // 질문 생성 요청
    @Transactional
    public void generateQuestions(Long groupId) {
 

				// ... DTO 생성, 내부 로직 어쩌구 저쩌구 ...
				
        // 비동기 요청
        aiServerClient.requestQuestionGeneration(request)
                .doOnSuccess(v -> log.info("[AI-QUESTION] AI 서버 요청 성공: requestId"))
                .doOnError(e -> log.error("[AI-QUESTION] AI 서버 요청 실패: {}", e.getMessage()))
                .subscribe();
    }
}

```

# 번외(1) Flux? Mono?

## 1️⃣ Mono와 Flux는 뭐냐?

### 공통점 (가장 중요)

`Mono`와 `Flux`는 둘 다 **Reactor의 리액티브 타입**이고,

> **“지금 값이 없을 수도 있고, 나중에 올 수도 있는 데이터 흐름”**

을 표현하는 객체야.

✔ 비동기

✔ 논블로킹

✔ 이벤트 기반

---

## 2️⃣ Mono vs Flux 차이 (핵심 요약)

| 구분 | Mono | Flux |
| --- | --- | --- |
| 방출 가능한 데이터 수 | 0 또는 1 | 0 ~ N |
| 완료 시점 | 값 1개 or 바로 완료 | 여러 개 후 완료 |
| 대표 용도 | 단건 응답 | 스트림 / 리스트 |
| 예시 | 단일 API 응답 | 채팅, 실시간 로그 |

✔ 이건 정의 수준이라 확실

---

## 3️⃣ Mono 자세히 보기

### ✔ 정의

> **Mono는 “최대 1개의 값”을 비동기로 전달**

### ✔ 예시

```java
Mono<User> monoUser;
```

가능한 상태:

  - 값 1개 (`User`)

  - 값 없음 (`Mono.empty()`)

  - 에러 (`Mono.error()`)

---

### ✔ 실무 예

```java
Mono<Void>
```

이건:

  - “값은 없고”

  - “완료 or 실패 신호만 있음”

👉 **지금 네 WebClient 코드가 이 케이스**

---

## 4️⃣ Flux 자세히 보기

### ✔ 정의

> **Flux는 “여러 개의 값이 시간에 따라 흘러오는 스트림”**

### ✔ 예시

```java
Flux<Message>
```

가능한 상태:

  - 0개

  - 1개

  - 1000개

  - 무한 스트림

---

### ✔ 실무 예

```java
Flux<ChatMessage>
```

  - WebSocket 메시지

  - 실시간 로그

  - SSE 이벤트

---

## 5️⃣ 가장 중요한 개념: “차가 아니다”

### ❌ 오해

```java
Mono<User> user = service.getUser();
```

→ “여기에 User가 들어있겠지?”

### ⭕ 진실

> `Mono`는 **User가 ‘언젠가 올 예정’이라는 약속(Promise)** 이다.

✔ 아직 실행 안 됐을 수도 있음

✔ 값이 아직 없음

---

## 6️⃣ 언제 실행되냐? (이게 진짜 중요)

### 핵심 규칙

> **Mono / Flux는 ****`subscribe()`****되기 전까지 아무 일도 안 일어난다**

```java
Mono<String> mono = webClient.get()...;
```

이 시점:

  - ❌ HTTP 요청 안 감

```java
mono.subscribe();
```

이 순간:

  - ⭕ 실제 요청 발생

✔ 확실한 Reactor 규칙

---

### Spring WebFlux에서는?

  - Controller가 `Mono` / `Flux`를 반환하면

  - **Spring이 대신 subscribe() 해줌**

그래서 우리가 직접 안 써도 됨

---

## 7️⃣ Mono / Flux 생명주기 (신호 3개)

리액티브 스트림은 **이 3가지만 보장**한다.

  1. `onNext` – 데이터 전달

  1. `onError` – 실패

  1. `onComplete` – 정상 종료

### Mono

```plain text
onNext (0 or 1회)
→ onComplete
```

### Flux

```plain text
onNext (여러 번)
→ onComplete
```

---

## 8️⃣ 지금 프로젝트에 대입하면

### WebClient 요청

```java
Mono<Void>requestTopicGeneration(...)
```

의미:

  - “AI 서버 요청을 **비동기로 보낼 거고**”

  - “성공 or 실패만 알려줄게”

  - “결과 데이터는 콜백으로 받을 거야”

👉 Mono가 딱 맞음

---

### 만약 Flux를 쓴다면?

예를 들어:

  - AI가 생성 중간중간 결과를 스트리밍으로 보내준다면

```java
Flux<PartialResult>
```

이런 구조가 맞았을 것

---

## 9️⃣ 언제 Mono / 언제 Flux? (기억용)

```plain text
결과 1개 → Mono
결과 여러 개 → Flux
결과 개수 모름 / 스트림 → Flux
결과 없음 → Mono<Void>
```

---

## 한 줄 요약

> `Mono`는 **0~1개의 값을 비동기로 전달하는 타입**,

`Flux`는 **여러 개의 값을 시간에 따라 전달하는 스트림 타입**이고,

둘 다 **subscribe되기 전까지는 아무 일도 하지 않는다.**

# 번외(2) Webflux와 flux, mono의 관계

## 1️⃣ 결론부터 명확히

> ✅ **WebFlux를 의존성에 추가하면 ****`Mono`**** / ****`Flux`****를 사용할 수 있다.**

✅ `Mono` / `Flux`는 **WebFlux 자체의 것이 아니라, Reactor(Core) 라이브러리**에서 온다.

✅ WebClient는 **Reactor(Mono/Flux)를 기반으로 동작**한다.

---

## 2️⃣ 의존성 관계를 정확히 풀어보자

### (1) `spring-boot-starter-webflux`가 포함하는 것 (확실함)

```plain text
implementation 'org.springframework.boot:spring-boot-starter-webflux'
```

이 스타터에는 내부적으로 다음이 포함돼:

  - `spring-webflux`

  - **`reactor-core`**

    - 👉 `Mono`

    - 👉 `Flux`

  - Netty(기본 서버)

즉,

> **WebFlux를 추가 = Reactor(Core)가 같이 들어온다**

---

### (2) Mono / Flux의 출처 (확실함)

  - `Mono`, `Flux`는 **Project Reactor**의 타입

  - 패키지:

```java
reactor.core.publisher.Mono
reactor.core.publisher.Flux
```

➡️ WebFlux는 **이 Reactor 타입을 “표준 비동기 타입”으로 채택**한 프레임워크야.

---

## 3️⃣ 그래서 “WebFlux ↔ Mono/Flux” 관계는?

### 정확한 관계 (중요)

```plain text
Project Reactor
   └── Mono / Flux (비동기 스트림 타입)
        └── WebFlux
             └── WebClient
```

  - Mono/Flux → **기반 기술**

  - WebFlux → **Spring의 Reactive 웹 프레임워크**

  - WebClient → **WebFlux 위에 만들어진 HTTP 클라이언트**

👉 **WebFlux는 Mono/Flux를 사용하도록 설계되었을 뿐, 직접 만드는 건 아님**

---

## 4️⃣ WebFlux 의존성만 추가해도 Mono를 쓸 수 있나?

### ✅ 가능 (확실함)

```java
Mono<String> mono = Mono.just("hello");
```

👉 별도의 reactor 의존성 추가 ❌

👉 WebFlux starter만으로 ⭕

---

## 5️⃣ 그럼 MVC 프로젝트에서도 Mono를 쓸 수 있나?

### ⚠️ 부분적으로 가능하지만 주의 필요 (확실함)

  - `spring-boot-starter-web` (MVC)만 있으면:

    - ❌ Mono/Flux 기본 제공 안 됨

  - 하지만:

```plain text
implementation 'io.projectreactor:reactor-core'
```

를 **직접 추가하면** 사용은 가능

📌 다만:

  - MVC는 **Servlet 기반, Blocking 모델**

  - Mono/Flux를 써도 **논블로킹 서버가 되지는 않음**

➡️ 그래서 WebClient + Mono를 제대로 쓰려면

**WebFlux 의존성을 함께 쓰는 게 정석**

---

## 6️⃣ 네 상황에 딱 맞게 정리하면

> ✔️ WebClient를 쓰기 위해 WebFlux를 의존성에 추가했고

✔️ 그 결과 Reactor(Core)가 포함되어

✔️ `Mono`, `Flux`를 자연스럽게 사용할 수 있는 상태다

그리고:

  - WebClient의 반환 타입이 `Mono<T>`인 이유는

👉 **WebFlux가 Reactor 기반으로 설계됐기 때문**

---

## 7️⃣ 한 문장 요약 (시험/면접용)

> Spring WebFlux는 Project Reactor의 `Mono`와 `Flux`를 기반으로 한

Reactive 웹 프레임워크이며,

WebClient는 이 WebFlux 위에서 동작하는 비동기 HTTP 클라이언트다.

---

## 8️⃣ 다음으로 이어지면 딱 좋은 질문

  - ❓ **MVC + WebFlux를 같이 쓰면 충돌한다는 말은 왜 나오는가?**

  - ❓ `Mono<Void>`는 어떤 의미인가?

  - ❓ WebClient를 MVC에서 써도 되는가?

여기까지 이해했으면

**Reactive 개념의 80%는 이미 잡은 상태**야 👍
