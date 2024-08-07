import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import "./Popup.scss";

// 定义弹出窗口组件
function Popup() {
    // 图片链接
    const [hrefValue, setHrefValue] = useState<string>("");
    const [fileName, setFileName] = useState("");
    // 图片下载按钮是否可用
    const [downloadBtnDisabled, setDownloadBtnDisabled] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // 点击下载按钮
    const handleDownload = () => {
        if (loading || downloadBtnDisabled) {
            return;
        }
        imgDownload(hrefValue);
    };

    // 下载图片
    function imgDownload(href: string) {

        setLoading(true)
        chrome.downloads.download({
            url: href, // 图片的URL
            filename: fileName, // 下载后的文件名
            saveAs: false // 是否显示“另存为”对话框
        }, function (downloadId) {
            console.log('Download started with ID:', downloadId);
            setLoading(false)
            window.close();
        });
    }

    // 注入到当前标签页的JS脚本函数
    function scriptForImgDownload() {
        const title = document.title.replaceAll(/[<>:"\/\\|?*#]/g, "");

        const imgEle = document.querySelectorAll("#highres")[0] as HTMLAnchorElement;
        if (imgEle) {
            imgEle.target = "_blank";
        }

        const pngEle = document.querySelectorAll("#png")[0] as HTMLAnchorElement;
        if (pngEle) {
            pngEle.target = "_blank";
        }

        const href = (pngEle || imgEle).href;

        return {
            href,
            title,
        };
    }

    useEffect(() => {

        // 在扩展的后台JS脚本中获取网页元素的内容
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tabId: number = tabs[0].id as number;
            try {
                if (chrome.scripting) {
                    chrome.scripting
                        .executeScript({
                            target: {tabId: tabId},
                            func: scriptForImgDownload,
                        })
                        .then((props) => {
                            console.log("script injected", props);
                            const {href = "" as string, title = "" as string} = props[0].result;

                            // 存储图片链接和页面标题
                            setHrefValue(href);
                            setFileName(title)
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
    }, [hrefValue]);

    return (
        <div id="popupBox">
            <div
                className={!downloadBtnDisabled ? "hidden" : ""}
                style={{textAlign: "center"}}
            >
                <p>当前页无法下载，请前往{chrome.i18n.getMessage("enable_download_path")}</p>
                <p>若路径正确，请使用最新版Chrome浏览器。</p>
            </div>
            <button
                className="downloadBtn"
                onClick={handleDownload}
                disabled={downloadBtnDisabled}
            >
                {loading ? '等待下载......' : '下载'}
            </button>
        </div>
    );
}

ReactDOM.createRoot(document.body).render(<Popup/>);
