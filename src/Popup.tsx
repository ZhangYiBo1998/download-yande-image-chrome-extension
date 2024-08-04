// 引入所需的库和组件
import { h, render } from 'preact';
import './Popup.scss';

// 定义PopupProps接口
interface PopupProps {
}

// 定义弹出窗口组件
function Popup(props: PopupProps) {

    return (
        <div>
            empty-chrome-extension
        </div>
    );
}

// 加载配置并渲染弹出窗口
chrome.storage.local.get([], () => {


    render(<Popup/>, document.body);
});