/**
 * Shared Employee Utilities
 * Include this file in all pages that need employee color support
 * Usage: <script src="employee-utils.js"></script>
 */

// Default color palette (fallback when no custom color set)
var DEFAULT_EMPLOYEE_COLORS = [
  '#3b82f6',  // Blue
  '#22c55e',  // Green
  '#f97316',  // Orange
  '#8b5cf6',  // Purple
  '#ec4899',  // Pink
  '#14b8a6',  // Teal
  '#eab308',  // Yellow
  '#ef4444',  // Red
  '#6366f1',  // Indigo
  '#84cc16'   // Lime
];

// Comprehensive color options for settings - 50+ colors
var COLOR_OPTIONS = [
  // Blues
  { value: '#3b82f6', name: 'Blue' },
  { value: '#0ea5e9', name: 'Sky Blue' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#2563eb', name: 'Royal Blue' },
  { value: '#1d4ed8', name: 'Dark Blue' },
  { value: '#0284c7', name: 'Ocean Blue' },
  { value: '#0891b2', name: 'Teal Blue' },
  { value: '#6366f1', name: 'Indigo' },
  { value: '#4f46e5', name: 'Deep Indigo' },
  
  // Greens
  { value: '#22c55e', name: 'Green' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#14b8a6', name: 'Teal' },
  { value: '#84cc16', name: 'Lime' },
  { value: '#65a30d', name: 'Apple Green' },
  { value: '#16a34a', name: 'Forest' },
  { value: '#059669', name: 'Jade' },
  { value: '#0d9488', name: 'Sea Green' },
  { value: '#4ade80', name: 'Mint' },
  
  // Oranges & Yellows
  { value: '#f97316', name: 'Orange' },
  { value: '#ea580c', name: 'Dark Orange' },
  { value: '#fb923c', name: 'Light Orange' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#eab308', name: 'Yellow' },
  { value: '#ca8a04', name: 'Gold' },
  { value: '#d97706', name: 'Honey' },
  { value: '#fbbf24', name: 'Sunflower' },
  
  // Reds & Pinks
  { value: '#ef4444', name: 'Red' },
  { value: '#dc2626', name: 'Crimson' },
  { value: '#b91c1c', name: 'Dark Red' },
  { value: '#f43f5e', name: 'Rose' },
  { value: '#e11d48', name: 'Ruby' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#db2777', name: 'Hot Pink' },
  { value: '#be185d', name: 'Magenta' },
  { value: '#f472b6', name: 'Light Pink' },
  
  // Purples
  { value: '#8b5cf6', name: 'Purple' },
  { value: '#a855f7', name: 'Violet' },
  { value: '#7c3aed', name: 'Deep Purple' },
  { value: '#9333ea', name: 'Electric Purple' },
  { value: '#c026d3', name: 'Fuchsia' },
  { value: '#d946ef', name: 'Orchid' },
  { value: '#6d28d9', name: 'Grape' },
  
  // Browns & Neutrals
  { value: '#78716c', name: 'Stone' },
  { value: '#57534e', name: 'Warm Gray' },
  { value: '#a16207', name: 'Brown' },
  { value: '#92400e', name: 'Chocolate' },
  { value: '#854d0e', name: 'Bronze' },
  { value: '#713f12', name: 'Coffee' },
  { value: '#78350f', name: 'Espresso' },
  
  // Grays
  { value: '#6b7280', name: 'Gray' },
  { value: '#4b5563', name: 'Dark Gray' },
  { value: '#9ca3af', name: 'Light Gray' },
  { value: '#374151', name: 'Charcoal' },
  { value: '#64748b', name: 'Slate' },
  { value: '#475569', name: 'Cool Gray' },
  
  // Special
  { value: '#000000', name: 'Black' },
  { value: '#18181b', name: 'Midnight' },
  { value: '#1e3a5f', name: 'Navy' },
  { value: '#166534', name: 'Pine' },
  { value: '#7f1d1d', name: 'Maroon' },
  { value: '#581c87', name: 'Plum' }
];

/**
 * Get employee color from stored value or fallback to default
 * @param {string} empId - Employee ID
 * @param {Array} allEmployees - Array of all employees (must have employee_id and color fields)
 * @returns {string} Hex color code
 */
function getEmployeeColor(empId, allEmployees) {
  if (!empId) return '#6b7280'; // Gray for unassigned
  
  var emp = allEmployees.find(function(e) { 
    return e.employee_id === empId; 
  });
  
  if (!emp) return '#6b7280';
  
  // Use stored color if available
  if (emp.color) return emp.color;
  
  // Fallback to default based on position
  var idx = allEmployees.findIndex(function(e) { 
    return e.employee_id === empId; 
  });
  
  return idx >= 0 ? DEFAULT_EMPLOYEE_COLORS[idx % DEFAULT_EMPLOYEE_COLORS.length] : '#6b7280';
}

/**
 * Get employee initials
 * @param {Object} emp - Employee object with first_name and last_name
 * @returns {string} Two-letter initials
 */
function getEmployeeInitials(emp) {
  if (!emp) return '?';
  var first = (emp.first_name || '')[0] || '';
  var last = (emp.last_name || '')[0] || '';
  return (first + last).toUpperCase() || '?';
}

/**
 * Get employee full name
 * @param {Object} emp - Employee object
 * @returns {string} Full name or 'Unknown'
 */
function getEmployeeName(emp) {
  if (!emp) return 'Unknown';
  return ((emp.first_name || '') + ' ' + (emp.last_name || '')).trim() || emp.email || 'Unknown';
}

/**
 * Update employee color in database
 * @param {Object} supabaseClient - Supabase client instance
 * @param {string} empId - Employee ID
 * @param {string} color - Hex color code
 * @returns {Promise} Supabase response
 */
async function updateEmployeeColor(supabaseClient, empId, color) {
  return await supabaseClient
    .from('employees')
    .update({ color: color })
    .eq('employee_id', empId);
}

/**
 * Render color picker dropdown HTML
 * @param {string} selectId - ID for the select element
 * @param {string} currentColor - Currently selected color
 * @returns {string} HTML string
 */
function renderColorPicker(selectId, currentColor) {
  var html = '<select id="' + selectId + '" class="form-select color-picker">';
  COLOR_OPTIONS.forEach(function(opt) {
    var selected = opt.value === currentColor ? ' selected' : '';
    html += '<option value="' + opt.value + '"' + selected + ' style="background:' + opt.value + ';color:white;">' + opt.name + '</option>';
  });
  html += '</select>';
  return html;
}

/**
 * Render color grid for settings page
 * @param {string} currentColor - Currently selected color
 * @param {string} onClickHandler - JavaScript function name to call on click (receives color value)
 * @returns {string} HTML string
 */
function renderColorGrid(currentColor, onClickHandler) {
  var html = '<div class="color-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:8px;">';
  COLOR_OPTIONS.forEach(function(opt) {
    var selected = opt.value === currentColor ? 'ring:2px solid white;transform:scale(1.1);' : '';
    html += '<div class="color-swatch" style="width:40px;height:40px;border-radius:8px;background:' + opt.value + ';cursor:pointer;' + selected + 'border:2px solid ' + (opt.value === currentColor ? 'white' : 'transparent') + ';" onclick="' + onClickHandler + '(\'' + opt.value + '\')" title="' + opt.name + '"></div>';
  });
  html += '</div>';
  return html;
}

/**
 * Get color name from value
 * @param {string} colorValue - Hex color value
 * @returns {string} Color name or 'Custom'
 */
function getColorName(colorValue) {
  var opt = COLOR_OPTIONS.find(function(o) { return o.value === colorValue; });
  return opt ? opt.name : 'Custom';
}

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_EMPLOYEE_COLORS: DEFAULT_EMPLOYEE_COLORS,
    COLOR_OPTIONS: COLOR_OPTIONS,
    getEmployeeColor: getEmployeeColor,
    getEmployeeInitials: getEmployeeInitials,
    getEmployeeName: getEmployeeName,
    updateEmployeeColor: updateEmployeeColor,
    renderColorPicker: renderColorPicker
  };
}
