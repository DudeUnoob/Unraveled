"use client";

import { memo, useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
        <div ref={containerRef} className="w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-sans text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                        Trend Decay Curve
                    </h3>
                    <p className="font-sans text-xs text-charcoal/40 font-medium">
                        Interest trajectory modeled via logistic decay.
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-forest" />
                        <span className="font-mono text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Historical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-forest/20 border-2 border-dashed border-forest/40" />
                        <span className="font-mono text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Projected</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="w-full h-[320px] -ml-4">
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
                            strokeDasharray="4 4"
                            stroke="rgba(92, 108, 71, 0.05)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 10, fill: "rgba(28, 28, 28, 0.25)", fontFamily: "var(--font-jetbrains-mono)", fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            interval={Math.floor(chartData.length / 5)}
                            dy={10}
                        />

                        <YAxis
                            tick={{ fontSize: 10, fill: "rgba(28, 28, 28, 0.25)", fontFamily: "var(--font-jetbrains-mono)", fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, "dataMax + 10"]}
                            dx={-10}
                        />

                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ stroke: 'rgba(92, 108, 71, 0.1)', strokeWidth: 2 }}
                            wrapperStyle={{ outline: 'none' }}
                        />

                        {/* Reference Lines */}
                        {curve.peak_week && (
                            <ReferenceLine
                                x={curve.peak_week}
                                stroke="rgba(92, 108, 71, 0.1)"
                                strokeDasharray="6 6"
                                label={{
                                    value: "PEAK",
                                    position: "top",
                                    fill: "rgba(92, 108, 71, 0.3)",
                                    fontSize: 9,
                                    fontWeight: 700,
                                    fontFamily: "var(--font-jetbrains-mono)",
                                    letterSpacing: '0.1em'
                                }}
                            />
                        )}

                        <ReferenceLine
                            y={15}
                            stroke="rgba(200, 75, 49, 0.15)"
                            strokeDasharray="4 2"
                            label={{
                                value: "MARKET DEATH",
                                position: "insideRight",
                                fill: "rgba(200, 75, 49, 0.4)",
                                fontSize: 8,
                                fontWeight: 800,
                                fontFamily: "var(--font-jetbrains-mono)",
                                letterSpacing: '0.1em',
                                dy: -10
                            }}
                        />

                        {currentWeek && (
                            <ReferenceLine
                                x={currentWeek}
                                stroke="#5c6c47"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={{
                                    value: "PRESENT DAY",
                                    position: "insideTopRight",
                                    fill: "#5c6c47",
                                    fontSize: 9,
                                    fontWeight: 800,
                                    fontFamily: "var(--font-jetbrains-mono)",
                                    letterSpacing: '0.1em'
                                }}
                            />
                        )}

                        {/* Historical area */}
                        <Area
                            type="monotone"
                            dataKey="historical"
                            stroke="#5c6c47"
                            strokeWidth={3}
                            fill="url(#historicalGradient)"
                            connectNulls={false}
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: "#5c6c47",
                                stroke: "#fff",
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
                            strokeWidth={2}
                            strokeDasharray="8 4"
                            fill="url(#projectedGradient)"
                            connectNulls={false}
                            dot={false}
                            animationDuration={2500}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Source Attribution (Cockpit Mode) */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-10 pt-8 border-t border-forest/5">
                <div className="flex flex-col gap-1">
                    <span className="font-sans text-[9px] font-bold text-charcoal/20 uppercase tracking-widest">Data Input</span>
                    <span className="font-mono text-[10px] font-bold text-charcoal/60 uppercase">
                         {curve.model_type === "keyword_fallback"
                            ? "Keyword Vector Approximation"
                            : `Google Trends + ${data_sources?.tiktok?.available ? "TikTok" : "Platform"} Signatures`}
                    </span>
                </div>
                
                <div className="flex flex-col gap-1">
                    <span className="font-sans text-[9px] font-bold text-charcoal/20 uppercase tracking-widest">Model Topology</span>
                    <span className="font-mono text-[10px] font-bold text-charcoal/60 uppercase">
                        Logistic Decay (R² {(curve.r_squared * 100).toFixed(1)}%)
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                     <span className="font-mono text-[10px] font-bold text-forest/40 uppercase tracking-widest">Live Analysis Feed</span>
                </div>
            </div>
        </div>
    );
});
