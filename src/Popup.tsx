import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./Popup.scss";

// 定义PopupProps接口
interface PopupProps {
	ruleStr: string;
}

// 定义弹出窗口组件
function Popup(props: PopupProps) {
	// 弹出窗口标题
	const ruleStr = props["ruleStr"] || "";

	// 输入框内容
	const [inputValue, setInputValue] = useState<string>("");
	// 图片链接
	const [hrefValue, setHrefValue] = useState<string>("");
	// 页面标题
	const [title, setTitle] = useState<string>("");
	// 文件名
	const [fileName, setFileName] = useState<string>(() => {
		const ruleStr = props["ruleStr"] || "{title}";

		return replacePlaceholders(ruleStr);
	});
	// 图片下载按钮是否可用
	const [downloadBtnDisabled, setDownloadBtnDisabled] =
		useState<boolean>(false);

	// 输入框内容变化时
	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value || "";
		setInputValue(value);
	};

	// 保存规则
	const handleSave = () => {
		chrome.storage.local.set({
			ruleStr: inputValue,
		});

		setFileName(replacePlaceholders(inputValue));
	};

	// 点击下载按钮
	const handleDownload = () => {
		imgDownload(hrefValue, fileName);
	};

	// 替换规则中的占位符
	function replacePlaceholders(inputString: string): string {
		const date = new Date().toLocaleString();

		// 使用正则表达式替换 {title} 和 {date}
		return inputString.replace(/{title}/g, title).replace(/{date}/g, date);
	}

	// 下载图片
	function imgDownload(
		href: string,
		fileName: string = new Date().toLocaleString()
	) {
		const aEle = document.createElement("a");
		aEle.href = href;
		aEle.download = fileName;
		aEle.click();
	}

	// 注入到当前标签页的JS脚本函数
	function scriptForImgDownload() {
		const title = document.title.replaceAll(/[<>:"\/\\|?*#]/g, "");

		const imgEle = document.querySelectorAll(
			"#highres"
		)[0] as HTMLAnchorElement;
		if (imgEle) {
			imgEle.target = "_blank";
		}

		const pngEle = document.querySelectorAll("#png")[0] as HTMLAnchorElement;
		if (pngEle) {
			pngEle.target = "_blank";
		}

		const href = (pngEle || imgEle).href;

		return {
			title,
			href,
		};
	}

	useEffect(() => {
		setInputValue(ruleStr);

		// 在扩展的后台JS脚本中获取网页元素的内容
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			const tabId: number = tabs[0].id as number;
			try {
				if (chrome.scripting) {
					chrome.scripting
						.executeScript({
							target: { tabId: tabId },
							func: scriptForImgDownload,
						})
						.then((props) => {
							console.log("script injected", props);

							// 存储图片链接和页面标题
							setHrefValue((props[0].result.href as string) || "");
							setTitle((props[0].result.title as string) || "");
						});
				} else {
					setDownloadBtnDisabled(true);
				}
			} catch (e) {
				console.log("error: ", e);
				setDownloadBtnDisabled(true);
			}
		});
	}, []);

	useEffect(() => {
		setDownloadBtnDisabled(!hrefValue);
	}, [hrefValue])

	return (
		<div id="popupBox">
			<div className="ruleBox hidden">
				<div className="discriptionBox">
					<h3 className="title">yande.re图片下载器 文件名規則：</h3>
					<div className="discription">
						<p>{"{title}当前标签页标题"}</p>
						<p>{"{date}当前时间，格式：YYYY-MM-DD HH:mm:ss"}</p>
						<p>{"{id}图片id，如：12345678"}</p>
					</div>
				</div>

				<div className="inputBox">
					<input
						type="text"
						title=""
						placeholder="文件名規則"
						value={inputValue}
						onChange={handleTitleChange}
					/>
					<button className="saveBtn" onClick={handleSave}>
						保存规则
					</button>
				</div>
			</div>
			<div
				className={!downloadBtnDisabled ? "hidden" : ""}
				style={{ textAlign: "center" }}
			>
				<p>当前页无法下载，请前往https://yande.re/post/show/*</p>
				<p>若页面正确，请使用最新版Chrome浏览器。</p>
			</div>
			<button
				className="downloadBtn"
				onClick={handleDownload}
				disabled={downloadBtnDisabled}
			>
				下载
			</button>
		</div>
	);
}

// 加载配置并渲染弹出窗口
chrome.storage.local.get(["ruleStr"], (props: any = {}) => {
	ReactDOM.createRoot(document.body).render(<Popup {...props} />);
});
