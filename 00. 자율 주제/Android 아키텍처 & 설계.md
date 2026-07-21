---
title: "Android 아키텍처 & 설계"
author: "서지원"
notion: "https://app.notion.com/p/Android-30c4f7753cf280f88893c4c8b4c89ec4"
week: "2월 2주차"
category: "자율"
---


# Android 아키텍처 & 설계

# 1. Build Logic (빌드 로직)

안드로이드 프로젝트에서 빌드 로직은

👉 **프로젝트 전체에서 사용하는 라이브러리, 플러그인, 버전 관리 전략을 정의하는 영역**이다.

과거에는 각 `build.gradle` 파일마다 직접 버전을 작성했기 때문에

버전이 서로 달라지거나 충돌이 발생하는 문제가 많았다.

이를 해결하기 위해 등장한 것이 **Version Catalog**이다.

---

## 📌 Version Catalog

Version Catalog는

👉 **모든 라이브러리와 버전을 중앙에서 관리하는 방식**이다.

```toml
[versions]retrofit ="2.9.0"[libraries]retrofit = { module ="com.squareup.retrofit2:retrofit", version.ref ="retrofit" }
```

그리고 실제 사용은

```kotlin
implementation(libs.retrofit)
```

처럼 참조만 한다.

---

## 📌 왜 사용하는가?

- 버전 관리 일관성 확보

- 의존성 충돌 방지

- 유지보수 용이

- 팀 협업 시 안정성 증가

👉 대규모 프로젝트일수록 필수

---

# 2. 주요 라이브러리

---

## 1) Room DB

Room은 Android에서 제공하는 ORM(Object Relational Mapping) 라이브러리로

👉 SQLite를 보다 쉽게 사용할 수 있도록 도와준다.

직접 SQL을 작성할 수 있으며, DAO(Data Access Object)를 통해 데이터를 관리한다.

---

### 📌 사용하는 이유

- 로컬 데이터 저장

- 캐싱 (offline-first 구현)

- 네트워크 없을 때도 앱 동작 가능

---

👉 내 프로젝트에서는

사진 메타데이터, 키워드, 앨범 등을 저장하는 데 활용했음

---

## 2) Hilt (Dependency Injection)

Hilt는 DI(Dependency Injection)를 쉽게 사용할 수 있도록 만든 라이브러리이다.

---

### 📌 DI란?

객체를 직접 생성하지 않고

👉 외부에서 주입받는 방식

---

### 📌 왜 필요한가?

객체를 직접 생성하면

- 결합도 증가

- 테스트 어려움

- 유지보수 어려움

---

DI를 사용하면

- 유연한 구조

- 테스트 용이

- 확장성 증가

---

### 📌 핵심 개념

- **DIP (Dependency Inversion Principle)**

→ 구체적인 구현이 아닌 인터페이스에 의존

- **SOLID 원칙**

→ 객체지향 설계의 기본 원칙

---

### 📌 Hilt 특징

- Annotation 기반 설정 (`@Inject`, `@Module`)

- Singleton 관리

- 컴포넌트 스코프 관리

---

👉 안드로이드에서는 사실상 필수 라이브러리

---

## 3) Retrofit + OkHttp

네트워크 통신을 위한 라이브러리

---

### 📌 구성

- Retrofit → API 인터페이스 정의

- OkHttp → 실제 HTTP 통신 처리

---

### 📌 특징

- REST API 구조에 최적화

- JSON 직렬화 지원

- Coroutine과 쉽게 연동

---

👉 서버 통신의 표준

---

## 4) CameraX

카메라 기능을 구현하기 위한 라이브러리

---

### 📌 특징

- Lifecycle-aware

- 다양한 기기 호환

- Preview / ImageCapture 지원

→ 전면 + 후면 동시 촬영을 위해 사용했었음

---

# 3. 전체 아키텍처

안드로이드에서는 일반적으로

👉 레이어드 아키텍처 (Layered Architecture)를 사용한다.

---

## 📌 기본 구조

```plain text
app
 └ feature
     └data
         ├ db
         └ network
```

---

## 📌 확장 구조 (Clean Architecture)

```plain text
Presentation (UI)
   ↓
Domain
   ↓Data
```

---

## 📌 핵심 원칙

👉 **의존성은 항상 한 방향으로만 흐른다**

```plain text
UI → Domain →Data
```

반대로 의존하면 구조가 깨진다.

---

# 4. MVVM 패턴

Android에서 가장 많이 사용하는 아키텍처 패턴

---

## 📌 구조

```plain text
View (Compose)
   ↓
ViewModel
   ↓
Repository
   ↓Data
```

---

## 📌 각 역할

### View (Compose)

- UI를 그림

- 상태를 관찰

- 사용자 이벤트 전달

---

### ViewModel

- UI 상태 관리

- 비즈니스 로직 처리

- Repository와 연결

👉 UI와 Data 사이의 중간 역할

---

### Repository

- 데이터 소스 추상화

- DB / Network 통합 관리

---

### Data Layer

- 실제 데이터 처리

---

## 📌 핵심 원칙

👉 View는 ViewModel만 바라본다

👉 ViewModel은 UI를 몰라야 한다

---

# 5. Repository 패턴

Repository는

👉 데이터 소스를 하나로 추상화하는 역할을 한다.

---

## 📌 구조

```kotlin
classPhotoRepository(privateval api: PhotoApi,privateval dao: PhotoDao
)
```

---

## 📌 역할

- 네트워크 vs 로컬 선택

- 캐싱 전략 구현

- 데이터 가공

---

## 📌 장점

- UI와 Data 분리

- 유지보수 용이

- 테스트 용이

---

👉 아이랑 나랑에서

- 서버 사진 vs 로컬 사진 관리

- 업로드 / 다운로드 처리

---

# 6. 상태 관리 (Compose)

Jetpack Compose는

👉 **상태 기반 UI(State-driven UI)**이다.

---

## 📌 개념

UI는 상태(State)에 따라 자동으로 업데이트된다.

---

## 📌 예시

```kotlin
val uiStateby viewModel.uiState.collectAsState()
```

---

## 📌 데이터 흐름

```plain text
Repository → ViewModel → StateFlow → UI
```

---

👉 데이터가 바뀌면 UI가 자동으로 다시 그림

---

## 📌 장점

- 코드 간결

- 버그 감소

- UI 동기화 자동화

---

# 7. Coroutine & Flow

---

## 📌 Coroutine

비동기 처리를 위한 경량 스레드

---

## 📌 Thread 구조

- Main → UI

- IO → DB / Network

- Default → CPU 작업

---

👉 Main Thread blocking 시 ANR 발생

---

## 📌 Flow

비동기 데이터 스트림

---

### 종류

| 타입 | 설명 |
| --- | --- |
| Flow | 일반 데이터 |
| StateFlow | 상태 |
| SharedFlow | 이벤트 |

---

## 📌 예시

```kotlin
privateval _uiState = MutableStateFlow(UiState())
```

---

👉 Compose와 함께 필수 사용

---

# 8. Core Layer

---

## 1) Model

- DB / Network 데이터를 UI용으로 변환

- 순수 Kotlin 코드

---

## 2) Design System

- Color / Typography / Theme

- 공통 UI 컴포넌트

👉 앱 디자인 일관성 유지

---

## 3) UI

- 앱 전용 컴포넌트

👉 예: 앨범, 상세 화면

---

## 4) Common

- 공통 로직

- Coroutine / Utils

---

## 5) Navigation (Navigation3)

화면 이동 관리

---

### 특징

- NavKey 기반

- Stack 구조

---

### UX

- 뒤로가기 → pop

- 홈 → 종료

---

## 6) Notification

알림 관리

---

- Channel 기반

- 백그라운드 처리

---

## 7) DataStore

경량 데이터 저장

---

### 저장 대상

- 토큰

- 유저 정보

---

👉 앱 종료 후에도 유지됨

---

# 9. Data Layer

---

## 📌 구성

- DB (Room)

- Network (Retrofit)

---

## 📌 역할

- 데이터 가져오기

- UI에 맞게 가공

---

# 10. Sync (동기화)

---

## 📌 개념

로컬 DB와 서버 데이터를 맞추는 과정

---

## 📌 구성

- Patch → 서버 → 로컬

- Upload → 로컬 → 서버

---

## 📌 Offline-first

- 먼저 로컬 데이터 사용

- 이후 서버 동기화

---

👉 네트워크 없어도 앱 사용 가능

---

## 📌 WorkManager

백그라운드 작업 처리

---

### 사용 예

- 사진 업로드

- 데이터 동기화

---

# 11. Feature Layer

---

## 📌 개념

기능 단위 모듈

---

## 📌 예시

- feature:gallery

- feature:highlight

---

## 📌 구성

- UI

- ViewModel

- Repository

---

## 📌 장점

- 모듈화

- 협업 효율

---

# 12. UI (Compose)

---

## 📌 특징

- 선언형 UI

- Kotlin 기반

---

## 📌 장점

- 코드 간결

- 상태 기반 UI

---

👉 데이터 변경 → 자동 UI 갱신

---

# 13. Error Handling

---

## 📌 문제

- 네트워크 실패

- 서버 에러

---

## 📌 해결

```kotlin
sealedclassResult {dataclassSuccess(valdata: Any)dataclassError(val message: String)
}
```

---

👉 UI 상태로 변환하여 처리

---

# 14. Paging

---

## 📌 목적

대량 데이터 효율적 처리

- Lazy Loading

- 무한 스크롤

---

# 15. 이미지 처리

## 📌 라이브러리

- Coil / Glide

---

## 📌 역할

- 이미지 로딩

- 캐싱

- 메모리 관리

---

# 16. 권한 처리

---

## 📌 필요 권한

- Camera

- Storage

---

👉 CameraX 사용 시 필수

---

# 17. ANR

---

## 📌 정의

5초 이상 UI 응답 없음 → 앱 종료

---

## 📌 해결

- Coroutine 사용

- IO / Default 분리

---

# 🔥 최종 정리

---

## 📌 핵심 기술

- MVVM + Compose

- Hilt (DI)

- Repository Pattern

- Coroutine + Flow

- Room + Offline-first

---

## 📌 한 줄 정리

👉

**"Android 앱은 MVVM과 Clean Architecture 기반으로 설계하며,
Hilt를 통해 의존성을 관리하고,
Coroutine과 Flow를 활용해 비동기 처리를 수행하며,
Room과 WorkManager를 통해 Offline-first 구조를 구현한다."**

# 🔥 [추가] 18. Android vs Spring(Java) vs Vue 비교

---

Android 아키텍처는 단순히 모바일만의 구조가 아니라

👉 **웹(Spring), 프론트(Vue)와 동일한 개념을 공유하는 구조**이다.

이 비교를 이해하면 전체 시스템 설계를 더 깊게 이해할 수 있다.

---

## 📌 1) 전체 구조 비교

---

### 📱 Android (MVVM)

```plain text
UI → ViewModel → Repository →Data
```

---

### ☕ Spring (MVC)

```plain text
Controller → Service → Repository → DB
```

---

### 🌐 Vue

```plain text
Component → Store → API
```

---

## 📌 매핑 관계

| Android | Spring | Vue | 역할 |
| --- | --- | --- | --- |
| View (Compose) | View | Component | 화면 |
| ViewModel | Controller + Service | Store | 상태 + 로직 |
| Repository | Repository | API Layer | 데이터 처리 |
| Room DB | DB | LocalStorage | 저장 |

---

👉 즉,

**Android MVVM = Spring MVC 구조와 거의 동일**

---

## 📌 2) ViewModel vs Controller vs Store

---

### 📱 Android - ViewModel

- UI 상태 관리

- 비즈니스 로직 처리

- Repository 호출

---

### ☕ Spring

- Controller → 요청 처리

- Service → 비즈니스 로직

---

### 🌐 Vue

- Store(Pinia) → 상태 관리 + API 호출

---

## 📌 핵심 비교

👉 ViewModel은

**Controller + Service 역할을 동시에 수행**

---

👉 Vue Store와도 동일한 개념

---

## 📌 3) Repository 비교

---

### 📱 Android

```kotlin
classPhotoRepository(privateval api: PhotoApi,privateval dao: PhotoDao
)
```

---

### ☕ Spring

```java
@RepositorypublicinterfaceUserRepositoryextendsJpaRepository<User, Long> {}
```

---

### 🌐 Vue

```javascript
exportconstfetchUsers = () => axios.get("/users")
```

---

## 📌 차이점

| Android | Spring | Vue |
| --- | --- | --- |
| DB + Network 통합 | DB 중심 | API 중심 |
| Offline 가능 | 불가 | 불가 |

---

👉 Android Repository는

**로컬 DB + 서버를 함께 관리하는 구조**

---

## 📌 4) DI (Dependency Injection)

---

### 📱 Android - Hilt

```kotlin
@Injectlateinitvar repository: Repository
```

---

### ☕ Spring

```java
@Autowiredprivate UserService userService;
```

---

## 📌 공통점

- 객체 생성 자동화

- 의존성 주입

- Singleton 관리

---

👉 완전히 동일한 개념

---

## 📌 5) 비동기 처리

---

| Android | Spring | Vue |
| --- | --- | --- |
| Coroutine | Thread / @Async | Promise |
| Flow | 없음 | 없음 |

---

👉 Android는 Flow를 통해

**데이터 스트림 처리까지 가능**

---

## 📌 6) 상태 관리

---

### 📱 Android

- StateFlow

- LiveData

---

### 🌐 Vue

- reactive

- Pinia(Store)

---

## 📌 공통점

👉 상태 변경 → UI 자동 업데이트

---

👉 완전히 동일한 개념

---

## 📌 7) 데이터 흐름

---

### 📱 Android

```plain text
Repository → ViewModel → UI
```

---

### 🌐 Vue

```plain text
API → Store → Component
```

---

👉 동일한 흐름

---

## 📌 8) 가장 큰 차이 (핵심)

---

### 📱 Android

- Room (로컬 DB)

- WorkManager (백그라운드)

- Offline-first 가능

---

### 🌐 Vue / Spring

- 서버 중심 구조

- 네트워크 의존

---

👉 **Android는 오프라인에서도 동작 가능**

👉 가장 큰 차별점

---

# 🔥 [추가] 19. 왜 이런 구조를 사용하는가?

---

Android에서 MVVM + Clean Architecture를 사용하는 이유는

👉 **확장성과 유지보수를 고려한 설계**이다.

---

## 📌 1) 관심사 분리 (Separation of Concerns)

각 레이어가 역할을 나누기 때문에

- UI

- 비즈니스 로직

- 데이터 처리

가 분리된다.

---

👉 유지보수 용이

---

## 📌 2) 의존성 분리

```plain text
UI → ViewModel → Repository → Data
```

👉 한 방향 의존

---

👉 코드 변경 영향 최소화

---

## 📌 3) 테스트 용이

- Repository Mock 가능

- ViewModel 테스트 가능

---

👉 유지보수 + 안정성 증가

---

## 📌 4) 재사용성

- Feature 단위 분리

- 공통 모듈 활용

---

👉 협업에 유리
