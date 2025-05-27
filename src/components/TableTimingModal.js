import React, { useState, useEffect } from 'react';
import './TableTimingModal.css';
import { v4 as uuidv4 } from 'uuid';

const TableTimingModal = ({ isOpen, onClose, selectedTable, store, tableItem, onTableStart, onTableEnd, forceStartMode = false }) => {
  const [basePrice, setBasePrice] = useState('0.00'); // 基础价格（不可修改）
  const [calculatedFee, setCalculatedFee] = useState('0.00'); // 计算出的台费（有颜色显示）
  const [finalFee, setFinalFee] = useState(''); // 最终台费（用户可输入，空则用计算的）
  const [currentStatus, setCurrentStatus] = useState('Not Started');
  const [startTime, setStartTime] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [usedDuration, setUsedDuration] = useState(''); // 已用时长
  const [customDuration, setCustomDuration] = useState(''); // 自定义时长
  const [timerDuration, setTimerDuration] = useState('');
  const [timerAction, setTimerAction] = useState('No Action');
  const [remarks, setRemarks] = useState('');
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  
  // 定时器信息状态
  const [currentTimerInfo, setCurrentTimerInfo] = useState(null);

  // 翻译功能
  const translations = [
    { input: "Table Timing", output: "开台计时" },
    { input: "Base Price", output: "基础价格" },
    { input: "Calculated Fee", output: "计算台费" },
    { input: "Final Fee", output: "最终台费" },
    { input: "Current Status", output: "当前状态" },
    { input: "Start Time", output: "开台时间" },
    { input: "Current Time", output: "当前时间" },
    { input: "Used Duration", output: "已用时长" },
    { input: "Custom Duration", output: "自定义时长" },
    { input: "Timer Settings", output: "定时操作设置" },
    { input: "Timer Duration", output: "定时时长" },
    { input: "Timer Action", output: "到时执行" },
    { input: "Remarks", output: "备注" },
    { input: "No remarks", output: "无备注" },
    { input: "Not Started", output: "未开台" },
    { input: "In Service", output: "正在用餐" },
    { input: "No Action", output: "无操作" },
    { input: "Auto Checkout", output: "自动结账" },
    { input: "Continue Billing", output: "到时继续计费" },
    { input: "Start Table", output: "开台" },
    { input: "End Table", output: "结台" },
    { input: "Cancel", output: "取消" },
    { input: "Confirm", output: "确认" },
    { input: "minutes", output: "分钟" },
    { input: "hours", output: "小时" },
    { input: "Table", output: "桌台" },
    { input: "Enter remarks here...", output: "在此输入备注..." },
    { input: "Start table successful!", output: "开台成功！" },
    { input: "End table successful!", output: "结台成功！" },
    { input: "Dining time has reached", output: "用餐时间已到达" },
    { input: "Total used time", output: "总用时" },
    { input: "Leave empty to use calculated fee", output: "留空则使用计算台费" },
    { input: "Timer checkout executed", output: "定时结账已执行" },
    { input: "Active Timer", output: "当前定时器" },
    { input: "Remaining time", output: "剩余时间" },
  ];

  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : input;
  }

  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input;
  }

  // 计算时长（分钟）
  const calculateDuration = (startTimeMs) => {
    const now = Date.now();
    const durationMs = now - startTimeMs;
    return Math.floor(durationMs / (1000 * 60)); // 转换为分钟
  };

  // 格式化时长显示
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}${fanyi("hours")}${mins}${fanyi("minutes")}`;
    }
    return `${mins}${fanyi("minutes")}`;
  };

  // 按分钟计算费用
  const calculateFeeByMinutes = (durationMinutes) => {
    const basePriceValue = Math.max(parseFloat(basePrice), 1.00); // 确保基础价格至少为1
    const basePricePerMinute = basePriceValue / 60; // 每分钟价格
    const fee = durationMinutes * basePricePerMinute;
    // 删除最低0.01的限制，让真实计算结果显示
    return Math.max(fee, 0.001); // 最低0.1分
  };

  // 更新当前时间和已用时长
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      // 如果正在用餐，更新已用时长和计算费用
      if (currentStatus === 'In Service' && startTime) {
        const tableKey = tableItem && tableItem.id ? 
          (tableItem.count ? `${tableItem.id}-${tableItem.count}` : `${tableItem.id}`) : 
          selectedTable;
        const startTimeKey = `${store}-${tableKey}-isSent_startTime`;
        const storedStartTime = localStorage.getItem(startTimeKey);
        
        if (storedStartTime && !isNaN(parseInt(storedStartTime))) {
          const durationMinutes = calculateDuration(parseInt(storedStartTime));
          setUsedDuration(formatDuration(durationMinutes));
          
          // 自动计算费用
          const finalDuration = customDuration ? parseInt(customDuration) : durationMinutes;
          const autoFee = calculateFeeByMinutes(finalDuration);
          setCalculatedFee(autoFee.toFixed(2));
        }
      }
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, [currentStatus, startTime, basePrice, customDuration]);

  // 检查是否已经开台
  useEffect(() => {
    if (tableItem) {
      // 如果有商品信息，使用商品价格作为基础价格，但确保至少为1
      const itemPrice = tableItem.subtotal || 0;
      const minimumPrice = Math.max(itemPrice, 1.00);
      setBasePrice(minimumPrice.toFixed(2));
    } else {
      // 如果没有商品信息，设置默认最低价格
      setBasePrice("1.00");
    }

    const tableKey = tableItem && tableItem.id ? 
      (tableItem.count ? `${tableItem.id}-${tableItem.count}` : `${tableItem.id}`) : 
      selectedTable;
    const startTimeKey = `${store}-${tableKey}-isSent_startTime`;
    const storedStartTime = localStorage.getItem(startTimeKey);

    // 读取定时器信息
    const timerInfoKey = `${store}-${tableKey}-timerInfo`;
    const storedTimerInfo = localStorage.getItem(timerInfoKey);
    if (storedTimerInfo) {
      try {
        const timerInfo = JSON.parse(storedTimerInfo);
        setCurrentTimerInfo(timerInfo);
      } catch (error) {
        console.error('解析定时器信息失败:', error);
        setCurrentTimerInfo(null);
      }
    } else {
      setCurrentTimerInfo(null);
    }
    
    if (forceStartMode) {
      // 强制开台模式：始终显示未开台状态，清空备注
      setCurrentStatus('Not Started');
      setStartTime('');
      setUsedDuration('');
      setCalculatedFee('0.00');
      setRemarks(''); // 开台模式清空备注
    } else if (storedStartTime && !isNaN(parseInt(storedStartTime))) {
      const startDate = new Date(parseInt(storedStartTime));
      setStartTime(startDate.toLocaleString('zh-CN'));
      setCurrentStatus('In Service');
      
      // 计算已用时长
      const durationMinutes = calculateDuration(parseInt(storedStartTime));
      setUsedDuration(formatDuration(durationMinutes));
      
      // 结台模式：直接从tableItem中读取备注
      if (tableItem) {
        let savedRemarks = '';
        if (tableItem.tableRemarks) {
          savedRemarks = tableItem.tableRemarks;
        }
        setRemarks(savedRemarks);
      } else {
        setRemarks('');
      }
    } else {
      setCurrentStatus('Not Started');
      setStartTime('');
      setUsedDuration('');
      setCalculatedFee('0.00');
      setRemarks(''); // 未开台时清空备注
    }

    // 读取基础价格
    const basePriceKey = `${store}-${tableKey}-basePrice`;
    const storedBasePrice = localStorage.getItem(basePriceKey);
    if (storedBasePrice) {
      // 确保存储的基础价格也不为0
      const storedPrice = Math.max(parseFloat(storedBasePrice), 1.00);
      setBasePrice(storedPrice.toFixed(2));
    }

    // 读取最终费用
    const finalFeeKey = `${store}-${tableKey}-finalFee`;
    const storedFinalFee = localStorage.getItem(finalFeeKey);
    if (storedFinalFee) {
      setFinalFee(storedFinalFee);
    }
  }, [store, selectedTable, tableItem, isOpen, forceStartMode]);

  // 自动结账处理函数（独立于手动结账）
  const handleAutoCheckout = (tableItemForTimer) => {
    const tableKey = `${tableItemForTimer.id}-${tableItemForTimer.count}`; // 使用传入的 count
    const startTimeKey = `${store}-${tableKey}-isSent_startTime`;
    const basePriceKey = `${store}-${tableKey}-basePrice`;
    const finalFeeKey = `${store}-${tableKey}-finalFee`; // 自动结账时可能需要读取，但不在此处设置
    const timerInfoKey = `${store}-${tableKey}-timerInfo`; // 清理定时器信息时使用

    // 从购物车中找到对应的商品信息，使用传入的 id 和 count
    let products = JSON.parse(localStorage.getItem(store + "-" + selectedTable)) || [];
    const targetProduct = products.find(product => 
      product.id === tableItemForTimer.id && 
      product.count === tableItemForTimer.count && // 现在 tableItemForTimer.count 应该是有效的
      product.isTableItem
    );

    if (!targetProduct) {
      console.error('自动结账时找不到目标商品 (使用模态框生成的count后):', tableItemForTimer.id, tableItemForTimer.count, tableItemForTimer);
      console.log('购物车商品:', products.map(p => ({id: p.id, count: p.count, name: p.name, isTableItem: p.isTableItem, attr: p.attributeSelected})));
      // 可以考虑如果找不到，是否弹窗提示用户或者采取其他恢复措施
      alert('自动结账失败：找不到对应的开台商品。请检查购物车。 Anomalous situation, please contact support.');
      return;
    }

    // 计算最终价格
    const storedStartTime = localStorage.getItem(startTimeKey);
    let finalPrice = 0;
    let finalDuration = 0;
    
    if (storedStartTime && !isNaN(parseInt(storedStartTime))) {
      const durationMinutes = calculateDuration(parseInt(storedStartTime));
      finalDuration = durationMinutes;
      
      const storedBasePrice = localStorage.getItem(basePriceKey);
      // 使用 targetProduct 的 basePrice 或 localStorage 的 basePrice
      const currentBasePrice = storedBasePrice ? parseFloat(storedBasePrice) : (targetProduct.subtotal / (targetProduct.quantity || 1)); // 假设subtotal是单价
      
      const basePricePerMinute = Math.max(parseFloat(currentBasePrice), 1.00) / 60;
      finalPrice = Math.max(durationMinutes * basePricePerMinute, 0.001);
    }

    let displayRemarks = '';
    if (targetProduct && targetProduct.tableRemarks) {
      displayRemarks = `\n${fanyi("Remarks")}: ${targetProduct.tableRemarks}`;
    }

    localStorage.removeItem(startTimeKey);
    localStorage.removeItem(basePriceKey);
    localStorage.removeItem(finalFeeKey); // 清理可能存在的旧最终费用记录
    localStorage.removeItem(timerInfoKey); // 清理定时器信息

    alert(`${selectedTable} ${fanyi("Timer checkout executed")}\n${fanyi("Total used time")}: ${formatDuration(finalDuration)}\n${fanyi("Final Fee")}: $${finalPrice.toFixed(2)}${displayRemarks}`);

    if (onTableEnd && targetProduct) {
      console.log('自动结账更新商品:', targetProduct.id, targetProduct.count, finalPrice);
      onTableEnd(targetProduct, finalPrice);
    }

    if (isOpen) {
      setStartTime('');
      setCurrentStatus('Not Started');
      setUsedDuration('');
      setCustomDuration('');
      setCalculatedFee('0.00');
      setFinalFee('');
      setRemarks('');
      setCurrentTimerInfo(null);
      onClose();
    }
  };

  const handleStartTable = () => {
    const now = Date.now();
    const newCount = uuidv4(); // 在 TableTimingModal 内部生成 count

    // 准备传递给 onTableStart 的对象，包含新生成的 count 和备注
    const tableItemForCallback = {
      ...tableItem, // 原始商品信息
      count: newCount, // 新生成的 count
      tableRemarks: remarks, // 当前模态框中的备注
      attributeSelected: {
        ...(tableItem ? tableItem.attributeSelected : {}),
        // '开台商品' 标记通常在父组件添加，确保与购物车逻辑一致
        // 如果父组件期望这里也添加，可以取消注释下面这行，但通常这个唯一时间戳key由父组件生成
        // '开台商品': [`开台时间-${now}`],
        '备注': remarks ? [remarks] : [] 
      }
    };

    // 调用 onTableStart (父组件的 handleTableStart)，传递带有 newCount 的商品信息
    // 父组件的 handleTableStart 需要能接收并使用这个 count
    onTableStart(tableItemForCallback);

    // ----- TableTimingModal 内部逻辑，全部使用 newCount -----
    const tableKey = `${tableItem.id}-${newCount}`; // 使用 newCount 构建 key
    const startTimeKey = `${store}-${tableKey}-isSent_startTime`;
    const basePriceKey = `${store}-${tableKey}-basePrice`;
    // const finalFeeKey = `${store}-${tableKey}-finalFee`; // 开台时不设置最终费用
    const timerInfoKey = `${store}-${tableKey}-timerInfo`;

    // startTime 的记录应由父组件的 onTableStart 结合其购物车逻辑来完成。
    // TableTimingModal 主要负责UI和触发开台动作。
    // 如果父组件没有记录startTime，可以在这里记录，但要确保key的一致性。
    // localStorage.setItem(startTimeKey, now.toString()); // 假设父组件会处理或已处理

    localStorage.setItem(basePriceKey, basePrice);

    const startDate = new Date(now);
    setStartTime(startDate.toLocaleString('zh-CN'));
    setCurrentStatus('In Service');

    // 如果设置了定时器
    if (isTimerEnabled && timerDuration && timerAction !== 'No Action') {
      const timerMs = parseInt(timerDuration) * 60 * 1000;
      
      // 传递给自动结账函数的对象也应包含 newCount
      const currentTableItemForTimer = { 
        ...tableItem, // 原始商品ID、名称等
        count: newCount, // 关键的 count
        tableRemarks: remarks, // 当时的备注
        // attributeSelected 如果自动结账需要，也应从 tableItemForCallback 获取或重新构建
        attributeSelected: tableItemForCallback.attributeSelected 
      }; 
      console.log(`设置定时器: ${timerDuration}分钟, 动作: ${timerAction}, tableItem (with newCount):`, currentTableItemForTimer);
      
      const timerInfo = {
        duration: timerDuration,
        action: timerAction,
        startTime: now // 定时器本身的启动时间
      };
      localStorage.setItem(timerInfoKey, JSON.stringify(timerInfo));

      setTimeout(() => {
        if (timerAction === 'Auto Checkout') {
          handleAutoCheckout(currentTableItemForTimer); 
        } else if (timerAction === 'Continue Billing') {
          console.log('到时继续计费');
        }
      }, timerMs);
    }

    alert(`${selectedTable} ${fanyi("Start table successful!")}`);
    
    setRemarks('');
    setTimerDuration('');
    setIsTimerEnabled(false);
    setTimerAction('No Action');
    
    onClose();
  };

  const handleEndTable = () => {
    const tableKey = tableItem && tableItem.id ? 
      (tableItem.count ? `${tableItem.id}-${tableItem.count}` : `${tableItem.id}`) : 
      selectedTable;
    const startTimeKey = `${store}-${tableKey}-isSent_startTime`;
    const basePriceKey = `${store}-${tableKey}-basePrice`;
    const finalFeeKey = `${store}-${tableKey}-finalFee`;
    const timerInfoKey = `${store}-${tableKey}-timerInfo`;

    // 使用最终费用或计算费用
    const finalPrice = finalFee && finalFee.trim() !== '' ? parseFloat(finalFee) : parseFloat(calculatedFee);

    // 计算实际用时
    const storedStartTime = localStorage.getItem(startTimeKey);
    let finalDuration = 0;
    if (storedStartTime && !isNaN(parseInt(storedStartTime))) {
      const durationMinutes = calculateDuration(parseInt(storedStartTime));
      finalDuration = customDuration ? parseInt(customDuration) : durationMinutes;
    }

    // 获取备注内容用于显示
    let displayRemarks = '';
    if (tableItem && tableItem.attributeSelected && tableItem.attributeSelected['备注'] && tableItem.attributeSelected['备注'][0]) {
      displayRemarks = `\n${fanyi("Remarks")}: ${tableItem.attributeSelected['备注'][0]}`;
    } else if (tableItem && tableItem.tableRemarks) {
      displayRemarks = `\n${fanyi("Remarks")}: ${tableItem.tableRemarks}`;
    } else if (remarks) {
      displayRemarks = `\n${fanyi("Remarks")}: ${remarks}`;
    }

    // 清除存储的数据（包括定时器信息）
    localStorage.removeItem(startTimeKey);
    localStorage.removeItem(basePriceKey);
    localStorage.removeItem(finalFeeKey);
    localStorage.removeItem(timerInfoKey);

    // 显示结台信息（包含备注）
    alert(`${selectedTable} ${fanyi("End table successful!")}\n${fanyi("Total used time")}: ${formatDuration(finalDuration)}\n${fanyi("Final Fee")}: $${finalPrice.toFixed(3)}${displayRemarks}`);

    // 重置状态
    setStartTime('');
    setCurrentStatus('Not Started');
    setUsedDuration('');
    setCustomDuration('');
    setCalculatedFee('0.00');
    setFinalFee('');
    setRemarks('');
    setCurrentTimerInfo(null);

    onClose();

    // 通知父组件更新购物车价格（确保自动结账和手动结账都调用）
    if (onTableEnd && tableItem) {
      console.log('手动结账更新商品:', tableItem.id, tableItem.count, finalPrice);
      onTableEnd(tableItem, finalPrice);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="table-timing-modal-overlay">
      <div className="table-timing-modal">
        <div className="table-timing-modal-header">
          <h3>{fanyi("Table Timing")} - {fanyi("Table")} {selectedTable}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="table-timing-modal-body">
          {/* 基础价格（只读显示） */}
          <div className="form-group">
            <label>{fanyi("Base Price")}:</label>
            <div className="status-display inactive notranslate">
              ${(Math.round(parseFloat(basePrice) * 100) / 100).toFixed(2)}
            </div>
          </div>

          {/* 当前状态 */}
          <div className="form-group">
            <label>{fanyi("Current Status")}:</label>
            <div className={`status-display ${currentStatus === 'In Service' ? 'active' : 'inactive'}`}>
              {fanyi(currentStatus)}
            </div>
          </div>

          {/* 时间显示区域 */}
          <div className="form-row">
            <div className="form-group half">
              <label>{fanyi("Start Time")}:</label>
              <div className="time-display">
                {startTime || '--:--:--'}
              </div>
            </div>
            <div className="form-group half">
              <label>{fanyi("Current Time")}:</label>
              <div className="time-display">{currentTime}</div>
            </div>
          </div>

          {/* 已用时长 */}
          <div className="form-group">
            <label>{fanyi("Used Duration")}:</label>
            <div className="time-display">
              {usedDuration || '--:--:--'}
            </div>
          </div>

          {/* 开台弹窗内容 */}
          {(forceStartMode || currentStatus === 'Not Started') && (
            <>
              {/* 定时操作设置 */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isTimerEnabled}
                    onChange={(e) => setIsTimerEnabled(e.target.checked)}
                  />
                  {fanyi("Timer Settings")}
                </label>
              </div>

              {isTimerEnabled && (
                <div className="timer-settings">
                  <div className="form-row">
                    <div className="form-group half">
                      <label>{fanyi("Timer Duration")}:</label>
                      <div className="input-group">
                        <input
                          type="number"
                          value={timerDuration}
                          onChange={(e) => setTimerDuration(e.target.value)}
                          className="form-control notranslate"
                          placeholder="30"
                        />
                        <span className="input-suffix">{fanyi("minutes")}</span>
                      </div>
                    </div>
                    <div className="form-group half">
                      <label>{fanyi("Timer Action")}:</label>
                      <select
                        value={timerAction}
                        onChange={(e) => setTimerAction(e.target.value)}
                        className="form-control"
                      >
                        <option value="No Action">{fanyi("No Action")}</option>
                        <option value="Auto Checkout">{fanyi("Auto Checkout")}</option>
                        <option value="Continue Billing">{fanyi("Continue Billing")}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 备注（开台时可编辑） */}
              <div className="form-group">
                <label>{fanyi("Remarks")}:</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="form-control"
                  rows="3"
                  placeholder={fanyi("Enter remarks here...")}
                />
              </div>
            </>
          )}

          {/* 结台弹窗内容 */}
          {!forceStartMode && currentStatus === 'In Service' && (
            <>
              {/* 显示当前定时器信息（如果有） */}
              {currentTimerInfo && (
                <div className="form-group">
                  <label>{fanyi("Active Timer")}:</label>
                  <div className="status-display active notranslate" style={{backgroundColor: '#e8f5ff', color: '#2d2d5a', border: '2px solid #5050ff'}}>
                    {fanyi("Timer Duration")}: {currentTimerInfo.duration}{fanyi("minutes")} | {fanyi("Timer Action")}: {fanyi(currentTimerInfo.action)}
                  </div>
                </div>
              )}

              {/* 自定义时长 */}
              <div className="form-group">
                <label>{fanyi("Custom Duration")}:</label>
                <div className="input-group">
                  <input
                    type="number"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="form-control notranslate"
                    placeholder="30"
                  />
                  <span className="input-suffix">{fanyi("minutes")}</span>
                </div>
              </div>

              {/* 计算台费（有颜色显示） */}
              <div className="form-group">
                <label>{fanyi("Calculated Fee")}:</label>
                <div className="status-display active notranslate" style={{backgroundColor: '#e8f5e8', color: '#2d5a2d', border: '2px solid #4caf50'}}>
                  ${(Math.round(parseFloat(calculatedFee) * 100) / 100).toFixed(2)}
                </div>
              </div>

              {/* 最终台费（用户可输入） */}
              <div className="form-group">
                <label>{fanyi("Final Fee")} ({fanyi("Leave empty to use calculated fee")}):</label>
                <div className="input-group">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={finalFee}
                    onChange={(e) => setFinalFee(e.target.value)}
                    className="form-control notranslate"
                    placeholder={calculatedFee}
                  />
                </div>
              </div>

              {/* 结台时显示备注内容（只读） */}
              <div className="form-group">
                <label>{fanyi("Remarks")}:</label>
                <div className="status-display inactive notranslate" style={{whiteSpace: 'pre-wrap', textAlign: 'left', minHeight: '40px', padding: '8px'}}>
                  {remarks || fanyi("No remarks")}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="table-timing-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            {fanyi("Cancel")}
          </button>
          {(forceStartMode || currentStatus === 'Not Started') ? (
            <button className="btn btn-primary" onClick={handleStartTable}>
              {fanyi("Start Table")}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleEndTable}>
              {fanyi("End Table")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableTimingModal; 