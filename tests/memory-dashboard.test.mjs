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
