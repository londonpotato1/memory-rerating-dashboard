import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function sectionBetween(source, startMarker, endMarker) {
	const start = source.indexOf(startMarker);
	const end = source.indexOf(endMarker, start);
	assert.notEqual(start, -1, `${startMarker} marker should exist`);
	assert.notEqual(
		end,
		-1,
		`${endMarker} marker should exist after ${startMarker}`,
	);
	return source.slice(start, end);
}

function memoryMarkup() {
	return sectionBetween(html, '<main id="memoryTab"', '<main id="pcbTab"');
}

function pcbMarkup() {
	return sectionBetween(html, '<main id="pcbTab"', "</main>");
}

test("memory beginner summary exposes four 3-second conclusion cards", () => {
	const memory = memoryMarkup();
	assert.match(
		memory,
		/3초 결론/,
		"memory tab should start with a 3-second conclusion section",
	);
	assert.match(
		memory,
		/지금 무슨 이야기\?/,
		"summary should explain the story in beginner language",
	);
	assert.match(
		memory,
		/왜 주가가 올랐나\?/,
		"summary should explain what moved the stock first",
	);
	assert.match(
		memory,
		/그래서 싼가\?/,
		"summary should avoid claiming it is simply cheap",
	);
	assert.match(
		memory,
		/무엇을 확인해야 하나\?/,
		"summary should show what to check next",
	);
});

test("memory tab includes beginner glossary terms as one-sentence cards", () => {
	const memory = memoryMarkup();
	for (const term of [
		"HBM",
		"DRAM",
		"EPS",
		"PER",
		"PBR",
		"CAPEX",
		"FCF",
		"리레이팅",
	]) {
		assert.match(
			memory,
			new RegExp(`<h3>${term}</h3>|<b>${term}</b>`),
			`${term} glossary term should be visible`,
		);
	}
	assert.match(
		memory,
		/AI 반도체 옆에서 데이터를 빠르게 주고받는 고급 메모리/,
		"HBM should use plain-language wording",
	);
	assert.match(
		memory,
		/시장[이은는]{1,2} 회사를 예전보다 더 높은 가격 기준으로 봐주는 것/,
		"rerating should be explained simply",
	);
});

test("memory valuation tables and sources are moved into accessible details", () => {
	const memory = memoryMarkup();
	assert.match(
		memory,
		/<summary>상세 밸류에이션 계산 펼치기<\/summary>/,
		"valuation table details should exist",
	);
	assert.match(
		memory,
		/<summary>EPS와 PER 가정 펼치기<\/summary>/,
		"EPS assumptions details should exist",
	);
	assert.match(
		memory,
		/<summary>출처와 기준일 펼치기<\/summary>/,
		"source details should exist",
	);
	const sourceDetailsStart = memory.indexOf(
		"<summary>출처와 기준일 펼치기</summary>",
	);
	const nextDetailsStart = memory.indexOf(
		"<summary>사이클·무효화 상세 검증 펼치기</summary>",
		sourceDetailsStart,
	);
	const sourceDetailsMarkup = memory.slice(
		sourceDetailsStart,
		nextDetailsStart,
	);
	assert.match(
		sourceDetailsMarkup,
		/id="sourceList"/,
		"full source list should live inside the source details",
	);

	const firstTableIndex = memory.indexOf("<table");
	const firstDetailsIndex = memory.indexOf("<details");
	assert.ok(
		firstDetailsIndex !== -1 && firstDetailsIndex < firstTableIndex,
		"memory tables should only appear after the first details accordion",
	);
});

test("memory company section renders as stock-style scenario cards", () => {
	const memory = memoryMarkup();
	assert.match(
		memory,
		/id="memoryCompanyCards"/,
		"memory company card container should remain present",
	);
	assert.match(
		html,
		/memoryStockCard/,
		"SK Hynix and Samsung should render with stock-card styling",
	);
	for (const label of ["Bear", "Base", "Bull", "조건부 관찰"]) {
		assert.match(
			html,
			new RegExp(label),
			`${label} should be visible on cards`,
		);
	}
});

test("hash tabs and pcb chain surface remain wired", () => {
	assert.match(
		html,
		/hashFor = \{memory:"#memory", pcb:"#pcb-chain"\}/,
		"hash mapping should preserve #memory and #pcb-chain",
	);
	assert.match(
		html,
		/<main id="pcbTab" class="tabPanel"/,
		"PCB tab panel should remain present",
	);
	assert.match(html, /AI PCB·CCL·동박/, "PCB tab label should remain present");
	assert.match(
		html,
		/function renderPcbChain\(\)/,
		"PCB render entry point should remain present",
	);
});

test("T-PCB-001 pcb first screen centers new-buy ranking headline and score formula", () => {
	const pcb = pcbMarkup();
	assert.match(
		pcb,
		/id="pcbDecisionHero"/,
		"PCB tab should start with a decision hero",
	);
	assert.match(
		pcb,
		/AI PCB 16개 기업, 지금 새로 산다면 어디가 더 매력적인가\?/,
		"PCB hero should use the requested ranking question",
	);
	assert.match(
		pcb,
		/id="pcbScoreFormula"/,
		"PCB hero should expose the scoring formula",
	);
	assert.ok(
		pcb.indexOf("pcbDecisionHero") < pcb.indexOf("초보자용 용어"),
		"decision ranking hero should appear before glossary content",
	);
});

test("T-PCB-002 pcb score model covers exactly sixteen companies with 100-point factor keys", () => {
	const rankScoreBlocks = html.match(/rankScore:\s*\{/g) || [];
	assert.equal(rankScoreBlocks.length, 16, "sixteen valuation models need rankScore data");
	for (const key of [
		"directBenefit",
		"earnings",
		"valueAttractiveness",
		"verification",
		"businessPurity",
		"lowRisk",
		"total",
		"rank",
		"easyLine",
		"goodPoint",
		"concernPoint",
	]) {
		assert.match(html, new RegExp(`${key}:`), `${key} should be part of rankScore`);
	}
	for (const weight of [
		"directBenefit:25",
		"earnings:20",
		"valueAttractiveness:20",
		"verification:15",
		"businessPurity:10",
		"lowRisk:10",
	]) {
		assert.match(html, new RegExp(weight), `${weight} should be in scoreFormula`);
	}
	for (let rank = 1; rank <= 16; rank += 1) {
		assert.match(html, new RegExp(`rank:${rank}\\b`), `rank ${rank} should exist`);
	}
});

test("T-PCB-003 pcb first screen exposes Top 5 and 1-to-16 ranking surfaces before long evidence", () => {
	const pcb = pcbMarkup();
	for (const id of [
		"pcbTopFiveCards",
		"pcbRankingTable",
		"pcbRankingCards",
		"pcbRankingEvidence",
	]) {
		assert.match(pcb, new RegExp(`id="${id}"`), `${id} should exist`);
	}
	assert.ok(
		pcb.indexOf("pcbTopFiveCards") < pcb.indexOf("pcbRankingEvidence"),
		"Top 5 cards should appear before collapsed evidence",
	);
	assert.ok(
		pcb.indexOf("pcbRankingTable") < pcb.indexOf("pcbRankingEvidence"),
		"ranking table should appear before collapsed evidence",
	);
	assert.ok(
		pcb.indexOf("pcbRankingEvidence") < pcb.indexOf("pcbClaimsTable"),
		"claim details should stay below the collapsed ranking evidence",
	);
});

test("T-PCB-004 pcb ranking renderer emits Top 5 and sixteen ranked rows/cards", () => {
	assert.match(html, /function renderPcbRanking\(d\)/, "ranking renderer should exist");
	assert.match(
		html,
		/renderPcbRanking\(d\);/,
		"renderPcbOverview should call ranking renderer",
	);
	assert.match(
		html,
		/querySelector\("#pcbRankingTable tbody"\)/,
		"renderer should target desktop ranking table body",
	);
	assert.match(
		html,
		/getElementById\("pcbRankingCards"\)/,
		"renderer should target mobile ranking cards",
	);
	assert.match(
		html,
		/filter\(v => v\.rankScore\.rank <= 5\)/,
		"Top 5 should be derived from valuationModels rankScore data",
	);
});

test("T-PCB-005 pcb company ranking cards use four beginner decision lines and collapse long evidence", () => {
	for (const label of ["점수/순위", "쉬운 한줄", "좋은점", "걸리는점"]) {
		assert.match(html, new RegExp(label), `${label} label should be rendered`);
	}
	assert.match(
		html,
		/공식 AI 데이터센터 PCB 주문 지표가 제일 선명하다\./,
		"TTM Top 5 copy should be beginner-friendly",
	);
	const pcb = pcbMarkup();
	const heroStart = pcb.indexOf('id="pcbDecisionHero"');
	const evidenceStart = pcb.indexOf('id="pcbRankingEvidence"');
	const firstScreen = pcb.slice(heroStart, evidenceStart);
	assert.doesNotMatch(
		firstScreen,
		/실적·멀티플/,
		"long valuation wording should not appear in the visible first-screen ranking body",
	);
});

test("T-PCB-007 pcb desktop ranking table renders all four decision lines for every company", () => {
	assert.match(
		html,
		/rankingDesktopSummary\(v\)/,
		"desktop table should use the same four-line summary data",
	);
	assert.match(
		html,
		/<td class="leftText rankDecisionCell">\$\{rankingDesktopSummary\(v\)\}<\/td>/,
		"desktop table should render full decision summary in a table cell",
	);
	for (const field of ["easyLine", "goodPoint", "concernPoint"]) {
		assert.match(
			html,
			new RegExp(`rankScore\\.${field}`),
			`desktop ranking summary should use ${field}`,
		);
	}
	assert.match(
		html,
		/공식 AI 데이터센터 PCB 주문 지표가 제일 선명하다\./,
		"first ranked company summary should remain visible",
	);
	assert.match(
		html,
		/1년 급등과 AI 고객 확인 부족이 동시에 부담이다\./,
		"last ranked company concern should remain available in ranking data",
	);
});

test("T-PCB-006 pcb beginner analogies replace hard terms in the ranking surface", () => {
	for (const analogy of [
		"AI 서버 안의 고속도로 판",
		"그 고속도로를 깔기 위한 바닥판",
		"전기가 지나가는 매끈한 구리 도로",
		"GPU와 보드를 잇는 초미세 연결 다리",
		"AI 서버를 실제로 조립하는 공장",
		"이미 주가에 기대가 얼마나 붙었는지 보는 가격표",
	]) {
		assert.match(html, new RegExp(analogy), `${analogy} analogy should be present`);
	}
});
