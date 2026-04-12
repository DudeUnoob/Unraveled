"use client";
import { memo, useState, useEffect, useRef } from "react";
import { motion, } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import type { CurveDataPoint, TrendCurve, TrendAnalysisResponse } from "@/types/analysis";
interface DecayCurveChartProps {
    curve: TrendCurve;
    phaseColor: string;
    data_sources?: TrendAnalysisResponse["data_sources"];
}
function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number; payload: CurveDataPoint }>;
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    const point = payload[0];
    const isProjected = point.payload.projected;
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-charcoal/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl min-w-[140px]"
        >
            <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xl font-bold text-white tabular-nums">
                        {point.value.toFixed(1)}
                    </span>
                    <span className="font-sans text-[10px] font-bold text-white/30 uppercase tracking-widest">Interest</span>
                </div>
                {isProjected && (
                    <div className="mt-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 w-fit">
                        <div className="w-1 h-1 rounded-full bg-forest-light animate-pulse" />
                        <span className="font-mono text-[9px] text-white/60 uppercase tracking-widest font-bold">
                            Projected
                        </span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
export const DecayCurveChart = memo(function DecayCurveChart({
    curve,
    phaseColor,
    data_sources,
}: DecayCurveChartProps) {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        return () => observer.disconnect();
    }, []);
    // Split data for dual-area rendering
    const historicalData = curve.data_points.filter((p) => !p.projected);
    const projectedData = curve.data_points.filter((p) => p.projected);
    // "You are here" = last historical data point
    const currentWeek = historicalData.length > 0
        ? historicalData[historicalData.length - 1].week
        : null;
    // Build combined data
    const chartData = curve.data_points.map((point) => ({
        week: point.week,
        historical: point.projected ? undefined : point.interest,
        projected: point.projected ? point.interest : undefined,
        // Bridge point
        ...(point.week === historicalData[historicalData.length - 1]?.week && projectedData.length > 0
            ? { projected: point.interest }
            : {}),
    }));
    return (
        <div ref={containerRef} className="w-full flex flex-col h-full relative">
            {/* Header / Top Right Selector */}
            <div className="absolute top-0 right-0 z-10">
                <div className="flex items-center gap-2 bg-[#9fa586] text-white px-4 py-1.5 rounded-full border-2 border-[#5c6c47] font-serif text-lg">
                    <span>2025</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>
            <h3 className="font-serif text-3xl font-bold text-[#5c6c47] mb-8">
                Trend Decay Curve
            </h3>
            {/* Chart Container */}
            <div className="w-full h-[320px] -ml-4 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#5c6c47" stopOpacity={0.15} />
                                <stop offset="100%" stopColor="#5c6c47" stopOpacity={0.01} />
                            </linearGradient>
                            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#5c6c47" stopOpacity={0.05} />
                                <stop offset="100%" stopColor="#5c6c47" stopOpacity={0.005} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(92, 108, 71, 0.15)"
                            vertical={true}
                            horizontal={false}
                        />
                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 16, fill: "#5c6c47", fontFamily: "var(--font-adamina)" }}
                            tickLine={false}
                            axisLine={false}
                            interval={Math.floor(chartData.length / 4)}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 16, fill: "#5c6c47", fontFamily: "var(--font-adamina)" }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, "dataMax + 10"]}
                            dx={-10}
                            tickCount={5}
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ stroke: 'rgba(92, 108, 71, 0.3)', strokeWidth: 1, strokeDasharray: '3 3' }}
                            wrapperStyle={{ outline: 'none' }}
                        />
                        {currentWeek && (
                            <ReferenceLine
                                x={currentWeek}
                                stroke="#5c6c47"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                            />
                        )}
                        {/* Historical area */}
                        <Area
                            type="monotone"
                            dataKey="historical"
                            stroke="#5c6c47"
                            strokeWidth={2}
                            fill="url(#historicalGradient)"
                            connectNulls={false}
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: "#5c6c47",
                                stroke: "#eaf1d7",
                                strokeWidth: 3,
                            }}
                            animationDuration={2000}
                            animationEasing="ease-in-out"
                        />
                        {/* Projected area */}
                        <Area
                            type="monotone"
                            dataKey="projected"
                            stroke="#5c6c47"
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            fill="url(#projectedGradient)"
                            connectNulls={false}
                            dot={false}
                            animationDuration={2500}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});