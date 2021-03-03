//import {elemVisibility} from './libs/Eotones/BanaUI.js';
//import {BanaApi} from './libs/Eotones/BanaApi.js';
//import {BanaTTS} from './libs/Eotones/BanaTTS.js';
//import {LangToken} from './libs/vendor.js';
//import {LangGiftList} from './libs/LangGiftList.js';

//const tts = new BanaTTS();

//const LangToken = kk_getToken;

//全域變數
const DEBUG_MODE = false;
// 是否顯示console.log, 值: true or false
// 例:
// DEBUG_MODE && console.log("errer");

//檢查瀏覽器來源
// 返回 string
// 值: "obs_browser", "desktop_app", "normal_browser"
// 參考資料: https://github.com/obsproject/obs-browser/blob/master/README.md
const check_browser_source = function () {
    if (typeof window.obsstudio !== 'undefined') { // obs studio專用js
        // is OBS browser
        document.body.id = "css_for_obs";
        return "obs_browser";
    } else {
        // other browser

        if (window.navigator.userAgent.match(/babanana/i) !== null) {
            //桌面版app
            document.body.id = "css_for_desktop"
            return "desktop_app";
        } else {
            //普通瀏覽器 (OBS以外的直播軟體可能也會跑來這裡)
            //document.body.id = "css_for_browser" //預設值不用改
            return "normal_browser";
        }
    }
};
var browser_source = check_browser_source();



const page_load_time = new Date().getTime();
let chat_ws_conn_time = new Date().getTime();

const client_id = 'chikattochikachika';

// const wsUri_chat = "wss://cht.ws.kingkong.com.tw/chat_nsp/?EIO=3&transport=websocket"; //chat server
// const wsUri_gift_2 = "wss://ctl.ws.kingkong.com.tw/control_nsp/?EIO=3&transport=websocket"; //gift server
// const wsUri_gift_1 = "wss://ctl-1.ws.kingkong.com.tw/control_nsp/?EIO=3&transport=websocket"; //館長台

//const wsUri_chat = "wss://cht.lv-show.com/socket.io/?EIO=3&transport=websocket"; //chat server
//const wsUri_gift = "wss://ctl.lv-show.com/socket.io/?EIO=3&transport=websocket"; //gift server

// 2020.10.12
const wsUri_chat_ch = "wss://cht-web-aws.lv-show.com/chat_nsp/?EIO=3&transport=websocket"; //chat server
const wsUri_gift_ch = "wss://ctl-web-aws.lv-show.com/control_nsp/?EIO=3&transport=websocket"; //gift server

// 2021.01.31
const wsUri_chat_en = "wss://chat-web.lang.live/chat_nsp/?EIO=3&transport=websocket"; //chat server
const wsUri_gift_en = "wss://control-web.lang.live/control_nsp/?EIO=3&transport=websocket"; //gift server

const wsUri_chat = wsUri_chat_ch;
const wsUri_gift = wsUri_gift_ch;

var output; //聊天室輸出 div#output
var output_last_lines = new Array(); //保存最新的n行訊息
var heat; //熱度 div#heat
var user_cnt; //觀眾數 div#user_cnt
var viewers = 0;
var setting_div; //設定欄 #setting_div
var scroll_to_bottom_btn; //捲到到最新行的按鈕 #scroll_to_bottom_btn
var ping; // 保持websocket連線,PING-PONG
var ping2; // 保持websocket連線,PING-PONG
var ping_ovs;
var chat_i = 0; //計算聊天室的行數
var tokens = []; //連線資訊
var stop_scroll = false; //上拉時防止捲動
var get_sticker_done = false; //抓取貼圖完成狀態
var get_sticker_obj = {};
var tool_bar_datetime_span; //toolbar時間
var conn_overseas_chat = false; //是否連接海外chat ws server
var last_msg_time = 0;

//conn_overseas_chat = true;

// 禮物列表
// https://game-api.lang.live/webapi/v1/gift/list?live_id=2282757G99342N1nd&pfid=2426076&anchor_pfid=2282757
// https://game-api.lang.live/webapi/v1/gift/list?anchor_pfid=2282757
// 舊
// https://g-api.langlive.com/webapi/v1/gift/list?live_id=2282757G99342N1nd&pfid=2426076&anchor_pfid=2282757
var prod_id_arr = [];
(() => { //折疊用
    prod_id_arr[112] = "喔我戀愛了";
    prod_id_arr[116] = "陪你看流星雨";

    prod_id_arr[1001] = "小紅包";
    prod_id_arr[1002] = "大紅包";

    prod_id_arr[1054] = "告白氣球";
    prod_id_arr[1058] = "浪Live應援團";
    prod_id_arr[1073] = "大聲說愛你";

    prod_id_arr[1138] = "人氣卡（Small）";
    prod_id_arr[1139] = "人氣卡（Medium）";
    prod_id_arr[1140] = "人氣卡（Large）";

    prod_id_arr[1159] = "火箭";

    prod_id_arr[1167] = "真情告白";
    prod_id_arr[1174] = "鑽石恆久遠";

    prod_id_arr[1225] = "人氣卡（mini）";
    prod_id_arr[1246] = "愛の火箭";

    prod_id_arr[1313] = "MVP";

    prod_id_arr[1334] = "94狂";
    prod_id_arr[1335] = "掌聲鼓勵";
    prod_id_arr[1336] = "很廢";
    prod_id_arr[1337] = "好棒棒";
    prod_id_arr[1339] = "能量飲料";

    prod_id_arr[1341] = "平底鍋";
    prod_id_arr[1342] = "灰機";

    prod_id_arr[1362] = "歡樂送";
    prod_id_arr[1364] = "大雞大利";
    prod_id_arr[1365] = "香蕉";
    prod_id_arr[1366] = "幸運幣";
    prod_id_arr[1367] = "卡牌包";

    prod_id_arr[1370] = "問號燈";
    prod_id_arr[1371] = "凱撒之力";
    prod_id_arr[1372] = "天使甲";
    prod_id_arr[1373] = "小金人";

    prod_id_arr[1393] = "LMS徽章";

    prod_id_arr[1462] = "帥氣";
    prod_id_arr[1469] = "COOL";
    prod_id_arr[1470] = "神操作";

    prod_id_arr[1473] = "全力聲援";

    prod_id_arr[1559] = "AWM";
    prod_id_arr[1560] = "雞毛";
    prod_id_arr[1561] = "主播加油券";

    prod_id_arr[1629] = "最佳導演";
    prod_id_arr[1630] = "最佳演員";
    prod_id_arr[1661] = "金剛寶寶";

    prod_id_arr[1707] = "能量話筒";
    prod_id_arr[1778] = "空投箱";

    prod_id_arr[1813] = "ahq集氣徽章";
    prod_id_arr[1814] = "FW集氣徽章";
    prod_id_arr[1815] = "GRX集氣徽章";
    prod_id_arr[1816] = "HKA集氣徽章";
    prod_id_arr[1817] = "JT集氣徽章";
    prod_id_arr[1818] = "M17集氣徽章";
    prod_id_arr[1819] = "MAD集氣徽章";
    prod_id_arr[1820] = "AFR集氣徽章";

    prod_id_arr[1867] = "帕呼哩系";
    prod_id_arr[1868] = "阿多肯";

    prod_id_arr[1925] = "Skr";
    prod_id_arr[1926] = "噴很大";
    prod_id_arr[1938] = "穩";

    prod_id_arr[2048] = "超級幸運星";
    prod_id_arr[2085] = "一起搖擺";
    prod_id_arr[2113] = "愛の火箭";

    prod_id_arr[2229] = "浪Live應援團（LS專用）";
    prod_id_arr[2230] = "Tick Tack！Tick Tack！（LS專用）";
    prod_id_arr[2240] = "嚇到吃腳腳";

    prod_id_arr[2371] = "掌聲鼓勵";
    prod_id_arr[2372] = "94狂";
    prod_id_arr[2374] = "蜂蜜檸檬水";
    prod_id_arr[2378] = "漫威之父";

    prod_id_arr[2401] = "狩獵小刀";
    prod_id_arr[2402] = "豪野人戰斧";
    prod_id_arr[2403] = "鳳凰神弓";
    prod_id_arr[2454] = "阿伯怪怪的";
    prod_id_arr[2487] = "電玩教父 施文彬";
    prod_id_arr[2488] = "愛愛問候您";

    prod_id_arr[2514] = "冒險火箭";

    prod_id_arr[2517] = "拐杖糖";
    prod_id_arr[2518] = "薑餅人";
    prod_id_arr[2519] = "聖誕襪-金";
    prod_id_arr[2520] = "聖誕襪-銀";
    prod_id_arr[2521] = "聖誕帽";
    prod_id_arr[2522] = "聖誕老公公";
    prod_id_arr[2523] = "聖誕老公公-銀";
    prod_id_arr[2524] = "聖誕鈴鐺";
    prod_id_arr[2525] = "雪人";
    prod_id_arr[2526] = "雪人 (橫屏)";
    prod_id_arr[2527] = "麋鹿";
    prod_id_arr[2528] = "麋鹿 (橫屏)";
    prod_id_arr[2529] = "聖誕雪橇";
    prod_id_arr[2530] = "聖誕雪橇 (橫屏)";
    prod_id_arr[2531] = "聖誕火箭";
    prod_id_arr[2532] = "聖誕火箭 (橫屏)";

    prod_id_arr[2650] = "草莓";
    prod_id_arr[2651] = "草莓醬";
    prod_id_arr[2652] = "草莓吐司";
    prod_id_arr[2653] = "草莓派";
    prod_id_arr[2654] = "草莓派(橫)";
    prod_id_arr[2655] = "草莓蛋糕";
    prod_id_arr[2668] = "雞腿";
    prod_id_arr[2669] = "刈包";
    prod_id_arr[2670] = "封肉";
    prod_id_arr[2671] = "雞尾酒";
    prod_id_arr[2672] = "雞尾酒(橫)";
    prod_id_arr[2673] = "佛跳牆";
    prod_id_arr[2674] = "佛跳牆(橫)";

    prod_id_arr[2706] = "一起搖擺";
    prod_id_arr[2712] = "水瓶圖";
    prod_id_arr[2713] = "星光";
    prod_id_arr[2714] = "慧星";
    prod_id_arr[2715] = "水瓶座";
    prod_id_arr[2716] = "水瓶座(橫)";
    prod_id_arr[2717] = "流星雨";
    prod_id_arr[2718] = "流星雨(橫)";

    prod_id_arr[2741] = "YR吃竹鼠";

    prod_id_arr[2746] = "春";
    prod_id_arr[2747] = "福";
    prod_id_arr[2748] = "燈籠";
    prod_id_arr[2749] = "爆竹";
    prod_id_arr[2750] = "金元寶";
    prod_id_arr[2751] = "年年有魚";
    prod_id_arr[2752] = "舞龍舞獅";
    prod_id_arr[2753] = "舞龍舞獅(橫)";
    prod_id_arr[2754] = "財神";
    prod_id_arr[2755] = "財神(橫)";
    prod_id_arr[2756] = "金豬火箭";
    prod_id_arr[2757] = "金豬火箭(橫)";

    prod_id_arr[2764] = "巧克力棒";
    prod_id_arr[2765] = "手工巧克力";
    prod_id_arr[2766] = "肉麻簡訊";
    prod_id_arr[2767] = "一生一世";
    prod_id_arr[2768] = "伴您一生";
    prod_id_arr[2769] = "伴您一生(橫)";
    prod_id_arr[2770] = "愛您一輩子";
    prod_id_arr[2771] = "愛您一輩子(橫)";
    prod_id_arr[2772] = "紋銀百兩";
    prod_id_arr[2773] = "豆沙元宵";
    prod_id_arr[2774] = "小提燈";
    prod_id_arr[2775] = "蜂炮";
    prod_id_arr[2776] = "蜂炮(橫)";
    prod_id_arr[2777] = "祈福天燈";
    prod_id_arr[2778] = "祈福天燈(橫)";

    prod_id_arr[2779] = "絕代雙丸";

    prod_id_arr[2781] = "一生一世(橫)";

    prod_id_arr[2870] = "真亦";
    prod_id_arr[2882] = "浩克";

    prod_id_arr[2961] = "免費加油券";
    prod_id_arr[2962] = "男神祝福券";
    prod_id_arr[2963] = "歐巴選票";
    prod_id_arr[2964] = "帥氣墨鏡";
    prod_id_arr[2965] = "歐巴520";
    prod_id_arr[2966] = "男神超跑";
    prod_id_arr[2967] = "男神超跑(橫)";
    prod_id_arr[2968] = "男神火箭";
    prod_id_arr[2969] = "男神火箭(橫)";

    prod_id_arr[2971] = "女神唇膏";
    prod_id_arr[2972] = "裸背裙";

    prod_id_arr[2976] = "水瓶千千";
    prod_id_arr[2977] = "啵緹";

    prod_id_arr[3015] = "摘星";

    prod_id_arr[3028] = "裸背裙(橫)";
    prod_id_arr[3029] = "女神王冠(橫)";
    prod_id_arr[3030] = "女神王冠";
    prod_id_arr[3031] = "女神火箭";
    prod_id_arr[3032] = "女神火箭(橫)";
    prod_id_arr[3035] = "仿真蟑螂(橫)";

    prod_id_arr[3049] = "小饅頭";
    prod_id_arr[3050] = "小饅頭-雙魚冠軍";
    prod_id_arr[3055] = "詭王";

    prod_id_arr[3124] = "刀鋒嘎嘎嘎";

    prod_id_arr[3160] = "櫻花瓣";
    prod_id_arr[3161] = "櫻花樹";
    prod_id_arr[3162] = "櫻花印記";
    prod_id_arr[3163] = "櫻之扇";
    prod_id_arr[3164] = "醉櫻劍";
    prod_id_arr[3165] = "醉櫻劍(橫)";
    prod_id_arr[3166] = "櫻之武盔";
    prod_id_arr[3167] = "櫻之武盔(橫)";
    prod_id_arr[3169] = "平底鍋";

    prod_id_arr[3211] = "手裏劍";
    prod_id_arr[3212] = "撒菱";
    prod_id_arr[3213] = "影之撒菱";
    prod_id_arr[3214] = "苦無";
    prod_id_arr[3215] = "影之苦無";
    prod_id_arr[3216] = "吹矢";
    prod_id_arr[3217] = "吹矢(橫)";
    prod_id_arr[3218] = "忍刀";
    prod_id_arr[3219] = "忍刀(橫)";

    prod_id_arr[3231] = "金牛角";
    prod_id_arr[3232] = "金牛座";
    prod_id_arr[3233] = "金牛座(橫)";

    prod_id_arr[3267] = "狼人殺";
    prod_id_arr[3268] = "狼人殺";
    prod_id_arr[3275] = "萬毒歸宗";
    prod_id_arr[3276] = "人氣卡（Nano）";
    prod_id_arr[3277] = "萬毒歸宗";
    prod_id_arr[3278] = "泡槍哭哭";
    prod_id_arr[3279] = "泡槍哭哭";
    prod_id_arr[3294] = "一番好意";

    prod_id_arr[3300] = "星探禮";
    prod_id_arr[3301] = "星探禮";
    prod_id_arr[3303] = "幸運四葉草";
    prod_id_arr[3306] = "雙子";
    prod_id_arr[3307] = "雙子座";
    prod_id_arr[3308] = "雙子座(橫)";
    prod_id_arr[3342] = "抽獎券";
    prod_id_arr[3362] = "啵緹-牡羊冠軍";
    prod_id_arr[3363] = "國動-專屬禮物";
    prod_id_arr[3377] = "飆悍-專屬禮物";
    prod_id_arr[3378] = "飆悍-專屬禮物";

    prod_id_arr[3410] = "應援棒";
    prod_id_arr[3411] = "應援棒";
    prod_id_arr[3423] = "Fun";

    prod_id_arr[3441] = "登入先";
    prod_id_arr[3442] = "登入先(免費禮物)";
    prod_id_arr[3444] = "7777(免費禮物)";
    prod_id_arr[3446] = "都你講(免費禮物)";

    prod_id_arr[3592] = "777";
    prod_id_arr[3609] = "強力留言";
    prod_id_arr[3663] = "發大財";
    prod_id_arr[3664] = "棒棒糖";
    prod_id_arr[3665] = "黑人問號";
    prod_id_arr[3666] = "好棒棒";
    prod_id_arr[3667] = "鼓鼓掌";
    prod_id_arr[3668] = "嗨起乃";
    prod_id_arr[3669] = "錢給你";
    prod_id_arr[3670] = "手指愛心";
    prod_id_arr[3671] = "親一口";
    prod_id_arr[3672] = "中指摳";
    prod_id_arr[3673] = "鈔票噴子";
    prod_id_arr[3674] = "超級7";
    prod_id_arr[3675] = "灰機";
    prod_id_arr[3676] = "看夜景";
    prod_id_arr[3677] = "MVP";
    prod_id_arr[3678] = "熱氣球";
    prod_id_arr[3750] = "壁咚";
    prod_id_arr[3751] = "完美演出";
    prod_id_arr[3752] = "幸運蛋";
    prod_id_arr[3757] = "姊姊-巨蟹座";

    prod_id_arr[3942] = "抽獎券";

    prod_id_arr[4003] = "陪我玩";
    prod_id_arr[4004] = "開趴踢";

    prod_id_arr[4053] = "田亞霍專屬鼓勵";

    prod_id_arr[4194] = "幸福教教主刮哥";

    prod_id_arr[4734] = "火柴";
    prod_id_arr[4735] = "火柴盒";
    prod_id_arr[4736] = "熱茶";
    prod_id_arr[4737] = "熱茶壺";
    prod_id_arr[4738] = "扇子";
    prod_id_arr[4949] = "手工餅乾";
    prod_id_arr[4950] = "果汁棉花糖";
    prod_id_arr[4951] = "競技の愛";

    prod_id_arr[5047] = "告白氣球";
    prod_id_arr[5048] = "喔我戀愛了";
    prod_id_arr[5049] = "陪你看流星雨";
    prod_id_arr[5050] = "大聲說愛你";
    prod_id_arr[5051] = "別說了,吻你";
    prod_id_arr[5053] = "鑽石恆久遠";

    prod_id_arr[5175] = "傑出的一手";
    prod_id_arr[5176] = "尾刀狗";
    prod_id_arr[5177] = "我覺得不行";
    prod_id_arr[5178] = "歐皇";
    prod_id_arr[5179] = "非酋";
    prod_id_arr[5180] = "豬隊友";
    prod_id_arr[5181] = "頭香";
    prod_id_arr[5182] = "嚇到吃手手";
    prod_id_arr[5183] = "黑人問號";
    prod_id_arr[5184] = "很雷";
    prod_id_arr[5185] = "C8763";
    prod_id_arr[5186] = "Carry";
    prod_id_arr[5187] = "我阿嬤都比你強";
    prod_id_arr[5188] = "梳不齊";
    prod_id_arr[5189] = "尷尬又不失禮貌的微笑";
    prod_id_arr[5190] = "是在哈囉";

    // 2020.04.30 統神 day 1
    prod_id_arr[5296] = "太神啦";
    prod_id_arr[5297] = "聊天室 7 起來";

    prod_id_arr[5303] = "再來啊";
    prod_id_arr[5304] = "你就是個小丑R";
    prod_id_arr[5305] = "剩下一張帥臉";

    prod_id_arr[5533] = "沖天炮";
    prod_id_arr[5534] = "撈金魚";
    prod_id_arr[5535] = "波浪舞";
    prod_id_arr[5536] = "花火大會";

    prod_id_arr[5556] = "大紅包";

    prod_id_arr[5581] = "你又懂甚麼";
    prod_id_arr[5582] = "I don't care";
    prod_id_arr[5583] = "兄弟齊心三百公斤";
    prod_id_arr[5584] = "做自己94帥";

    prod_id_arr[5666] = "粉絲團7天體驗券";
    prod_id_arr[5919] = "看好你喔!";
    prod_id_arr[5946] = "LOVE";
    prod_id_arr[5947] = "讚一個啦";

    prod_id_arr[6002] = "玫瑰";

    prod_id_arr[6165] = "Carry";
    prod_id_arr[6201] = "濃情巧克力(特效)";

    prod_id_arr[6542] = "貼春聯";
    prod_id_arr[6543] = "大紅燈籠";
    prod_id_arr[6544] = "年獸來了";
    prod_id_arr[6545] = "爆竹火箭";
})();



//檢查使用者自訂的css display屬性
// none為false,否則為true
var cssCheck_kk_gift;
var cssCheck_kk_reconn;
var cssCheck_kk_bana;
var cssCheck_kk_come;

var reconnection_chat_count = 0; //計算斷線重連次數 chat server
var reconnection_overseas_chat_count = 0;
var reconnection_gift_count = 0; //計算斷線重連次數 gift server

//外部變數(index.htm<script>)
//無設定時使用預設值
var obs_mode;
var chat_limit;
var csrf_token;

if (typeof document.body.dataset.obs_mode === "undefined") {
    obs_mode = false;
} else {
    obs_mode = (document.body.dataset.obs_mode == "true" || document.body.id === "css_for_obs");
}

if (typeof document.body.dataset.chat_limit === "undefined") {
    chat_limit = 10;
} else {
    chat_limit = parseInt(document.body.dataset.chat_limit);
}

if (typeof document.body.dataset.csrf_token === "undefined") {
    csrf_token = false;
} else {
    csrf_token = document.body.dataset.csrf_token;
}


/*
CSS:
.toggle-content { display: none; }
.toggle-content.is-visible { display: block; }

JS:
elemVisibility.init(elem);
elemVisibility.show(elem);
elemVisibility.hide(elem);
elemVisibility.toggle(elem);
elemVisibility.check(elem);
*/
const elemVisibility = {
    init: function (elem, default_show = true) {
        elem.classList.add('toggle-content'); // display: none;
        if (default_show) {
            this.show(elem); // display: block;
        }
    },
    init_inline(elem, default_show = true) {
        elem.classList.add('toggle-content'); // display: none;
        if (default_show) {
            this.show_inline(elem); // display: inline-block;
        }
    },
    show: function (elem) {
        elem.classList.add('is-visible'); // display: block;
    },
    show_inline: function (elem) {
        elem.classList.add('is-visible-inline'); // display: inline-block;
    },
    hide: function (elem) {
        elem.classList.remove('is-visible');
    },
    toggle: function (elem) {
        elem.classList.toggle('is-visible');
    },
    toggle_inline: function (elem) {
        elem.classList.toggle('is-visible-inline');
    },
    check: function (elem) {
        if (getComputedStyle(elem).display === 'none') {
            return false;
        } else {
            return true;
        }
    }
};

const BanaApi = {
    post: function (ajax_post_type = 'test', ajax_post_obj = {}) {
        let post_data = {
            csrf_token: document.body.dataset.csrf_token,
            type: ajax_post_type,
            data_obj: ajax_post_obj
        };

        return fetch(
            '/api.php',
            {
                method: 'POST', // GET, POST
                headers: {
                    'content-type': 'application/json',
                    'Client-ID': client_id
                },
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                mode: 'same-origin', // no-cors, cors, *same-origin
                body: JSON.stringify(post_data)
            }
        ).then((response) => {
            return response.json();
        });
    },
    getRoomInfo: function (_room_id) {
        return this.post('getRoomInfo', { room_id: _room_id });
    },
    getRoomStickerList: function (_room_id) {
        return this.post('getRoomStickerList', { room_id: _room_id });
    },
    getRoomGiftList: function (_room_id) {
        return this.post('getRoomGiftList', { room_id: _room_id });
    }
};

//getRoomInfo test
// BanaApi.getRoomInfo('2132991').then((data) => {
//   console.log(data);
// }).catch((error) => { 
//   console.log(error);
// });

//getRoomStickerList test
// BanaApi.getRoomStickerList('2132991').then((data) => {
//   console.log(data);
// }).catch((error) => { 
//   console.log(error);
// });


//統計
/*
  目前熱度 ofc_heat
  目前觀眾數 ofc_online_user

  最高熱度 max_heat
  最高觀眾數 max_online_user

  累計留言數 msg_count
  累計留言人數 msg_user_count

  累計進入聊天室人數 join_count
  累計追隨人數 follow_count
*/
const stats = {
    init: function () {
        //
        this.ofc_heat = 0;
        this.ofc_online_user = 0;
        this.max_heat = 0;
        this.max_online_user = 0;
        this.msg_count = 0;
        this.msg_user_count = 0;
        this.join_count = 0;
        this.follow_count = 0;

        //Set
        this.msg_user_count_set = new Set();
        this.join_count_set = new Set();
        this.follow_count_set = new Set();

        //elemVisibility.init(document.getElementById('stats_ui'));
    },
    set_max_heat: function (new_heat) {
        if (new_heat > this.max_heat) this.max_heat = new_heat;
    },
    set_max_online_user: function (new_online_user) {
        if (new_online_user > this.max_online_user) this.max_online_user = new_online_user;
    },
    msg_user_count_set_add: function (user_id) {
        this.msg_user_count_set.add(user_id);
        this.msg_user_count = this.msg_user_count_set.size;
    },
    join_count_set_add: function (user_id) {
        this.join_count_set.add(user_id);
        this.join_count = this.join_count_set.size;
    },
    follow_count_set_add: function (user_id) {
        this.follow_count_set.add(user_id);
        this.follow_count = this.follow_count_set.size;
    },
    refresh_ui: function () {
        //
        this.set_max_heat(this.ofc_heat);
        this.set_max_online_user(this.ofc_online_user);

        if (obs_mode == false) {
            let elem_stats_ui = document.getElementById('stats_ui');
            let elem_stats_ui_show = !(getComputedStyle(elem_stats_ui).display === 'none');

            if (document.getElementById("statsUiCheck").checked == false) {
                if (elem_stats_ui_show) elemVisibility.hide(elem_stats_ui);
            } else {
                if (!elem_stats_ui_show) elemVisibility.show(elem_stats_ui);

                elem_stats_ui.innerHTML = `
                    聊天統計<br>
                    (僅供參考,不保證資料正確)<br>
                    <br>
                    目前熱度: ${main.numberWithCommas(this.ofc_heat)}<br>
                    目前觀眾數: ${main.numberWithCommas(this.ofc_online_user)}<br>
                    <br>
                    最高熱度: ${main.numberWithCommas(this.max_heat)}<br>
                    最高觀眾數: ${main.numberWithCommas(this.max_online_user)}<br>
                    <br>
                    累計留言數: ${main.numberWithCommas(this.msg_count)}<br>
                    累計留言人數: ${main.numberWithCommas(this.msg_user_count)}<br>
                    <br>
                    累計新進入人數: ${main.numberWithCommas(this.join_count)}<br>
                    累計新追隨人數: ${main.numberWithCommas(this.follow_count)}<br>
                    <br>
                    [${main.get_time_full()}]<br>
                `;
            }
        }
    }
};

const main = {
    init: function () {
        // 當 hashtag 改變時重新載入頁面
        window.addEventListener("hashchange", function () {
            location.reload();
        }, false);

        //判斷載入分頁
        if (window.location.hash == '' || window.location.hash == '#') {
            //載入首頁
            this.goto_home_page();
        } else {
            //載入聊天室頁面
            this.goto_chat_page();
        }
    },
    check_hashtag_value: function () {
        if (window.location.hash == '' || window.location.hash == '#') {
            //
        } else {
            let raw_hashtag_value = window.location.hash.substr(1);

            if(raw_hashtag_value.startsWith("twitch:") === true){
                //twitch
                let raw_twitch_channel_name = raw_hashtag_value.replace(/^twitch:/ig, '');

                /*
                if(raw_twitch_channel_name.length >= 4){
                    let twitch_channel_name = raw_twitch_channel_name.match(/^[a-zA-Z0-9_]{4,25}$/);
                    if(raw_twitch_channel_name !== twitch_channel_name){
                        //goto twitch chat
                    }else{
                        //含有非法字元
                    }
                }
                */

                if(raw_twitch_channel_name.match(/^[a-zA-Z0-9_]{4,25}$/) !== null){
                    //goto twitch chat
                    //let twitch_channel_name = raw_twitch_channel_name;
                    this.load_twitch_chat(raw_twitch_channel_name);
                }else{
                    //含有非法字元
                }
                
            }else{
                //lang play
                let langplay_channel_name = raw_hashtag_value.replace(/[^0-9]/g,'');
                this.load_langplay_chat(langplay_channel_name);
            }
        }
    },
    goto_home_page: function () { //載入首頁
        let c_script = document.getElementById("c_script");
        elemVisibility.show(c_script);
        this.change_channel_btn(); //改完後觸發hashchange重載頁面
    },
    goto_chat_page: function () { //載入聊天室頁面
        this.check_scroll(); //檢查畫面捲動方向,如果向上則觸法暫停捲動功能

        output = document.getElementById("output"); //聊天室輸出
        output.innerHTML = '';

        heat = document.getElementById("heat"); //熱度
        heat.innerHTML = '● 載入中..';

        user_cnt = document.getElementById("user_cnt"); //觀眾數
        user_cnt.innerHTML = '';

        if (obs_mode == false) {
            //關閉checkbox
            document.querySelector("#ttsCheck").checked = false; //語音
            document.querySelector("#statsUiCheck").checked = false; //統計

            this.scroll_to_bottom_btn(); //建立向下捲動按鈕

            //開啟設定選單
            setting_div = document.getElementById("setting_div");
            scroll_to_bottom_btn = document.getElementById("scroll_to_bottom_btn");

            document.getElementById("tool_bar").addEventListener("mouseup", function () {
                elemVisibility.toggle(setting_div);
            });
        }

        this.check_hashtag_value();
    },
    load_twitch_chat: function (twitch_channel_name) {
        //
        heat.textContent = `● TWITCH`;
        user_cnt.textContent = `● ${twitch_channel_name.toUpperCase()}`;

        elemVisibility.hide(document.getElementById("announcements"));
        
        if (obs_mode == true) {
            elemVisibility.hide(document.getElementById("tool_bar"));
        }else {
            elemVisibility.hide(document.getElementById("joinCheck_lab"));
            elemVisibility.hide(document.getElementById("giftCheck_lab"));
            
            elemVisibility.show(document.getElementById("tool_bar"));
        }

        this.writeToScreen(`<span class="pod">INFO</span>[Twitch] ${twitch_channel_name}`);
        console.log('[twitch]');
        //
        const client = new tmi.Client({
            options: { debug: false, messagesLogLevel: "info" },
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: 'justinfan12345',
                password: 'oauth:kappa'
            },
            channels: [ twitch_channel_name ]
        });
        client.connect().catch(console.error);
        client.on('message', (channel, tags, message, self) => {
            if(self) return;
            // if(message.toLowerCase() === '!hello') {
            //     client.say(channel, `@${tags.username}, heya!`);
            // }
            //console.log(tags);

            if(tags.color == null) tags.color = '#1dddf8';

            let message_with_emotes = this.twitch_format_emotes(message, tags.emotes);

            if(tags['display-name'].toLowerCase() === tags.username.toLowerCase()){
                this.writeToScreen(`<span style="color:${tags.color}">${tags['display-name']}</span>: ${message_with_emotes}`);
            }else{
                //this.writeToScreen(`<span style="color:${tags.color}">${tags['display-name']}</span>(${tags.username}): ${message}`);
                this.writeToScreen(`<span style="color:${tags.color}">${tags['display-name']}</span>: ${message_with_emotes}`);
            }

            //tts
            if (obs_mode == false) {
                if (document.getElementById("ttsCheck").checked == true) {
                    tts.speak2(message);
                }
            }
            
        });
    },
    twitch_format_emotes: function (text, emotes) {
        let splitText = text.split('');
        for(let i in emotes) {
            let e = emotes[i];
            for(let j in e) {
                let mote = e[j];
                if(typeof mote == 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    let length =  mote[1] - mote[0],
                        empty = Array.apply(null, new Array(length + 1)).map(function() { return '' });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/' + i + '/1.0">');
                }
            }
        }
        return this.htmlEntities(splitText).join('');
    },
    htmlEntities: function (html) {
        function it() {
            return html.map(function(n, i, arr) {
                    if(n.length == 1) {
                        return n.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
                               return '&#'+i.charCodeAt(0)+';';
                            });
                    }
                    return n;
                });
        }
        let isArray = Array.isArray(html);
        if(!isArray) {
            html = html.split('');
        }
        html = it(html);
        if(!isArray) html = html.join('');
        return html;
    },
    load_langplay_chat: function (langplay_channel_name) {
        //
        let ovs = false;
        this.get_langplay_token(ovs); //取得token
    },
    change_channel_btn: function () { //首頁切換頻道按鈕
        let btn_submit = document.getElementById("btn_submit");
        let input_submit = document.getElementById("inputChannel");

        btn_submit.addEventListener("mouseup", function () {
            DEBUG_MODE && console.log("onmouseup");
            DEBUG_MODE && console.log(input_submit.value);
            window.location.hash = `#${input_submit.value}`;
        });

        input_submit.addEventListener("keydown", function (e) {
            if (e.keyCode == 13 || e.which == 13) {
                DEBUG_MODE && console.log("onkeydown");
                DEBUG_MODE && console.log(input_submit.value);
                window.location.hash = `#${input_submit.value}`;
            }
        });
    },
    get_langplay_token: function (ovs) { //取得連線資訊
        let get_hashtag = window.location.hash;
        //let get_token_url;

        if (get_hashtag !== '' || get_hashtag !== '#') {
            //let get_hashtag_num = get_hashtag.replace(/[^0-9]/g,'');

            if (get_hashtag.substr(1).toLowerCase().endsWith(",iddqd") === true || get_hashtag.substr(1).toLowerCase().endsWith(",both") === true) {
                conn_overseas_chat = true;
            }

            // ex. #2426076 => 2426076
            // 去掉'#'號,並且過濾掉數字以外的所有字元
            //let get_hashtag_num = this.htmlEncode(get_hashtag.substr(1));
            let get_hashtag_num = (get_hashtag.substr(1)).replace(/[^0-9]/g, '');

            //get_token_url = `get_token.php?u=${get_hashtag_num}`;
            //get_token_url = `/getRoomInfo.php?u=${get_hashtag_num}`; //php內會再過濾一次,避免被惡意攻擊
            //get_token_url = '/getRoomInfo.php';

            // let post_data = {
            //   csrf_token: document.body.dataset.csrf_token,
            //   data_obj: {
            //     room_id: get_hashtag_num
            //   }
            // };

            //原生JS AJAX
            BanaApi.getRoomInfo(get_hashtag_num).then((data) => {
                //console.log(myJson.data);

                if ((typeof data != "undefined") && (typeof data.data != "undefined")) {
                    //連線資料
                    //tokens['token'] = data.data[0].token;
                    //tokens['live_id'] = data.data[0].room.live_id;
                    tokens['room_id'] = data.data.live_info.room_id; //禮物效果用
                    tokens['uid'] = data.data.live_info.uid; //禮物效果用

                    //new
                    tokens['live_id'] = data.data.live_info.live_id;
                    tokens['live_key'] = data.data.live_info.live_key;
                    tokens['token'] = kk_getToken(tokens['live_id'], tokens['live_key']);
                    //console.log(kk_getToken(tokens['live_id'],tokens['live_key']));
                    //console.log(kk_getToken_2(tokens['live_id'],tokens['live_key']));

                    //其他資料
                    tokens['nickname'] = this.htmlEncode(data.data.live_info.nickname);
                    tokens['room_title'] = this.htmlEncode(data.data.live_info.room_title);

                    if (ovs === false) {
                        //熱度,觀眾數
                        heat.textContent = `● ${this.numberWithCommas(data.data.live_info.heat || "0")}`;
                        user_cnt.textContent = `● ${this.numberWithCommas(data.data.live_info.user_cnt_p || "0")}`;

                        elemVisibility.hide(document.getElementById("announcements"));
                        elemVisibility.show(document.getElementById("tool_bar"));

                        cssCheck_tool_bar = !(getComputedStyle(document.getElementById('tool_bar')).display === 'none');
                        if (obs_mode == false && cssCheck_tool_bar == true) {
                            //setting_div.style.display = 'block'; //新功能先預設開啟
                            //elemVisibility.show(setting_div);
                        }

                        //let exception_room = false;

                        //館長台
                        // if (get_hashtag_num == "2282757") {
                        //   wsUri_gift = wsUri_gift_1;
                        //   exception_room = true;
                        // } else {
                        //   wsUri_gift = wsUri_gift_2;
                        //   exception_room = false;
                        // }

                        //檢查CSS display屬性
                        this.cssCheck();

                        //歡迎訊息
                        //document.title = `[${tokens['nickname']}] ${tokens['room_title']} - BABANANA Chat`;
                        //this.writeToScreen(`歡迎來到 ${tokens['nickname']} 的實況台`);
                        //this.writeToScreen(`實況標題: ${tokens['room_title']}`);
                        this.writeToScreen(`<span class="pod">INFO</span>[ ${tokens['nickname']} | ${tokens['room_title']} ]`);



                        //取得貼圖
                        this.getSticker(get_hashtag_num);

                        //開台狀態&統計
                        if (obs_mode === false) {
                            stats.init();

                            tool_bar_datetime_span = document.getElementById("tool_bar_datetime");
                            this.display_datetime();
                        }
                        if (data.data.live_info.live_status == 1) {
                            //正在開台
                            console.log('[正在開台]');

                            //有開台才抓貼圖,省流量
                            //this.getSticker(get_hashtag_num);

                            if (obs_mode === false) {
                                //stats.init();

                                elemVisibility.show(document.getElementById('statsUiCheck_lab'));

                                setInterval(() => {
                                    stats.refresh_ui();
                                }, 1000);
                            }
                        } else {
                            //關台
                            console.log('[關台]');


                            if (obs_mode === true) {
                                //
                                heat.innerHTML = '● 目前沒有直播';
                                user_cnt.textContent = "";
                            } else {
                                heat.innerHTML = '● 目前沒有直播';
                                user_cnt.textContent = "";
                                main.writeToScreen(`[提示] 目前沒有直播，此聊天室房號僅為直播離線用，`, ["kk_chat", "kk_conn"]);
                                main.writeToScreen(`請在OBS開啟直播後手動F5重新載入聊天室，`, ["kk_chat", "kk_conn"]);
                                main.writeToScreen(`或等到頁面15分鐘後自動重載。`, ["kk_chat", "kk_conn"]);
                            }

                            setTimeout(function () {
                                location.reload(false); //重新載入頁面
                                // false - Default. Reloads the current page from the cache.
                                // true - Reloads the current page from the server
                            }, 900000);
                        }
                    } else {
                        webSocket_chat_overseas();
                    }

                } else {
                    this.writeToScreen(`[錯誤]找不到指定的聊天室!<br>回到 <a href="./">[首頁]</a>`);
                }
            }).catch((error) => {
                //console.log(error);
            });
        }
    },
    getSticker: function (_room_id) {
        //getRoomStickerList
        BanaApi.getRoomStickerList(_room_id).then((data) => {
            //連接聊天室伺服器
            webSocket_chat();

            //連接禮物伺服器
            webSocket_gift();



            console.log(data.data.list);
            get_sticker_obj = data.data.list;

            if (typeof get_sticker_obj !== "undefined" && get_sticker_obj.length >= 1) {
                get_sticker_done = true;

                let sticker_css_class = "lang_sticker";
                // if(obs_mode===true){
                //   sticker_css_class = "lang_sticker_obs";
                // }

                //測試貼圖
                //let _msg_img = '';
                let _msg_text = '';
                get_sticker_obj.forEach((ele, index) => {
                    //_msg_img += `<img src="${ele.sticker_img.medium}" alt="${ele.sticker_name}" class="${sticker_css_class}">`;
                    _msg_text += `[${ele.sticker_name}]`;

                    if (index >= get_sticker_obj.length - 1) {
                        //main.writeToScreen(`<span class="pod">目前貼圖</span> ${_msg_img}</span>`, ["kk_chat"]);

                        _msg_text = this.msgSticker(_msg_text, 99);
                        main.writeToScreen(`<span class="pod">STICKER</span> <span>${_msg_text}</span>`, ["kk_chat"]);

                        //let _msg_text2 = this.msgSticker("[扁人][扁人][扁人][扁人][扁人]", 99);
                        //main.writeToScreen(`<span class="pod">貼圖測試</span> ${_msg_text2}</span>`, ["kk_chat"]);
                    }
                });
            }

        }).catch((error) => {
            console.log(error);
        });
    },
    msgSticker: function (_msg, _vip_fan = 0) {
        let _msg_with_sticker = _msg;

        if (typeof get_sticker_obj !== "undefined" && get_sticker_obj.length >= 1) {
            for (let i = 0; i < get_sticker_obj.length; i++) {
                if (_vip_fan >= get_sticker_obj[i].sticker_level) {
                    let _img_ele = document.createElement("img");
                    _img_ele.src = get_sticker_obj[i].sticker_img.medium;
                    _img_ele.alt = get_sticker_obj[i].sticker_name;
                    _img_ele.classList = "lang_sticker";
                    let _img_ele_str = _img_ele.outerHTML;
                    _img_ele = null;

                    //_msg_with_sticker = _msg_with_sticker.replace(`[${get_sticker_obj[i].sticker_name}]`, `<img src="${get_sticker_obj[i].sticker_img.medium}" alt="${get_sticker_obj[i].sticker_name}" class="lang_sticker">`);
                    //_msg_with_sticker = _msg_with_sticker.replace(`[${get_sticker_obj[i].sticker_name}]`, _img_ele_str);
                    _msg_with_sticker = _msg_with_sticker.split(`[${get_sticker_obj[i].sticker_name}]`).join(_img_ele_str);
                }
            }

            return _msg_with_sticker;
        } else {
            return _msg;
        }
    },
    cssCheck: function () { //檢查用戶自訂的display是否為none,若為none則直接不輸出到網頁上(輸出前判定)
        main.writeToScreen(`<span class="pod">TEST</span> .kk_chat`, ["kk_chat", "testCSS"]);

        main.writeToScreen(`<span class="pod">TEST</span> .kk_gift`, ["kk_gift", "testCSS"]);
        main.writeToScreen(`<span class="pod">TEST</span> .kk_reconn`, ["kk_reconn", "testCSS"]);
        main.writeToScreen(`<span class="pod">TEST</span> .kk_bana`, ["kk_bana", "testCSS"]);
        main.writeToScreen(`<span class="pod">TEST</span> .kk_come`, ["kk_come", "testCSS"]);

        //計算OBS版的最大行數
        if (obs_mode === true) {
            this.linesCheck();

            //若視窗大小被改變
            //(正常在OBS下使用不會觸發這個,主要是瀏覽器上測試用)
            window.addEventListener('resize', () => {
                this.linesCheck();
            }, true);
        }

        //全域變數
        cssCheck_kk_gift = !(getComputedStyle(document.querySelector('.kk_gift')).display === 'none');
        cssCheck_kk_reconn = !(getComputedStyle(document.querySelector('.kk_reconn')).display === 'none');
        cssCheck_kk_bana = !(getComputedStyle(document.querySelector('.kk_bana')).display === 'none');
        cssCheck_kk_come = !(getComputedStyle(document.querySelector('.kk_come')).display === 'none');

        //測試完後刪除
        document.querySelectorAll(".testCSS").forEach((e) => {
            e.parentNode.removeChild(e);
        });

        //因為太多館長台的側錄Youtube頻道沒有按照說明文件給的CSS去修改,所以無法正確判定CSS的display是否為'none'
        //所以這裡直接把館長台OBS版頁面CSS判定結果直接定義
        /*
        if(obs_mode===true && exception_room===true){
          cssCheck_kk_gift = false;
          cssCheck_kk_reconn = false;
          cssCheck_kk_bana = false;
          cssCheck_kk_come = false;
        }
        */

        console.log('[cssCheck] kk_gift: ' + cssCheck_kk_gift);
        console.log('[cssCheck] kk_reconn: ' + cssCheck_kk_reconn);
        console.log('[cssCheck] kk_bana: ' + cssCheck_kk_bana);
        console.log('[cssCheck] kk_come: ' + cssCheck_kk_come);

        //elemVisibility.hide( document.getElementById('cssCheck') );
    },
    linesCheck: function () { //計算OBS版的最大行數
        console.log(`[預設聊天室行數] ${chat_limit}`);

        let cssCheck_kk_chat = document.querySelector('.kk_chat');

        if (cssCheck_kk_chat !== null) {
            let cssCheck_one_line_height = cssCheck_kk_chat.scrollHeight;
            let cssCheck_screen_height = window.innerHeight;
            console.log(`[測試單行高度] ${cssCheck_one_line_height}`);
            console.log(`[測試畫面高度] ${cssCheck_screen_height}`);

            let auto_chat_lines = (cssCheck_screen_height / cssCheck_one_line_height).toFixed(0);
            auto_chat_lines = auto_chat_lines * 1.0 + 3; //加3行緩衝
            console.log(`[自動判定聊天室行數] ${auto_chat_lines}`);

            //若在安全範圍內則修改,未在安全範圍內則繼續使用預設值
            if (auto_chat_lines >= 10 && auto_chat_lines <= 100) {
                //全域變數
                chat_limit = auto_chat_lines;
                console.log(`[聊天室行數] ${chat_limit} (修改成功)`);
            } else {
                console.log(`[聊天室行數] ${chat_limit} (未在安全範圍內則繼續使用預設值)`);
            }
        }
    },
    htmlEncode: function (html_c) { //去除XSS字元
        html_c = html_c.toString();
        html_c = html_c.trim();
        return html_c.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
    writeToScreen: function (message, class_name_arr) { //將訊息寫入畫面的 div#output 裡
        let pre = document.createElement("div");
        //pre.style.wordWrap = "break-word";
        pre.classList.add("output_lines");
        if (typeof class_name_arr !== "undefined") {
            pre.classList.add(...class_name_arr);
        } else {
            pre.classList.add("kk_chat");
        }

        message = message.trim();
        //pre.innerHTML = message.replace(/\n/g, "<br />"); // 將"\n"轉換成"<br />"
        //pre.innerHTML = `<span class="kk_time">${this.get_time()}</span><span class="kk_border"></span>${message}`;
        pre.innerHTML = `<span class="kk_time kk_pod">${this.get_time()}</span>${message}`;

        output.appendChild(pre); //輸出訊息在畫面上

        this.scroll_to_bottom_auto();

        //新方法
        //選while而不用加一刪一是因為要防bug漏算導致越積越多行
        //*目前不確定writeToScreen()如果送出太快太密集會不會導致行數多刪
        while (output.childElementCount > chat_limit) {
            output.removeChild(output.childNodes[0]);
        }

        this.scroll_to_bottom_auto();

        //舊方法
        /*
        //區分瀏覽器版和OBS版的聊天室顯示模式
        if (obs_mode != true) { // 瀏覽器
          //避免訊息過多瀏覽器當掉,超過30000則訊息時清空畫面
          if (chat_i > chat_limit) {
            output.innerHTML = "";
            console.clear();
            chat_i = 0;
          }
    
          output.appendChild(pre); //輸出訊息在畫面上
    
          chat_i++; //目前頁面訊息數
        }else{ // OBS
          // first in first out
          output_last_lines.push(pre); //保存最新的n行
          //console.log(output_last_lines.length);
          if(output_last_lines.length > chat_limit){
            output_last_lines.shift(); //清除最舊的一行
            //console.dir(output_last_lines);
          }
    
          output.innerHTML = "";
    
          //因為大台實況台刷屏很快的關係(一秒可能十則訊息以上)
          //目前想法是直接控制記憶體中的array變數(first in first out)會比在HTML中執行DOM搜尋穩定
          //所以目前選擇每次送出訊息都整面重繪,而不是DOM搜尋
          //預設為顯示30行,看起來還在可承受範圍內
          //輸出的部份未來有可能會改成setTimeout()或setInterval(),以每秒(或更低)輸出一次來減少使用者端的CPU負載
          let l_html = document.createElement("div");
          for(let fi = 0; fi < output_last_lines.length; fi++){
            l_html.appendChild(output_last_lines[fi]);
          }
          output.appendChild(l_html);
        }
        */
    },
    writeToScreen_v2: function (message, class_name_arr = ["kk_chat"]) {
        let pre = document.createElement("div");
        //pre.style.wordWrap = "break-word";
        pre.classList.add("output_lines");
        pre.classList.add(...class_name_arr);

        message = message.trim();
        //pre.innerHTML = message.replace(/\n/g, "<br />"); // 將"\n"轉換成"<br />"
        //pre.innerHTML = `<span class="kk_time">${this.get_time()}</span><span class="kk_border"></span>${message}`;

        //pre.innerHTML = `<span class="kk_time kk_pod">${this.get_time()}</span>${message}`;
        let ele_span_pod = document.createElement("span");
        ele_span_pod.classList.add("kk_time");
        ele_span_pod.classList.add("kk_pod");
        ele_span_pod.innerText = this.get_time();
        pre.appendChild(ele_span_pod);

        let ele_span_msg = document.createElement("span");
        ele_span_msg.innerHTML = this.get_time();
        pre.appendChild(ele_span_msg);

        output.appendChild(pre); //輸出訊息在畫面上

        this.scroll_to_bottom_auto();

        //新方法
        //選while而不用加一刪一是因為要防bug漏算導致越積越多行
        //*目前不確定writeToScreen()如果送出太快太密集會不會導致行數多刪
        while (output.childElementCount > chat_limit) {
            output.removeChild(output.childNodes[0]);
        }

        this.scroll_to_bottom_auto();
    },
    scroll_to_bottom_auto: function () { //畫面自動捲動
        if (stop_scroll == false) {
            window.scrollTo(0, document.body.scrollHeight); //畫面自動捲動
            if (obs_mode == false) {
                elemVisibility.hide(scroll_to_bottom_btn);
            }
        } else {
            //document.getElementById("scroll_to_bottom_btn").style.display = 'block';
        }
    },
    scroll_to_bottom_btn: function () { //向下捲動的按鈕
        let scroll_to_bottom_btn = document.getElementById("scroll_to_bottom_btn");
        scroll_to_bottom_btn.addEventListener("mouseup", function () {
            window.scrollTo(0, document.body.scrollHeight);
            //document.getElementById("scroll_to_bottom_btn").style.display = 'none';
            elemVisibility.hide(scroll_to_bottom_btn);
            stop_scroll = false;
        });
    },
    pt: function (num) { //數字小於10時前面補0 (顯示時間用,例 12:07)
        return (num < 10 ? "0" : "") + num;
    },
    get_time: function () { //取得目前時間
        let now_time = new Date();

        //let year = now_time.getFullYear();
        //let month = this.pt( now_time.getMonth() + 1 );
        //let day = this.pt( now_time.getDate() );
        let hours = this.pt(now_time.getHours());
        let minutes = this.pt(now_time.getMinutes());
        //let seconds = this.pt( now_time.getSeconds() );

        let txt_datetime = `${hours}:${minutes}`;

        return txt_datetime;
    },
    get_time_full: function () { //取得目前時間
        let now_time = new Date();

        let year = now_time.getFullYear();
        let month = this.pt(now_time.getMonth() + 1);
        let day = this.pt(now_time.getDate());
        let hours = this.pt(now_time.getHours());
        let minutes = this.pt(now_time.getMinutes());
        let seconds = this.pt(now_time.getSeconds());

        let txt_datetime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

        return txt_datetime;
    },
    numberWithCommas: function (x) { //數字千位加逗點 ( '1000' => '1,000' )
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    display_datetime: function () {
        //
        setInterval(() => {
            //let tool_bar_datetime = document.getElementById("tool_bar_datetime");
            tool_bar_datetime_span.textContent = `● ${this.get_time()}`;
        }, 1000);
    },
    check_scroll: function () { //檢查畫面捲動方向,如果向上則觸法暫停捲動功能
        //原版
        if (obs_mode != true) {
            var lastScrollTop = 0;
            /*
            window.addEventListener("scroll", function () {
              //console.log("on scroll");
              if(document.visibilityState === 'visible'){
                let st = window.pageYOffset || document.documentElement.scrollTop;
                //console.log(st, lastScrollTop);
                if ((st+130) > lastScrollTop) {
                  // downscroll code
                  //console.log("down scroll");
                } else {
                  // upscroll code
                  //console.log("up scroll");
                  stop_scroll = true;
                  //document.getElementById("scroll_to_bottom_btn").style.display = 'block';
                  elemVisibility.show(scroll_to_bottom_btn);
                }
                lastScrollTop = st;
              }
            }, false);
            */

            document.body.addEventListener('wheel', function () {
                stop_scroll = true;
                elemVisibility.show(scroll_to_bottom_btn);
            });

            document.body.addEventListener("touchmove", function () {
                stop_scroll = true;
                elemVisibility.show(scroll_to_bottom_btn);
            });
        }
    },
    pfid_color: function (_pfid) {
        let rel_color = "#ff4c4c";
        if (_pfid && (typeof _pfid == "string" || typeof _pfid == "number")) {
            //let new_color = "#A" + pfid.toString().substr(0, 7);
            let new_color_dec = 16777215 - parseInt(_pfid);
            if (new_color_dec <= 16777215 && new_color_dec >= 0) {
                let new_color_hex = new_color_dec.toString(16);
                if (new_color_hex.length == 6) {
                    rel_color = "#" + new_color_hex;
                }
            }
        }

        return rel_color;
    },
    conn_overseas_ws_chat: function () {
        //連接聊天室伺服器(overseas)
        //if(conn_overseas_chat === true){
        //延遲連線避免bug
        setTimeout(() => {
            //webSocket_chat_overseas();
            let ovs = true;
            this.get_langplay_token(ovs);
        }, 10000);
        //}
    }
};


//聊天室
var ws_chat = {
    onOpen: function (evt, overseas) {
        //DEBUG_MODE && console.log(evt);

        if (overseas === false) {
            main.writeToScreen(`[成功連接聊天室伺服器]`, ["kk_chat", "kk_conn", "kk_reconn"]);

            reconnection_chat_count = 0;
        } else {
            main.writeToScreen(`[成功連接聊天室伺服器/2]`, ["kk_chat", "kk_conn", "kk_reconn"]);

            reconnection_overseas_chat_count = 0;
        }

    },
    onMessage: function (evt, overseas) {
        DEBUG_MODE && console.log(evt.data);

        let chat_string = evt.data.trim();

        if (chat_string.substr(0, 2) == "0{") {
            this.doSend(`40/chat_nsp,`, overseas);
        }

        if (chat_string == "40/chat_nsp,") {
            // if(overseas === true){ //洗掉換新token(同token會被踢)
            //   tokens['token'] = kk_getToken(tokens['live_id'],tokens['live_key']);
            // }

            // 42/chat_nsp,["authentication",{"live_id":"2574682G69852PSel","anchor_pfid":2574682,"access_token":"這裡是token","token":"這裡是token","from":"WEB","client_type":"web","r":0}]
            this.doSend(`42/chat_nsp,["authentication",{"live_id":"${tokens['live_id']}","anchor_pfid":${tokens['room_id']},"access_token":"${tokens['token']}","token":"${tokens['token']}","from":"WEB","client_type":"web","r":0}]`, overseas);
        }

        if (chat_string == `42/chat_nsp,["authenticated",true]`) {


            chat_ws_conn_time = new Date().getTime();

            if (overseas === true) {
                ping_ovs = setTimeout(() => {
                    this.doSend("2", overseas);
                }, 50000);

                main.writeToScreen(`<span class="pod">✅ CHAT/2</span>`, ["kk_chat", "kk_conn"]);
            } else {
                ping = setTimeout(() => {
                    this.doSend("2", overseas);
                }, 50000);

                main.writeToScreen(`<span class="pod">✅ CHAT</span>`, ["kk_chat", "kk_conn"]);
            }


            if (obs_mode == false) {
                elemVisibility.show_inline(document.getElementById("setting_img"));

                let ttsCheck = document.getElementById("ttsCheck");
                ttsCheck.addEventListener('change', function (e) {
                    if (e.target.checked) { //checked
                        console.log("#ttsCheck true");
                    } else { //not checked
                        console.log("#ttsCheck false");
                        tts.cancel2();
                    }
                });
            }
        }
        if (chat_string == "3") {
            if (overseas === true) {
                clearTimeout(ping_ovs);
                ping_ovs = setTimeout(() => {
                    this.doSend("2", overseas);
                }, 50000);
            } else {
                clearTimeout(ping);
                ping = setTimeout(() => {
                    this.doSend("2", overseas);
                }, 50000);
            }
        }

        if (chat_string.substr(0, 11) == "42/chat_nsp") {
            let json_txt = chat_string.substr(12);
            let json_decode = JSON.parse(json_txt);
            DEBUG_MODE && console.log(json_decode);
            let w_name;
            let pfid;

            switch (json_decode[0]) {
                case "msg":
                    w_name = main.htmlEncode(json_decode[1].name);
                    let msg_raw = json_decode[1].msg;
                    let msg = main.htmlEncode(msg_raw);
                    let grade_lvl = json_decode[1].grade_lvl;
                    pfid = json_decode[1].pfid;
                    //console.log(json_decode[1].pfid);

                    //console.log(json_decode[1]);

                    //let rel_color = json_decode[1].rel_color;
                    // test new color
                    let rel_color = main.pfid_color(pfid);
                    let color_css = rel_color ? ("color:" + rel_color + ";") : "";

                    //挑位階最高的顯示
                    let role = "";
                    if (json_decode[1].is_admin == true) {
                        role = "管理";
                    }
                    if (w_name == tokens['nickname'] && pfid == tokens['uid']) {
                        role = "主播";
                    }
                    if (json_decode[1].role == 1) {
                        role = "官方";
                    }

                    if (role !== "") {
                        role = `<span class="pod isadmin">${role}</span>`;
                    }

                    DEBUG_MODE && console.log(`${w_name} : ${msg}`);

                    // !f5
                    // (緊急更新用)
                    if (msg.startsWith("!f5")) {
                        if (pfid == "2426076") {
                            //因為這平台每次進入聊天室會載入之前最後10則訊息,加這個頁面開啟超過1分鐘才有效的判定防止頁面無限重載
                            if ((new Date().getTime() - page_load_time) >= 60000) {
                                location.reload(true); //重新載入頁面
                                // false - Default. Reloads the current page from the cache.
                                // true - Reloads the current page from the server
                            }
                        }
                    }

                    //tts
                    if (obs_mode == false) {
                        if (document.getElementById("ttsCheck").checked == true) {
                            //ws連線超過30秒才讀語音
                            if ((new Date().getTime() - chat_ws_conn_time) >= 30000) {
                                tts.speak2(msg_raw);
                            }
                        }
                    }

                    //是否有貼圖
                    if (get_sticker_done = true && json_decode[1].emoji >= 1) {
                        //
                        //console.log(get_sticker_obj);
                        // get_sticker_obj.forEach((ele,index)=>{
                        //   msg.replace(`[${ele.sticker_name}]`, `<img src="${ele.sticker_img.medium}" alt="${ele.sticker_name}" class="lang_sticker">`);
                        // });

                        msg = main.msgSticker(msg, json_decode[1].vip_fan);
                    } else {
                        //
                    }

                    if (conn_overseas_chat === true) {
                        //排除重複部份
                        if (overseas === true && role !== "") {
                            break;
                        }
                        /*
                        if(overseas === true && (new Date().getTime() - chat_ws_conn_time) < 1000 ){
                          break;
                        }
                        */

                        //server端最後發言時間
                        /*
                        if((json_decode[1].at * 1) <= last_msg_time){
                          last_msg_time = json_decode[1].at * 1;
                          break;
                        }
                        */
                        last_msg_time = json_decode[1].at * 1;

                        let get_hashtag2 = window.location.hash;
                        if (get_hashtag2.substr(1).toLowerCase().endsWith(",iddqd") === true) {
                            if (overseas === true) {
                                w_name = `${w_name} <span class="pod">2</span>`
                            } else {
                                w_name = `${w_name} <span class="pod">1</span>`
                            }
                        }
                    }

                    main.writeToScreen(`${role}<!--<span class="grade_lvl">[${grade_lvl}]</span>--><span class="name name_title" style="${color_css}" title="${pfid}">${w_name} :</span> <span class="msg">${msg}</span>`, ["kk_chat"]);

                    //統計不重複留言人數
                    //OBS版不統計
                    if (obs_mode == false) {
                        stats.msg_user_count_set_add(pfid);

                        stats.msg_count++;
                    }

                    break;
                case "join":
                    if (overseas === true) break; //跳出重複部份

                    if (cssCheck_kk_come) {
                        w_name = main.htmlEncode(json_decode[1].name);
                        pfid = json_decode[1].pfid;

                        //統計不重複加入人數
                        //OBS版不統計
                        if (obs_mode == false) {
                            stats.join_count_set_add(pfid);
                        }

                        //joinCheck
                        if (obs_mode == false) {
                            if (document.getElementById("joinCheck").checked == false) {
                                break;
                            }
                        }

                        DEBUG_MODE && console.log(`[加入聊天室] ${w_name}`);
                        main.writeToScreen(`<span class="pod">JOIN</span><span class="name_title" title="${pfid}">${w_name}</span>`, ["kk_come"]);
                    }
                    break;
            }
        }
    },
    onError: function (evt) {
        main.writeToScreen('<span style="color: red;">[ERROR]:</span> ' + main.htmlEncode(evt.data));
    },
    doSend: function (message, overseas) {
        if (overseas === false) {
            websocket.send(message);
        } else {
            websocket_overseas.send(message);
        }
    },
    onClose: function (evt) {
        main.writeToScreen(`[❎與聊天室伺服器斷線]`, ["kk_chat", "kk_conn", "kk_reconn"]);

        this.reConnection();
    },
    reConnection: function () {
        websocket.close();
        websocket = null;
        reconnection_chat_count++;
        if (reconnection_chat_count <= 25) {
            window.setTimeout(function () {
                main.writeToScreen(`[重新連接聊天室伺服器..(${reconnection_chat_count})]`, ["kk_chat", "kk_conn", "kk_reconn"]);
                webSocket_chat();
            }, 15000);
        } else {
            main.writeToScreen(`[重新連接聊天室伺服器..(連線失敗)]`, ["kk_chat", "kk_conn", "kk_reconn"]);
        }
    },
    onClose_overseas: function (evt) {
        main.writeToScreen(`[❎與聊天室伺服器斷線/2]`, ["kk_chat", "kk_conn", "kk_reconn"]);
        console.log("[❎與聊天室伺服器斷線/2]");

        this.reConnection_overseas(); //有問題暫不重連
    },
    reConnection_overseas: function () {
        websocket_overseas.close();
        websocket_overseas = null;
        reconnection_overseas_chat_count++;
        if (reconnection_overseas_chat_count <= 25) {
            window.setTimeout(function () {
                main.writeToScreen(`[重新連接聊天室伺服器/2..(${reconnection_overseas_chat_count})]`, ["kk_chat", "kk_conn", "kk_reconn"]);
                webSocket_chat_overseas();
            }, 60000);
        } else {
            main.writeToScreen(`[重新連接聊天室伺服器/2..(連線失敗)]`, ["kk_chat", "kk_conn", "kk_reconn"]);
        }
    },
};

//聊天室
function webSocket_chat() {
    websocket = new WebSocket(wsUri_chat);
    let overseas = false;

    //websocket的事件監聽器
    websocket.onopen = function (evt) { ws_chat.onOpen(evt, overseas) };
    websocket.onclose = function (evt) { ws_chat.onClose(evt) };
    websocket.onmessage = function (evt) { ws_chat.onMessage(evt, overseas) };
    websocket.onerror = function (evt) { ws_chat.onError(evt) };
}

//聊天室(Overseas)
function webSocket_chat_overseas() {
    websocket_overseas = new WebSocket(wsUri_chat_en);
    let overseas = true;

    //websocket的事件監聽器
    websocket_overseas.onopen = function (evt) { ws_chat.onOpen(evt, overseas) };
    websocket_overseas.onclose = function (evt) { ws_chat.onClose_overseas(evt) };
    websocket_overseas.onmessage = function (evt) { ws_chat.onMessage(evt, overseas) };
    websocket_overseas.onerror = function (evt) { ws_chat.onError(evt) };
}

//禮物效果
var ws_gift = {
    onOpen: function (evt) {
        main.writeToScreen(`[成功連接禮物伺服器]`, ["kk_gift", "kk_conn", "kk_reconn"]);
        //DEBUG_MODE && console.log(evt);
        heat.style.display = 'inline-block'; //開啟熱度欄

        reconnection_gift_count = 0;
    },
    onClose: function (evt) {
        main.writeToScreen(`[❎與禮物伺服器斷線]`, ["kk_gift", "kk_conn", "kk_reconn"]);

        this.reConnection();
    },
    onMessage: function (evt) {
        DEBUG_MODE && console.log(evt.data);

        let chat_string = evt.data.trim();

        if (chat_string.substr(0, 2) == "0{") {
            this.doSend(`40/control_nsp,`);
        }

        if (chat_string == "40/control_nsp,") {
            this.doSend(`42/control_nsp,["authentication",{"live_id":"${tokens['live_id']}","anchor_pfid":${tokens['room_id']},"access_token":"${tokens['token']}","token":"${tokens['token']}","from":"WEB","client_type":"web","r":0}]`);
        }

        if (chat_string == `42/control_nsp,["authenticated",true]`) {
            ping2 = setTimeout(() => {
                this.doSend("2");
            }, 50000);

            main.writeToScreen(`<span class="pod">✅ GIFT</span>`, ["kk_gift", "kk_conn"]);

            //連接海外ws chat
            if (conn_overseas_chat === true) {
                main.conn_overseas_ws_chat();
            }
        }
        if (chat_string == "3") {
            clearTimeout(ping2);
            ping2 = setTimeout(() => {
                this.doSend("2");
            }, 50000);
        }

        if (chat_string.substr(0, 14) == "42/control_nsp") {
            let json_txt = chat_string.substr(15);
            let json_decode = JSON.parse(json_txt);
            DEBUG_MODE && console.log(json_decode);
            //console.log(json_decode[0]);
            //let w_name;

            let mute_nickname;
            let mute_pfid;

            switch (json_decode[0]) {
                case "room_broadcast":
                    /*
                      42/control_nsp,
                      ["room_broadcast",{
                        "type":1,"content":{"fe_name":"西門","fe_id":2152350,"fr_name":"未央派","fr_id":2204294,"fr_lv":15,"fr_grade_id":1,"fr_grade_lvl":31},"at":1519369770728
                      }]
                    */

                    //console.log(`${json_decode[1]}`);

                    //追蹤
                    if (json_decode[1].type == 1) {
                        //console.log(`${json_decode[1].content.fr_name} 追蹤了主播`);
                        main.writeToScreen(`<span><span class="pod">FOLLOW</span><span class="name_title" title="${json_decode[1].content.fr_id}">${json_decode[1].content.fr_name}</span></span>`, ["kk_gift"]);
                    }

                    //統計不重複追蹤人數
                    //OBS版不統計
                    if (obs_mode == false) {
                        stats.follow_count_set_add(json_decode[1].content.fr_id);
                    }

                    break;
                case "room_customize":
                    /*
                      42/control_nsp,
                      ["room_customize",{
                        "data":{"delta":-846,"heat":168294,"Event":"live_heat","at":1519369752448},"at":1519369752448
                      }]
                    */

                    //console.log(json_decode[1]);

                    //熱度:
                    if (json_decode[1].data.Event == "live_heat") {
                        //console.log(json_decode[1].data.heat);
                        heat.textContent = `● ${main.numberWithCommas(json_decode[1].data.heat)}`;

                        stats.ofc_heat = json_decode[1].data.heat;

                        break;
                    }

                    //觀眾數
                    if (json_decode[1].data.Event == "liun") {
                        //console.log(json_decode[1].data.user_cnt_p);
                        viewers = json_decode[1].data.user_cnt_p;
                        user_cnt.textContent = `● ${main.numberWithCommas(viewers)}`;

                        stats.ofc_online_user = viewers;

                        break;
                    }

                    //浪花語音
                    if (json_decode[1].data.Event == "bullet_send") {
                        //console.log(json_decode[1].data.user_cnt_p);
                        let f_pfid = json_decode[1].data.f_pfid;
                        let f_nickname = main.htmlEncode(json_decode[1].data.f_nickname);
                        let msg = main.htmlEncode(json_decode[1].data.msg);

                        let rel_color = main.pfid_color(f_pfid);
                        let color_css = rel_color ? ("color:" + rel_color + ";") : "";

                        main.writeToScreen(`<span><span class="pod">📢 SPEECH</span> <span class="name_title" style="${color_css}" title="${f_pfid}">${f_nickname} :</span> <span class="msg">${msg}</span></span>`, ["kk_tts"]);

                        //統計不重複留言人數
                        //OBS版不統計
                        if (obs_mode == false) {
                            stats.msg_user_count_set_add(f_pfid);

                            stats.msg_count++;
                        }

                        break;
                    }

                    //開台重連
                    if (json_decode[1].data.Event == "switch_chat_room") {
                        /*
                          42/control_nsp,["room_customize",{"data":{"live_id":"P2150422Ha5QEoN","live_key":"x6H07K","status":0,"limit":{"grade_id":0,"grade_lvl":0},"Event":"switch_chat_room","at":1547489669780},"at":1547489669780}]
            
                          42/control_nsp,["close",{"reason":"close","user_count":"356273","at":1547489669785}]
                        */

                        setTimeout(function () {
                            location.reload(false); //重新載入頁面
                            // false - Default. Reloads the current page from the cache.
                            // true - Reloads the current page from the server
                        }, 180000);

                        break;
                    }

                    //如果用戶自訂禮物CSS的display為none則跳出switch
                    if (!cssCheck_kk_gift) {
                        break;
                    }

                    //giftCheck
                    if (obs_mode == false) {
                        if (document.getElementById("giftCheck").checked == false) {
                            break;
                        }
                    }


                    /*
                      42/control_nsp,
                      ["room_customize",{
                        "data":{"icon":[{"index":60,"line_1":"TOP100+","line_2":"福氣值:713","now_icon":""}],"Event":"live_icon_dynamic","at":1519369775403},"at":1519369775403
                      }]
                    */

                    /*
                      42/control_nsp,
                      [
                        "room_customize",
                        {
                          "data":{
                            "live_id":"2152350G64995LSG4",
                            "f_pfid":2426076,
                            "f_nickname":"EOTONES",
                            "f_headimg":"http://blob.ufile.ucloud.com.cn/2f3713397e7df78ad17b4f163459b25a",
                            "f_lvl":6,
                            "prod_id":1335,
                            "prod_cnt":"1",
                            "prod_total":2,
                            "display":"1",
                            "prod_clickid":"1519373595671",
                            "prod_combo":1,
                            "prod_giftnum":"1",
                            "anchor_diamond":"820284",
                            "anchor_diamond_day":"3335",
                            "combo_final":0,
                            "vip_fan":0,
                            "grade_id":1,
                            "grade_lvl":13,
                            "Event":"gift_send",
                            "at":1519373610626
                          },
                          "at":1519373610626
                        }
                      ]
                    */


                    //顯示禮物
                    if (json_decode[1].data.f_nickname != null && json_decode[1].data.prod_id != null && json_decode[1].data.prod_id >= 1000 && json_decode[1].data.prod_id != 1059 && json_decode[1].data.prod_id != 1077 && json_decode[1].data.prod_id <= 100000) {
                        let f_nickname = main.htmlEncode(json_decode[1].data.f_nickname);
                        let prod_cnt = json_decode[1].data.prod_cnt;
                        //let prod_total = json_decode[1].data.prod_total;
                        let prod_id = json_decode[1].data.prod_id;
                        //let msg = htmlEncode(json_decode[1].msg);
                        //let grade_lvl = json_decode[1].grade_lvl;
                        //let rel_color = json_decode[1].rel_color;
                        //let color_css = rel_color?("color:"+rel_color+";"):"";

                        let pfid = json_decode[1].data.f_pfid;

                        //DEBUG_MODE && console.log(`${w_name} : ${msg}`);

                        //w_name = json_decode[1];

                        if (typeof prod_id_arr[prod_id] != 'undefined') {
                            if (prod_id == 1365) { //香蕉
                                if (cssCheck_kk_bana) {
                                    main.writeToScreen(`<span><span class="pod">GIFT</span><span class="name_title" title="${pfid}">${f_nickname}</span> 送出 ${prod_cnt}個 [${prod_id_arr[prod_id]}]</span>`, ["kk_gift", "kk_bana"]);
                                }
                            } else {
                                main.writeToScreen(`<span><span class="pod">GIFT</span><span class="name_title" title="${pfid}">${f_nickname}</span> 送出 ${prod_cnt}個 [${prod_id_arr[prod_id]}]</span>`, ["kk_gift"]);

                                /*
                                //tts
                                if(obs_mode == false){
                                  console.log(`prod_total: ${parseInt(json_decode[1].data.prod_total)}`);
                                  if(parseInt(json_decode[1].data.prod_total) >= 5){
                                    //if(document.getElementById("ttsCheck").checked == true){
                                      let gift_msg = `感謝 ${f_nickname} 送出 ${prod_cnt} 個 ${prod_id_arr[prod_id]}`;
                                      //tts.speak2(gift_msg);
                                      console.log(gift_msg);
                                    //}
                                  }
                                }
                                */
                            }
                        } else {
                            main.writeToScreen(`<span><span class="pod">GIFT</span><span class="name_title" title="${pfid}">${f_nickname}</span> 送出 ${prod_cnt}個 [禮物]</span>`, ["kk_gift"]);
                        }

                    }
                    break;
                case "mute_notify": //ban人訊息
                    //console.log(json_decode);
                    mute_nickname = main.htmlEncode(json_decode[1].data.nickname);
                    mute_pfid = json_decode[1].data.pfid;
                    main.writeToScreen(`<span><span class="pod">MUTE</span><span class="mute_name_title" title="${mute_pfid}">${mute_nickname}</span> 已被禁言</span>`, ["kk_mute"]);

                    break;
                case "unmute_notify": //解ban訊息
                    mute_nickname = main.htmlEncode(json_decode[1].data.nickname);
                    mute_pfid = json_decode[1].data.pfid;
                    main.writeToScreen(`<span><span class="pod">MUTE</span><span class="mute_name_title" title="${mute_pfid}">${mute_nickname}</span> 解除禁言</span>`, ["kk_mute"]);

                    break;
                //case "site_customize":
                //DEBUG_MODE && console.log(json_decode[1]);
                /*
                  42/control_nsp,
                  [
                    "site_customize",
                    {
                      "data":
                      {
                        "duration":20,
                        "icon":"http://blob.ufile.ucloud.com.cn/c6da5179d94ba255aea5e524ad9b562a",
                        "send_nickname":"🎹🎺PonPon🎰",
                        "gift_name":"旺旺鞭炮",
                        "award_times":500,
                        "award_amout":1500,
                        "live_info":null,
                        "filter":{"noti_flag":3},
                        "Event":"notify_gift_crit"
                      },
                      "at":1519369750593
                    }
                  ]
                */

                //break;
            }
        }
    },
    onError: function (evt) {
        main.writeToScreen('<span style="color: red;">[ERROR]:</span> ' + main.htmlEncode(evt.data));
    },
    doSend: function (message) {
        websocket_gift.send(message);
    },
    reConnection: function () {
        websocket_gift.close();
        websocket_gift = null;
        reconnection_gift_count++;
        if (reconnection_gift_count <= 25) {
            window.setTimeout(function () {
                main.writeToScreen(`[重新連接禮物伺服器..(${reconnection_chat_count})]`, ["kk_gift", "kk_conn", "kk_reconn"]);
                webSocket_gift();
            }, 15000);
        } else {
            main.writeToScreen(`[重新連接禮物伺服器..(連線失敗)]`, ["kk_gift", "kk_conn", "kk_reconn"]);
        }

    },
};

//禮物效果
function webSocket_gift() {
    websocket_gift = new WebSocket(wsUri_gift);

    //websocket的事件監聽器
    websocket_gift.onopen = function (evt) { ws_gift.onOpen(evt) };
    websocket_gift.onclose = function (evt) { ws_gift.onClose(evt) };
    websocket_gift.onmessage = function (evt) { ws_gift.onMessage(evt) };
    websocket_gift.onerror = function (evt) { ws_gift.onError(evt) };
}


(function () {
    //程式進入點
    window.addEventListener("load", main.init(), false);
})();
