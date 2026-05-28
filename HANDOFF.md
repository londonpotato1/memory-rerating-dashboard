# Memory Rerating Dashboard Handoff

작성일: 2026-05-28 KST  
프로젝트: `/Users/timothy/Projects/memory-rerating-dashboard`  
배포 URL: https://londonpotato1.github.io/memory-rerating-dashboard/  
현재 로컬 브라우저: `file:///Users/timothy/Projects/memory-rerating-dashboard/index.html`

## 현재 상태

- 저장소는 깨끗한 상태에서 마무리됨.
- 최신 커밋: `e59d3ad refactor: improve valuation dashboard auditability`
- 원격 `origin/main`에 푸시 완료.
- GitHub Pages 배포본에서도 새 HTML 반영 확인 완료.
- 주요 파일은 단일 정적 HTML: `index.html`

## 대시보드의 현재 목적

SK하이닉스와 삼성전자 매수 판단을 단순 목표가가 아니라 다음 체인으로 검증하는 교육용 대시보드:

1. AI 인프라 수요가 지속되는가
2. HBM/DRAM 가격과 물량이 유지되는가
3. 2026E EPS 컨센서스가 달성되는가
4. 현재 PER이 여전히 싸다고 볼 수 있는가
5. 분할매수와 무효화 조건을 어떻게 둘 것인가

현재 대시보드의 핵심 결론:

- 밸류에이션은 미국 메모리 기준주인 마이크론보다 낮다.
- 하지만 “싸다”는 결론은 2026E EPS 컨센서스 달성이 전제다.
- EPS가 20% 낮아지면 역프는 대부분 사라진다.
- 따라서 목표가 하나보다 EPS 추정치, DRAM/HBM 가격, 외국인 수급, CAPEX 지속성을 추적해야 한다.

## 완료된 리팩토링

`index.html`을 다음 방향으로 리팩토링했다.

- 수치/출처/시나리오를 `DATA` 객체로 분리
- PER, 역프, EPS 민감도, 확률가중 기대값, 분할매수 가격을 JS로 자동 계산
- 각 핵심 수치에 출처/기준일 배지 추가
- 모바일에서는 5사 비교표 대신 카드형 레이아웃 제공
- `STEP 1 — EPS 입력값 검증` 섹션 추가
- 2027E EPS와 3개월 revision trend는 무리하게 추정하지 않고 `확인 필요`로 표기
- bull/base/bear 시나리오에 확률과 확률가중 기대값 추가
- 3회 분할매수 가격대를 2026-05-27 종가 기준으로 자동 계산
- 접근성 개선: `main`, table `caption`, `scope`, 모바일 overflow 확인

검증 결과:

- `git diff --check` 통과
- 모바일 overflow: 표 영역을 제외하고 overflow 없음
- 공개 Pages에서 `검증상태`, `STEP 1`, `const DATA`, `3회 분할` 반영 확인
- 계산값:
  - SK하이닉스 역프: 약 `-20.9%`
  - 삼성전자 역프: 약 `-25.3%`
  - SK하이닉스 확률가중 기대값: `2,640,000원`
  - 삼성전자 확률가중 기대값: `413,000원`

## 현재 대시보드의 중요한 숫자

기준: 한국주식 2026-05-27 장마감, 미국주식 2026-05-26 종가

- SK하이닉스: `2,243,000원`, 2026E EPS `296,550`, Fwd PER 약 `7.6배`
- 삼성전자: `307,000원`, 2026E EPS `43,004`, Fwd PER 약 `7.1배`
- 마이크론: Fwd PER `9.56배`
- 역프:
  - SK하이닉스: `-20.9%`
  - 삼성전자: `-25.3%`

주의:

- 2027E EPS는 현재 대시보드에서 `확인 필요`
- 최근 3개월 EPS revision trend도 `정량 확인 필요`
- 외국인 수급, 금리, VIX, DRAM/HBM 가격 등은 수시 변동 데이터로 별도 재확인 필요

## 아직 남은 핵심 리서치 논제

사용자가 다음 논제를 제시했다:

> 삼성전자와 SK하이닉스를 매수한다는 것은 결국 AI 인프라 사이클, 특히 HBM/DRAM 수요 사이클에 투자한다는 뜻이다.  
> AI 사이클은 닷컴버블이나 스마트폰 초기 사이클과 어떻게 같고 다른가?  
> AI는 진짜여도 AI 관련 주식 또는 메모리주는 버블일 수 있는가?

반드시 세 가지를 분리해서 분석해야 한다.

1. 기술 채택 사이클: AI가 실제로 세상을 바꾸는가
2. CAPEX/인프라 사이클: GPU, 데이터센터, 전력, HBM 투자가 경제적으로 지속 가능한가
3. 주식시장 밸류에이션 사이클: 좋은 기술이라도 주가가 과도하게 선반영됐는가

## 다음 세션 권장 작업 순서

1. 웹 리서치로 최신 2026 데이터 수집
   - Microsoft, Alphabet, Amazon, Meta, Oracle의 2024~2026 CAPEX
   - 각 회사의 클라우드/AI 매출 성장률
   - FCF, 감가상각 부담, 경영진의 CAPEX 지속 발언
   - Nvidia backlog/order, GPU utilization 관련 공개 지표
   - HBM/DRAM 가격 및 공급 전망

2. 역사 비교 정리
   - 닷컴버블 1995~2002
   - 스마트폰 초기 2007~2015
   - AI 사이클 2022~2026
   - 비교 항목:
     - 실제 사용성
     - 매출 실체
     - 수익성
     - CAPEX 규모와 주체
     - adoption 속도
     - 대표 승자/패자
     - 밸류에이션 과열 지표
     - 붕괴/조정 trigger
     - 인프라 공급과잉 여부
     - 반도체 수요 영향

3. 삼성전자/SK하이닉스 연결
   - AI CAPEX 둔화가 HBM/DRAM 가격과 EPS에 미치는 민감도
   - SK하이닉스와 삼성전자 차이:
     - HBM 점유율
     - 기술력
     - 고객
     - 마진
     - 밸류에이션
   - “AI는 진짜”와 “메모리주는 지금 사도 된다” 사이의 빠진 연결고리 찾기

4. 대시보드 추가 섹션 설계
   - 추천 섹션명: `10. AI 사이클은 버블인가`
   - 하위 블록:
     - `AI는 진짜인가?`
     - `CAPEX는 지속 가능한가?`
     - `주가는 이미 선반영됐는가?`
     - `닷컴/스마트폰/AI 비교표`
     - `메모리주에 필요한 5개 연결고리`
     - `버블 붕괴 선행지표`

## 다음 세션용 리서치 프롬프트 요약

다음 세션에서 바로 사용할 질문:

```text
AI 사이클을 닷컴버블(1995~2002), 스마트폰 초기(2007~2015), 현재 AI(2022~2026)와 비교하라.
반드시 기술 채택, CAPEX 지속성, 주식 밸류에이션을 분리하라.

핵심 검증:
1. 닷컴버블 때는 정말 사업모델과 매출 실체가 부족했는가?
2. 닷컴버블 당시에도 광섬유/통신장비/서버 CAPEX 과잉이 있었는가?
3. 스마트폰 초기에는 AI처럼 hyperscaler 주도 초대형 CAPEX가 없었는가?
4. 현재 AI는 실제 매출, 사용성, 생산성 향상이 증명됐는가?
5. 현재 AI 매출과 ROI가 CAPEX를 정당화하는가?
6. AI CAPEX 둔화 시 HBM/DRAM 가격과 SK하이닉스/삼성전자 EPS는 얼마나 민감하게 꺾이는가?

출력:
- 한 줄 결론
- 닷컴/스마트폰/AI 비교표
- AI는 진짜인가 vs AI 주식은 버블인가 분리 판정
- hyperscaler CAPEX 지속가능성 표
- SK하이닉스/삼성전자 투자 논리와 리스크
- 버블 붕괴 선행지표
- 대시보드 추가 섹션 제안
- 모든 외부 수치에 URL + 날짜
```

## 리서치 시 우선 확인할 출처

공식/1차 출처 우선:

- Microsoft Investor Relations
- Alphabet Investor Relations
- Amazon Investor Relations
- Meta Investor Relations
- Oracle Investor Relations
- Nvidia Investor Relations
- SK hynix IR
- Samsung Electronics IR
- TrendForce 또는 DRAMeXchange
- SEC filings / annual reports

보조 출처:

- Stanford AI Index
- McKinsey State of AI
- OECD/World Bank/ITU 통신 인프라 데이터
- Nasdaq historical data
- IDC/Gartner/Counterpoint 스마트폰 출하량 자료

## 다음 세션 주의사항

- 사용자는 한국어로 답변을 선호한다.
- 투자 판단이므로 최신 데이터는 반드시 웹 검색해야 한다.
- AI가 진짜라는 사실과 AI 주식이 싸다는 결론을 섞으면 안 된다.
- “기술은 진짜지만 인프라/주식은 과열일 수 있다”는 프레임을 유지해야 한다.
- 대시보드에 추가할 경우 기존 정적 HTML 단일 파일 구조를 유지하는 편이 좋다.
- 기존 리팩토링 원칙: 숫자는 가능하면 `DATA` 객체에 넣고 화면은 자동 렌더링한다.

## 2026-05-28 추가 진행 상태

- `index.html`에 `10. AI 사이클은 버블인가` 섹션 추가.
- 핵심 판정은 세 축으로 분리:
  - 기술 채택: 실체 있음
  - CAPEX/인프라: 검증 중
  - 주식 밸류에이션: 가격 별도
- 5단계 프레임워크 판정:
  - 현재는 `2. 생산성 검증`을 통과하는 중이지만 `3. 인프라 과잉투자` 위험이 커지는 구간.
  - 아직 `4. 수익성 검증 실패`나 `5. 버블 붕괴/정상화`로 단정하지 않음.
- 추가된 화면 블록:
  - 닷컴버블 vs 스마트폰 초기 vs AI 사이클 비교표
  - Microsoft/Alphabet/Amazon/Meta/Oracle/Tesla·xAI CAPEX 지속가능성 표
  - 버블 붕괴 선행지표
  - 메모리주에 필요한 5개 연결고리
  - Bull/Base/Bear 시나리오
- 주요 신규 출처:
  - Microsoft FY26 Q3, 2026-04-29
  - Alphabet Q1 2026 transcript/slides, 2026-04-29
  - Amazon Q4 2025/Q1 2026, 2026-02-05/2026-04-29
  - Meta Q1 2026, 2026-04-29
  - Oracle FY26 Q3, 2026-03-10
  - NVIDIA FY27 Q1, 2026-05-20
  - TrendForce 1Q26/2Q26 memory price notes, 2026-01-05/2026-03-31
  - SK hynix Q1 2026, 2026-04-23
  - Samsung 1Q26 IR, 2026-04-30
- 검증:
  - `git diff --check` 통과
  - `<script>` 문법 검사 통과
  - Chrome/Playwright 모바일 렌더 확인, `#aiCapexTable` 렌더 확인
  - 모바일 body/html horizontal overflow를 `overflow-x:hidden`으로 차단
