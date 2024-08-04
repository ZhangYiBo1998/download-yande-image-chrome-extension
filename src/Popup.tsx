// 引入所需的库和组件
// import { h, render } from "preact";
// import { useEffect, useState } from "preact/hooks";

import React, {useState} from "react";
import ReactDOM from "react-dom/client";

import "./Popup.scss";

// 定义PopupProps接口
interface PopupProps {
	"download-yande-image-chrome-extension-title": string;
}

// 定义弹出窗口组件
function Popup(props: PopupProps | {} = {}) {
	console.log("Popup props:", props);

	const [titleValue, setTitleValue] = useState("");

	const handleTitleChange = (e: any) => {
		console.log(e.target?.value);
		setTitleValue(e.target?.value);
	};

	const handleSave = () => {
		chrome.storage.local.set({
			"download-yande-image-chrome-extension-title": titleValue,
		});
	};

	const handleDownload = () => {
		console.log("download");
	};

	return (
		<div>
			yande.re 下载器 文件名規則：
			<input
				type="text"
				title=""
				placeholder="文件名規則"
				value={titleValue}
				onChange={handleTitleChange}
			/>
			<button onClick={handleSave}>保存规则</button>
			<button onClick={handleDownload}>下载</button>
		</div>
	);
}

// 加载配置并渲染弹出窗口
chrome.storage.local.get(
	["download-yande-image-chrome-extension-title"],
	(props: any = {}) => {
		ReactDOM.createRoot(document.body).render(<Popup {...props} />);
	}
);
