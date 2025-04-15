// 将颜色变浅
export function lightenColor(hex, percent) {
  // 去除#号
  hex = hex.replace('#', '');
  
  // 转换为RGB值
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // 增加亮度
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  
  // 转换回HEX
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 获取商铺颜色
export function getStoreColor(index) {
  // 预定义的颜色数组，保证商铺颜色有区分度
  const colors = [
    '#4F46E5', // 靛蓝
    '#10B981', // 翡翠绿
    '#F97316', // 橙色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉红
    '#06B6D4', // 青色
    '#F59E0B', // 黄色
    '#EF4444', // 红色
    '#6366F1', // 蓝紫
    '#14B8A6', // 蓝绿
    '#F43F5E', // 玫红
    '#8B5CF6', // 紫罗兰
    '#0EA5E9', // 天蓝
    '#84CC16', // 石灰
    '#D946EF'  // 洋红
  ];
  
  // 根据索引返回颜色，如果索引超出数组长度则循环使用
  return colors[index % colors.length];
} 