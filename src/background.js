// 默认配置
var allRule = "匹配规则";
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
		console.log("background-收到消息：%s-%o", request.type, sender);
		if (request.type == "config") {
			chrome.storage.local.get({ "config": config }, function(data) {
				console.log("background-收到消息-加载配置：%o", data);
				config = data.config;
			});
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
			sendResponse({ "match": config.match, "rules": rules });
		} else {
			console.error("background-收到消息-类型错误：%o", request);
		}
	} else {
		console.error("background-收到消息-格式错误：%o", request);
	}
});

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

// 右键菜单消息
chrome.contextMenus.create({
	"title": "Chrome-Finder",
	"onclick": function() {
		sendMessageToContentScript({ "type": "find" }, function(response) {
			console.log("background-右键菜单：%o", response);
		});
	}
});

// 保存配置信息
function persist(data) {
	config = data;
	chrome.storage.local.set({ "config": config }, function() {
		console.log("background-保存配置：%o", config);
	});
}