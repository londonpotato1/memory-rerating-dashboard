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

function styleMarkup() {
	return sectionBetween(html, "<style>", "</style>");
}

function stripTags(markup) {
	return markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function sectionUntilDetails(markup) {
	const detailsIndex = markup.indexOf("<details");
	assert.notEqual(detailsIndex, -1, "section should contain a details boundary");
	return markup.slice(0, detailsIndex);
}

function memoryFirstReadMarkup() {
	return sectionUntilDetails(memoryMarkup());
}

function pcbFirstReadMarkup() {
	return sectionUntilDetails(pcbMarkup());
}

function dataObjectSlice() {
	return sectionBetween(html, "const DATA = {", "\nconst fmt = {");
}

function renderedFirstReadSource() {
	const data = dataObjectSlice();
	const memoryData = sectionBetween(data, "beginnerSummary:", "scenarios: {");
	const pcbData = sectionBetween(data, "pcbChain: {", "summary:[");
	const renderers = sectionBetween(html, "function renderMemoryBeginner()", "function renderPcbGlossary");
	return `${memoryFirstReadMarkup()} ${pcbFirstReadMarkup()} ${memoryData} ${pcbData} ${renderers}`;
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
		/공식 AI 데이터센터 PCB 주문 지표가 제일 또렷해요\./,
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
		/공식 AI 데이터센터 PCB 주문 지표가 제일 또렷해요\./,
		"first ranked company summary should remain visible",
	);
	assert.match(
		html,
		/1년 급등과 AI 고객 확인 부족이 한꺼번에 부담이에요\./,
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

test("T-TOSS-000 baseline preserves current tab surfaces before Toss refactor", () => {
	const memory = memoryMarkup();
	const pcb = pcbMarkup();
	for (const id of [
		"themeToggle",
		"tab-memory",
		"tab-pcb",
		"memoryBeginnerSummary",
		"memoryGlossary",
		"memoryDecisionCards",
		"memoryCompanyCards",
		"pcbDecisionHero",
		"pcbTopFiveCards",
		"pcbScoreFormula",
		"pcbRankingTable",
		"pcbRankingCards",
	]) {
		assert.match(html, new RegExp(`id="${id}"`), `${id} should remain present`);
	}
	assert.match(memory, /3초 결론/, "memory first section should remain visible");
	assert.match(pcb, /AI PCB 16개 기업/, "PCB decision hero should remain visible");
	assert.match(
		html,
		/hashFor = \{memory:"#memory", pcb:"#pcb-chain"\}/,
		"hash mapping should remain exact",
	);
});

test("T-TOSS-001 toss-like token layer uses restrained fintech surfaces", () => {
	const css = styleMarkup();
	for (const token of [
		"--color-bg",
		"--color-surface",
		"--color-text",
		"--color-muted",
		"--color-accent",
	]) {
		assert.match(css, new RegExp(`${token}:`), `${token} should exist`);
	}
	assert.match(css, /--radius-card:8px/, "card radius should be 8px");
	assert.match(css, /body\{[^}]*background:var\(--color-bg\)/s, "body should use a quiet solid app background");
	assert.doesNotMatch(css, /body\{[^}]*background-image:/s, "body should not use decorative gradients");
	for (const forbidden of ["@toss/tds-colors", "Toss Product Sans", "Tossface", "--tds-"]) {
		assert.doesNotMatch(html, new RegExp(forbidden), `${forbidden} should not be copied into the app`);
	}
});

test("T-PCB-008 pcb ranking-first regression survives Toss refactor", () => {
	const pcb = pcbMarkup();
	assert.ok(
		pcb.trim().startsWith('<main id="pcbTab"'),
		"PCB markup should start at the PCB tab panel",
	);
	assert.ok(
		pcb.indexOf('id="pcbDecisionHero"') < pcb.indexOf("<section", pcb.indexOf('id="pcbDecisionHero"') + 1),
		"decision hero should be the first PCB section",
	);
	assert.ok(
		pcb.indexOf("pcbTopFiveCards") < pcb.indexOf("pcbRankingEvidence"),
		"Top 5 should stay before ranking evidence",
	);
	assert.doesNotMatch(
		pcb,
		/<details class="detailBox" id="pcbRankingEvidence" open>/,
		"ranking evidence should be collapsed by default",
	);
	assert.equal(html.match(/rankScore:\s*\{/g)?.length, 16, "rank score data should remain exactly 16");
	assert.match(html, /rankingDesktopSummary\(v\)/, "desktop four-line summary should remain wired");
	assert.match(html, /renderPcbRanking\(d\);/, "PCB overview should render ranking first");
});

test("T-TOSS-002 header tabs and theme controls follow Toss-like accessibility", () => {
	const css = styleMarkup();
	assert.doesNotMatch(
		html,
		/<button id="themeToggle"[^>]*>[^<]*[\u{1F300}-\u{1FAFF}]/u,
		"theme toggle should not use emoji as its visible control",
	);
	assert.doesNotMatch(html, /class="secIcon"[^>]*>[^<]+</, "section icon spans should not render emoji text");
	assert.doesNotMatch(html, /class="cardIcon"[^>]*>/, "card icon spans should not be rendered");
	assert.match(css, /\.themeToggle\{[^}]*(?:width|min-width):44px/s, "theme toggle needs a 44px touch target width");
	assert.match(css, /\.themeToggle\{[^}]*(?:height|min-height):44px/s, "theme toggle needs a 44px touch target height");
});

test("T-TOSS-003 memory first read is a concise story hero", () => {
	const firstRead = memoryFirstReadMarkup();
	assert.match(firstRead, /class="storyHero"/, "memory should open with a one-glance story hero");
	assert.match(firstRead, /결론/, "story hero should end with a one-line conclusion");
	assert.doesNotMatch(firstRead, /<table\b/, "story hero should not show tables");
	assert.doesNotMatch(
		stripTags(firstRead),
		/Forward PER|Trailing PER|PBR|CAPEX|FCF|Revision|thesis|trigger/,
		"story hero should avoid hard finance terms",
	);
	const heroText = stripTags(firstRead);
	assert.ok(heroText.length <= 260, `story hero should stay short for a glance: ${heroText.length}`);
	assert.equal(
		(memoryMarkup().match(/class="memorySummaryCard"/g) || []).length,
		4,
		"four summary cards remain available inside details",
	);
	const memorySource = sectionBetween(dataObjectSlice(), "beginnerSummary:", "scenarios: {");
	assert.doesNotMatch(
		memorySource,
		/PER\/PBR|CAPEX|FCF|EPS revision|hyperscaler|Forward PER|book-to-bill|pure-play|SOTP|ASP|CAPA|thesis|trigger/,
		"memory summary data should avoid hard terms",
	);
});

test("T-TOSS-004 long evidence stays below concise first-read sections", () => {
	const memory = memoryMarkup();
	const pcb = pcbMarkup();
	assert.ok(
		memory.indexOf("<details") < memory.indexOf("<table"),
		"memory tables should stay below first detail disclosure",
	);
	for (const tableId of ["pcbClaimsTable", "pcbCompaniesTable", "pcbValuationTable"]) {
		assert.ok(
			pcb.indexOf("pcbRankingEvidence") < pcb.indexOf(tableId),
			`${tableId} should stay below ranking evidence`,
		);
	}
	const summaries = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map(match => stripTags(match[1]));
	assert.ok(summaries.length > 8, "detail summaries should be present");
	for (const summary of summaries) {
		assert.ok(summary.length <= 32, `detail summary should be concise: ${summary}`);
	}
});

test("T-TOSS-005 pcb ranking remains first while adopting Toss-like finance cards", () => {
	const css = styleMarkup();
	const rankRule = css.match(/\.rankTopCard,\s*\.rankMobileCard\{[^}]*\}/s)?.[0] || "";
	assert.doesNotMatch(rankRule, /radial-gradient/, "ranking cards should not use decorative radial gradients");
	assert.match(rankRule, /border-radius:var\(--radius-card\)|border-radius:8px/, "ranking cards should use Toss-like card radius");
	const pcb = pcbMarkup();
	for (const marker of ["초보자용 용어", "pcbRankingEvidence", "pcbClaimsTable", "pcbValuationTable"]) {
		assert.ok(
			pcb.indexOf("pcbDecisionHero") < pcb.indexOf(marker),
			`PCB decision hero should stay before ${marker}`,
		);
	}
});

test("T-TOSS-006 visible copy replaces hard terms with concise Korean", () => {
	const visible = stripTags(renderedFirstReadSource());
	assert.doesNotMatch(
		visible,
		/hyperscaler|pure-play|book-to-bill|SOTP|ASP|CAPA|thesis|trigger/,
		"visible first-read copy should not expose unexplained specialist English terms",
	);
	assert.doesNotMatch(
		stripTags(html),
		/기준R|기준와|기준가|합산는/,
		"Korean copy should not contain broken mechanical replacement phrases",
	);
	for (const term of ["CAPEX", "FCF", "Forward", "Trailing"]) {
		const index = visible.indexOf(term);
		if (index === -1) continue;
		const context = visible.slice(Math.max(0, index - 40), index + 40);
		assert.match(
			context,
			/설비투자|남은 현금|예상|과거|쉽게|뜻/,
			`${term} should be paired with simple Korean context`,
		);
	}
});

test("T-TOSS-007 mobile cards fit without horizontal overflow", () => {
	const css = styleMarkup();
	const mobile = css.match(/@media\(max-width:900px\)\{[\s\S]*?\n  \}/)?.[0] || "";
	for (const selector of [
		"memorySummaryGrid",
		"memoryDecisionGrid",
		"memoryCompanyGrid",
		"topFiveGrid",
		"scoreFormulaGrid",
		"rankDecisionGrid",
	]) {
		assert.match(mobile, new RegExp(`\\.${selector}`), `${selector} should be handled in the mobile query`);
	}
	for (const selector of ["rankTopCard", "rankMobileCard", "scoreFormulaChip", "rankLine"]) {
		const rule = css.match(new RegExp(`\\.${selector}\\{[^}]*\\}`, "s"))?.[0] || css.match(new RegExp(`[^}]*\\.${selector}[^}]*\\{[^}]*\\}`, "s"))?.[0] || "";
		assert.match(rule, /min-width:0|overflow-wrap:anywhere/, `${selector} should have overflow protection`);
	}
});

test("T-TOSS-008 hash theme tabs and carousel remain wired", () => {
	assert.match(
		html,
		/hashFor = \{memory:"#memory", pcb:"#pcb-chain"\}/,
		"hash mapping should remain exact",
	);
	assert.match(html, /localStorage\.setItem\("mr-theme"/, "theme persistence should remain wired");
	for (const id of ["pcbValPrev", "pcbValNext", "pcbValuationFilters", "pcbValuationRail"]) {
		assert.match(html, new RegExp(`id="${id}"`), `${id} should remain present`);
	}
	assert.match(html, /addEventListener\("hashchange"/, "hashchange listener should remain present");
	assert.match(html, /rail\.addEventListener\("scroll"/, "valuation carousel scroll listener should remain present");
});
