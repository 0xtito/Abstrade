import { motion } from "framer-motion";

export function Spinner() {
  return (
    <motion.div
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="relative place-content-center w-36 h-36 border-4 border-t-transparent border-l-transparent border-indigo-300 rounded-full"
    ></motion.div>
  );
}
