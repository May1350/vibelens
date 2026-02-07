# PRD: VibeLens (AI Quota Mission Control)

## 1. 프로젝트 개요
안티그래비티 내의 AGQ(Antigravity Quota) 확장 프로그램의 모든 기능을 완벽하게 지원하며, 이를 넘어 여러 계정과 서비스(Clause, Cursor 등)를 중앙 집중식 웹 대시보드에서 관리할 수 있는 AI 사용량 관제 시스템입니다.

## 2. 핵심 가치
1. **Perfect Compatibility**: IDE 내에서 AGQ와 동일하거나 더 나은 사용량 시각화 제공.
2. **Multi-Account Support**: 구글 계정 여러 개를 사용하는 유저를 위해 각 계정별 남은 쿼타를 통합 관리.
3. **Web-Based Mission Control**: IDE를 켜지 않아도 웹/모바일에서 실시간 상태 확인.

## 3. 주요 기능 및 요구사항

### 3.1. IDE 확장 프로그램 (VibeLens Tracker)
- **AGQ 기능 완벽 구현**: 
    - 상태 기반 실시간 게이지 (퍼센트 및 절대 수치 표시).
    - 모델별(Gemini, Claude, GPT) 상세 쿼타 분리 표시.
    - 쿼타 초기화(Refresh) 남은 시간 카운트다운.
- **Data Streaming**: IDE 내부에서 감지된 쿼타 데이터를 웹 대시보드로 실시간 전달.
- **Sync Key Management**: 웹 대시보드와 연결을 위한 고유 키 설정.

### 3.2. 중앙 웹 대시보드 (VibeLens Web)
- **다계정 통합 뷰**: 여러 안티그래비티 계정(구글 계정 A, B 등)의 데이터를 각각의 슬롯으로 관리 및 합산 표시.
- **정밀 데이터 시각화**: 소수점 단위의 상세 사용량 및 일별/시간별 사용 트렌드 차트.
- **알림 기능**: 특정 계정의 쿼타가 임계치(예: 10%) 이하로 떨어질 시 브라우저 푸시 알림.
- **보안**: 모든 데이터는 브라우저 로컬 스토리지에 저장 (Server-less architecture).

### 3.3. 확장 서비스 연동
- 안티그래비티(Antigravity)를 시작으로 Claude Code, Cursor 등의 세션 토큰/API 연동 지원.

## 4. UI/UX 디자인 가이드 (Minimalist Philosophy)
- **Core Principle**: **"Don't Make Me Think."** 불필요한 장식과 중복된 정보를 배제하고, 현재 가장 중요한 '잔여 쿼타' 정보만 극도로 강조한다.
- **Aesthetic**: 
    - **Extreme Minimalism**: 화려한 그라데이션 대신 단색과 여백을 활용한 깔끔한 UI.
    - **Premium Dark Mode**: 딥 블랙(#000) 배경에 텍스트와 게이지가 떠 있는 듯한 플로팅 디자인.
    - **Micro-interactions**: 데이터 업데이트 시에만 살짝 흔들리는 정도의 절제된 애니메이션.
- **UX Simplification**:
    - **One-Tap Access**: 모든 계정 정보는 스크롤 없이 한 화면에 들어와야 한다.
    - **Color Vocabulary**: 텍스트를 읽지 않아도 배경색이나 포인트 컬러의 변화만으로 위기 상황을 즉시 인지(Green/Red).

## 5. 기술 스택
- **Web**: Vanilla JS, CSS (Custom Properties), HTML5.
- **Extension**: VS Code Extension API 파생 (Antigravity 호환).
- **Communication**: LocalStorage Sync 또는 WebSockets (추후 고도화).

---
**Note**: 이 문서는 사용자의 요구에 따라 언제든 수정될 수 있으며, 모든 코드는 이 문서를 기준으로 작성됩니다.
