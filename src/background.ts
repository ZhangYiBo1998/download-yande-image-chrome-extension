// 使用chrome.storage.local.get()方法获取扩展的本地存储数据，并根据需要设置默认值
chrome.storage.local.get(["ruleStr"], (props: any) => {
	console.log("chrome.storage.local.get()获取扩展的本地存储数据成功", props);
});
