import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Global Base Theme
                'bg-deep-navy': '#0D1117',
                'surface-dark-charcoal': '#161B22',
                'border-subtle-dark': '#30363D',
                'text-primary-off-white': '#E6EDF3',
                'text-muted-cool-gray': '#7D8590',
                'accent-emerald-green': '#2D7A4F',
                'accent-hover-lighter-green': '#3AA362',
                'highlight-warm-gold': '#C9A84C',
                
                // Fantasy Theme
                'fantasy-sky-gradient-start': '#1A0A3A',
                'fantasy-sky-gradient-end': '#2D1B69',
                'fantasy-ground-dark-forest': '#0D2010',
                'fantasy-accent-warm-gold': '#C9A84C',
                'fantasy-enemy-hp': '#8B0000',
                'fantasy-player-hp': '#2D7A4F',
                'fantasy-mp': '#6A0DAD',
                'fantasy-dialog-box': '#FDF6E3',
                'fantasy-dialog-border': '#5C3D1E',
                
                // Horror Theme
                'horror-sky-gradient-start': '#0A0005',
                'horror-sky-gradient-end': '#1A0010',
                'horror-ground-dark-ash': '#0D0808',
                'horror-accent-blood-red': '#8B0000',
                'horror-enemy-hp': '#4A7C1A',
                'horror-player-hp': '#CC2200',
                'horror-mp': '#39571C',
                'horror-dialog-box': '#F0EDED',
                'horror-dialog-border': '#3D1C1C',
                
                // Sci-Fi Theme
                'scifi-sky-gradient-start': '#000010',
                'scifi-sky-gradient-end': '#0A0A2A',
                'scifi-ground-metallic': '#0D0D1A',
                'scifi-accent-electric-blue': '#00BFFF',
                'scifi-enemy-hp': '#FF6600',
                'scifi-player-hp': '#00CED1',
                'scifi-mp': '#0080FF',
                'scifi-dialog-box': '#0A0F1A',
                'scifi-dialog-text': '#E0F7FA',
                'scifi-dialog-border': '#1C3A5A',
            },
        },
    },
    plugins: [forms],
};
