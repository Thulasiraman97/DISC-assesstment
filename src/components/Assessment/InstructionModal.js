import { motion, AnimatePresence } from 'framer-motion';

export default function InstructionModal({ isOpen, onStart }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shrink-0">
                        <h2 className="text-2xl font-bold text-center">WeLe DISC Assessment – Quick Guide</h2>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-8 text-zinc-700">

                        {/* Section 1: What is it? */}
                        <section>
                            <h3 className="text-lg font-bold text-green-700 mb-2 flex items-center gap-2">
                                <span className="text-xl">💡</span> What is it?
                            </h3>
                            <p className="bg-green-50 p-4 rounded-xl border border-green-100 text-sm md:text-base leading-relaxed">
                                A simple test to understand your natural work and communication style. There are <strong>no right or wrong answers</strong>.
                            </p>
                        </section>

                        {/* Section 2: How It Works */}
                        <section>
                            <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                                <span className="text-xl">⭐</span> How It Works
                            </h3>
                            <ul className="space-y-3 pl-2">
                                <li className="flex items-start gap-3">
                                    <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                                    <span><strong>40 scenario questions</strong> total.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                                    <span>Each question has <strong>4 statements</strong>.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                                    <div className="space-y-2">
                                        <p>You must select:</p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                <span className="text-xl">👍</span>
                                                <span className="text-sm"><strong>MOST I like</strong><br />(Best matches you)</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                                <span className="text-xl">👎</span>
                                                <span className="text-sm"><strong>LEAST I like</strong><br />(Least represents you)</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </section>

                        {/* Section 3: Rules */}
                        <section>
                            <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                                <span className="text-xl">📜</span> Rules
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-medium">
                                <li className="flex items-center gap-2 text-zinc-600">
                                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Choose one 👍 and one 👎 per question
                                </li>
                                <li className="flex items-center gap-2 text-zinc-600">
                                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Cannot select both on the same statement
                                </li>
                                <li className="flex items-center gap-2 text-zinc-600">
                                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Submit unlocks only after all 40 completed
                                </li>
                                <li className="flex items-center gap-2 text-zinc-600">
                                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    Maximum Time Duration: 1 hour
                                </li>
                                <li className="flex items-center gap-2 text-zinc-600">
                                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Answers cannot be changed after submission
                                </li>
                                <li className="flex items-center gap-2 text-zinc-600">
                                    <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                                    Stable internet required
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-center shrink-0">
                        <button
                            onClick={onStart}
                            className="px-8 py-3 bg-zinc-900 hover:bg-black text-white text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <span>OK, I understood</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
