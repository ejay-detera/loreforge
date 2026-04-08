import { motion } from 'framer-motion';
import { usePage } from '@inertiajs/react'; 

export default function PageTransition({ children }) {
    const { component } = usePage();

    return (
        <motion.div
            key={component}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}  // ← add this
        >
            {children}
        </motion.div>
    );
}