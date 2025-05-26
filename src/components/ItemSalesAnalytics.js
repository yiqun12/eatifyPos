import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ItemSalesAnalytics = ({ orders, dateRange }) => {
  const [sortBy, setSortBy] = useState('quantity'); // 'quantity', 'revenue', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart', 'pie'
  const [searchTerm, setSearchTerm] = useState('');

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
  ];

  function translate(input) {
    const translation = translations.find(t => t.input.toLowerCase() === input.toLowerCase());
    return translation ? translation.output : input;
  }

  function fanyi(input) {
    return localStorage.getItem("Google-language")?.includes("Chinese") || localStorage.getItem("Google-language")?.includes("中") ? translate(input) : input;
  }

  // 分析订单数据，统计每个物品的销量
  const itemAnalytics = useMemo(() => {
    const itemStats = {};

    orders.forEach(order => {
      try {
        const receiptData = JSON.parse(order.receiptData || '[]');
        
        receiptData.forEach(item => {
          // 过滤掉包含memberId的错误数据（guest数据）
          if (item.memberId) {
            return; // 跳过这个项目
          }
          
          // 确保这是有效的物品数据（必须有name和quantity）
          if (!item.name || item.quantity === undefined) {
            return; // 跳过无效数据
          }
          
          // 处理物品名称，去除特殊前缀
          let itemName = item.name;
          let actualQuantity = item.quantity;
          
          // 处理特殊格式的物品名称 (#@%数字#@%)
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

          // 创建唯一键（包含属性选择）
          const attributes = item.attributeSelected ? 
            Object.entries(item.attributeSelected)
              .map(([key, value]) => Array.isArray(value) ? value.join(' ') : value)
              .join(' ') : '';
          
          const uniqueKey = attributes ? `${displayName} (${attributes})` : displayName;

          if (!itemStats[uniqueKey]) {
            itemStats[uniqueKey] = {
              name: uniqueKey,
              baseName: displayName,
              attributes: attributes,
              quantity: 0,
              revenue: 0,
              orders: 0,
              averagePrice: 0
            };
          }

          itemStats[uniqueKey].quantity += actualQuantity;
          itemStats[uniqueKey].revenue += parseFloat(item.itemTotalPrice || 0);
          itemStats[uniqueKey].orders += 1;
        });
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    });

    // 计算平均价格
    Object.values(itemStats).forEach(item => {
      item.averagePrice = item.quantity > 0 ? item.revenue / item.quantity : 0;
    });

    return Object.values(itemStats);
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
    <div className="item-sales-analytics p-4">
      <h3 className="text-2xl font-bold mb-4">{fanyi("Item Sales Analytics")}</h3>
      
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">{fanyi("Total Items")}</h4>
          <p className="text-2xl font-bold text-blue-600 notranslate">{totalStats.totalItems}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">{fanyi("Total Quantity")}</h4>
          <p className="text-2xl font-bold text-green-600 notranslate">{formatQuantity(totalStats.totalQuantity)}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800">{fanyi("Total Revenue")}</h4>
          <p className="text-2xl font-bold text-purple-600 notranslate">{formatCurrency(totalStats.totalRevenue)}</p>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {/* 搜索 */}
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-medium mb-1">{fanyi("Search Items")}</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder={fanyi("Search Items")}
          />
        </div>

        {/* 排序方式 */}
        <div>
          <label className="block text-sm font-medium mb-1">{fanyi("Sort by")}</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="quantity">{fanyi("Quantity")}</option>
            <option value="revenue">{fanyi("Revenue")}</option>
            <option value="name">{fanyi("Name")}</option>
          </select>
        </div>

        {/* 排序顺序 */}
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>

        {/* 查看模式 */}
        <div>
          <label className="block text-sm font-medium mb-1">{fanyi("View Mode")}</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="table">{fanyi("Table")}</option>
            <option value="chart">{fanyi("Bar Chart")}</option>
            <option value="pie">{fanyi("Pie Chart")}</option>
          </select>
        </div>
      </div>

      {/* 数据展示 */}
      {filteredAndSortedData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {fanyi("No data available")}
        </div>
      ) : (
        <>
          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">{fanyi("Item Name")}</th>
                    <th className="border border-gray-300 p-3 text-right">{fanyi("Quantity Sold")}</th>
                    <th className="border border-gray-300 p-3 text-right">{fanyi("Total Revenue")}</th>
                    <th className="border border-gray-300 p-3 text-right">{fanyi("Average Price")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 p-3">{item.name}</td>
                      <td className="border border-gray-300 p-3 text-right notranslate">{formatQuantity(item.quantity)}</td>
                      <td className="border border-gray-300 p-3 text-right notranslate">{formatCurrency(item.revenue)}</td>
                      <td className="border border-gray-300 p-3 text-right notranslate">{formatCurrency(item.averagePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === 'chart' && (
            <div className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">{fanyi("Top 10 Items by Quantity")}</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'quantity' ? formatQuantity(value) : formatCurrency(value),
                        name === 'quantity' ? fanyi("Quantity") : fanyi("Revenue")
                      ]}
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.name === label);
                        return item ? item.fullName : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="quantity" fill="#8884d8" name={fanyi("Quantity")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">{fanyi("Top 10 Items by Revenue")}</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'quantity' ? formatQuantity(value) : formatCurrency(value),
                        name === 'quantity' ? fanyi("Quantity") : fanyi("Revenue")
                      ]}
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.name === label);
                        return item ? item.fullName : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name={fanyi("Revenue")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {viewMode === 'pie' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">{fanyi("Top 10 Items by Quantity")}</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatQuantity(value)}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatQuantity(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">{fanyi("Top 10 Items by Revenue")}</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={120}
                      fill="#82ca9d"
                      dataKey="revenue"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ItemSalesAnalytics; 