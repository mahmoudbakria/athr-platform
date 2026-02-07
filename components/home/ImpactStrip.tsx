// @ts-nocheck
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Box, Heart, Recycle, CheckCircle } from 'lucide-react';

interface StatsProps {
    totalDonated: number;
    availableItems: number;
    newCondition: number;
    usedCondition: number;
}

const StatItem = ({ label, value, icon: Icon, delay }: { label: string, value: number, icon: any, delay: number }) => {
    return (
        // @ts-ignore
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="flex flex-col items-center text-center space-y-2"
        >
            <div className="p-3 rounded-full bg-white/10 text-white mb-2">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-4xl font-bold text-white tracking-tight">
                {value}+
            </h3>
            <p className="text-sm font-medium text-blue-100 uppercase tracking-wider">{label}</p>
        </motion.div>
    )
}

export function ImpactStrip({ stats }: { stats: StatsProps }) {
    return (
        <section className="container mx-auto px-4 my-8">
            <div className="bg-primary relative overflow-hidden rounded-xl shadow-sm flex items-center min-h-[150px] py-6 md:py-0">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatItem label="إجمالي التبرعات" value={stats.totalDonated} icon={Box} delay={0} />
                        <StatItem label="الأغراض المتاحة" value={stats.availableItems} icon={CheckCircle} delay={0.1} />
                        <StatItem label="حالة جديدة" value={stats.newCondition} icon={Heart} delay={0.2} />
                        <StatItem label="حالة مستعملة" value={stats.usedCondition} icon={Recycle} delay={0.3} />
                    </div>
                </div>
            </div>
        </section>
    );
}
