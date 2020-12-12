// 默认匹配规则：匹配所有规则
var allRule = "匹配规则";
// 获取background对象
var background = chrome.extension.getBackgroundPage();
// 获取配置信息
var config = background.config;

// 匹配元素节点
var matchElement = document.getElementById("match");
// 选择规则节点
var ruleElement = document.getElementById("rule");
// 规则名称节点
var ruleKeyElement = document.getElementById("ruleKey");
// 规则文本节点
var ruleValueElement = document.getElementById("ruleValue");
// 更新按钮节点
var updateElement = document.getElementById("update");
// 删除按钮节点
var deleteElement = document.getElementById("delete");
// 备份按钮节点
var backupElement = document.getElementById("backup");
// 导入按钮节点
var loadElement = document.getElementById("load");
// 导入文件节点
var loadFileElement = document.getElementById("loadFile");

// 刷新页面
function refreshPage() {
	// 设置匹配原始
	matchElement.value = config.match;
	// 删除所有选择节点
	var childNodes = ruleElement.childNodes;
	for (var index = childNodes.length - 1; index >= 0; index--) {
		ruleElement.removeChild(childNodes[index]);
	}
	// 添加所有选择节点
	var selectRule = config.rule;
	var options = [];
	for (var ruleKey in config.rules) {
		var option = document.createElement("option");
		option.innerText = ruleKey;
		option.setAttribute("value", ruleKey);
		if (ruleKey == selectRule) {
			option.setAttribute("selected", true);
			ruleKeyElement.value = ruleKey;
			ruleValueElement.value = config.rules[ruleKey].join('\n');
		}
		options[options.length] = option;
	}
	// 节点排序
	options.sort(function(a, b) {
		var aValue = a.innerText;
		var bValue = b.innerText;
		if (aValue == allRule) {
			return -1;
		} else if (bValue == allRule) {
			return 1;
		} else {
			return aValue.length - bValue.length;
		}
	});
	for (var option of options) {
		ruleElement.appendChild(option);
	}
}

// 选择规则
function selectRule() {
	// 设置选择规则
	config.rule = ruleElement.value;
	console.log("popup-选择规则：%s", config.rule);
}

// 更新规则
function updateRule() {
	// 设置匹配元素
	var match = matchElement.value;
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
	if (!match || !ruleKey || !ruleValue) {
		console.warn("popup-更新规则-失败：%s-%s-%s", match, ruleKey, ruleValue);
		return;
	}
	config.rule = ruleKey;
	config.match = match;
	config.rules[ruleKey] = rules;
	console.log("popup-更新规则：%s-%s", ruleKey, JSON.stringify(rules));
}

// 删除规则
function deleteRule() {
	var ruleKey = ruleKeyElement.value;
	if (ruleKey == allRule) {
		console.warn("popup-删除规则-失败：%s", ruleKey);
		return;
	}
	delete config.rules[ruleKey];
	config.rule = allRule;
	console.log("popup-删除规则：%s", ruleKey);
}

// 备份配置
function backup() {
	//	var data = new Blob([JSON.stringify(config)], { type: "text/plain;charset=utf-8" });
	var data = new Blob([JSON.stringify(config)], { type: "application/json;charset=utf-8" });
	var downloadUrl = window.URL.createObjectURL(data);
	var anchor = document.createElement("a");
	anchor.href = downloadUrl;
	anchor.download = "chrome-finder-config.json";
	anchor.click();
	window.URL.revokeObjectURL(data);
}

// 导入配置
function load() {
	loadFileElement.click();
}

// 加载配置
function loadFile(event) {
	var reader = new FileReader();
	reader.readAsText(event.target.files[0]);
	reader.onload = function() {
		var result = this.result;
		try {
			config = JSON.parse(result);
			refreshPage();
			background.persist(config);
		} catch (e) {
			console.log("popup-加载配置-异常：%s-%o", result, e);
		}
	}
}

// 选择事件
ruleElement.onchange = function() {
	selectRule();
	refreshPage();
	background.persist(config);
}
// 更新事件
updateElement.onclick = function() {
	updateRule();
	refreshPage();
	background.persist(config);
}
// 删除事件
deleteElement.onclick = function() {
	deleteRule();
	refreshPage();
	background.persist(config);
}

// 备份事件
backupElement.onclick = function() {
	backup();
}

// 导入事件
loadElement.onclick = function() {
	load();
}

// 加载事件
loadFileElement.onchange = function(e) {
	loadFile(e);
}

// 刷新页面
refreshPage();