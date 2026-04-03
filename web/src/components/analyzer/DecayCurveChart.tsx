"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
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
        <div className="bg-charcoal/90 backdrop-blur-md border border-charcoal/20 rounded-xl px-3 py-2 shadow-lg">
            <p className="font-mono text-[10px] text-cream/50 mb-0.5">{label}</p>
            <p className="font-mono text-sm text-cream font-semibold tabular-nums">
                {point.value} interest
            </p>
            {isProjected && (
                <p className="font-mono text-[9px] text-cream/40 mt-0.5 uppercase tracking-wider">
                    Projected
                </p>
            )}
        </div>
    );
}

export const DecayCurveChart = memo(function DecayCurveChart({
    curve,
    phaseColor,
    data_sources,
}: DecayCurveChartProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // Split data for dual-area rendering
    const historicalData = curve.data_points.filter((p) => !p.projected);
    const projectedData = curve.data_points.filter((p) => p.projected);

    // "You are here" = last historical data point
    const currentWeek = historicalData.length > 0
        ? historicalData[historicalData.length - 1].week
        : null;

    // Build combined data with historical and projected as separate keys
    const chartData = curve.data_points.map((point) => ({
        week: point.week,
        historical: point.projected ? undefined : point.interest,
        projected: point.projected ? point.interest : undefined,
        // Bridge point: last historical = first projected
        ...(point.week === historicalData[historicalData.length - 1]?.week && projectedData.length > 0
            ? { projected: point.interest }
            : {}),
    }));

    // Find peak data point index for reference line
    const peakDataIndex = curve.data_points.findIndex(
        (p) => p.week === curve.peak_week
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
        >
            {/* Header */}
            <div className="flex items-baseline justify-between mb-6">
                <h3 className="font-sans text-sm font-semibold text-charcoal/60 uppercase tracking-widest">
                    Trend decay curve
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 rounded-full bg-forest" />
                        <span className="font-mono text-[9px] text-charcoal/40 uppercase tracking-wider">Historical</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-0.5 rounded-full bg-forest/40 border border-dashed border-forest/30" />
                        <span className="font-mono text-[9px] text-charcoal/40 uppercase tracking-wider">Projected</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="w-full h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={phaseColor} stopOpacity={0.25} />
                                <stop offset="100%" stopColor={phaseColor} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={phaseColor} stopOpacity={0.1} />
                                <stop offset="100%" stopColor={phaseColor} stopOpacity={0.01} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(28, 28, 28, 0.05)"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="week"
                            tick={{ fontSize: 9, fill: "rgba(28, 28, 28, 0.3)", fontFamily: "var(--font-jetbrains-mono)" }}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(28, 28, 28, 0.08)" }}
                            interval={Math.floor(chartData.length / 6)}
                        />

                        <YAxis
                            tick={{ fontSize: 9, fill: "rgba(28, 28, 28, 0.3)", fontFamily: "var(--font-jetbrains-mono)" }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, "dataMax + 10"]}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Peak reference line */}
                        {curve.peak_week && (
                            <ReferenceLine
                                x={curve.peak_week}
                                stroke="rgba(28, 28, 28, 0.15)"
                                strokeDasharray="4 4"
                                label={{
                                    value: "Peak",
                                    position: "top",
                                    fill: "rgba(28, 28, 28, 0.35)",
                                    fontSize: 9,
                                    fontFamily: "var(--font-jetbrains-mono)",
                                }}
                            />
                        )}

                        {/* Death threshold line */}
                        <ReferenceLine
                            y={15}
                            stroke="rgba(200, 75, 49, 0.2)"
                            strokeDasharray="6 3"
                            label={{
                                value: "Trend death",
                                position: "right",
                                fill: "rgba(200, 75, 49, 0.4)",
                                fontSize: 9,
                                fontFamily: "var(--font-jetbrains-mono)",
                            }}
                        />

                        {/* "You are here" marker */}
                        {currentWeek && (
                            <ReferenceLine
                                x={currentWeek}
                                stroke={phaseColor}
                                strokeWidth={1.5}
                                strokeDasharray="3 3"
                                label={{
                                    value: "← You are here",
                                    position: "top",
                                    fill: phaseColor,
                                    fontSize: 9,
                                    fontFamily: "var(--font-jetbrains-mono)",
                                }}
                            />
                        )}

                        {/* Historical area */}
                        <Area
                            type="monotone"
                            dataKey="historical"
                            stroke={phaseColor}
                            strokeWidth={2}
                            fill="url(#historicalGradient)"
                            connectNulls={false}
                            dot={false}
                            activeDot={{
                                r: 4,
                                fill: phaseColor,
                                stroke: "#F5F0E8",
                                strokeWidth: 2,
                            }}
                            animationDuration={1200}
                            animationEasing="ease-out"
                        />

                        {/* Projected area */}
                        <Area
                            type="monotone"
                            dataKey="projected"
                            stroke={phaseColor}
                            strokeWidth={1.5}
                            strokeDasharray="6 3"
                            fill="url(#projectedGradient)"
                            connectNulls={false}
                            dot={false}
                            animationDuration={1500}
                            animationEasing="ease-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Source Attribution */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-charcoal/[0.06]">
                <span className="font-mono text-[9px] text-charcoal/30 uppercase tracking-wider">
                    {curve.model_type === "keyword_fallback"
                        ? "Data: Keyword estimate — configure Bright Data for live trend data"
                        : `Data: ${[
                            "Google Trends",
                            ...(data_sources?.tiktok?.available ? ["TikTok"] : []),
                            ...(data_sources?.pinterest?.available ? ["Pinterest"] : []),
                        ].join(" + ")}`}
                </span>
                <span className="text-charcoal/15">|</span>
                <span className="font-mono text-[9px] text-charcoal/30 uppercase tracking-wider">
                    {curve.model_type === "keyword_fallback"
                        ? "Model: Keyword estimate (no trend data)"
                        : `Model: Logistic Decay (R\u00B2 ${(curve.r_squared * 100).toFixed(0)}%)`}
                </span>
            </div>
        </motion.div>
    );
});
