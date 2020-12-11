// 默认匹配规则：匹配所有规则
var allRule = "匹配规则";
// 默认配置信息
var config = {
	"match": "a",
	"rule": "匹配规则",
	"rules": {
		"匹配规则": []
	}
}

// 监听content-script消息：页面JS消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request) {
		console.log("background-收到消息：%s-%s", request.type, JSON.stringify(sender));
		if (request.type == "config") {
			sendResponse(buildFinderConfig());
		} else if(request.type == "size") {
			matchSize(request.size);
		} else {
			console.warn("background-收到消息-类型错误：%s", JSON.stringify(request));
		}
	} else {
		console.warn("background-收到消息-格式错误：%o", request);
	}
});

// 右键菜单消息
chrome.contextMenus.create({
	"title": "Chrome-Finder",
	"onclick": function() {
		sendMessageToContentScript({ "type": "find" }, function(response) {
			console.log("background-右键菜单：%s", JSON.stringify(response));
		});
	}
});

// 初始配置信息
function init() {
	chrome.storage.local.get({ "config": config }, function(data) {
		console.log("background-加载配置：%s", JSON.stringify(data));
		config = data.config;
	});
}

// 保存配置信息
function persist(data) {
	config = data;
	chrome.storage.local.set({ "config": config }, function() {
		console.log("background-保存配置：%s", JSON.stringify(config));
	});
	// 更新页面配置
	sendMessageToContentScript({ "type": "config", "config": buildFinderConfig() }, function(response) {
		console.log("background-更新配置：%s", JSON.stringify(response));
	});
}

// 发送content-script消息：页面JS消息
function sendMessageToContentScript(message, callback) {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
			if (callback) {
				callback(response);
			}
		});
	});
}

// 创建页面需要配置
function buildFinderConfig() {
	// 返回匹配规则
	var rules = [];
	if (config.rule == allRule) {
		for (var ruleKey in config.rules) {
			for (var rule of config.rules[ruleKey]) {
				rules[rules.length] = rule;
			}
		}
	} else {
		rules = config.rules[config.rule];
	}
	return { "match": config.match, "rules": rules };
}

// 查找结果
function matchSize(size) {
	chrome.browserAction.setBadgeText({"text": size.toString()});
	chrome.browserAction.setBadgeBackgroundColor({"color": [255, 0, 0, 255]});
}

// 初始配置
init();