import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ItemSalesAnalytics = ({ orders, dateRange }) => {
  const [sortBy, setSortBy] = useState('quantity'); // 'quantity', 'revenue', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart', 'pie'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMainKeys, setExpandedMainKeys] = useState([]);

  // 翻译功能
  const translations = [
    { input: "Item Sales Analytics", output: "物品销量分析" },
    { input: "Item Name", output: "物品名称" },
    { input: "Quantity Sold", output: "销售数量" },
    { input: "Total Revenue", output: "总营收" },
    { input: "Average Price", output: "平均价格" },
    { input: "Sort by", output: "排序方式" },
    { input: "Quantity", output: "数量" },
    { input: "Revenue", output: "营收" },
    { input: "Name", output: "名称" },
    { input: "View Mode", output: "查看模式" },
    { input: "Table", output: "表格" },
    { input: "Bar Chart", output: "柱状图" },
    { input: "Pie Chart", output: "饼图" },
    { input: "Search Items", output: "搜索物品" },
    { input: "Total Items", output: "总物品数" },
    { input: "Total Quantity", output: "总销量" },
    { input: "Total Revenue", output: "总营收" },
    { input: "No data available", output: "暂无数据" },
    { input: "Top 10 Items by Quantity", output: "销量前10物品" },
    { input: "Top 10 Items by Revenue", output: "营收前10物品" },
    { input: "Amount", output: "金额" },
  ];

  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : input;
  }

  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input;
  }

  // 分析订单数据，统计每个物品的销量（主品+变体结构）
  const itemAnalytics = useMemo(() => {
    const mainStats = {};

    orders.forEach(order => {
      try {
        const receiptData = JSON.parse(order.receiptData || '[]');
        receiptData.forEach(item => {
          // 过滤掉包含memberId的错误数据（guest数据）
          if (item.memberId) return;
          if (!item.name || item.quantity === undefined) return;

          // 处理物品名称，去除特殊前缀
          let itemName = item.name;
          let actualQuantity = item.quantity;
          if (/^#@%\d+#@%/.test(item.name)) {
            const match = item.name.match(/#@%(\d+)#@%/);
            const divisor = match ? parseInt(match[1]) : 1;
            itemName = item.name.replace(/^#@%\d+#@%/, '');
            actualQuantity = Math.round(item.quantity) / divisor;
          }

          // 使用中文名称（如果有的话）
          const displayName = localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中")
            ? (item.CHI || itemName)
            : itemName;

          // 主品key（不拼接属性）
          const mainKey = displayName;

          // 变体key（属性序列化）
          const attrObj = item.attributeSelected || {};
          const attributesKey = JSON.stringify(attrObj);
          // 变体label友好显示（无属性用英文）
          let attributesLabel = Object.entries(attrObj).map(([k, v]) => {
            if (Array.isArray(v)) return v.join(' ');
            return v;
          }).filter(Boolean).join(', ');
          if (!attributesLabel) attributesLabel = '(No attributes)';

          // 初始化主品
          if (!mainStats[mainKey]) {
            mainStats[mainKey] = {
              name: mainKey,
              baseName: displayName,
              quantity: 0,
              revenue: 0,
              orders: 0,
              averagePrice: 0,
              variants: {}
            };
          }

          // 初始化变体
          if (!mainStats[mainKey].variants[attributesKey]) {
            mainStats[mainKey].variants[attributesKey] = {
              attributesKey,
              attributesLabel,
              quantity: 0,
              revenue: 0,
              orders: 0,
              averagePrice: 0
            };
          }

          // 累加主品
          mainStats[mainKey].quantity += actualQuantity;
          mainStats[mainKey].revenue += parseFloat(item.itemTotalPrice || 0);
          mainStats[mainKey].orders += 1;

          // 累加变体
          mainStats[mainKey].variants[attributesKey].quantity += actualQuantity;
          mainStats[mainKey].variants[attributesKey].revenue += parseFloat(item.itemTotalPrice || 0);
          mainStats[mainKey].variants[attributesKey].orders += 1;
        });
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    });

    // 计算平均价格
    Object.values(mainStats).forEach(mainItem => {
      mainItem.averagePrice = mainItem.quantity > 0 ? mainItem.revenue / mainItem.quantity : 0;
      // 变体数组化并算均价
      mainItem.variants = Object.values(mainItem.variants).map(variant => {
        variant.averagePrice = variant.quantity > 0 ? variant.revenue / variant.quantity : 0;
        return variant;
      });
    });

    return Object.values(mainStats);
  }, [orders]);

  // 过滤和排序数据
  const filteredAndSortedData = useMemo(() => {
    let filtered = itemAnalytics.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.quantity;
          bValue = b.quantity;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [itemAnalytics, searchTerm, sortBy, sortOrder]);

  // 统计总数
  const totalStats = useMemo(() => {
    return {
      totalItems: itemAnalytics.length,
      totalQuantity: itemAnalytics.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: itemAnalytics.reduce((sum, item) => sum + item.revenue, 0)
    };
  }, [itemAnalytics]);

  // 图表数据（前10名）
  const chartData = useMemo(() => {
    return filteredAndSortedData.slice(0, 10).map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      fullName: item.name,
      quantity: Math.round(item.quantity * 100) / 100,
      revenue: Math.round(item.revenue * 100) / 100
    }));
  }, [filteredAndSortedData]);

  // 饼图颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'];

  const formatCurrency = (value) => {
    return `$${(Math.round(value * 100) / 100).toFixed(2)}`;
  };

  const formatQuantity = (value) => {
    return Math.round(value * 100) / 100;
  };

  return (
    <div className="item-sales-analytics">
      {/* 头部标题 - 优化样式 */}
      <div className="bg-white p-6">
        {/* 统计概览 - 使用flexbox替代grid */}
        <div className="flex flex-wrap gap-6 lg:gap-8 mb-8">
          <div className="flex-1 min-w-[280px] bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-800 text-base">{fanyi("Total Items")}</h4>
                <p className="text-3xl font-bold text-blue-600 notranslate mt-2">{totalStats.totalItems}</p>
              </div>
              <i className="bi bi-box text-blue-400 text-4xl"></i>
            </div>
          </div>
          <div className="flex-1 min-w-[280px] bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800 text-base">{fanyi("Total Quantity")}</h4>
                <p className="text-3xl font-bold text-green-600 notranslate mt-2">{formatQuantity(totalStats.totalQuantity)}</p>
              </div>
              <i className="bi bi-stack text-green-400 text-4xl"></i>
            </div>
          </div>
          <div className="flex-1 min-w-[280px] bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-800 text-base">{fanyi("Total Revenue")}</h4>
                <p className="text-3xl font-bold text-purple-600 notranslate mt-2">{formatCurrency(totalStats.totalRevenue)}</p>
              </div>
              <i className="bi bi-currency-dollar text-purple-400 text-4xl"></i>
            </div>
          </div>
        </div>

        {/* 控制面板 - 简化版本 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
          <div className="flex flex-wrap gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={fanyi("Search Items")}
                />
                <i className="bi bi-search absolute left-3 top-3.5 text-gray-400"></i>
              </div>
            </div>

            {/* 排序方式 */}
            <div className="min-w-[150px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="quantity">{fanyi("Quantity")}</option>
                <option value="revenue">{fanyi("Revenue")}</option>
                <option value="name">{fanyi("Name")}</option>
              </select>
            </div>

            {/* 排序顺序 */}
            <div className="min-w-[150px]">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>

            {/* 查看模式 */}
            <div className="min-w-[150px]">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="table">{fanyi("Table")}</option>
                <option value="chart">{fanyi("Bar Chart")}</option>
                <option value="pie">{fanyi("Pie Chart")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 数据展示 - 优化滚动和移动端 */}
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <i className="bi bi-inbox text-6xl text-gray-300 mb-6 block"></i>
            <p className="text-xl font-medium">{fanyi("No data available")}</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or date range</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                {/* 移动端卡片视图 - 优化布局 */}
                <div className="block md:hidden">
                  <div className="p-4 border-b bg-gray-50">
                    <h4 className="font-semibold text-gray-800">Items ({filteredAndSortedData.length})</h4>
                  </div>
                  <div className="">
                    {filteredAndSortedData.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => {
                          setExpandedMainKeys(keys => keys.includes(item.name) ? keys.filter(k => k !== item.name) : [...keys, item.name]);
                        }}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-gray-800 flex-1 mr-3">{item.name}</h5>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium notranslate">
                              {formatQuantity(item.quantity)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{fanyi("Total Revenue")}:</span>
                            <span className="font-semibold text-green-600 notranslate">{formatCurrency(item.revenue)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{fanyi("Average Price")}:</span>
                            <span className="font-semibold text-purple-600 notranslate">{formatCurrency(item.averagePrice)}</span>
                          </div>
                          {/* 变体明细 */}
                          {expandedMainKeys.includes(item.name) && (
                            <div className="mt-2 border-t pt-2">
                              <div className="flex text-xs text-gray-500 font-semibold pb-1">
                                <div className="flex-1">Attributes</div>
                                <div style={{width: 60}} className="text-right">{fanyi("Quantity")}</div>
                                <div style={{width: 70}} className="text-right">{fanyi("Amount")}</div>
                              </div>
                              {item.variants.map((variant, vIdx) => (
                                <div key={vIdx} className="flex text-xs text-gray-700 py-1 items-center">
                                  <div className="flex-1" title={variant.attributesLabel}>{variant.attributesLabel}</div>
                                  <div style={{width: 60}} className="text-right notranslate">{formatQuantity(variant.quantity)}</div>
                                  <div style={{width: 70}} className="text-right notranslate">{formatCurrency(variant.revenue)}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 桌面端表格视图 - 支持主品行展开变体明细 */}
                <div className="hidden md:block">
                  <div className="">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b text-base">{fanyi("Item Name")}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700 border-b text-base">{fanyi("Quantity Sold")}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700 border-b text-base">{fanyi("Total Revenue")}</th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700 border-b text-base">{fanyi("Average Price")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredAndSortedData.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr
                              className={"hover:bg-blue-50 cursor-pointer transition-colors"}
                              onClick={() => {
                                setExpandedMainKeys(keys => keys.includes(item.name) ? keys.filter(k => k !== item.name) : [...keys, item.name]);
                              }}
                            >
                              <td className="px-6 py-4 text-gray-800 font-medium">{item.name}</td>
                              <td className="px-6 py-4 text-right font-semibold text-blue-600 notranslate text-lg">{formatQuantity(item.quantity)}</td>
                              <td className="px-6 py-4 text-right font-semibold text-green-600 notranslate text-lg">{formatCurrency(item.revenue)}</td>
                              <td className="px-6 py-4 text-right font-semibold text-purple-600 notranslate text-lg">{formatCurrency(item.averagePrice)}</td>
                            </tr>
                            {/* 变体明细行 */}
                            {expandedMainKeys.includes(item.name) && (
                              <tr>
                                <td colSpan={4} className="bg-gray-50 px-8 py-2">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr>
                                        <th className="text-left py-1">Attributes</th>
                                        <th className="text-right py-1">Quantity</th>
                                        <th className="text-right py-1">Revenue</th>
                                        <th className="text-right py-1">Avg Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.variants.map((variant, vIdx) => (
                                        <tr key={vIdx}>
                                          <td className="py-1">{variant.attributesLabel}</td>
                                          <td className="py-1 text-right notranslate">{formatQuantity(variant.quantity)}</td>
                                          <td className="py-1 text-right notranslate">{formatCurrency(variant.revenue)}</td>
                                          <td className="py-1 text-right notranslate">{formatCurrency(variant.averagePrice)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'chart' && (
              <div className="space-y-6 md:space-y-8">
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <i className="bi bi-bar-chart text-blue-600 mr-2"></i>
                    {fanyi("Top 10 Items by Quantity")}
                  </h4>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          fontSize={12}
                          tick={{ fill: '#666' }}
                        />
                        <YAxis fontSize={12} tick={{ fill: '#666' }} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'quantity' ? formatQuantity(value) : formatCurrency(value),
                            name === 'quantity' ? fanyi("Quantity") : fanyi("Revenue")
                          ]}
                          labelFormatter={(label) => {
                            const item = chartData.find(d => d.name === label);
                            return item ? item.fullName : label;
                          }}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="quantity" fill="#3b82f6" name={fanyi("Quantity")} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <i className="bi bi-currency-dollar text-green-600 mr-2"></i>
                    {fanyi("Top 10 Items by Revenue")}
                  </h4>
                  <div className="h-64 md:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          fontSize={12}
                          tick={{ fill: '#666' }}
                        />
                        <YAxis fontSize={12} tick={{ fill: '#666' }} />
                        <Tooltip 
                          formatter={(value, name) => [
                            name === 'quantity' ? formatQuantity(value) : formatCurrency(value),
                            name === 'quantity' ? fanyi("Quantity") : fanyi("Revenue")
                          ]}
                          labelFormatter={(label) => {
                            const item = chartData.find(d => d.name === label);
                            return item ? item.fullName : label;
                          }}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name={fanyi("Revenue")} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'pie' && (
              <div className="flex flex-wrap gap-6 md:gap-8">
                <div className="flex-1 min-w-[300px] bg-white rounded-lg border shadow-sm p-4">
                  <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <i className="bi bi-pie-chart text-blue-600 mr-2"></i>
                    {fanyi("Top 10 Items by Quantity")}
                  </h4>
                  <div className="h-64 md:h-80 flex">
                    <ResponsiveContainer width="70%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="quantity"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-q-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [formatQuantity(value), props.payload.fullName]}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 flex items-center justify-center">
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry) => entry.payload.fullName}
                        iconType="circle"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-[300px] bg-white rounded-lg border shadow-sm p-4">
                  <h4 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                    <i className="bi bi-pie-chart text-green-600 mr-2"></i>
                    {fanyi("Top 10 Items by Revenue")}
                  </h4>
                  <div className="h-64 md:h-80 flex">
                    <ResponsiveContainer width="70%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#82ca9d"
                          dataKey="revenue"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-r-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [formatCurrency(value), props.payload.fullName]}
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 flex items-center justify-center">
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        formatter={(value, entry) => entry.payload.fullName}
                        iconType="circle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ItemSalesAnalytics; 