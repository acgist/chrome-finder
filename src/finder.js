// 默认配置
var config = {};
// 是否查找
var matchRule = false;
// 选中元素样式
var matchClass = " finder-match";

// 监听background消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request) {
		console.log("finder-收到消息：%s-%s", request.type, JSON.stringify(sender));
		if (request.type == "find") {
			match();
			sendResponse({ "type": "success" });
		} else if (request.type == "config") {
			config = request.config;
			console.log("finder-收到消息-更新配置：%s", JSON.stringify(config));
			sendResponse({ "type": "success" });
		} else {
			console.warn("finder-收到消息-类型错误：%s", JSON.stringify(request));
		}
	} else {
		console.warn("finder-收到消息-格式错误：%o", request);
	}
});

// 获取配置
chrome.runtime.sendMessage(
	{ "type": "config" },
	function(response) {
		if (response) {
			config = response;
			console.log("finder-获取配置：%s", JSON.stringify(config));
		} else {
			console.warn("finder-获取配置-失败：%o", response);
		}
	}
);

// 监听页面事件：Ctrl + Q
document.onkeydown = function(e) {
	var ctrlKey = e.ctrlKey || e.metaKey;
	var keyCode = e.keyCode || e.which || e.charCode;
	if (ctrlKey && keyCode == 81) {
		match();
	}
	return true;
}

// 查找数据
function match() {
	matchRule = !matchRule;
	if (config) {
		var list = [];
		var elements = document.getElementsByTagName(config.match);
		for (var element of elements) {
			for (var rule of config.rules) {
				if (element && rule) {
					var text = element.innerText;
					if (text && (text.search(rule) >= 0 || text.toUpperCase().search(rule.toUpperCase()) >= 0)) {
						if (!list.includes(element)) {
							list[list.length] = element;
						}
					}
				}
			}
		}
		for (var element of list) {
			console.log("选择连接：%s", element.href)
			var className = element.className;
			if (matchRule) {
				if (!className || className.indexOf(matchClass) < 0) {
					element.className += matchClass;
				}
			} else {
				if (className && className.indexOf(matchClass) >= 0) {
					element.className = className.substring(0, className.indexOf(matchClass));
				}
			}
		}
		var size = matchRule ? list.length : 0;
		chrome.runtime.sendMessage({ "type": "size", "size": size });
	}
}