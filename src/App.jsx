import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Utensils, Calendar, Home, Coffee, Sun, Moon, Leaf, Plus, Trash2, PenTool, Save, RotateCcw, Camera, Image as ImageIcon, X } from 'lucide-react';

const ItineraryApp = () => {
  const [activeDay, setActiveDay] = useState(0);

  // 筆記狀態管理：從 localStorage 讀取
  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem('kyushu_trip_notes_v1');
      return savedNotes ? JSON.parse(savedNotes) : {};
    } catch (error) {
      console.error("無法讀取儲存的筆記", error);
      return {};
    }
  });

  // 當 notes 改變時，自動儲存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kyushu_trip_notes_v1', JSON.stringify(notes));
    } catch (error) {
      console.error("儲存失敗", error);
      // 如果儲存失敗（通常是因為圖片太多導致空間不足），給予提示
      if (error.name === 'QuotaExceededError') {
        alert("儲存空間已滿！建議刪除一些舊圖片以釋放空間。");
      }
    }
  }, [notes]);

  // 圖片壓縮處理函數 (為了節省 localStorage 空間)
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // 限制最大寬度
          const scaleSize = MAX_WIDTH / img.width;

          // 如果圖片比限制小，就不縮放
          const width = scaleSize < 1 ? MAX_WIDTH : img.width;
          const height = scaleSize < 1 ? img.height * scaleSize : img.height;

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // 轉換為壓縮後的 base64 字串 (JPEG 格式, 品質 0.7)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  // 處理圖片上傳
  const handleImageUpload = async (noteId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const resizedImage = await resizeImage(file);
      setNotes(prev => ({
        ...prev,
        [activeDay]: prev[activeDay].map(note =>
          note.id === noteId ? { ...note, image: resizedImage } : note
        )
      }));
    } catch (error) {
      console.error("圖片處理失敗", error);
      alert("圖片處理失敗，請重試");
    }
  };

  // 刪除圖片
  const removeImage = (noteId) => {
    setNotes(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].map(note =>
        note.id === noteId ? { ...note, image: null } : note
      )
    }));
  };

  // 新增記事
  const addNote = () => {
    const newNote = { id: Date.now(), text: '', image: null };
    setNotes(prev => ({
      ...prev,
      [activeDay]: [...(prev[activeDay] || []), newNote]
    }));
  };

  // 更新記事內容
  const updateNote = (id, newText) => {
    setNotes(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].map(note =>
        note.id === id ? { ...note, text: newText } : note
      )
    }));
  };

  // 刪除記事
  const deleteNote = (id) => {
    setNotes(prev => ({
      ...prev,
      [activeDay]: prev[activeDay].filter(note => note.id !== id)
    }));
  };

  // 清除所有資料（重置用）
  const resetAllData = () => {
    if (window.confirm('確定要刪除所有筆記與照片嗎？此動作無法復原。')) {
      setNotes({});
      localStorage.removeItem('kyushu_trip_notes_v1');
    }
  };

  // 楓葉裝飾組件
  const MomijiIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.87,1.5c-0.34,2.14-1.89,4.45-3.09,5.88c-1.46-1.32-3.8-2.61-5.74-2.54c1.17,1.6,2.37,3.67,2.44,5.65 c-1.92-0.66-4.52-0.84-6.32,0.14c1.69,1.15,4.09,1.88,6.04,1.86c-1.5,1.54-3.56,3.65-3.95,5.77c1.47-0.78,3.46-1.12,5.13-0.5 c-0.61,1.82-0.96,4.05-0.18,5.82c0.69-1.63,2.09-3.41,3.49-4.38c0.07,2.23,0.37,4.38,1.35,6.31c0.88-1.94,1.13-4.14,1.18-6.33 c1.45,0.92,2.94,2.71,3.63,4.41c0.64-1.83,0.3-4.08-0.36-5.83c1.64-0.62,3.64-0.3,5.1,0.48c-0.37-2.1-2.42-4.2-3.91-5.75 c1.94,0.01,4.35-0.73,6.04-1.88c-1.8-0.97-4.4-0.8-6.32-0.15c0.09-1.99,1.29-4.06,2.46-5.65c-1.94-0.07-4.28,1.22-5.74,2.54 C17.88,5.92,16.29,3.58,15.93,1.5C15.2,1.96,14.07,1.82,12.87,1.5z" />
    </svg>
  );

  const itinerary = [
    {
      day: 1,
      date: "11/28",
      title: "初抵福岡・夜訪中洲",
      stay: "博多TRAD飯店 或 福岡蒙特瑪娜飯店",
      meals: {
        b: "自理",
        l: "自理",
        d: "機上簡餐"
      },
      highlights: [
        {
          time: "晚間",
          location: "中洲屋台街 (Nakasu Yatai)",
          desc: "福岡最具代表性的夜生活風景。沿著那珂川排列的傳統小吃攤，充滿人情味。",
          foodie_tips: "推薦自費體驗：博多拉麵、明太子玉子燒、炭烤雞肉串(Yakitori)。體驗在地屋台熱鬧氣氛。",
          tags: ["自由探訪", "屋台文化"]
        },
        {
          time: "宵夜",
          location: "一蘭拉麵 (總本店)",
          desc: "一蘭拉麵本社大樓，掛著巨大的燈籠，是拉麵迷的朝聖地。",
          foodie_tips: "美食情報：這裡有限定的「釜醬汁豚骨拉麵」，方形碗盛裝，湯頭更為濃郁。",
          tags: ["必吃名店", "限定版"]
        }
      ]
    },
    {
      day: 2,
      date: "11/29",
      title: "水都柳川・熊本城銀杏",
      stay: "星野集團 OMO5 熊本飯店",
      meals: {
        b: "飯店內享用",
        l: "柳川名物~鰻魚御膳 (¥2500)",
        d: "日本和牛燒肉吃到飽+飲料暢飲 (¥5500)"
      },
      highlights: [
        {
          time: "上午",
          location: "柳川人力遊船",
          desc: "被稱為日本威尼斯的柳川，搭乘小舟欣賞沿岸垂柳與古建築。",
          foodie_tips: "行程特色：行程已包含著名的「鰻魚御膳」。柳川鰻魚飯特色是將醬汁拌入飯中蒸煮，口感軟糯香甜。",
          tags: ["遊船體驗", "鰻魚飯"]
        },
        {
          time: "下午",
          location: "櫻之馬場・城彩苑 & 熊本城",
          desc: "日本三大名城之一，秋季銀杏環繞，美不勝收。登上天守閣俯瞰熊本市。",
          foodie_tips: "在地小吃推薦：1. 芥末蓮藕 (嗆辣酥脆) 2. 即時糰子 (紅豆番薯內餡) 3. 海膽可樂餅。",
          tags: ["銀杏名所", "鄉土料理"]
        },
        {
          time: "晚上",
          location: "熊本下通商店街",
          desc: "自由逛街購物時間。",
          foodie_tips: "自由食推薦：如果您還有胃口，可以試試看熊本名產「生馬肉(Basashi)」，口感鮮嫩無腥味。",
          tags: ["自由購物"]
        }
      ]
    },
    {
      day: 3,
      date: "11/30",
      title: "神話高千穗・阿蘇秘境",
      stay: "阿蘇溫泉 龜之井阿蘇公園度假村",
      meals: {
        b: "飯店內享用",
        l: "高千穗鄉土料理 (¥2500)",
        d: "飯店迎賓自助百匯 + 長腳蟹吃到飽"
      },
      highlights: [
        {
          time: "上午",
          location: "高千穗峽 & 天空小火車",
          desc: "搭乘小火車接受森林洗禮，欣賞壯麗的柱狀節理懸崖與真名井瀑布。",
          foodie_tips: "在地特色：高千穗是「流水麵」發源地。若有機會可自費體驗，或品嚐「高千穗牛」相關小吃。",
          tags: ["絕景", "長腳蟹之夜"]
        },
        {
          time: "下午",
          location: "上色見熊野座神社",
          desc: "通往異世界的入口，參道兩旁近百座佈滿青苔的石燈籠，氣氛神秘。",
          foodie_tips: "周邊情報：阿蘇地區以「赤牛(Akaushi)」聞名，肉質脂肪少、肉味濃郁。",
          tags: ["動漫聖地", "秘境"]
        }
      ]
    },
    {
      day: 4,
      date: "12/01",
      title: "童話由布院・別府海地獄",
      stay: "別府溫泉 衫乃井虹館",
      meals: {
        b: "飯店內享用",
        l: "由布院特色御膳 (¥2500)",
        d: "飯店百匯料理 + 酒精飲料無限暢飲"
      },
      highlights: [
        {
          time: "上午",
          location: "湯布院 (湯之坪街道/金鱗湖)",
          desc: "包含史努比茶屋、吉卜力專門店、魔女琪琪麵包店等。彷彿掉進繪本世界。",
          foodie_tips: "★行程贈送★：Milch半熟起司蛋糕。\n必吃推薦：1. B-Speak 生乳捲 2. 金賞可樂餅 3. 史努比茶屋抹茶點心。",
          tags: ["甜點天堂", "贈送甜點"]
        },
        {
          time: "下午",
          location: "別府海地獄",
          desc: "別府八大地獄之一，夢幻的鈷藍色池水。",
          foodie_tips: "地獄名物：利用溫泉蒸氣製作的「地獄蒸布丁」與「溫泉蛋」，帶有淡淡焦糖與硫磺香氣。",
          tags: ["溫泉", "蒸料理"]
        }
      ]
    },
    {
      day: 5,
      date: "12/02",
      title: "野生動物園・耶馬溪賞楓",
      stay: "博多TRAD飯店 或 福岡蒙特瑪娜飯店",
      meals: {
        b: "飯店內享用",
        l: "北九州鄉土料理 (¥2500)",
        d: "敬請自理 (方便逛街)"
      },
      highlights: [
        {
          time: "上午",
          location: "九州自然動物園",
          desc: "特別安排：搭乘叢林巴士，近距離餵食獅子、大象與黑熊。",
          foodie_tips: "園區點心：造型可愛的動物餅乾與獅子造型咖哩飯。",
          tags: ["叢林巴士", "親子體驗"]
        },
        {
          time: "下午",
          location: "深耶馬溪 (一目八景)",
          desc: "九州著名的賞楓勝地，奇岩怪石與紅葉交織。",
          foodie_tips: "在地特產：深耶馬溪「手打蕎麥麵」與大分縣特產「香菇天婦羅」。",
          tags: ["賞楓名所", "蕎麥麵"]
        }
      ]
    },
    {
      day: 6,
      date: "12/03",
      title: "福岡全日自由行",
      stay: "博多TRAD飯店 或同級",
      meals: {
        b: "飯店內享用",
        l: "敬請自理",
        d: "敬請自理"
      },
      highlights: [
        {
          time: "全日",
          location: "博多/天神/運河城",
          desc: "自由購物與美食探索的一天。",
          foodie_tips: "★晚餐強力推薦★：博多名物「牛腸鍋 (Motsunabe)」。\n推薦名店：大山(Oyama)、前田屋。\n其他推薦：努努雞(冷炸雞)、鐵鍋餃子。",
          tags: ["自由行", "牛腸鍋"]
        }
      ]
    },
    {
      day: 7,
      date: "12/04",
      title: "太宰府祈福・鬼滅聖地",
      stay: "溫暖的家",
      meals: {
        b: "元氣早餐",
        l: "敬請自理",
        d: "機上套餐"
      },
      highlights: [
        {
          time: "上午",
          location: "太宰府天滿宮",
          desc: "祭祀學問之神，參道商店街充滿特色星巴克與各式小店。",
          foodie_tips: "必吃名物：梅枝餅。外皮微焦酥脆，內餡熱騰騰紅豆泥。推薦店家「かさの家」。",
          tags: ["梅枝餅", "星巴克"]
        },
        {
          time: "下午",
          location: "寶滿宮竈門神社",
          desc: "《鬼滅之刃》朝聖地，也是知名的賞楓與結緣神社。",
          foodie_tips: "特色：參拜後可到設計時尚的社務所挑選「結緣御守」，或品嚐周邊的「戀愛結緣布丁」。",
          tags: ["鬼滅之刃", "賞楓"]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#4A3B32] selection:bg-[#B93A32] selection:text-white">
      {/* 紋理背景層 */}
      <div className="fixed inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4c5b0\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>

      {/* Hero Header - 日式賞楓風格 */}
      <div className="relative bg-[#B93A32] text-white pt-10 pb-16 px-6 overflow-hidden shadow-xl">
        {/* 裝飾性楓葉 */}
        <div className="absolute top-0 right-0 text-[#D96B43] opacity-30 transform translate-x-10 -translate-y-10">
          <MomijiIcon className="w-64 h-64" />
        </div>
        <div className="absolute top-20 left-10 text-[#FFD700] opacity-20 transform -rotate-45">
          <MomijiIcon className="w-16 h-16" />
        </div>
        <div className="absolute bottom-5 right-20 text-[#FFD700] opacity-20 transform rotate-12">
          <MomijiIcon className="w-12 h-12" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 mb-4 border border-white/30 px-4 py-1.5 rounded-full bg-[#8B2E28]/40 backdrop-blur-sm">
            <span className="text-sm font-medium tracking-widest">超ㄅㄧㄤ旅行社</span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="text-sm font-medium tracking-widest">好玩的測試</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide font-serif leading-tight">
            楓賞北九州<br />
            <span className="text-2xl md:text-3xl font-light mt-2 block opacity-90">美食・溫泉・秘境七日</span>
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start items-center text-sm space-x-6 opacity-90 font-medium">
            <span className="flex items-center bg-white/10 px-3 py-1 rounded"><Calendar className="w-4 h-4 mr-2" /> 2025/11/28 出發</span>
            <span className="flex items-center bg-white/10 px-3 py-1 rounded"><MapPin className="w-4 h-4 mr-2" /> 桃園 - 福岡</span>
          </div>
        </div>

        {/* 底部波浪裝飾 */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg className="relative block w-full h-[40px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FDFCF8"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20 pb-20">

        {/* 日期選擇器 - 卷軸風格 */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-8 border border-[#E5E0D8]">
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar scroll-smooth">
            {itinerary.map((item, index) => (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`flex-shrink-0 px-3 py-3 rounded-lg flex flex-col items-center min-w-[70px] transition-all duration-300 border ${activeDay === index
                    ? "bg-[#B93A32] text-white border-[#B93A32] shadow-md"
                    : "bg-white text-[#8C8C8C] border-transparent hover:bg-[#FAF7F2]"
                  }`}
              >
                <span className="text-[10px] tracking-wider mb-1 opacity-80 uppercase">Day {item.day}</span>
                <span className="text-sm font-bold font-serif">{item.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 每日詳細行程 */}
        <div className="space-y-6 animate-fade-in-up">
          {/* 標題卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-[#D96B43] relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10 text-[#D96B43]">
              <MomijiIcon className="w-24 h-24" />
            </div>
            <h2 className="text-2xl font-bold text-[#4A3B32] mb-1 font-serif flex items-center">
              <span className="bg-[#B93A32] text-white text-xs px-2 py-1 rounded mr-3 font-sans tracking-widest">DAY {itinerary[activeDay].day}</span>
              {itinerary[activeDay].title}
            </h2>
            <div className="mt-3 flex items-start text-[#666] text-sm bg-[#FAF7F2] p-3 rounded">
              <Home className="w-4 h-4 mr-2 mt-0.5 text-[#D96B43]" />
              <span>{itinerary[activeDay].stay}</span>
            </div>
          </div>

          {/* 餐食計畫區塊 */}
          <div className="bg-[#FAF7F2] rounded-xl p-5 border border-[#EBE5DC] shadow-inner">
            <h3 className="text-[#B93A32] font-bold mb-4 flex items-center font-serif text-lg border-b border-[#D96B43]/20 pb-2">
              <Utensils className="w-5 h-5 mr-2" />
              本日餐食計畫
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3">
                <div className="bg-[#E6F4F1] p-2 rounded-full text-[#2C7A7B]">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">早餐</span>
                  <span className="text-sm font-medium text-gray-800">{itinerary[activeDay].meals.b}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3 border-l-2 border-[#D96B43]">
                <div className="bg-[#FFF5F5] p-2 rounded-full text-[#C53030]">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">午餐</span>
                  <span className="text-sm font-medium text-gray-800">{itinerary[activeDay].meals.l}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm flex items-start space-x-3 border-l-2 border-[#805AD5]">
                <div className="bg-[#F3F0FF] p-2 rounded-full text-[#805AD5]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">晚餐</span>
                  <span className="text-sm font-medium text-gray-800">{itinerary[activeDay].meals.d}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 景點與美食推薦 */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-px bg-[#E5E0D8] flex-1"></div>
              <span className="text-xs text-[#8C8C8C] tracking-widest uppercase">Highlights</span>
              <div className="h-px bg-[#E5E0D8] flex-1"></div>
            </div>

            {itinerary[activeDay].highlights.map((spot, idx) => (
              <div key={idx} className="group relative pl-4 md:pl-0">
                {/* 左側時間軸線 (Desktop) */}
                <div className="hidden md:block absolute left-[-20px] top-6 w-px h-full bg-[#E5E0D8]"></div>
                <div className="hidden md:block absolute left-[-24px] top-6 w-2 h-2 rounded-full bg-[#D96B43]"></div>

                <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-[#4A3B32] font-serif">{spot.location}</h3>
                      <span className="inline-block mt-2 md:mt-0 bg-[#4A3B32] text-[#FDFCF8] text-xs px-3 py-1 rounded-full w-fit">
                        {spot.time}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-5 leading-relaxed text-sm">
                      {spot.desc}
                    </p>

                    {/* 特色美食推薦區塊 */}
                    <div className="relative bg-[#FFFBE6] rounded-lg p-4 border-l-4 border-[#FFD700]">
                      <div className="flex items-center mb-2 text-[#975A16]">
                        <Leaf className="w-4 h-4 mr-2" />
                        <span className="font-bold text-sm">在地美食探訪</span>
                      </div>
                      <p className="text-[#5F370E] text-sm leading-relaxed whitespace-pre-line">
                        {spot.foodie_tips}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {spot.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] tracking-wider text-[#8C8C8C] border border-[#E5E0D8] px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 新增功能：旅途手札 (Persistence Version) */}
          <div className="pt-8 pb-12">
            <div className="bg-white rounded-xl shadow-md border border-[#E5E0D8] p-6 relative">
              {/* 手札裝飾標題 */}
              <div className="absolute -top-4 left-6 bg-[#4A3B32] text-[#FDFCF8] px-4 py-1.5 rounded shadow-sm flex items-center">
                <PenTool className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium tracking-widest">旅途手札・圖文紀錄</span>
              </div>
              <div className="absolute -top-4 right-6 flex items-center space-x-2">
                <span className="flex items-center text-[10px] text-[#2C7A7B] bg-[#E6F4F1] px-2 py-1 rounded-full">
                  <Save className="w-3 h-3 mr-1" /> 自動儲存中
                </span>
                <button onClick={resetAllData} className="flex items-center text-[10px] text-[#C53030] bg-[#FFF5F5] px-2 py-1 rounded-full hover:bg-red-100 transition-colors" title="刪除所有筆記">
                  <RotateCcw className="w-3 h-3 mr-1" /> 重置
                </button>
              </div>

              <div className="mt-4 space-y-6">
                {/* 顯示當天的記事列表 */}
                {(notes[activeDay] || []).length > 0 ? (
                  (notes[activeDay] || []).map((note) => (
                    <div key={note.id} className="group border-b border-[#E5E0D8] pb-4 last:border-0 animate-fade-in">
                      {/* 文字輸入區塊 */}
                      <div className="flex items-center mb-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={note.text}
                            onChange={(e) => updateNote(note.id, e.target.value)}
                            placeholder="請輸入記事..."
                            className="w-full bg-transparent border-none py-2 px-1 text-[#4A3B32] placeholder-gray-300 focus:outline-none focus:ring-0 text-base"
                          />
                        </div>

                        {/* 操作按鈕群 */}
                        <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* 圖片上傳按鈕 */}
                          <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full text-gray-500 hover:text-[#D96B43] transition-colors relative">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageUpload(note.id, e)}
                            />
                            <Camera className="w-4 h-4" />
                          </label>

                          {/* 刪除記事按鈕 */}
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                            title="刪除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 圖片顯示區塊 */}
                      {note.image && (
                        <div className="relative inline-block mt-2 ml-1">
                          <img
                            src={note.image}
                            alt="Note attachment"
                            className="h-32 w-auto object-cover rounded-lg shadow-sm border border-[#E5E0D8]"
                          />
                          <button
                            onClick={() => removeImage(note.id)}
                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border border-gray-200 text-gray-500 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-300 text-sm italic border-2 border-dashed border-[#F0EBE5] rounded-lg">
                    點擊下方按鈕，開始記錄這一天的心情、花費或照片...
                  </div>
                )}

                {/* 新增按鈕 */}
                <button
                  onClick={addNote}
                  className="w-full mt-2 py-3 border-2 border-dashed border-[#D96B43]/30 text-[#D96B43] rounded-lg hover:bg-[#FFF5F5] hover:border-[#D96B43] transition-all flex items-center justify-center font-medium text-sm group"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  新增一條記事
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItineraryApp;