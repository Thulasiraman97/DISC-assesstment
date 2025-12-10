import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, label }) {
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <div className="w-full max-w-xl mx-auto mb-8">
            <div className="flex justify-between text-zinc-400 text-sm mb-2 font-mono">
                <span>{label || `Question ${current}`}</span>
                {!label && <span>{total} Total</span>}
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                <motion.div
                    className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
}
