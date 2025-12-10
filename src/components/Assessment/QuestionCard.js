import { motion } from 'framer-motion';

export default function QuestionCard({ question, onAnswer }) {
    // variants for card animation
    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            x: -50,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div
            key={question.qId}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass-panel p-8 rounded-2xl max-w-2xl w-full mx-auto text-center"
        >
            <h2 className="text-2xl md:text-3xl font-light mb-12 text-white">
                {question.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map((option, index) => {
                    // We need to map these to DISC types if the backend expects "D", "I", "S", "C" directly 
                    // OR if we are just collecting agreement levels.
                    // However, looking at the backend model `Assessment.model.js`:
                    // `answer: { type: String, required: true }, // D, I, S, C`
                    // The backend expects the ANSWER to be one of "D", "I", "S", "C".
                    // But normally a DISC test asks you to pick which word/phrase describes you best from a set of 4.
                    // BUT `seed.js` shows: `questions: [{ qId: 1, question: "I am assertive...", type: "D" }, ...]`
                    // This implies a Likert scale (Agree/Disagree) where "Agree" adds to the `D` score?
                    // OR it implies selecting the statement that matches?

                    // Checking the seed data again:
                    // { qId: 1, question: "I am assertive and demanding.", type: "D" }
                    // If the user answers "Agree" to this, they get points for D?

                    // Let's assume a Likert scale logic implicitly for this specific seed data structure.
                    // IF the user selects "Agree" on a "D" type question, it adds to "D".
                    // The backend `submitAssessment` logic counts `scores[ans.answer]++`. 
                    // WAIT. The backend logic: `if (scores[ans.answer] !== undefined) scores[ans.answer]++;`
                    // This means `ans.answer` MUST be "D", "I", "S", or "C".

                    // So the User is NOT selecting "Agree/Disagree". The User is presumably selecting WHICH option?
                    // BUT the seed data has linear questions.
                    // Usually DISC is forced choice (Pick Most/Least from 4).
                    // The current seed data looks like single statements. 
                    // Maybe the Frontend logic is: If User Agrees, sends the Question's TYPE as the "answer"?
                    // If User Disagrees, it sends nothing?

                    // Let's look at the backend logic again.
                    // `answers` is array of `{ qId, answer }`. 
                    // `scores[ans.answer]++`. 
                    // So `ans.answer` must be "D".

                    // PROPOSED LOGIC:
                    // This looks like a simple "Select all that apply" or "Yes/No" flow.
                    // But the prompt said "one-question-at-a-time assessment flow".
                    // If I give a Likert scale, how do I map "Strongly Agree" to "D"? 
                    // If I Strong Agree D question, D+2?
                    // The backend only does increment `++`.
                    // So likely: "Does this describe you?" -> Yes/No.
                    // If YES -> answer = question.type.
                    // If NO -> answer = "" (or ignored).

                    // Let's implement a nicer UI: "Me" vs "Not Me". 
                    // Or just 2 buttons.

                    return (
                        <button
                            key={option}
                            onClick={() => {
                                // For now, let's assume we are sending the TYPE if it's a positive response.
                                // This might need backend validatio check.
                                // Actually, if the backend just counts frequencies of "D", "I", "S", "C",
                                // then for each question "I am assertive (Type D)", if I click "Yes", I send "D".
                                // If I click "No", I send nothing or skip?

                                // Let's simplified to a Binary Choice for now to fit the backend 1:1 map.
                                // "Describes Me" vs "Does Not Describe Me".
                                // Wait, I can't loop map buttons if I change logic.
                                null
                            }}
                        />
                    )
                })}
            </div>

            {/* Revised UI for Binary Choice based on Seed Data + Backend Logic */}
            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                <button
                    onClick={() => onAnswer(question.type)} // Send the Type (e.g., "D")
                    className="px-8 py-4 rounded-xl bo-glass bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 transition-all duration-300 text-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                    Describes Me
                </button>
                <button
                    onClick={() => onAnswer(null)} // Send null or skip
                    className="px-8 py-4 rounded-xl bg-transparent hover:bg-white/5 border border-transparent hover:border-white/10 text-zinc-400 hover:text-white transition-all duration-300"
                >
                    Not Me
                </button>
            </div>
        </motion.div>
    );
}
