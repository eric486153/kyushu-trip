import React, { useState, useEffect } from 'react';
import { MapPin, Utensils, Calendar, Home, Sun, Moon, Leaf, Plus, Trash2, PenTool, Save, RotateCcw, Camera, X, Wallet, Calculator, Coins, ChevronUp, ChevronDown } from 'lucide-react';

// 將圖標組件移到外部
const MomijiIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.87,1.5c-0.34,2.14-1.89,4.45-3.09,5.88c-1.46-1.32-3.8-2.61-5.74-2.54c1.17,1.6,2.37,3.67,2.44,5.65 c-1.92-0.66-4.52-0.84-6.32,0.14c1.69,1.15,4.09,1.88,6.04,1.86c-1.5,1.54-3.56,3.65-3.95,5.77c1.47-0.78,3.46-1.12,5.13-0.5 c-0.61,1.82-0.96,4.05-0.18,5.82c0.69-1.63,2.09-3.41,3.49-4.38c0.07,2.23,0.37,4.38,1.35,6.31c0.88-1.94,1.13-4.14,1.18-6.33 c1.45,0.92,2.94,2.71,3.63,4.41c0.64-1.83,0.3-4.08-0.36-5.83c1.64-0.62,3.64-0.3,5.1,0.48c-0.37-2.1-2.42-4.2-3.91-5.75 c1.94,0.01,4.35-0.73,6.04-1.88c-1.8-0.97-4.4-0.8-6.32-0.15c0.09-1.99,1.29-4.06,2.46-5.65c-1.94-0.07-4.28,1.22-5.74,2.54 C17.88,5.92,16.29,3.58,15.93,1.5C15.2,1.96,14.07,1.82,12.87,1.5z" />
  </svg>
);

const ItineraryApp = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0.22);
  const [isFooterOpen, setIsFooterOpen] = useState(false); // 控制底部展開/收合狀態

  // --- 狀態管理 ---
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('kyushu_trip_notes_v1');
      const parsed = saved ? JSON.parse(saved) : {};
      return (typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) { return {}; }
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('kyushu_trip_expenses_v1');
      const parsed = saved ? JSON.parse(saved) : {};
      return (typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (e) { return {}; }
  });

  const [expenseInput, setExpenseInput] = useState({ item: '', amount: '', currency: 'JPY' });

  // --- 自動儲存 ---
  useEffect(() => {
    try { localStorage.setItem('kyushu_trip_notes_v1', JSON.stringify(notes)); } catch (e) { }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem('kyushu_trip_expenses_v1', JSON.stringify(expenses)); } catch (e) { }
  }, [expenses]);

  // --- 記帳邏輯 ---
  const addExpense = () => {
    if (!expenseInput.item || !expenseInput.amount) return;

    const newExpense = {
      id: Date.now(),
      item: expenseInput.item,
      amount: parseFloat(expenseInput.amount) || 0,
      currency: expenseInput.currency
    };

    setExpenses(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), newExpense]
    }));

    setExpenseInput({ item: '', amount: '', currency: 'JPY' });
  };

  const deleteExpense = (id) => {
    setExpenses(prev => ({ ...prev, [activeDay]: prev[activeDay].filter(ex => ex.id !== id) }));
  };

  const calculateTotal = (expenseList = []) => {
    let totalJPY = 0;
    let totalTWD = 0;
    if (!Array.isArray(expenseList)) return { jpy: 0, twd: 0 };

    expenseList.forEach(ex => {
      const amt = parseFloat(ex.amount) || 0;
      if (ex.currency === 'JPY') {
        totalJPY += amt;
        totalTWD += amt * exchangeRate;
      } else {
        totalTWD += amt;
        totalJPY += amt / (exchangeRate || 1);
      }
    });
    return { jpy: Math.round(totalJPY), twd: Math.round(totalTWD) };
  };

  const dailyTotal = calculateTotal(expenses[activeDay] || []);

  const grandTotal = () => {
    let allExpenses = [];
    Object.values(expenses).forEach(dayList => {
      if (Array.isArray(dayList)) allExpenses = [...allExpenses, ...dayList];
    });
    return calculateTotal(allExpenses);
  };

  // --- 圖片處理 ---
  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject("No file");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          const width = scaleSize < 1 ? MAX_WIDTH : img.width;
          const height = scaleSize < 1 ? img.height * scaleSize : img.height;
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (noteId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resizedImage = await resizeImage(file);
      setNotes(prev => ({
        ...prev,
        [activeDay]: (prev[activeDay] || []).map(note => note.id === noteId ? { ...note, image: resizedImage } : note)
      }));
    } catch (error) { alert("圖片處理失敗"); }
  };

  const removeImage = (noteId) => {
    setNotes(prev => ({
      ...prev,
      [activeDay]: (prev[activeDay] || []).map(note => note.id === noteId ? { ...note, image: null } : note)
    }));
  };

  // --- 筆記操作 ---
  const addNote = () => setNotes(prev => ({ ...prev, [activeDay]: [...(prev[activeDay] || []), { id: Date.now(), text: '', image: null }] }));
  const updateNote = (id, newText) => setNotes(prev => ({ ...prev, [activeDay]: (prev[activeDay] || []).map(n => n.id === id ? { ...n, text: newText } : n) }));
  const deleteNote = (id) => setNotes(prev => ({ ...prev, [activeDay]: (prev[activeDay] || []).filter(n => n.id !== id) }));

  const resetAllData = () => {
    if (window.confirm('確定要刪除所有資料（筆記、照片、記帳）嗎？無法復原。')) {
      setNotes({});
      setExpenses({});
      localStorage.removeItem('kyushu_trip_notes_v1');
      localStorage.removeItem('kyushu_trip_expenses_v1');
    }
  };

  const itinerary = [
    { day: 1, date: "11/28", title: "初抵福岡・夜訪中洲", stay: "博多TRAD飯店 或 福岡蒙特瑪娜飯店", meals: { b: "自理", l: "自理", d: "機上簡餐" }, highlights: [{ time: "晚間", location: "中洲屋台街", desc: "福岡最具代表性的夜生活風景。", foodie_tips: "推薦：博多拉麵、明太子玉子燒。", tags: ["屋台"] }, { time: "宵夜", location: "一蘭拉麵 (總本店)", desc: "掛著巨大燈籠的本社大樓。", foodie_tips: "必吃：限定方形碗釜醬汁豚骨拉麵。", tags: ["拉麵"] }] },
    { day: 2, date: "11/29", title: "水都柳川・熊本城", stay: "星野集團 OMO5 熊本飯店", meals: { b: "飯店內", l: "柳川鰻魚御膳", d: "和牛燒肉吃到飽" }, highlights: [{ time: "上午", location: "柳川人力遊船", desc: "搭乘小舟欣賞沿岸垂柳。", foodie_tips: "特色：蒸籠鰻魚飯，米飯軟糯香甜。", tags: ["遊船"] }, { time: "下午", location: "熊本城 & 城彩苑", desc: "日本三大名城，銀杏環繞。", foodie_tips: "推薦：芥末蓮藕、即時糰子、海膽可樂餅。", tags: ["銀杏"] }, { time: "晚上", location: "熊本下通商店街", desc: "自由逛街。", foodie_tips: "推薦：生馬肉(Basashi)口感鮮嫩。", tags: ["購物"] }] },
    { day: 3, date: "11/30", title: "高千穗・阿蘇秘境", stay: "阿蘇溫泉 龜之井", meals: { b: "飯店內", l: "高千穗鄉土料理", d: "自助百匯+長腳蟹" }, highlights: [{ time: "上午", location: "高千穗峽", desc: "柱狀節理懸崖與真名井瀑布。", foodie_tips: "名物：流水麵、高千穗牛。", tags: ["絕景"] }, { time: "下午", location: "上色見熊野座神社", desc: "通往異世界的神秘參道。", foodie_tips: "推薦：阿蘇赤牛丼(Akaushi)。", tags: ["秘境"] }] },
    { day: 4, date: "12/01", title: "由布院・別府地獄", stay: "別府溫泉 衫乃井虹館", meals: { b: "飯店內", l: "由布院特色御膳", d: "飯店百匯+暢飲" }, highlights: [{ time: "上午", location: "湯布院", desc: "童話般的溫泉小鎮。", foodie_tips: "贈送：Milch半熟起司蛋糕。推薦：B-Speak生乳捲。", tags: ["甜點"] }, { time: "下午", location: "別府海地獄", desc: "夢幻鈷藍色池水。", foodie_tips: "必吃：地獄蒸布丁、溫泉蛋。", tags: ["溫泉"] }] },
    { day: 5, date: "12/02", title: "動物園・耶馬溪賞楓", stay: "博多TRAD飯店 或同級", meals: { b: "飯店內", l: "北九州鄉土料理", d: "自理" }, highlights: [{ time: "上午", location: "九州自然動物園", desc: "叢林巴士餵食體驗。", foodie_tips: "造型可愛的動物餅乾。", tags: ["親子"] }, { time: "下午", location: "深耶馬溪", desc: "一目八景賞楓勝地。", foodie_tips: "特產：手打蕎麥麵、香菇天婦羅。", tags: ["賞楓"] }] },
    { day: 6, date: "12/03", title: "福岡全日自由行", stay: "博多TRAD飯店 或同級", meals: { b: "飯店內", l: "自理", d: "自理" }, highlights: [{ time: "全日", location: "博多/天神", desc: "自由購物美食日。", foodie_tips: "晚餐推薦：博多牛腸鍋(Motsunabe)、努努雞。", tags: ["自由行"] }] },
    { day: 7, date: "12/04", title: "太宰府・鬼滅聖地", stay: "溫暖的家", meals: { b: "飯店內", l: "自理", d: "機上" }, highlights: [{ time: "上午", location: "太宰府天滿宮", desc: "學問之神。", foodie_tips: "名物：梅枝餅 (かさの家)。", tags: ["古蹟"] }, { time: "下午", location: "寶滿宮竈門神社", desc: "鬼滅聖地與結緣神社。", foodie_tips: "推薦：戀愛結緣布丁。", tags: ["鬼滅"] }] }
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#4A3B32] pb-40">
      {/* 背景 */}
      <div className="fixed inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4c5b0\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* Header */}
      <div className="relative bg-[#B93A32] text-white pt-8 pb-12 px-6 shadow-xl">
        <div className="absolute top-0 right-0 text-[#D96B43] opacity-30 transform translate-x-10 -translate-y-10"><MomijiIcon className="w-64 h-64" /></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center space-x-2 mb-2 border border-white/30 px-3 py-1 rounded-full bg-[#8B2E28]/40 backdrop-blur-sm">
            <span className="text-xs font-medium tracking-widest">緣點旅行社</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-serif">楓賞北九州</h1>
          <div className="flex items-center text-sm opacity-90">
            <Calendar className="w-4 h-4 mr-2" /> 11/28 - 12/04
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">

        {/* 日期選擇 */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 border border-[#E5E0D8]">
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar scroll-smooth">
            {itinerary.map((item, index) => (
              <button key={index} onClick={() => setActiveDay(index)} className={`flex-shrink-0 px-3 py-3 rounded-lg flex flex-col items-center min-w-[70px] transition-all duration-300 border ${activeDay === index ? "bg-[#B93A32] text-white border-[#B93A32] shadow-md" : "bg-white text-[#8C8C8C] border-transparent hover:bg-[#FAF7F2]"}`}>
                <span className="text-[10px] tracking-wider mb-1 opacity-80 uppercase">Day {item.day}</span>
                <span className="text-sm font-bold font-serif">{item.date}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* 當日標題 */}
          <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-[#D96B43]">
            <h2 className="text-xl font-bold text-[#4A3B32] mb-2 font-serif flex items-center">
              <span className="bg-[#B93A32] text-white text-xs px-2 py-1 rounded mr-3 font-sans">DAY {itinerary[activeDay].day}</span>
              {itinerary[activeDay].title}
            </h2>
            <div className="flex items-start text-[#666] text-xs bg-[#FAF7F2] p-2 rounded">
              <Home className="w-3 h-3 mr-2 mt-0.5 text-[#D96B43]" /> {itinerary[activeDay].stay}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded text-center"><Sun className="w-3 h-3 mx-auto mb-1 text-orange-400" />{itinerary[activeDay].meals.b}</div>
              <div className="bg-orange-50 p-2 rounded text-center border border-orange-100"><Utensils className="w-3 h-3 mx-auto mb-1 text-orange-600" />{itinerary[activeDay].meals.l}</div>
              <div className="bg-purple-50 p-2 rounded text-center border border-purple-100"><Moon className="w-3 h-3 mx-auto mb-1 text-purple-600" />{itinerary[activeDay].meals.d}</div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] p-4">
            <div className="flex items-center mb-3">
              <MapPin className="w-4 h-4 mr-2 text-[#D96B43]" />
              <span className="font-bold text-sm">今日行程與美食重點</span>
            </div>
            <div className="space-y-4">
              {itinerary[activeDay].highlights.map((spot, idx) => (
                <div key={idx} className="pl-3 border-l-2 border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-[#4A3B32]">{spot.location}</h3>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{spot.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{spot.desc}</p>
                  <div className="text-xs text-[#975A16] bg-[#FFFBE6] p-2 rounded mt-1">
                    <Leaf className="w-3 h-3 inline mr-1" />{spot.foodie_tips}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 旅途手札 */}
          <div className="bg-white rounded-xl shadow-md border border-[#E5E0D8] p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#8B2E28]"></div>
            <div className="flex items-center mb-4 text-[#8B2E28]">
              <PenTool className="w-4 h-4 mr-2" />
              <span className="font-bold text-sm">旅途手札</span>
            </div>
            <div className="space-y-4">
              {(notes[activeDay] || []).map((note) => (
                <div key={note.id} className="group border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center">
                    <input type="text" value={note.text} onChange={(e) => updateNote(note.id, e.target.value)} placeholder="寫下心情..." className="flex-1 bg-transparent border-none py-1 px-0 text-sm focus:ring-0 placeholder-gray-300" />
                    <div className="flex items-center space-x-1">
                      <label className="cursor-pointer p-1.5 text-gray-400 hover:text-[#D96B43]"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(note.id, e)} /><Camera className="w-4 h-4" /></label>
                      <button onClick={() => deleteNote(note.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {note.image && (
                    <div className="relative inline-block mt-2">
                      <img src={note.image} alt="attachment" className="h-24 w-auto object-cover rounded shadow-sm" />
                      <button onClick={() => removeImage(note.id)} className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow border"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addNote} className="w-full py-2 border border-dashed border-gray-300 text-gray-400 rounded hover:bg-gray-50 text-xs flex items-center justify-center"><Plus className="w-3 h-3 mr-1" />新增記事</button>
            </div>
          </div>

          {/* 消費記帳 */}
          <div className="bg-[#F6F8FA] rounded-xl shadow-md border border-[#D0D7DE] p-5 relative">
            <div className="flex items-center justify-between mb-4 text-[#0969DA]">
              <div className="flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                <span className="font-bold text-sm">今日消費記帳</span>
              </div>
              <div className="text-xs bg-white px-2 py-1 rounded border border-gray-200 shadow-sm text-gray-600 font-mono">
                小計: <span className="text-[#CF222E] font-bold">¥{dailyTotal.jpy.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4 sm:flex-row">
              <input type="text" value={expenseInput.item} onChange={(e) => setExpenseInput({ ...expenseInput, item: e.target.value })} placeholder="品項 (如: 拉麵)" className="w-full sm:flex-[2] text-base border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
              <div className="flex gap-2 w-full sm:flex-[1.5]">
                <input type="number" value={expenseInput.amount} onChange={(e) => setExpenseInput({ ...expenseInput, amount: e.target.value })} placeholder="金額" className="flex-1 text-base border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500" />
                <select value={expenseInput.currency} onChange={(e) => setExpenseInput({ ...expenseInput, currency: e.target.value })} className="text-sm border border-gray-300 rounded px-2 bg-white focus:outline-none min-w-[80px]">
                  <option value="JPY">¥ JPY</option>
                  <option value="TWD">$ TWD</option>
                </select>
                <button onClick={addExpense} className="bg-[#0969DA] text-white px-4 rounded hover:bg-[#0858B6] flex items-center justify-center min-w-[44px]">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {(expenses[activeDay] || []).length > 0 ? (
                (expenses[activeDay] || []).map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 shadow-sm text-sm">
                    <span className="font-medium text-gray-700">{ex.item}</span>
                    <div className="flex items-center">
                      <span className={`font-mono font-bold mr-3 ${ex.currency === 'JPY' ? 'text-gray-800' : 'text-green-600'}`}>
                        {ex.currency === 'JPY' ? '¥' : 'NT$'} {ex.amount.toLocaleString()}
                      </span>
                      <button onClick={() => deleteExpense(ex.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-xs italic">尚未新增消費紀錄</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部總結算 (可縮放式) */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.1)] z-50 border-t border-gray-200 transition-all duration-300 ease-in-out ${isFooterOpen ? 'h-auto' : 'h-12'}`}
      >
        {/* 標題欄 (點擊可展開/收合) */}
        <div
          onClick={() => setIsFooterOpen(!isFooterOpen)}
          className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center text-sm font-bold text-gray-700">
            <Calculator className="w-4 h-4 mr-2 text-[#B93A32]" />
            <span className="mr-2">旅費總結算</span>
            {!isFooterOpen && (
              <span className="text-[#B93A32] font-mono text-sm">
                NT$ {grandTotal().twd.toLocaleString()}
              </span>
            )}
          </div>
          {isFooterOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </div>

        {/* 展開後的詳細內容 */}
        {isFooterOpen && (
          <div className="px-4 pb-6 animate-fade-in">
            {/* 匯率輸入 */}
            <div className="flex items-center justify-end text-xs text-gray-500 mb-2">
              <Coins className="w-3 h-3 mr-1" />
              匯率: 0.
              <input type="number" value={Math.round(exchangeRate * 100)} onChange={(e) => setExchangeRate(e.target.value / 100)} className="w-6 border-b border-gray-300 text-center mx-0.5 focus:outline-none focus:border-[#B93A32]" />
            </div>

            {/* 金額統計卡片 */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="text-center flex-1 border-r border-gray-200">
                <div className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Total JPY</div>
                <div className="text-xl font-bold font-mono text-gray-800">¥ {grandTotal().jpy.toLocaleString()}</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-[10px] text-gray-500 mb-0.5 uppercase tracking-wider">Total TWD</div>
                <div className="text-xl font-bold font-mono text-[#B93A32]">NT$ {grandTotal().twd.toLocaleString()}</div>
              </div>
            </div>

            <div className="text-right mt-2">
              <button onClick={resetAllData} className="text-[10px] text-red-300 hover:text-red-500 underline decoration-dashed p-1">重置所有資料</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryApp;