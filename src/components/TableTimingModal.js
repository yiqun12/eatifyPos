import React, { useState, useEffect } from 'react';
import './TableTimingModal.css';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-modal';
import NumberPad from './NumberPad';

// Define and Export billing rules
export const BILLING_RULES = {
  RULE_1: 'first_hour_block_then_15min',      // 首小时(不足按1小时), 后续15分钟计费
  RULE_2: 'first_half_hour_block_then_15min', // 首半小时(不足按半小时), 半到1小时(按1小时), 后续15分钟计费
  RULE_3: 'first_hour_block_then_30min',      // 首小时(不足按1小时), 后续30分钟计费
  RULE_4: 'first_hour_block_then_minute',     // 首小时(不足按1小时), 后续分钟计费
  RULE_5: 'exact_minute',                     // 按分钟计费
  CUSTOM_RULE: 'custom_rule',                 // 新增自定义规则
};

// Exportable utility function for price calculation
export const calculatePriceForBillingRule = (totalMinutes, hourlyRate, ruleId, customRuleConfig) => {
    let price = 0;
    const minsElapsed = Math.max(0, totalMinutes); // Ensure minutes are not negative
    const rate = Math.max(0, hourlyRate); // Ensure rate is not negative

    if (rate === 0) return 0.00; // No charge if rate is zero

    switch (ruleId) {
        case BILLING_RULES.RULE_1:
            if (minsElapsed <= 60) price = rate;
            else price = rate + Math.ceil((minsElapsed - 60) / 15) * (rate / 4);
            break;
        case BILLING_RULES.RULE_2:
            if (minsElapsed <= 30) price = rate / 2;
            else if (minsElapsed <= 60) price = rate;
            else price = rate + Math.ceil((minsElapsed - 60) / 15) * (rate / 4);
            break;
        case BILLING_RULES.RULE_3:
            if (minsElapsed <= 60) price = rate;
            else price = rate + Math.ceil((minsElapsed - 60) / 30) * (rate / 2);
            break;
        case BILLING_RULES.RULE_4:
            if (minsElapsed <= 60) price = rate;
            else price = rate + (minsElapsed - 60) * (rate / 60);
            break;
        case BILLING_RULES.RULE_5:
            price = minsElapsed * (rate / 60);
            break;
        case BILLING_RULES.CUSTOM_RULE:
            if (!customRuleConfig) {
                console.error("[calculatePriceForBillingRule] Custom rule selected but no config provided.");
                return 0.00; // Or handle error appropriately, returning 0 for safety
            }
            const firstBlock = parseInt(customRuleConfig.firstBlockDuration);
            const initialSegment = parseInt(customRuleConfig.initialSegmentMinutes);
            const subsequentSegment = parseInt(customRuleConfig.subsequentSegmentMinutes);

            if (isNaN(firstBlock) || !(firstBlock === 30 || firstBlock === 60) ||
                isNaN(initialSegment) || initialSegment <= 0 ||
                isNaN(subsequentSegment) || subsequentSegment <= 0) {
              console.error("[calculatePriceForBillingRule] Invalid custom rule parameters:", customRuleConfig);
              return 0.00; // Return 0 if params are invalid
            }

            const priceForFirstBlock = (firstBlock / 60) * rate;

            if (minsElapsed <= 0) {
              price = 0;
            } else if (minsElapsed <= firstBlock) {
              const billedUnitsInFirst = Math.ceil(minsElapsed / initialSegment);
              let billedMinutesForPrice = billedUnitsInFirst * initialSegment;
              if (billedMinutesForPrice >= firstBlock) {
                  price = priceForFirstBlock;
              } else {
                  price = (billedMinutesForPrice / 60) * rate;
              }
            } else { // minsElapsed > firstBlock
              price = priceForFirstBlock;
              const remainingMinutes = minsElapsed - firstBlock;
              const additionalUnits = Math.ceil(remainingMinutes / subsequentSegment);
              price += additionalUnits * (subsequentSegment / 60) * rate;
            }
            break;
        default:
            console.warn(`[calculatePriceForBillingRule] Unknown billing rule ID: ${ruleId}. Defaulting to exact minute calculation.`);
            price = minsElapsed * (rate / 60); // Fallback to exact minute for unknown rules
    }
    return Math.max(price, 0.00); // Ensure price is not negative, can be 0 if duration is 0
};

const TableTimingModal = ({ isOpen, onClose, selectedTable, store, tableItem, onTableStart, onTableEnd, onRemarksUpdate, forceStartMode = false }) => {
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

  // State for selected billing rule
  const [selectedBillingRule, setSelectedBillingRule] = useState(BILLING_RULES.RULE_2);

  // 新增: 自定义计费规则参数的状态
  const [customFirstBlockDuration, setCustomFirstBlockDuration] = useState(60); // 默认60分钟
  const [customInitialSegmentMinutes, setCustomInitialSegmentMinutes] = useState(15); // 默认15分钟
  const [customSubsequentSegmentMinutes, setCustomSubsequentSegmentMinutes] = useState(15); // 默认15分钟
  const [customRuleError, setCustomRuleError] = useState('');

  // 定时器信息状态
  const [currentTimerInfo, setCurrentTimerInfo] = useState(null);

  // 数字键盘相关状态
  const [activeInputField, setActiveInputField] = useState('timerDuration'); // 默认激活定时时长
  const [keypadValue, setKeypadValue] = useState('');
  const [isPC, setIsPC] = useState(window.innerWidth >= 1024);

  // 备注编辑状态
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);

  // 计费规则编辑状态
  const [isEditingBillingRule, setIsEditingBillingRule] = useState(false);

  // 确认结台弹窗状态
  const [showEndTableConfirm, setShowEndTableConfirm] = useState(false);

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
    // New translations for billing rules
    { input: "Billing Rule", output: "计费规则" },
    { input: "Rule: Hour Block / 15-min", output: "规则: 首小时不足按1小时 / 后续15分钟" },
    { input: "Rule: 30-min Block, then Hour Block / 15-min", output: "规则: 首30分钟按半小时,不足1小时按1小时 / 后续15分钟" },
    { input: "Rule: Hour Block / 30-min", output: "规则: 首小时不足按1小时 / 后续30分钟" },
    { input: "Rule: Hour Block / Minute", output: "规则: 首小时不足按1小时 / 后续分钟" },
    { input: "Rule: Exact Minute", output: "规则: 按分钟" },
    // 新增自定义规则相关的翻译 (英文优先)
    { input: "Custom Rule", output: "自定义规则" },
    { input: "Configure Custom Rule", output: "配置自定义规则" },
    { input: "First Block (30/60 min)", output: "首个固定时段 (30/60 分钟)" },
    { input: "30 minutes", output: "30分钟" },
    { input: "1 hour", output: "1小时" },
    { input: "Initial Segment (min, round up)", output: "首时段计费单位 (分钟, 向上取整)" },
    { input: "Subsequent Segment (min)", output: "后续计费单位 (分钟)" },
    { input: "Invalid custom rule parameters. Please check inputs.", output: "自定义规则参数无效，请检查输入。" },
    // 数字键盘相关翻译
    { input: "Number Pad", output: "数字键盘" },
    { input: "Click input field to activate keypad", output: "点击输入框激活键盘" },
    { input: "No input fields available for keypad", output: "暂无可用的输入字段" },
    { input: "First Block Billing Unit", output: "首时段计费单位" },
    { input: "Subsequent Billing Unit", output: "后续计费单位" },
    { input: "Update Settings", output: "更新设置" },
    { input: "Settings updated successfully", output: "设置更新成功" },
    { input: "Edit", output: "编辑" },
    { input: "Save", output: "保存" },
    { input: "Edit Rule", output: "编辑规则" },
    { input: "Current Rule", output: "当前规则" },
    { input: "Confirm End Table", output: "确认结台" },
    { input: "Are you sure you want to end this table?", output: "确定要结台吗？" },
    { input: "This action cannot be undone.", output: "此操作无法撤销。" },
    { input: "Yes, End Table", output: "确认结台" },
  ];

  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : input;
  }

  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input;
  }

  // 数字键盘相关函数  
  const getAvailableInputFields = () => {
    const fields = [];
    
    // 定时器字段（只有启用时才可用）
    if (isTimerEnabled) {
      fields.push('timerDuration');
    }
    
    // 自定义规则字段（只有选择自定义规则时才可用）
    if (selectedBillingRule === BILLING_RULES.CUSTOM_RULE) {
      fields.push('customInitialSegment', 'customSubsequentSegment');
    }
    
    // 结台模式的字段
    if (!forceStartMode && currentStatus === 'In Service') {
      fields.push('customDuration', 'finalFee');
    }
    
    return fields;
  };

  const activateInputField = (fieldName, currentValue = '') => {
    const availableFields = getAvailableInputFields();
    
    // 如果尝试激活的字段不可用，切换到第一个可用字段
    if (!availableFields.includes(fieldName)) {
      if (availableFields.length === 0) {
        // 没有可用字段，设置为空状态
        setActiveInputField('none');
        setKeypadValue('');
        return;
      }
      
      // 切换到第一个可用字段
      fieldName = availableFields[0];
      switch (fieldName) {
        case 'timerDuration':
          currentValue = timerDuration;
          break;
        case 'customInitialSegment':
          currentValue = customInitialSegmentMinutes.toString();
          break;
        case 'customSubsequentSegment':
          currentValue = customSubsequentSegmentMinutes.toString();
          break;
        case 'customDuration':
          currentValue = customDuration;
          break;
        case 'finalFee':
          currentValue = finalFee;
          break;
        default:
          currentValue = '';
      }
    }
    
    setActiveInputField(fieldName);
    setKeypadValue(currentValue);
  };

  const handleKeypadChange = (newValue) => {
    setKeypadValue(newValue);
    
    // 实时更新对应的输入框
    switch (activeInputField) {
      case 'timerDuration':
        // 只有定时器启用时才允许修改
        if (isTimerEnabled) {
          setTimerDuration(newValue);
        }
        break;
      case 'customInitialSegment':
        // 对于整数字段，只有当输入完整时才更新，避免输入过程中的干扰
        if (newValue === '' || !isNaN(parseInt(newValue))) {
          setCustomInitialSegmentMinutes(newValue === '' ? 1 : Math.max(1, parseInt(newValue)));
        }
        break;
      case 'customSubsequentSegment':
        if (newValue === '' || !isNaN(parseInt(newValue))) {
          setCustomSubsequentSegmentMinutes(newValue === '' ? 1 : Math.max(1, parseInt(newValue)));
        }
        break;
      case 'customDuration':
        setCustomDuration(newValue);
        break;
      case 'finalFee':
        setFinalFee(newValue);
        break;
      default:
        break;
    }
  };

  const handleKeypadConfirm = () => {
    // 确认时只清空键盘值，因为实时更新已经在 handleKeypadChange 中处理了
    setKeypadValue('');
  };

  const handleKeypadCancel = () => {
    setKeypadValue('');
  };

  // 备注编辑相关函数
  const handleEditRemarks = () => {
    setIsEditingRemarks(true);
  };

  const handleSaveRemarks = () => {
    setIsEditingRemarks(false);
    // 自动更新到购物车
    if (tableItem && tableItem.id && tableItem.count && currentStatus === 'In Service') {
      const cartStorageKey = `${store}-${selectedTable}`;
      let products = JSON.parse(localStorage.getItem(cartStorageKey)) || [];
      const targetProductIndex = products.findIndex(product =>
        product.id === tableItem.id &&
        product.count === tableItem.count &&
        product.isTableItem
      );

      if (targetProductIndex !== -1) {
        // 更新备注
        products[targetProductIndex].tableRemarks = remarks;
        products[targetProductIndex].attributeSelected = {
          ...(products[targetProductIndex].attributeSelected || {}),
          '备注': remarks ? [remarks] : []
        };
        
        // 立即更新localStorage
        localStorage.setItem(cartStorageKey, JSON.stringify(products));
        console.log('[TableTimingModal] 备注已保存到本地存储:', remarks);
        
        // 调用外部的回调函数来保存到数据库
        if (onRemarksUpdate) {
          onRemarksUpdate(cartStorageKey, JSON.stringify(products));
        }
        
        // 通过window事件通知购物车更新
        window.dispatchEvent(new CustomEvent('cartUpdated', {
          detail: { store, selectedTable, tableItem, remarks }
        }));
      }
    }
  };

  const handleCancelEditRemarks = () => {
    setIsEditingRemarks(false);
    // 恢复到之前的备注
    if (tableItem) {
      let savedRemarks = tableItem.tableRemarks || '';
      if (!savedRemarks && tableItem.attributeSelected && tableItem.attributeSelected['备注'] && tableItem.attributeSelected['备注'][0]) {
        savedRemarks = tableItem.attributeSelected['备注'][0];
      }
      setRemarks(savedRemarks);
    }
  };

  // 计费规则编辑相关函数
  const handleEditBillingRule = () => {
    setIsEditingBillingRule(true);
  };

  const handleSaveBillingRule = () => {
    if (!tableItem || !tableItem.id || !tableItem.count) {
      console.error("[TableTimingModal][handleSaveBillingRule] Cannot proceed: tableItem information missing.");
      return;
    }

    const itemSpecificKeyPrefix = `${store}-${tableItem.id}-${tableItem.count}`;
    
    // 更新计费规则
    localStorage.setItem(`${itemSpecificKeyPrefix}-billingRule`, selectedBillingRule);
    
    // 更新自定义规则参数
    if (selectedBillingRule === BILLING_RULES.CUSTOM_RULE) {
      const firstBlock = parseInt(customFirstBlockDuration);
      const initialSegment = parseInt(customInitialSegmentMinutes);
      const subsequentSegment = parseInt(customSubsequentSegmentMinutes);
      
      if (isNaN(firstBlock) || !(firstBlock === 30 || firstBlock === 60) ||
          isNaN(initialSegment) || initialSegment <= 0 ||
          isNaN(subsequentSegment) || subsequentSegment <= 0) {
        alert(fanyi("Invalid custom rule parameters. Please check inputs."));
        return;
      }
      
      localStorage.setItem(`${itemSpecificKeyPrefix}-customFirstBlock`, customFirstBlockDuration.toString());
      localStorage.setItem(`${itemSpecificKeyPrefix}-customInitialSegment`, customInitialSegmentMinutes.toString());
      localStorage.setItem(`${itemSpecificKeyPrefix}-customSubsequentSegment`, customSubsequentSegmentMinutes.toString());
    } else {
      // 清理旧的自定义规则参数
      localStorage.removeItem(`${itemSpecificKeyPrefix}-customFirstBlock`);
      localStorage.removeItem(`${itemSpecificKeyPrefix}-customInitialSegment`);
      localStorage.removeItem(`${itemSpecificKeyPrefix}-customSubsequentSegment`);
    }

    setIsEditingBillingRule(false);
    console.log('[TableTimingModal] 计费规则已更新:', selectedBillingRule);
  };

  const handleCancelEditBillingRule = () => {
    setIsEditingBillingRule(false);
    // 恢复到之前保存的规则设置
    if (tableItem && tableItem.id && tableItem.count) {
      const itemSpecificKeyPrefix = `${store}-${tableItem.id}-${tableItem.count}`;
      const savedBillingRule = localStorage.getItem(`${itemSpecificKeyPrefix}-billingRule`);
      
      if (savedBillingRule) {
        setSelectedBillingRule(savedBillingRule);
        if (savedBillingRule === BILLING_RULES.CUSTOM_RULE) {
          const savedFirstBlock = localStorage.getItem(`${itemSpecificKeyPrefix}-customFirstBlock`);
          const savedInitialSegment = localStorage.getItem(`${itemSpecificKeyPrefix}-customInitialSegment`);
          const savedSubsequentSegment = localStorage.getItem(`${itemSpecificKeyPrefix}-customSubsequentSegment`);
          
          setCustomFirstBlockDuration(savedFirstBlock ? parseInt(savedFirstBlock) : 60);
          setCustomInitialSegmentMinutes(savedInitialSegment ? parseInt(savedInitialSegment) : 15);
          setCustomSubsequentSegmentMinutes(savedSubsequentSegment ? parseInt(savedSubsequentSegment) : 15);
        }
      } else {
        // 如果没有保存的规则，恢复默认值
        setSelectedBillingRule(BILLING_RULES.RULE_1);
        setCustomFirstBlockDuration(60);
        setCustomInitialSegmentMinutes(15);
        setCustomSubsequentSegmentMinutes(15);
      }
    }
  };

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

  // 检测屏幕尺寸
  useEffect(() => {
    const handleResize = () => {
      setIsPC(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 监听字段可用性变化，自动调整数字键盘激活字段
  useEffect(() => {
    const availableFields = getAvailableInputFields();
    
    // 如果当前激活的字段不可用，切换到可用字段
    if (!availableFields.includes(activeInputField)) {
      if (availableFields.length > 0) {
        activateInputField(availableFields[0]);
      } else {
        setActiveInputField('none');
        setKeypadValue('');
      }
    }
  }, [isTimerEnabled, selectedBillingRule, forceStartMode, currentStatus]);

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

          // 自动计算费用 - Incorporate new billing rules here
          const finalDuration = customDuration ? parseInt(customDuration) : durationMinutes;
          const hourlyRate = parseFloat(basePrice); // basePrice is the hourly rate
          if (hourlyRate > 0 && finalDuration >= 0) {
            // 使用新的统一计费函数
            let customConfig = null;
            if (selectedBillingRule === BILLING_RULES.CUSTOM_RULE) {
                // Validate current custom state before passing to calculation
                const firstBlock = parseInt(customFirstBlockDuration);
                const initialSegment = parseInt(customInitialSegmentMinutes);
                const subsequentSegment = parseInt(customSubsequentSegmentMinutes);
                if (isNaN(firstBlock) || !(firstBlock === 30 || firstBlock === 60) ||
                    isNaN(initialSegment) || initialSegment <= 0 ||
                    isNaN(subsequentSegment) || subsequentSegment <= 0) {
                  setCustomRuleError(fanyi("Invalid custom rule parameters. Please check inputs."));
                  setCalculatedFee('0.00'); // Set to 0 or an error state if params invalid during UI update
                  // Skip price calculation if params are bad for the UI display part
                  return; 
                } else {
                  setCustomRuleError(''); // Clear error if params are now valid
                }
                customConfig = {
                    firstBlockDuration: customFirstBlockDuration,
                    initialSegmentMinutes: customInitialSegmentMinutes,
                    subsequentSegmentMinutes: customSubsequentSegmentMinutes
                };
            }
            const price = calculatePriceForBillingRule(finalDuration, hourlyRate, selectedBillingRule, customConfig);
            setCalculatedFee(price.toFixed(2));
          } else {
            setCalculatedFee('0.00');
          }
        }
      }
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, [currentStatus, startTime, basePrice, customDuration, selectedBillingRule, store, tableItem, selectedTable, fanyi]);

  // 检查是否已经开台
  useEffect(() => {
    if (isOpen) { // 当模态框新打开时，重置这些特定于输入的字段
      setCustomDuration('');
      setFinalFee('');
      // setRemarks(''); // Remarks 应该基于加载的 tableItem，或者在 forceStartMode 时清空

      if (tableItem) {
        const itemPrice = tableItem.subtotal || 0;
        const minimumPrice = Math.max(itemPrice, 1.00);
        setBasePrice(minimumPrice.toFixed(2));
        setCalculatedFee('0.00');
        setRemarks('');
        // setCustomDuration(''); // Already reset if isOpen
        // setFinalFee('');     // Already reset if isOpen
      } else {
        setBasePrice("1.00");
      }

      // 构建用于读取特定条目开台时间、基础价格的 key
      // 这需要 tableItem 和它的 count (如果已经开台)
      let itemSpecificStartTime = null;
      let itemSpecificBasePrice = null;
      let itemSpecificTimerInfo = null;
      let itemSpecificBillingRule = null; // <-- Variable to hold rule from LS
      let itemCustomFirstBlock = null;
      let itemCustomInitialSegment = null;
      let itemCustomSubsequentSegment = null;

      if (tableItem && tableItem.id && tableItem.count) { // 确保是已开台的商品，有id和count
        const itemKeyForTiming = `${store}-${tableItem.id}-${tableItem.count}`;
        console.log(`[TableTimingModal][useEffect] Reading item details. Key prefix for startTime/basePrice/billingRule: ${itemKeyForTiming}`);
        itemSpecificStartTime = localStorage.getItem(`${itemKeyForTiming}-isSent_startTime`);
        itemSpecificBasePrice = localStorage.getItem(`${itemKeyForTiming}-basePrice`);
        itemSpecificBillingRule = localStorage.getItem(`${itemKeyForTiming}-billingRule`); // <-- Read billing rule
        if (itemSpecificBillingRule === BILLING_RULES.CUSTOM_RULE) {
          itemCustomFirstBlock = localStorage.getItem(`${itemKeyForTiming}-customFirstBlock`);
          itemCustomInitialSegment = localStorage.getItem(`${itemKeyForTiming}-customInitialSegment`);
          itemCustomSubsequentSegment = localStorage.getItem(`${itemKeyForTiming}-customSubsequentSegment`);
        }
        
        // 读取持久化的定时器信息 (activeTimer-...) 以显示在弹窗中
        // persistentTimerKey 依然需要 selectedTable，因为它标识的是特定桌台上的特定商品的定时器
        const persistentTimerKey = `activeTimer-${store}-${selectedTable}-${tableItem.id}-${tableItem.count}`;
        const storedActiveTimer = localStorage.getItem(persistentTimerKey);
        if (storedActiveTimer) {
          try {
            const parsedTimer = JSON.parse(storedActiveTimer);
            // 从 parsedTimer 中提取需要在UI上显示的信息，例如 action 和 duration
            // 注意： currentTimerInfo 状态可能需要调整以适应 timerDetailsForStorage 的结构
            setCurrentTimerInfo({
              duration: parsedTimer.durationMs / (60 * 1000), // 转换回分钟
              action: parsedTimer.action,
              // startTime: parsedTimer.timerSetAt // 这个是定时器设置的原始时间，UI上可能不需要显示
            }); 
          } catch (error) {
            console.error('[TableTimingModal] 解析 activeTimer 信息失败:', error);
            setCurrentTimerInfo(null);
          }
        } else {
          setCurrentTimerInfo(null);
        }
      } else {
        // 如果 tableItem 无效或没有 count (例如，新开台，或者selectedTable只是一个名字)
        // 则不应该有已激活的定时器信息与此特定模态框关联
        setCurrentTimerInfo(null);
      }
      
      if (forceStartMode) {
        setCurrentStatus('Not Started');
        setStartTime('');
        setUsedDuration('');
        setCalculatedFee('0.00');
        setRemarks('');
        setCurrentTimerInfo(null);
        setIsTimerEnabled(false);
        setTimerDuration('');
        setTimerAction('No Action');
        setSelectedBillingRule(BILLING_RULES.RULE_2);
        setCustomFirstBlockDuration(60);
        setCustomInitialSegmentMinutes(15);
        setCustomSubsequentSegmentMinutes(15);
        setCustomRuleError('');
        setIsEditingRemarks(false);
        setIsEditingBillingRule(false);
        setShowEndTableConfirm(false);
        // 开台模式智能选择默认激活字段
        const availableFields = getAvailableInputFields();
        if (availableFields.length > 0) {
          activateInputField(availableFields[0]);
        } else {
          setActiveInputField('none');
          setKeypadValue('');
        }
      } else if (itemSpecificStartTime && !isNaN(parseInt(itemSpecificStartTime))) {
        const startDate = new Date(parseInt(itemSpecificStartTime));
        setStartTime(startDate.toLocaleString('zh-CN'));
        setCurrentStatus('In Service');
        const durationMinutes = calculateDuration(parseInt(itemSpecificStartTime));
        setUsedDuration(formatDuration(durationMinutes));
        if (tableItem) {
          // 尝试从多个来源读取备注
          let savedRemarks = tableItem.tableRemarks || '';
          if (!savedRemarks && tableItem.attributeSelected && tableItem.attributeSelected['备注'] && tableItem.attributeSelected['备注'][0]) {
            savedRemarks = tableItem.attributeSelected['备注'][0];
          }
          setRemarks(savedRemarks);
        }
        setCalculatedFee('0.00');
        // 不要重置备注，保持从tableItem读取的值
        // setRemarks('');
        // 保持定时器信息，不要重置
        // setCurrentTimerInfo(null);
        setIsTimerEnabled(false);
        setTimerDuration('');
        setTimerAction('No Action');
        setSelectedBillingRule(BILLING_RULES.RULE_2);
        setCustomFirstBlockDuration(60);
        setCustomInitialSegmentMinutes(15);
        setCustomSubsequentSegmentMinutes(15);
        setCustomRuleError('');
        setIsEditingRemarks(false);
        setIsEditingBillingRule(false);
        setShowEndTableConfirm(false);
        // 结台模式默认激活自定义时长
        setActiveInputField('customDuration');
        setKeypadValue('');
      } else {
        setCurrentStatus('Not Started');
        setStartTime('');
        setUsedDuration('');
        setCalculatedFee('0.00');
        setRemarks('');
        setCurrentTimerInfo(null);
        setIsTimerEnabled(false);
        setTimerDuration('');
        setTimerAction('No Action');
        setSelectedBillingRule(BILLING_RULES.RULE_2);
        setCustomFirstBlockDuration(60);
        setCustomInitialSegmentMinutes(15);
        setCustomSubsequentSegmentMinutes(15);
        setCustomRuleError('');
        setIsEditingRemarks(false);
        setIsEditingBillingRule(false);
        setShowEndTableConfirm(false);
        // 默认状态智能选择激活字段
        const availableFields = getAvailableInputFields();
        if (availableFields.length > 0) {
          activateInputField(availableFields[0]);
        } else {
          setActiveInputField('none');
          setKeypadValue('');
        }
      }

      if (itemSpecificBasePrice) {
        const storedPrice = Math.max(parseFloat(itemSpecificBasePrice), 1.00);
        setBasePrice(storedPrice.toFixed(2));
      }

      // Set selectedBillingRule if found for the item, otherwise keep default
      if (itemSpecificBillingRule) {
        setSelectedBillingRule(itemSpecificBillingRule);
        console.log(`[TableTimingModal][useEffect] Loaded billing rule for item: ${itemSpecificBillingRule}`);
        if (itemSpecificBillingRule === BILLING_RULES.CUSTOM_RULE) {
          setCustomFirstBlockDuration(itemCustomFirstBlock ? parseInt(itemCustomFirstBlock) : 60);
          setCustomInitialSegmentMinutes(itemCustomInitialSegment ? parseInt(itemCustomInitialSegment) : 15);
          setCustomSubsequentSegmentMinutes(itemCustomSubsequentSegment ? parseInt(itemCustomSubsequentSegment) : 15);
          console.log(`[TableTimingModal][useEffect] Loaded custom params: ${itemCustomFirstBlock}, ${itemCustomInitialSegment}, ${itemCustomSubsequentSegment}`);
        }
      } else {
        // If no specific rule stored for the item, and we are not in forceStartMode,
        // it might be an older item or rule was cleared. Keep modal's current default.
        // For forceStartMode, it will use the default set by useState.
        // console.log(`[TableTimingModal][useEffect] No specific billing rule found for item, using current/default: ${selectedBillingRule}`);
      }

      // 最终费用读取逻辑保持不变，因为它不直接与定时器显示相关
      // const finalFeeKey = ... ; localStorage.getItem(finalFeeKey);
    }
  }, [store, selectedTable, tableItem, isOpen, forceStartMode]);

  // 自动结账处理函数（独立于手动结账）
  const handleAutoCheckout = (itemForCheckout, currentSelectedTableName) => {
    // CORRECTED: itemForCheckout now contains the correct `count` generated by this modal instance or passed correctly.
    // currentSelectedTableName is the table this modal was opened for.

    const itemSpecificKeyPrefix = `${store}-${itemForCheckout.id}-${itemForCheckout.count}`;
    const itemSpecificStartTimeKey = `${itemSpecificKeyPrefix}-isSent_startTime`;
    const itemSpecificBasePriceKey = `${itemSpecificKeyPrefix}-basePrice`;
    // The persistentTimerKey includes the table name because it describes WHICH table the timer was set on.
    const persistentTimerKey = `activeTimer-${store}-${currentSelectedTableName}-${itemForCheckout.id}-${itemForCheckout.count}`;
    
    console.log(`[TableTimingModal][handleAutoCheckout] Initiated for item ${itemForCheckout.id}-${itemForCheckout.count} on table ${currentSelectedTableName}`);
    console.log(`[TableTimingModal][handleAutoCheckout] Using startTimeKey: ${itemSpecificStartTimeKey}, basePriceKey: ${itemSpecificBasePriceKey}, persistentTimerKey: ${persistentTimerKey}`);

    // 使用 currentSelectedTableName 而不是 props.selectedTable
    const cartStorageKey = `${store}-${currentSelectedTableName}`;

    let products = JSON.parse(localStorage.getItem(cartStorageKey)) || [];
    const targetProduct = products.find(product =>
      product.id === itemForCheckout.id &&
      product.count === itemForCheckout.count && // 现在 itemForCheckout.count 应该是有效的
      product.isTableItem
    );

    if (!targetProduct) {
      console.error('自动结账时找不到目标商品 (使用模态框生成的count后):', itemForCheckout.id, itemForCheckout.count, itemForCheckout);
      console.log('购物车商品:', products.map(p => ({id: p.id, count: p.count, name: p.name, isTableItem: p.isTableItem, attr: p.attributeSelected})));
      // 可以考虑如果找不到，是否弹窗提示用户或者采取其他恢复措施
      alert('自动结账失败：找不到对应的开台商品。请检查购物车。 Anomalous situation, please contact support.');
      return;
    }

    // 计算最终价格
    const storedStartTime = localStorage.getItem(itemSpecificStartTimeKey);
    let finalPrice = 0;
    let finalDuration = 0;

    // Retrieve the full timer details to get the billing rule
    const timerDetailsString = localStorage.getItem(persistentTimerKey);
    let autoCheckoutBillingRule = BILLING_RULES.RULE_5; // Default to exact minute if not found
    let autoCustomParams = { firstBlock: 60, initialSegment: 15, subsequentSegment: 15 }; // Defaults for custom

    if (timerDetailsString) {
      try {
        const timerDetails = JSON.parse(timerDetailsString);
        if (timerDetails.billingRule) {
          autoCheckoutBillingRule = timerDetails.billingRule;
          console.log(`[TableTimingModal][handleAutoCheckout] Using billing rule from timer: ${autoCheckoutBillingRule}`);
          if (autoCheckoutBillingRule === BILLING_RULES.CUSTOM_RULE) {
            autoCustomParams.firstBlock = timerDetails.customFirstBlockDuration || 60;
            autoCustomParams.initialSegment = timerDetails.customInitialSegmentMinutes || 15;
            autoCustomParams.subsequentSegment = timerDetails.customSubsequentSegmentMinutes || 15;
            console.log(`[TableTimingModal][handleAutoCheckout] Using custom params from timer:`, autoCustomParams);
          }
        }
      } catch (e) {
        console.error("[TableTimingModal][handleAutoCheckout] Error parsing timer details for billing rule", e);
      }
    }

    if (storedStartTime && !isNaN(parseInt(storedStartTime))) {
      const durationMinutes = calculateDuration(parseInt(storedStartTime));
      finalDuration = durationMinutes;

      const storedBasePrice = localStorage.getItem(itemSpecificBasePriceKey);
      const currentHourlyRate = storedBasePrice ? parseFloat(storedBasePrice) : (targetProduct.subtotal / (targetProduct.quantity || 1));

      // Apply the stored billing rule for price calculation
      if (currentHourlyRate > 0 && finalDuration >= 0) {
        // 使用导出的计费计算函数，避免重复代码
        finalPrice = calculatePriceForBillingRule(finalDuration, currentHourlyRate, autoCheckoutBillingRule, autoCustomParams);
      } else {
        finalPrice = 0.00; // Or some default if rate is invalid
      }
    } else {
      // Fallback if start time is missing - though this should ideally not happen for an active timer
      finalPrice = targetProduct.subtotal; // Or some other default logic
      console.warn(`[TableTimingModal][handleAutoCheckout] Start time not found for item ${itemForCheckout.id}-${itemForCheckout.count}. Using base subtotal as price.`);
    }

    let displayRemarks = '';
    if (targetProduct && targetProduct.tableRemarks) {
      displayRemarks = `\n${fanyi("Remarks")}: ${targetProduct.tableRemarks}`;
    }

    localStorage.removeItem(itemSpecificStartTimeKey);
    localStorage.removeItem(itemSpecificBasePriceKey);
    localStorage.removeItem(`${itemSpecificKeyPrefix}-billingRule`); // <-- Clean up billing rule
    localStorage.removeItem(persistentTimerKey); // Clean the active timer details

    alert(`${currentSelectedTableName} ${fanyi("Timer checkout executed")}\n${fanyi("Total used time")}: ${formatDuration(finalDuration)}\n${fanyi("Final Fee")}: $${finalPrice.toFixed(2)}${displayRemarks}`);

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

    const currentBasePrice = parseFloat(basePrice) || 1.00;

    // Create a snapshot of the tableItem with all necessary fields for later restoration
    const tableItemSnapshot = {
      id: tableItem.id,
      name: tableItem.name,
      CHI: tableItem.CHI,
      image: tableItem.image,
      // Store the base subtotal (per unit price at the time of starting the table)
      // This is crucial for `handleTableEnd` if it needs the original price, not the calculated fee.
      // `currentBasePrice` in this modal is this value.
      subtotal: currentBasePrice, 
      availability: tableItem.availability,
      attributesArr: tableItem.attributesArr || {},
      // IMPORTANT: Capture the attributeSelected *as it is when the table is started*,
      // including the '开台商品' marker that onTableStart (in Food.js) will add.
      // For this to work, onTableStart MUST return the item with the added marker, or we assume it here.
      // Let's assume tableItemForCallback (after onTableStart) is the source of truth for attributes.
      // However, onTableStart is called *after* this, so we need a slightly different approach.
      // We will pass a basic tableItemForCallback to onTableStart,
      // and the itemSnapshot here will be used by the *restored* checkout.

      // The `attributeSelected` needed by `handleTableEnd` to find the item
      // is the one that *includes* the '开台商品' marker.
      // `tableItemForCallback.attributeSelected` (created below) will have this.
      // So, we should store that version if possible, or reconstruct it.

      // For now, let's store the remarks and count, other fields from original tableItem.
      // The `attributeSelected` for matching in `handleTableEnd` is more complex.
      // It needs the one with `开台商品`.
      // The `tableItemForCallback` sent to `onTableStart` will get this added by `Food.js`.
      // So, `timerDetailsForStorage` should ideally store that full `attributeSelected`.

      // Let's simplify: we pass essential identifying + data fields.
      // `handleTableEnd` uses id & count for primary match, then `isTableItem` and `attributeSelected['开台商品']`
      // The `attributeSelected` for the *timer* might just need basic attributes + remarks.
      // The original `attributeSelected` of the `tableItem` prop is what we have here.
      attributeSelected: tableItem.attributeSelected || {}, // Original attributes before开台商品 marker
      tableRemarks: remarks, // Current remarks from modal
      count: newCount, // The new unique count for this session
      quantity: tableItem.quantity || 1 // Assuming quantity is relevant
    };

    const tableItemForCallback = {
      ...tableItem, // original item
      count: newCount, // new count for this session
      tableRemarks: remarks, // current remarks
      // `subtotal` in tableItemForCallback should be the original item subtotal (base price)
      // It will be added to cart with this price.
      subtotal: currentBasePrice, 
      attributeSelected: {
        ...(tableItem ? tableItem.attributeSelected : {}),
        '备注': remarks ? [remarks] : []
        // The '开台商品' marker will be added by Food.js -> handleTableStart -> addSpecialFood
      }
    };
    onTableStart(tableItemForCallback); // This will eventually call addSpecialFood

    // CORRECTED KEY FORMAT: Use ${store}-${itemId}-${itemCount} for item-specific data
    const itemSpecificKeyPrefix = `${store}-${tableItem.id}-${newCount}`;
    localStorage.setItem(`${itemSpecificKeyPrefix}-isSent_startTime`, now.toString());
    localStorage.setItem(`${itemSpecificKeyPrefix}-basePrice`, currentBasePrice.toString());
    localStorage.setItem(`${itemSpecificKeyPrefix}-billingRule`, selectedBillingRule); // <-- Always store billing rule on start
    if (selectedBillingRule === BILLING_RULES.CUSTOM_RULE) {
      const firstBlock = parseInt(customFirstBlockDuration);
      const initialSegment = parseInt(customInitialSegmentMinutes);
      const subsequentSegment = parseInt(customSubsequentSegmentMinutes);
       if (isNaN(firstBlock) || !(firstBlock === 30 || firstBlock === 60) ||
           isNaN(initialSegment) || initialSegment <= 0 ||
           isNaN(subsequentSegment) || subsequentSegment <= 0) {
        alert(fanyi("Invalid custom rule parameters. Please check inputs.") + ` Cannot start table.`);
        // Do not proceed with starting the table if custom params are bad
        localStorage.removeItem(`${itemSpecificKeyPrefix}-isSent_startTime`);
        localStorage.removeItem(`${itemSpecificKeyPrefix}-basePrice`);
        localStorage.removeItem(`${itemSpecificKeyPrefix}-billingRule`);
        return; 
      }
      localStorage.setItem(`${itemSpecificKeyPrefix}-customFirstBlock`, customFirstBlockDuration.toString());
      localStorage.setItem(`${itemSpecificKeyPrefix}-customInitialSegment`, customInitialSegmentMinutes.toString());
      localStorage.setItem(`${itemSpecificKeyPrefix}-customSubsequentSegment`, customSubsequentSegmentMinutes.toString());
      console.log(`[TableTimingModal] Custom rule params saved. Prefix: ${itemSpecificKeyPrefix}, Params: ${customFirstBlockDuration}, ${customInitialSegmentMinutes}, ${customSubsequentSegmentMinutes}`);
    } else {
      // Clean up any old custom params if switching away from custom to another rule
      localStorage.removeItem(`${itemSpecificKeyPrefix}-customFirstBlock`);
      localStorage.removeItem(`${itemSpecificKeyPrefix}-customInitialSegment`);
      localStorage.removeItem(`${itemSpecificKeyPrefix}-customSubsequentSegment`);
    }
    console.log(`[TableTimingModal] Item start time, base price, and billing rule saved. Key prefix: ${itemSpecificKeyPrefix}, Rule: ${selectedBillingRule}`);

    const startDate = new Date(now);
    setStartTime(startDate.toLocaleString('zh-CN'));
    setCurrentStatus('In Service');

    if (isTimerEnabled && timerDuration && timerAction !== 'No Action') {
      const durationMs = parseInt(timerDuration) * 60 * 1000;
      const absoluteEndTime = now + durationMs;

      const timerDetailsForStorage = {
        originalStore: store,
        originalSelectedTable: selectedTable,
        itemSnapshot: {
            ...tableItemSnapshot,
        },
        action: timerAction,
        billingRule: selectedBillingRule,
        // Store custom parameters if custom rule is selected for the timer
        ...(selectedBillingRule === BILLING_RULES.CUSTOM_RULE && {
          customFirstBlockDuration: customFirstBlockDuration,
          customInitialSegmentMinutes: customInitialSegmentMinutes,
          customSubsequentSegmentMinutes: customSubsequentSegmentMinutes,
        }),
        timerSetAt: now,
        durationMs: durationMs,
        absoluteEndTime: absoluteEndTime,
      };
      
      const persistentTimerKey = `activeTimer-${store}-${selectedTable}-${tableItem.id}-${newCount}`;
      localStorage.setItem(persistentTimerKey, JSON.stringify(timerDetailsForStorage));
      console.log(`[TableTimingModal] 定时器信息已存储 (with itemSnapshot)到localStorage key: ${persistentTimerKey}`, timerDetailsForStorage);

      const internalTimeoutTableItem = { 
        id: tableItem.id, 
        count: newCount, 
        subtotal: currentBasePrice, 
        tableRemarks: remarks 
      };
      setTimeout(() => {
        const stillExists = localStorage.getItem(persistentTimerKey);
        if (stillExists) { // 只有当Food.js还没处理这个定时器时，这个内部的才执行
          if (timerAction === 'Auto Checkout') {
            console.log('[TableTimingModal]内部setTimeout触发自动结账 for:', internalTimeoutTableItem, 'on table:', selectedTable);
            handleAutoCheckout(internalTimeoutTableItem, selectedTable); // 确保传递selectedTable
          } else if (timerAction === 'Continue Billing') {
            console.log(`[TableTimingModal] ${selectedTable} 内部setTimeout触发到时继续计费`);
          }
          // 内部执行后也应该清除，避免Food.js重复执行，或Food.js执行时发现没了会跳过
          // localStorage.removeItem(persistentTimerKey); // 暂时不在这里移除，让Food.js作为主要清理者
        } else {
          console.log('[TableTimingModal]内部setTimeout触发，但persistentTimerKey已不存在，可能已被Food.js处理:', persistentTimerKey);
        }
      }, durationMs);
    }

    // alert(`${selectedTable} ${fanyi("Start table successful!")}`);
    setRemarks('');
    setTimerDuration('');
    setIsTimerEnabled(false);
    setTimerAction('No Action');
    onClose();
  };



  // 显示结台确认弹窗
  const handleEndTable = () => {
    setShowEndTableConfirm(true);
  };

  // 确认结台
  const confirmEndTable = () => {
    setShowEndTableConfirm(false);
    performEndTable();
  };

  // 取消结台
  const cancelEndTable = () => {
    setShowEndTableConfirm(false);
  };

  // 实际执行结台操作
  const performEndTable = () => {
    // Ensure tableItem and its count are available for correct key generation
    if (!tableItem || !tableItem.id || !tableItem.count) {
      console.error("[TableTimingModal][handleEndTable] Cannot proceed: tableItem, tableItem.id, or tableItem.count is missing.", tableItem);
      // alert("Error: Critical item information is missing for ending table. Please try again or contact support.");
      onClose(); // Close modal to prevent further issues
      return;
    }

    // CORRECTED KEY FORMAT: Use ${store}-${itemId}-${itemCount} for item-specific data
    const itemSpecificKeyPrefix = `${store}-${tableItem.id}-${tableItem.count}`;
    const startTimeKey = `${itemSpecificKeyPrefix}-isSent_startTime`;
    const basePriceKey = `${itemSpecificKeyPrefix}-basePrice`;
    // finalFeeKey and timerInfoKey seem to be using a different, potentially problematic pattern.
    // For consistency, if they are item-specific, they should also use itemSpecificKeyPrefix.
    // const finalFeeKey = `${store}-${tableKey}-finalFee`; // old, tableKey could be just selectedTable
    // const timerInfoKey = `${store}-${tableKey}-timerInfo`; // old
    // Let's assume these are not strictly needed or should be re-evaluated.
    // The primary keys to clean are startTimeKey, basePriceKey, and the activeTimer key.

    const persistentTimerKey = `activeTimer-${store}-${selectedTable}-${tableItem.id}-${tableItem.count}`;

    console.log(`[TableTimingModal][handleEndTable] Initiated for item ${tableItem.id}-${tableItem.count} on table ${selectedTable}`);
    console.log(`[TableTimingModal][handleEndTable] Cleaning startTimeKey: ${startTimeKey}, basePriceKey: ${basePriceKey}, persistentTimerKey: ${persistentTimerKey}`);


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
    localStorage.removeItem(`${itemSpecificKeyPrefix}-billingRule`); // <-- Clean up billing rule
    // localStorage.removeItem(finalFeeKey); // Commenting out as its key structure was different and might be unused/problematic
    // localStorage.removeItem(timerInfoKey); // Commenting out for same reason
    localStorage.removeItem(persistentTimerKey); // Clean the active timer details

    // 显示结台信息（包含备注）
    // alert(`${selectedTable} ${fanyi("End table successful!")}\n${fanyi("Total used time")}: ${formatDuration(finalDuration)}\n${fanyi("Final Fee")}: $${finalPrice.toFixed(2)}${displayRemarks}`);

    // 重置状态
    setStartTime('');
    setCurrentStatus('Not Started');
    setUsedDuration('');
    setCustomDuration('');
    setCalculatedFee('0.00');
    setFinalFee('');
    setRemarks('');
    setCurrentTimerInfo(null);
    setShowEndTableConfirm(false);

    onClose();

    // 通知父组件更新购物车价格（确保自动结账和手动结账都调用）
    if (onTableEnd && tableItem) {
      console.log('手动结账更新商品:', tableItem.id, tableItem.count, finalPrice);
      onTableEnd(tableItem, finalPrice);
    }
  };

  if (!isOpen) return null;

  const inputStyle = "notranslate mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

  return (
    <div className="table-timing-modal-overlay">
              <div className="table-timing-modal" style={{ maxWidth: isPC ? '1100px' : '700px', minHeight: '600px' }}>
        <div className="table-timing-modal-header">
          <h2 className="text-xl font-semibold mb-4">{fanyi("开台计时")} - <span className="notranslate">{tableItem?.name}</span></h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: isPC ? '20px' : '0' }}>
          <div className="table-timing-modal-body" style={{ flex: isPC ? '1' : 'none', width: isPC ? 'auto' : '100%' }}>
          {/* 基础价格 和 当前状态 - 修改为一行显示 */}
          <div className="form-row">
            <div className="form-group half">
            <label>{fanyi("Base Price")}:</label>
            <div className="status-display inactive notranslate">
              ${(Math.round(parseFloat(basePrice) * 100) / 100).toFixed(2)}
            </div>
          </div>
            <div className="form-group half">
            <label>{fanyi("Current Status")}:</label>
            <div className={`status-display ${currentStatus === 'In Service' ? 'active' : 'inactive'}`}>
              {fanyi(currentStatus)}
              </div>
            </div>
          </div>

          {/* 时间显示区域 */}
          <div className="form-row">
            <div className="form-group half">
              <label>{fanyi("Start Time")}:</label>
              <div className="time-display notranslate">
                {startTime || '--:--:--'}
              </div>
            </div>
            <div className="form-group half">
              <label>{fanyi("Current Time")}:</label>
              <div className="time-display notranslate">{currentTime}</div>
            </div>
          </div>

          {(forceStartMode || currentStatus === 'Not Started') && (
             <>
              {/* 已用时长 */}
              <div className="form-group">
                <label>{fanyi("Used Duration")}:</label>
                <div className="time-display">
                  {usedDuration || '--:--:--'}
                </div>
              </div>
            </>
          )}

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
                          onClick={() => activateInputField('timerDuration', timerDuration)}
                          className={`${inputStyle} ${activeInputField === 'timerDuration' ? 'ring-2 ring-blue-500' : ''}`}
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
                        className={inputStyle}
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
                  className={inputStyle}
                  rows="3"
                  placeholder={fanyi("Enter remarks here...")}
                />
              </div>
            </>
          )}

          {/* Billing Rule Selection - Display if starting or in service */}
          {(forceStartMode || currentStatus === 'Not Started' || currentStatus === 'In Service') && (
            <div className="form-group">
              {/* 开台模式：直接显示选择框 */}
              {(forceStartMode || currentStatus === 'Not Started') && (
                <>
                  <label htmlFor="billingRuleSelect">{fanyi("Billing Rule")}:</label>
                  <select 
                    id="billingRuleSelect" 
                    className={inputStyle} 
                    value={selectedBillingRule} 
                    onChange={(e) => setSelectedBillingRule(e.target.value)}
                  >
                    <option value={BILLING_RULES.RULE_1}>{fanyi("Rule: Hour Block / 15-min")}</option>
                    <option value={BILLING_RULES.RULE_2}>{fanyi("Rule: 30-min Block, then Hour Block / 15-min")}</option>
                    <option value={BILLING_RULES.RULE_3}>{fanyi("Rule: Hour Block / 30-min")}</option>
                    <option value={BILLING_RULES.RULE_4}>{fanyi("Rule: Hour Block / Minute")}</option>
                    <option value={BILLING_RULES.RULE_5}>{fanyi("Rule: Exact Minute")}</option>
                    <option value={BILLING_RULES.CUSTOM_RULE}>{fanyi("Custom Rule")}</option>
                  </select>
                </>
              )}
              
              {/* 结台模式：编辑模式 */}
              {currentStatus === 'In Service' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label>{fanyi("Billing Rule")}:</label>
                    <div>
                      {!isEditingBillingRule ? (
                        <button 
                          type="button"
                          onClick={handleEditBillingRule}
                          className="btn btn-sm btn-outline-primary notranslate"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          {fanyi("Edit Rule")}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            type="button"
                            onClick={handleSaveBillingRule}
                            className="btn btn-sm btn-success notranslate"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            {fanyi("Save")}
                          </button>
                          <button 
                            type="button"
                            onClick={handleCancelEditBillingRule}
                            className="btn btn-sm btn-secondary notranslate"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            {fanyi("Cancel")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isEditingBillingRule ? (
                    <div className="status-display inactive notranslate" style={{textAlign: 'left', minHeight: '40px', padding: '8px'}}>
                      {(() => {
                        switch (selectedBillingRule) {
                          case BILLING_RULES.RULE_1:
                            return fanyi("Rule: Hour Block / 15-min");
                          case BILLING_RULES.RULE_2:
                            return fanyi("Rule: 30-min Block, then Hour Block / 15-min");
                          case BILLING_RULES.RULE_3:
                            return fanyi("Rule: Hour Block / 30-min");
                          case BILLING_RULES.RULE_4:
                            return fanyi("Rule: Hour Block / Minute");
                          case BILLING_RULES.RULE_5:
                            return fanyi("Rule: Exact Minute");
                          case BILLING_RULES.CUSTOM_RULE:
                            return `${fanyi("Custom Rule")} (${customFirstBlockDuration === 30 ? fanyi("30 minutes") : fanyi("1 hour")} / ${customInitialSegmentMinutes}min → ${customSubsequentSegmentMinutes}min)`;
                          default:
                            return fanyi("Rule: Hour Block / 15-min");
                        }
                      })()}
                    </div>
                  ) : (
                    <select 
                      id="billingRuleSelect" 
                      className={inputStyle} 
                      value={selectedBillingRule} 
                      onChange={(e) => setSelectedBillingRule(e.target.value)}
                    >
                      <option value={BILLING_RULES.RULE_1}>{fanyi("Rule: Hour Block / 15-min")}</option>
                      <option value={BILLING_RULES.RULE_2}>{fanyi("Rule: 30-min Block, then Hour Block / 15-min")}</option>
                      <option value={BILLING_RULES.RULE_3}>{fanyi("Rule: Hour Block / 30-min")}</option>
                      <option value={BILLING_RULES.RULE_4}>{fanyi("Rule: Hour Block / Minute")}</option>
                      <option value={BILLING_RULES.RULE_5}>{fanyi("Rule: Exact Minute")}</option>
                      <option value={BILLING_RULES.CUSTOM_RULE}>{fanyi("Custom Rule")}</option>
                    </select>
                  )}
                </>
              )}
            </div>
          )}

          {/* 自定义规则配置区域 */}
          {selectedBillingRule === BILLING_RULES.CUSTOM_RULE && (forceStartMode || currentStatus === 'Not Started' || (currentStatus === 'In Service' && isEditingBillingRule)) && (
            <div className="custom-billing-config form-group">
              <h4>{fanyi("Configure Custom Rule")}</h4>
              {customRuleError && <p className="error-message" style={{color: 'red'}}>{customRuleError}</p>}
              <div className="form-row" style={{display: 'flex', gap: '10px'}}>
                <div className="form-group" style={{flex: '1'}}>
                  <label htmlFor="customFirstBlockDuration">{fanyi("First Block (30/60 min)")}:</label>
                  <select
                    id="customFirstBlockDuration"
                    className={inputStyle}
                    value={customFirstBlockDuration}
                    onChange={(e) => setCustomFirstBlockDuration(parseInt(e.target.value))}
                  >
                    <option value={30}>{fanyi("30 minutes")}</option>
                    <option value={60}>{fanyi("1 hour")}</option>
                  </select>
                </div>
                <div className="form-group" style={{flex: '1'}}>
                  <label htmlFor="customInitialSegmentMinutes">{fanyi("Initial Segment (min, round up)")}:</label>
                  <input
                    type="number"
                    id="customInitialSegmentMinutes"
                    className={`${inputStyle} ${activeInputField === 'customInitialSegment' ? 'ring-2 ring-blue-500' : ''}`}
                    value={customInitialSegmentMinutes}
                    onChange={(e) => setCustomInitialSegmentMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    onClick={() => activateInputField('customInitialSegment', customInitialSegmentMinutes.toString())}
                    min="1"
                  />
                </div>
                <div className="form-group" style={{flex: '1'}}>
                  <label htmlFor="customSubsequentSegmentMinutes">{fanyi("Subsequent Segment (min)")}:</label>
                  <input
                    type="number"
                    id="customSubsequentSegmentMinutes"
                    className={`${inputStyle} ${activeInputField === 'customSubsequentSegment' ? 'ring-2 ring-blue-500' : ''}`}
                    value={customSubsequentSegmentMinutes}
                    onChange={(e) => setCustomSubsequentSegmentMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    onClick={() => activateInputField('customSubsequentSegment', customSubsequentSegmentMinutes.toString())}
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 内容仅在结台时显示: 自定义时长, 计算台费, 最终台费, 只读备注 */}
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

              {/* 已用时长 + 自定义时长合并为一行 */}
              <div className="form-row">
                <div className="form-group half">
                  <label>{fanyi("Used Duration")}:</label>
                  <div className="time-display">
                    {usedDuration || '--:--:--'}
                  </div>
                </div>
                <div className="form-group half">
                  <label>{fanyi("Custom Duration")}:</label>
                  <div className="input-group">
                    <input
                      type="number"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      onClick={() => activateInputField('customDuration', customDuration)}
                      className={`${inputStyle} ${activeInputField === 'customDuration' ? 'ring-2 ring-blue-500' : ''}`}
                      placeholder="30"
                    />
                    <span className="input-suffix">{fanyi("minutes")}</span>
                  </div>
                </div>
              </div>

              {/* 计算台费（有颜色显示）+ 最终台费（用户可输入）合并为一行 */}
              <div className="form-row">
                <div className="form-group half">
                  <label>{fanyi("Calculated Fee")}:</label>
                  <div className="status-display active notranslate" style={{backgroundColor: '#e8f5e8', color: '#2d5a2d', border: '2px solid #4caf50'}}>
                    ${(Math.round(parseFloat(calculatedFee) * 100) / 100).toFixed(2)}
                  </div>
                </div>
                <div className="form-group half">
                  <label>{fanyi("Final Fee")} ({fanyi("Leave empty to use calculated fee")}):</label>
                  <div className="input-group">
                    <input
                      type="number"
                      step="0.01"
                      value={finalFee}
                      onChange={(e) => setFinalFee(e.target.value)}
                      onClick={() => activateInputField('finalFee', finalFee)}
                      className={`${inputStyle} ${activeInputField === 'finalFee' ? 'ring-2 ring-blue-500' : ''}`}
                      placeholder={'$'+(Math.round(parseFloat(calculatedFee) * 100) / 100).toFixed(2)}
                    />
                  </div>
                </div>
              </div>

              {/* 结台时显示备注内容（可编辑） */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label>{fanyi("Remarks")}:</label>
                  <div>
                    {!isEditingRemarks ? (
                      <button 
                        type="button"
                        onClick={handleEditRemarks}
                        className="btn btn-sm btn-outline-primary notranslate"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                      >
                        {fanyi("Edit")}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          type="button"
                          onClick={handleSaveRemarks}
                          className="btn btn-sm btn-success notranslate"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          {fanyi("Save")}
                        </button>
                        <button 
                          type="button"
                          onClick={handleCancelEditRemarks}
                          className="btn btn-sm btn-secondary notranslate"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          {fanyi("Cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {!isEditingRemarks ? (
                  <div className="status-display inactive notranslate" style={{whiteSpace: 'pre-wrap', textAlign: 'left', minHeight: '40px', padding: '8px'}}>
                    {remarks || fanyi("No remarks")}
                  </div>
                ) : (
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className={inputStyle}
                    rows="3"
                    placeholder={fanyi("Enter remarks here...")}
                    style={{ minHeight: '60px' }}
                  />
                )}
              </div>
            </>
          )}
          </div>

          {/* 右侧数字键盘区域 */}
          {isPC && (
            <div style={{ width: '300px', flexShrink: 0, borderLeft: '1px solid #e0e0e0', paddingLeft: '20px' }}>
              <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2">{fanyi("Number Pad")}</h4>
                <div className="text-sm text-gray-600 mb-3">
                  {(() => {
                    const availableFields = getAvailableInputFields();
                    
                    if (availableFields.length === 0) {
                      return fanyi("No input fields available for keypad");
                    }
                    
                    switch (activeInputField) {
                      case 'timerDuration':
                        return `${fanyi("Timer Duration")}: ${timerDuration || '--'} ${fanyi("minutes")}`;
                      case 'customInitialSegment':
                        return `${fanyi("First Block Billing Unit")}: ${customInitialSegmentMinutes} ${fanyi("minutes")}`;
                      case 'customSubsequentSegment':
                        return `${fanyi("Subsequent Billing Unit")}: ${customSubsequentSegmentMinutes} ${fanyi("minutes")}`;
                      case 'customDuration':
                        return `${fanyi("Custom Duration")}: ${customDuration || '--'} ${fanyi("minutes")}`;
                      case 'finalFee':
                        return `${fanyi("Final Fee")}: $${finalFee || (Math.round(parseFloat(calculatedFee) * 100) / 100).toFixed(2)}`;
                      case 'none':
                        return fanyi("No input fields available for keypad");
                      default:
                        return fanyi("Click input field to activate keypad");
                    }
                  })()}
                </div>
              </div>

              <NumberPad
                inputValue={keypadValue}
                onInputChange={handleKeypadChange}
                onConfirm={handleKeypadConfirm}
                onCancel={handleKeypadCancel}
                show={true}
                embedded={true}
              />
            </div>
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

        {/* 确认结台弹窗 */}
        {showEndTableConfirm && (
          <div className="confirmation-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div className="confirmation-dialog" style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              minWidth: '300px',
              maxWidth: '400px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              border: '1px solid #ddd'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#dc3545'
              }}>
                {fanyi("Confirm End Table")}
              </h3>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#666'
              }}>
                {fanyi("Are you sure you want to end this table?")}
              </p>
              <p style={{
                margin: '0 0 20px 0',
                fontSize: '12px',
                color: '#999'
              }}>
                {fanyi("This action cannot be undone.")}
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button 
                  onClick={cancelEndTable}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {fanyi("Cancel")}
                </button>
                <button 
                  onClick={confirmEndTable}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                  {fanyi("Yes, End Table")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableTimingModal;
