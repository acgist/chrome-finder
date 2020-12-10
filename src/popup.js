// 配置信息
var allRule = "匹配规则";
var background = chrome.extension.getBackgroundPage();
var config = background.config;

// 初始元素
var ruleElement = document.getElementById("rule");
var matchElement = document.getElementById("match");
var updateElement = document.getElementById("update");
var deleteElement = document.getElementById("delete");
var ruleKeyElement = document.getElementById("ruleKey");
var ruleValueElement = document.getElementById("ruleValue");

// 初始规则
function init() {
	// 设置匹配
	matchElement.value = config.match;
	// 删除节点
	var childNodes = ruleElement.childNodes;
	for (var index = childNodes.length - 1; index >= 0; index--) {
		ruleElement.removeChild(childNodes[index]);
	}
	// 设置规则
	var selectRule = config.rule;
	for (var ruleKey in config.rules) {
		var option = document.createElement("option");
		option.innerText = ruleKey;
		option.setAttribute("value", ruleKey);
		if (ruleKey == selectRule) {
			option.setAttribute("selected", true);
			ruleKeyElement.value = ruleKey;
			ruleValueElement.value = config.rules[ruleKey].join('\n');
		}
		ruleElement.appendChild(option);
	}
}

// 选择规则
function selectRule() {
	// 选中规则
	config.rule = ruleElement.value;
	console.log("popup-选中规则：%s", config.rule);
}

// 更新规则
function updateRule() {
	// 设置匹配
	config.match = matchElement.value;
	// 选中规则
	config.rule = ruleKeyElement.value;
	// 设置规则
	var ruleKey = ruleKeyElement.value;
	var ruleValue = ruleValueElement.value;
	var rules = [];
	var ruleValues = ruleValue.split('\n');
	for (var rule of ruleValues) {
		if (rule) {
			rules[rules.length] = rule;
		}
	}
	config.rules[ruleKey] = rules;
	console.log("popup-更新规则：%s-%o", ruleKey, rules);
	background.persist(config);
}

// 删除规则
function deleteRule() {
	var ruleKey = ruleKeyElement.value;
	if (ruleKey == allRule) {
		console.log("popup-禁止删除");
		return;
	}
	delete config.rules[ruleKey];
	config.rule = allRule;
	console.log("popup-删除规则：%s", ruleKey);
	background.persist(config);
}

// 选择事件
ruleElement.onchange = function() {
	selectRule();
	init();
}
// 更新事件
updateElement.onclick = function() {
	updateRule();
	init();
}
// 删除事件
deleteElement.onclick = function() {
	deleteRule();
	init();
}

// 初始配置
init();