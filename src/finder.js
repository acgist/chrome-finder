// 默认配置
var config = {};

// 监听background消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request) {
		console.log("finder-收到消息：%o-%o", sender, request);
		if (request.type == "find") {
			match();
			sendResponse({ "type": "success" });
		} else {
			console.error("finder-收到消息-类型错误：%o", request);
		}
	} else {
		console.error("finder-收到消息-格式错误：%o", request);
	}
});

// 获取配置
chrome.runtime.sendMessage(
	{ "type": "config" },
	function(response) {
		if (response) {
			config = response;
			console.log("finder-获取配置：%o", config);
		} else {
			console.error("finder-获取配置失败");
		}
	}
);

// 监听页面事件：Ctrl+Q
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
			console.log("选中连接：%s", element.href)
			element.className = "finder-match";
		}
	}
}