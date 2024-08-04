import React from 'react'
import LineChartComponent from '../../components/LineChart'
import BarChartComponent from '@/components/BarChart'
import PieChartComponent from '@/components/PieChart'
import AreaChartComponent from '@/components/AreaChart'
import RadarChartComponent from '@/components/RadarChart'
import RadialChartComponent from '@/components/RadialChart'
function page() {
  return (
    <div className="mainBody p-[40px] flex items-center justify-center gap-[24px] flex-wrap">
        <div className="chartBody shadow-sm w-[404px] h-[404px] rounded-lg flex justify-center border border-[#e3e3e3] dark:border-[#27272a] "><LineChartComponent /></div>
        <div className="chartBody shadow-sm w-[404px] h-[404px] rounded-lg flex justify-center border border-[#e3e3e3] dark:border-[#27272a] "><BarChartComponent /></div>
        <div className="chartBody shadow-sm w-[404px] h-[404px] rounded-lg flex justify-center border border-[#e3e3e3] dark:border-[#27272a] "><PieChartComponent /></div>
        <div className="chartBody shadow-sm w-[404px] h-[404px] rounded-lg flex justify-center border border-[#e3e3e3] dark:border-[#27272a] "><AreaChartComponent /></div>
        <div className="chartBody shadow-sm w-[404px] h-[404px] rounded-lg flex justify-center border border-[#e3e3e3] dark:border-[#27272a] "><RadarChartComponent /></div>
        <div className="chartBody shadow-sm w-[404px] h-[404px] rounded-lg flex justify-center border border-[#e3e3e3] dark:border-[#27272a] "><RadialChartComponent /></div>
    </div>
    
  )
}

export default page