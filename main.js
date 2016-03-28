/* 数据格式演示
var aqiSourceData = {
  '北京': {
    '2016-01-01': 10,
    '2016-01-02': 10,
    '2016-01-03': 10,
    '2016-01-04': 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date('2016-01-01');
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  '北京': randomBuildData(500),
  '上海': randomBuildData(300),
  '广州': randomBuildData(200),
  '深圳': randomBuildData(100),
  '成都': randomBuildData(300),
  '西安': randomBuildData(500),
  '福州': randomBuildData(100),
  '厦门': randomBuildData(100),
  '沈阳': randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  'nowSelectCity': '北京',
  'nowGraTime': 'day'
}
var lastState = {}

function draw(type, height, color, date) {
  return '<div class="'+type+' box"><div class="pill" style="height:'+height+'px;background-color:'+color+';" title="'+date+' : '+height+'"></div></div>'
}

/**
 * 渲染图表
 */
function renderChart() {
  console.log(lastState)
  console.log(pageState)
  console.log(chartData)
  if (lastState['nowSelectCity'] === pageState['nowSelectCity'] && lastState['nowGraTime'] === pageState['nowGraTime']) {
    return
  } else {
    lastState['nowSelectCity'] = pageState['nowSelectCity']
    lastState['nowGraTime'] = pageState['nowGraTime']
  }

  var wrap = document.getElementById('aqi-chart-wrap')
  wrap.innerHTML = ''
  var data = chartData[pageState['nowSelectCity']][pageState['nowGraTime']]
  var html = ''
  for (var date in data) {
    html += draw(pageState['nowGraTime'], data[date]['aqi'], data[date]['color'], date)
  }
  wrap.innerHTML = html
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange() {
  var types = document.getElementsByName('gra-time')
  Array.prototype.forEach.call(types, function(x) {
    if(x.checked) pageState['nowGraTime'] = x.value
  })
  renderChart()
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
  // 确定是否选项发生了变化
  pageState['nowSelectCity'] = document.getElementById('city-select').value
  // 设置对应数据

  // Array.prototype.forEach.call(cites, function(x) {
  //   if(x.checked) pageState['nowSelectCity'] = x.value
  // })
  // 调用图表渲染函数
  renderChart()
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  Array.prototype.forEach.call(document.getElementsByName('gra-time'), function(value) {
    value.addEventListener('click', graTimeChange)
  })
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  var selector = document.getElementById('city-select')
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  selector.innerHTML = Object.keys(aqiSourceData).reduce(function(html, city) {
    return html + '<option>' + city + '</option>'
  }, '')

  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  selector.addEventListener('change', citySelectChange)
}

function getColor(value) {
  var colorMap = {
    50: 'green',
    100: 'blue',
    200: 'red',
    300: 'purple',
    500: 'black'
  }
  return colorMap[Object.keys(colorMap).find(function(x) { return x > value })]
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中
  for (var city in aqiSourceData) {
    var aqis = aqiSourceData[city]
    chartData[city] = {
      'day': {},
      'week': {},
      'month': {}
    }
    var month = lastMonth = ''
    var mSum = mDay = mAqi = 0
    var wSum = wDay = wAqi = 0
    for (var date in aqis) {
      // month
      month = date.slice(0, 7) // '2016-01'
      if (lastMonth && lastMonth !== month) {
        mAqi = Math.round(wSum / wDay)
        chartData[city]['month'][month] = { 'aqi': mAqi, 'color': getColor(mAqi) }
        mSum = mDay = 0
      }
      lastMonth = month
      mSum += aqis[date]
      mDay += 1

      // week
      if (wDay === 7) {
        wAqi = Math.round(wSum / wDay)
        chartData[city]['week'][date] = { 'aqi': wAqi, 'color': getColor(wAqi) }
        wSum = wDay = 0
      }
      wSum += aqis[date]
      wDay += 1

      // day
      chartData[city]['day'][date] = { 'aqi': aqis[date], 'color': getColor(aqis[date]) }
    }
    mAqi = Math.round(wSum / wDay)
    wAqi = Math.round(wSum / wDay)
    chartData[city]['month'][lastMonth] = { 'aqi': mAqi, 'color': getColor(mAqi) }
    chartData[city]['week'][date] = { 'aqi': wAqi, 'color': getColor(wAqi) }
  }
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector()
  initAqiChartData()
  renderChart()
}

init();
